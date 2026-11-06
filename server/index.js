// FiberTech serveri: admin API, cookie'siz statistika va tayyor saytni (dist) tarqatish.
// Sozlamalar: .env.example
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import geoip from 'geoip-country'
import { PROJECT_SLUGS, SERVICE_SLUGS, SITE_URL as DEFAULT_SITE_URL, isKnownPath } from '../src/data/routes.js'
import { createAnalytics } from './analytics.js'
import { createAuth } from './auth.js'
import { openDb, postStore } from './db.js'
import { validatePost, validatePrices } from './validate.js'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const DIST = process.env.DIST_DIR ? resolve(process.env.DIST_DIR) : join(ROOT, 'dist')
const PORT = Number(process.env.PORT ?? 8787)
const PRODUCTION = process.env.NODE_ENV === 'production'
const TRUST_PROXY = process.env.TRUST_PROXY === '1'
const PASSWORD = process.env.ADMIN_PASSWORD
const SITE_URL = (process.env.SITE_URL ?? DEFAULT_SITE_URL).replace(/\/+$/, '')

if (!PASSWORD || PASSWORD.length < 10) {
  console.error('ADMIN_PASSWORD kamida 10 belgidan iborat bo\'lishi kerak. Namuna: .env.example')
  process.exit(1)
}

const { db, getSetting, setSetting } = openDb(process.env.DB_PATH ?? join(ROOT, 'server', 'data', 'fibertech.db'))
const posts = postStore(db)
const auth = createAuth(db, { password: PASSWORD, secureCookie: PRODUCTION })
const analytics = createAnalytics(db, {
  secret: getSetting('visitorSecret'),
  countryOf: (ip) => geoip.lookup(ip)?.country ?? null,
})

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2',
  '.json': 'application/json', '.ico': 'image/x-icon',
}

const clientIp = (req) => {
  const forwarded = TRUST_PROXY ? req.headers['x-forwarded-for']?.split(',')[0]?.trim() : null
  return (forwarded || req.socket.remoteAddress || '').replace(/^::ffff:/, '')
}

// Qidiruv botlari va bir manzildan keladigan oqim statistikani to'ldirib yubormasligi uchun.
const trackHits = new Map()
function trackAllowed(ip) {
  const now = Date.now()
  const entry = trackHits.get(ip)
  if (!entry || now - entry.since > 60000) {
    if (trackHits.size > 10000) trackHits.clear()
    trackHits.set(ip, { count: 1, since: now })
    return true
  }
  entry.count += 1
  return entry.count <= 120
}

function json(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers })
  res.end(JSON.stringify(body))
}

function readBody(req, limit) {
  return new Promise((done, fail) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        fail(Object.assign(new Error('too large'), { status: 413 }))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => done(Buffer.concat(chunks).toString('utf8')))
    req.on('error', fail)
  })
}

async function readJson(req, limit = 1_000_000) {
  try {
    return JSON.parse(await readBody(req, limit))
  } catch (error) {
    if (error.status) throw error
    throw Object.assign(new Error('bad json'), { status: 400 })
  }
}

// Boshqa saytdan yuborilgan so'rovlarni rad etadi (CSRF).
function sameOrigin(req) {
  const { origin } = req.headers
  if (!origin) return true
  try {
    return new URL(origin).host === req.headers.host
  } catch {
    return false
  }
}

async function handleAdmin(req, res, url) {
  const { method } = req
  const route = url.pathname.slice('/api/admin'.length)

  if (method !== 'GET') {
    if (!sameOrigin(req)) return json(res, 403, { error: 'Ruxsat yöq.' })
    if (!req.headers['content-type']?.startsWith('application/json')) return json(res, 415, { error: 'JSON kerak.' })
  }

  if (route === '/login' && method === 'POST') {
    const ip = clientIp(req)
    if (auth.isLocked(ip)) return json(res, 429, { error: 'Urinişlar köp. 15 daqiqadan keyin qayta urinib köring.' })
    const body = await readJson(req, 4096)
    const cookie = auth.login(ip, body?.password)
    if (!cookie) return json(res, 401, { error: 'Parol notöğri.' })
    return json(res, 200, { ok: true }, { 'Set-Cookie': cookie })
  }

  if (!auth.isAuthed(req)) return json(res, 401, { error: 'Avval tizimga kiring.' })

  if (route === '/me' && method === 'GET') return json(res, 200, { ok: true })
  if (route === '/logout' && method === 'POST') return json(res, 200, { ok: true }, { 'Set-Cookie': auth.logout(req) })

  if (route === '/analytics' && method === 'GET') {
    const days = Number(url.searchParams.get('days'))
    return json(res, 200, analytics.report([7, 30, 90].includes(days) ? days : 30))
  }

  if (route === '/prices') {
    if (method === 'GET') return json(res, 200, { prices: getSetting('prices') })
    if (method === 'PUT') {
      const { value, error, index } = validatePrices((await readJson(req))?.prices)
      if (error) return json(res, 400, { error, index })
      setSetting('prices', value)
      return json(res, 200, { prices: value })
    }
  }

  if (route === '/posts') {
    if (method === 'GET') return json(res, 200, { posts: posts.list() })
    if (method === 'POST') {
      const { value, error } = validatePost(await readJson(req), { requireSlug: true })
      if (error) return json(res, 400, { error })
      if (posts.get(value.slug)) return json(res, 409, { error: 'Bu manzilda maqola bor.' })
      posts.create(value)
      return json(res, 201, { post: posts.get(value.slug) })
    }
  }

  const postRoute = route.match(/^\/posts\/([a-z0-9-]+)$/)
  if (postRoute) {
    const [, slug] = postRoute
    if (!posts.get(slug)) return json(res, 404, { error: 'Maqola topilmadi.' })
    if (method === 'GET') return json(res, 200, { post: posts.get(slug) })
    if (method === 'PUT') {
      const { value, error } = validatePost(await readJson(req), { requireSlug: false })
      if (error) return json(res, 400, { error })
      posts.update(slug, value)
      return json(res, 200, { post: posts.get(slug) })
    }
    if (method === 'DELETE') {
      posts.remove(slug)
      return json(res, 200, { ok: true })
    }
  }

  return json(res, 404, { error: 'Topilmadi.' })
}

async function handleApi(req, res, url) {
  if (url.pathname === '/api/public/content' && req.method === 'GET') {
    const published = posts.published().map(({ slug, date, art, texts }) => ({ slug, date, art, texts }))
    return json(res, 200, { prices: getSetting('prices'), posts: published })
  }

  if (url.pathname === '/api/track' && req.method === 'POST') {
    const ip = clientIp(req)
    if (sameOrigin(req) && trackAllowed(ip)) {
      let payload = null
      try {
        payload = JSON.parse(await readBody(req, 4096))
      } catch {
        // Noto'g'ri so'rov shunchaki sanalmaydi.
      }
      if (payload) {
        analytics.record({
          payload,
          ip,
          userAgent: req.headers['user-agent'],
          ownHost: req.headers.host,
          headerCountry: TRUST_PROXY ? req.headers['cf-ipcountry']?.slice(0, 2) || null : null,
        })
      }
    }
    res.writeHead(204).end()
    return undefined
  }

  if (url.pathname.startsWith('/api/admin/')) return handleAdmin(req, res, url)
  return json(res, 404, { error: 'Topilmadi.' })
}

function robots() {
  return `User-agent: *\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
}

function sitemap() {
  const published = posts.published()
  const entries = [
    ['/'],
    ['/blog'],
    ...PROJECT_SLUGS.map((slug) => [`/projects/${slug}`]),
    ...SERVICE_SLUGS.map((slug) => [`/services/${slug}`]),
    ...published.map((post) => [`/blog/${post.slug}`, post.date]),
  ]
  const urls = entries.map(([path, date]) => `  <url><loc>${SITE_URL}${path === '/' ? '' : path}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}</url>`)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

function serveStatic(req, res, url) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405).end()
    return
  }
  let pathname
  try {
    pathname = decodeURIComponent(url.pathname)
  } catch {
    res.writeHead(400).end()
    return
  }
  // /blog/ => /blog: bitta sahifaning bitta manzili bo'lsin.
  if (pathname.length > 1 && pathname.endsWith('/')) {
    res.writeHead(301, { Location: pathname.replace(/\/+$/, '') + url.search }).end()
    return
  }
  if (pathname === '/robots.txt' || pathname === '/sitemap.xml') {
    const body = pathname === '/robots.txt' ? robots() : sitemap()
    res.writeHead(200, { 'Content-Type': pathname === '/robots.txt' ? 'text/plain; charset=utf-8' : 'application/xml; charset=utf-8' }).end(body)
    return
  }
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/') || pathname === '/admin.html'
  let file = resolve(DIST, `.${isAdmin ? '/admin.html' : pathname}`)
  const inside = file === DIST || file.startsWith(DIST + sep)
  let status = 200
  if (!inside || !existsSync(file) || statSync(file).isDirectory()) {
    // Sayt bitta sahifadan ochiladi. Mavjud bo'lmagan manzil Google uchun 404 bo'lib qoladi.
    if (!isKnownPath(pathname, posts.published().map((p) => p.slug))) status = 404
    file = join(DIST, 'index.html')
  }
  if (!existsSync(file)) {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Sayt hali build qilinmagan: npm run build')
    return
  }

  const headers = {
    'Content-Type': MIME[extname(file)] ?? 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': file.includes(`${sep}assets${sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache',
  }
  if (isAdmin) {
    headers['X-Frame-Options'] = 'DENY'
    headers['X-Robots-Tag'] = 'noindex, nofollow'
  }
  res.writeHead(status, headers)
  if (req.method === 'HEAD') res.end()
  else createReadStream(file).pipe(res)
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  // www.fibertech.uz => fibertech.uz
  if (PRODUCTION && req.headers.host?.startsWith('www.')) {
    res.writeHead(301, { Location: SITE_URL + url.pathname + url.search }).end()
    return
  }
  try {
    if (url.pathname.startsWith('/api/')) await handleApi(req, res, url)
    else serveStatic(req, res, url)
  } catch (error) {
    if (res.headersSent) {
      res.destroy()
      return
    }
    if (error.status) {
      json(res, error.status, { error: 'Sörov notöğri.' })
      return
    }
    console.error(error)
    json(res, 500, { error: 'Server xatosi.' })
  }
}).listen(PORT, () => {
  console.log(`FiberTech: http://localhost:${PORT}  (admin: /admin)`)
})
