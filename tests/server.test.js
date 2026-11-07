// Haqiqiy server vaqtinchalik bazada ishga tushiriladi va HTTP orqali tekshiriladi.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { after, before, describe, test } from 'node:test'

const ROOT = new URL('..', import.meta.url)
const PASSWORD = 'test-password-123'
const BROWSER = 'Mozilla/5.0 (X11; Linux x86_64) Chrome/130.0 Safari/537.36'
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64, 1)])
const WEBP = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP'), Buffer.alloc(32, 1)])
const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(32, 1)])

let nextPort = 18900 + Math.floor(Math.random() * 500)
let nextIp = 1
const freshIp = () => `10.0.${Math.floor(nextIp / 250)}.${(nextIp++ % 250) + 1}`

async function startServer(env, dir) {
  const port = nextPort++
  const dist = join(dir, 'dist')
  mkdirSync(dist, { recursive: true })
  writeFileSync(join(dist, 'index.html'), '<!doctype html><title>site</title>')
  writeFileSync(join(dist, 'admin.html'), '<!doctype html><title>admin</title>')
  const child = spawn(process.execPath, ['--no-warnings', 'server/index.js'], {
    cwd: ROOT,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      ADMIN_PASSWORD: PASSWORD,
      TRUST_PROXY: '1',
      PORT: String(port),
      DB_PATH: join(dir, 'data', 'test.db'),
      DIST_DIR: dist,
      TELEGRAM_BOT_TOKEN: '',
      TELEGRAM_CHAT_ID: '',
      ...env,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let log = ''
  child.stderr.on('data', (chunk) => { log += chunk })
  await new Promise((done, fail) => {
    child.stdout.on('data', (chunk) => String(chunk).includes('FiberTech') && done())
    child.once('exit', (code) => fail(new Error(`server exited ${code}: ${log}`)))
  })
  return { base: `http://127.0.0.1:${port}`, port, stop: () => new Promise((done) => { child.once('exit', done); child.kill() }), log: () => log }
}

function client(base) {
  let cookie = ''
  const request = async (path, { method = 'GET', body, headers = {}, ip = freshIp(), raw } = {}) => {
    const response = await fetch(base + path, {
      method,
      redirect: 'manual',
      headers: {
        'x-forwarded-for': ip,
        'user-agent': BROWSER,
        ...(cookie ? { cookie } : {}),
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...headers,
      },
      body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined),
    })
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) cookie = setCookie.split(';')[0]
    const text = await response.text()
    let data = null
    try { data = JSON.parse(text) } catch { /* matn javobi */ }
    return { status: response.status, data, text, headers: response.headers }
  }
  return { request, login: () => request('/api/admin/login', { method: 'POST', body: { password: PASSWORD } }) }
}

const fullTexts = (name = 'Loyiha') => Object.fromEntries(['uz', 'ru', 'en'].map((lang) => [lang, {
  name: `${name} ${lang}`, category: 'Sayt', alt: 'Rasm', galleryAlt: [], summary: 'Tavsif', task: 'Vazifa', solution: 'Yechim', result: 'Natija', services: ['Dizayn'],
}]))
const project = (over = {}) => ({
  slug: 'yangi-loyiha', status: 'published', url: 'https://misol.uz/', image: '/works/iau.webp', width: 100, height: 80,
  logo: '', wide: false, sample: false, tech: ['react'], gallery: [], texts: fullTexts(), ...over,
})
const lead = (over = {}) => ({ name: 'Ali Valiyev', reach: '+998901234567', message: 'Sayt kerak', service: 'Sayt', lang: 'uz', ...over })

describe('server', () => {
  let dir
  let server
  let anon
  let admin

  before(async () => {
    dir = mkdtempSync(join(tmpdir(), 'fibertech-test-'))
    server = await startServer({}, dir)
    anon = client(server.base)
    admin = client(server.base)
    assert.equal((await admin.login()).status, 200)
  })
  after(async () => {
    await server.stop()
    rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
  })

  test('ochiq kontent: boshlang\'ich loyihalar, mijozlar va aloqa', async () => {
    const { data, status } = await anon.request('/api/public/content')
    assert.equal(status, 200)
    assert.deepEqual(data.projects.map((p) => p.slug), ['iau', 'oak', 'taxiline', 'ayolqadami'])
    assert.ok(data.projects.every((p) => p.texts.uz.name && p.texts.ru.name && p.texts.en.name))
    assert.equal(data.clients.length, 4)
    assert.deepEqual(data.testimonials, [])
    assert.deepEqual(data.contact, { email: 'hello@fibertech.uz', telegram: 'fibertech' })
    assert.equal(data.prices.length, 8)
    assert.equal(data.posts.length, 3)
  })

  test('har bir admin marshruti kirishsiz yopiq', async () => {
    const routes = [
      ['GET', '/leads'], ['GET', '/leads/summary'], ['PUT', '/leads/1'], ['DELETE', '/leads/1'], ['GET', '/projects'], ['POST', '/projects'],
      ['PUT', '/projects/iau'], ['DELETE', '/projects/iau'], ['PUT', '/projects-order'], ['GET', '/clients'], ['PUT', '/clients'], ['GET', '/testimonials'],
      ['PUT', '/testimonials'], ['GET', '/settings'], ['PUT', '/settings'], ['POST', '/settings/test-telegram'], ['GET', '/search-console'], ['GET', '/analytics'],
    ]
    for (const [method, route] of routes) {
      const { status } = await anon.request(`/api/admin${route}`, { method, body: method === 'GET' ? undefined : {} })
      assert.equal(status, 401, `${method} ${route}`)
    }
    const upload = await anon.request('/api/admin/uploads', { method: 'POST', raw: PNG, headers: { 'content-type': 'image/png' } })
    assert.equal(upload.status, 401)
    assert.equal(existsSync(join(dir, 'data', 'uploads')), false)
  })

  describe('arizalar', () => {
    test('ariza saqlanadi va panelda ko\'rinadi', async () => {
      const created = await anon.request('/api/public/leads', { method: 'POST', body: lead({ name: '  Vali  ', message: '<script>alert(1)</script>' }) })
      assert.equal(created.status, 201)
      const { data } = await admin.request('/api/admin/leads')
      const saved = data.leads.find((l) => l.name === 'Vali')
      assert.ok(saved)
      assert.equal(saved.status, 'new')
      assert.equal(saved.message, '<script>alert(1)</script>')
      assert.equal(saved.notified, 0)
      assert.ok((await admin.request('/api/admin/leads/summary')).data.new >= 1)
    })

    test('noto\'g\'ri ma\'lumot rad etiladi', async () => {
      for (const bad of [{ name: 'A' }, { reach: 'x' }, { message: '  ' }, { name: 123 }]) {
        assert.equal((await anon.request('/api/public/leads', { method: 'POST', body: lead(bad) })).status, 400, JSON.stringify(bad))
      }
      assert.equal((await anon.request('/api/public/leads', { method: 'POST', raw: '{bad', headers: { 'content-type': 'application/json' } })).status, 400)
      assert.equal((await anon.request('/api/public/leads', { method: 'POST', raw: 'null', headers: { 'content-type': 'application/json' } })).status, 400)
    })

    test('bot maydoni to\'ldirilsa saqlanmaydi, lekin bot buni bilmaydi', async () => {
      const before = (await admin.request('/api/admin/leads')).data.leads.length
      const { status } = await anon.request('/api/public/leads', { method: 'POST', body: lead({ website: 'http://spam' }) })
      assert.equal(status, 201)
      assert.equal((await admin.request('/api/admin/leads')).data.leads.length, before)
    })

    test('boshqa saytdan va JSON bo\'lmagan so\'rov o\'tmaydi', async () => {
      const foreign = await anon.request('/api/public/leads', { method: 'POST', body: lead(), headers: { origin: 'https://evil.example' } })
      assert.equal(foreign.status, 403)
      const plain = await anon.request('/api/public/leads', { method: 'POST', raw: JSON.stringify(lead()), headers: { 'content-type': 'text/plain' } })
      assert.equal(plain.status, 415)
    })

    test('bir manzildan 5 tadan ortiq ariza o\'tmaydi', async () => {
      const ip = freshIp()
      for (let i = 0; i < 5; i += 1) assert.equal((await anon.request('/api/public/leads', { method: 'POST', body: lead(), ip })).status, 201)
      assert.equal((await anon.request('/api/public/leads', { method: 'POST', body: lead(), ip })).status, 429)
      assert.equal((await anon.request('/api/public/leads', { method: 'POST', body: lead() })).status, 201)
    })

    test('holat va izoh yangilanadi, keyin o\'chiriladi', async () => {
      await anon.request('/api/public/leads', { method: 'POST', body: lead({ name: 'Holat Test' }) })
      const { id } = (await admin.request('/api/admin/leads')).data.leads.find((l) => l.name === 'Holat Test')
      const updated = await admin.request(`/api/admin/leads/${id}`, { method: 'PUT', body: { status: 'won', note: 'Shartnoma' } })
      assert.equal(updated.status, 200)
      assert.equal(updated.data.lead.status, 'won')
      assert.equal(updated.data.lead.note, 'Shartnoma')
      assert.equal((await admin.request(`/api/admin/leads/${id}`, { method: 'PUT', body: { status: 'nope' } })).status, 400)
      assert.equal((await admin.request(`/api/admin/leads/${id}`, { method: 'DELETE', body: {} })).status, 200)
      assert.equal((await admin.request(`/api/admin/leads/${id}`, { method: 'DELETE', body: {} })).status, 404)
    })
  })

  describe('natijalar statistikasi', () => {
    test('ariza, Telegram va email sanaladi, manbaga bog\'lanadi', async () => {
      const ip = freshIp()
      const track = (body, headers = {}) => anon.request('/api/track', { method: 'POST', raw: JSON.stringify(body), headers: { 'content-type': 'text/plain', ...headers }, ip })
      const report = async () => (await admin.request('/api/admin/analytics?days=7')).data.conversions

      const start = await report()
      await track({ path: '/', entry: true, referrer: 'https://t.me/kanal', lang: 'uz' })
      await track({ event: 'telegram' })
      await track({ event: 'email' })
      await anon.request('/api/public/leads', { method: 'POST', body: lead(), ip })

      const end = await report()
      assert.equal(end.telegram, start.telegram + 1)
      assert.equal(end.email, start.email + 1)
      assert.equal(end.form, start.form + 1)
      assert.equal(end.visitors, start.visitors + 1)
      assert.ok(end.bySource.some((s) => s.name === 'social' && s.visitors >= 1))
      assert.ok(end.rate > 0)
    })

    test('botlar, noma\'lum hodisa va soxta "form" sanalmaydi', async () => {
      const report = async () => (await admin.request('/api/admin/analytics?days=7')).data.conversions
      const start = await report()
      const post = (body, ua = BROWSER) => anon.request('/api/track', { method: 'POST', raw: JSON.stringify(body), headers: { 'content-type': 'text/plain', 'user-agent': ua } })
      assert.equal((await post({ event: 'telegram' }, 'Googlebot/2.1')).status, 204)
      assert.equal((await post({ event: 'hack' })).status, 204)
      assert.equal((await post({ event: 'form' })).status, 204)
      assert.equal((await post({ event: { a: 1 } })).status, 204)
      const end = await report()
      assert.deepEqual([end.telegram, end.email, end.form], [start.telegram, start.email, start.form])
    })

    test('oddiy tashrif hisobi buzilmagan', async () => {
      const ip = freshIp()
      const before = (await admin.request('/api/admin/analytics?days=7')).data.totals.views
      await anon.request('/api/track', { method: 'POST', raw: JSON.stringify({ path: '/blog', entry: true, referrer: '', lang: 'uz' }), headers: { 'content-type': 'text/plain' }, ip })
      assert.equal((await admin.request('/api/admin/analytics?days=7')).data.totals.views, before + 1)
    })
  })

  describe('rasm yuklash', () => {
    const upload = (raw, type = 'image/png', who = admin) => who.request('/api/admin/uploads', { method: 'POST', raw, headers: { 'content-type': type } })

    test('PNG, JPG va WebP yuklanadi va to\'g\'ri turda beriladi', async () => {
      for (const [raw, ext, mime] of [[PNG, 'png', 'image/png'], [JPG, 'jpg', 'image/jpeg'], [WEBP, 'webp', 'image/webp']]) {
        const { status, data } = await upload(raw, mime)
        assert.equal(status, 201)
        assert.match(data.url, new RegExp(`^/uploads/[a-f0-9]{32}\\.${ext}$`))
        const file = await anon.request(data.url)
        assert.equal(file.status, 200)
        assert.equal(file.headers.get('content-type'), mime)
        assert.equal(file.headers.get('x-content-type-options'), 'nosniff')
        assert.equal((await anon.request(data.url, { method: 'HEAD' })).status, 200)
      }
    })

    test('turi soxta fayl qabul qilinmaydi (SVG, HTML, nomi rasm bo\'lgan matn)', async () => {
      const count = () => readdirSync(join(dir, 'data', 'uploads')).length
      await upload(PNG)
      const before = count()
      for (const raw of ['<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>', '<!doctype html><script>alert(1)</script>', 'short', '']) {
        assert.equal((await upload(raw, 'image/png')).status, 415, raw)
      }
      assert.equal(count(), before)
    })

    test('5 MB dan katta fayl 413 oladi va server ishlashda davom etadi', async () => {
      const big = Buffer.concat([PNG, Buffer.alloc(5 * 1024 * 1024)])
      const { status, data } = await upload(big)
      assert.equal(status, 413)
      assert.equal(data.error, 'Hajmi juda katta.')
      assert.equal((await anon.request('/api/public/content')).status, 200)
    })

    test('boshqa saytdan yuklab bo\'lmaydi', async () => {
      const { status } = await admin.request('/api/admin/uploads', { method: 'POST', raw: PNG, headers: { 'content-type': 'image/png', origin: 'https://evil.example' } })
      assert.equal(status, 403)
    })

    test('uploads orqali boshqa fayllarni o\'qib bo\'lmaydi', async () => {
      for (const path of ['/uploads/test.db', '/uploads/..%2Ftest.db', '/uploads/%2e%2e%2ftest.db', '/uploads/..%5Ctest.db', `/uploads/${'a'.repeat(32)}.png`, '/uploads/']) {
        const { status, text } = await anon.request(path)
        assert.notEqual(status, 200, path)
        assert.ok(!text.includes('SQLite'), path)
      }
    })
  })

  describe('loyihalar', () => {
    test('qoralama saytda ko\'rinmaydi, e\'lon qilingach ko\'rinadi', async () => {
      const draft = project({ slug: 'qoralama', status: 'draft', image: '', width: 0, height: 0, texts: {} })
      assert.equal((await admin.request('/api/admin/projects', { method: 'POST', body: draft })).status, 201)
      assert.equal((await anon.request('/projects/qoralama')).status, 404)
      assert.ok(!(await anon.request('/sitemap.xml')).text.includes('qoralama'))
      assert.ok(!(await anon.request('/api/public/content')).data.projects.some((p) => p.slug === 'qoralama'))

      assert.equal((await admin.request('/api/admin/projects/qoralama', { method: 'PUT', body: project({ slug: 'qoralama' }) })).status, 200)
      assert.equal((await anon.request('/projects/qoralama')).status, 200)
      assert.ok((await anon.request('/sitemap.xml')).text.includes('/projects/qoralama'))
      assert.ok((await anon.request('/api/public/content')).data.projects.some((p) => p.slug === 'qoralama'))

      assert.equal((await admin.request('/api/admin/projects/qoralama', { method: 'DELETE', body: {} })).status, 200)
      assert.equal((await anon.request('/projects/qoralama')).status, 404)
    })

    test('to\'liq bo\'lmagan loyiha e\'lon qilinmaydi', async () => {
      const noImage = await admin.request('/api/admin/projects', { method: 'POST', body: project({ image: '', width: 0, height: 0 }) })
      assert.equal(noImage.status, 400)
      const texts = fullTexts()
      texts.ru.task = ''
      const noText = await admin.request('/api/admin/projects', { method: 'POST', body: project({ texts }) })
      assert.equal(noText.status, 400)
      assert.match(noText.data.error, /RU/)
    })

    test('xavfli qiymatlar o\'tmaydi', async () => {
      const bad = [
        { url: 'javascript:alert(1)' }, { url: 'data:text/html,x' }, { image: 'https://evil.example/x.png' }, { image: '//evil.example/x.png' },
        { image: '/../../etc/passwd.png' }, { logo: 'javascript:alert(1)' }, { slug: 'Yomon Manzil' }, { slug: '../x' }, { tech: ['<script>'] },
        { gallery: [{ src: 'https://evil.example/x.png', width: 1, height: 1 }] }, { gallery: [{ src: '/works/iau.webp', width: -1, height: 1 }] }, { status: 'public' },
      ]
      for (const over of bad) {
        assert.equal((await admin.request('/api/admin/projects', { method: 'POST', body: project(over) })).status, 400, JSON.stringify(over))
      }
    })

    test('takroriy manzil 409, mavjud loyihaning manzili o\'zgarmaydi', async () => {
      assert.equal((await admin.request('/api/admin/projects', { method: 'POST', body: project({ slug: 'iau' }) })).status, 409)
      const put = await admin.request('/api/admin/projects', { method: 'POST', body: project({ slug: 'bir' }) })
      assert.equal(put.status, 201)
      const renamed = await admin.request('/api/admin/projects/bir', { method: 'PUT', body: project({ slug: 'boshqa' }) })
      assert.equal(renamed.data.project.slug, 'bir')
      await admin.request('/api/admin/projects/bir', { method: 'DELETE', body: {} })
    })

    test('tartib o\'zgaradi, noto\'g\'ri tartib rad etiladi', async () => {
      const slugs = (await admin.request('/api/admin/projects')).data.projects.map((p) => p.slug)
      const reversed = [...slugs].reverse()
      assert.equal((await admin.request('/api/admin/projects-order', { method: 'PUT', body: { slugs: reversed } })).status, 200)
      assert.deepEqual((await anon.request('/api/public/content')).data.projects.map((p) => p.slug), reversed)
      for (const wrong of [slugs.slice(1), [...slugs.slice(1), slugs[1]], [...slugs.slice(1), 'yoq'], 'iau', null]) {
        assert.equal((await admin.request('/api/admin/projects-order', { method: 'PUT', body: { slugs: wrong } })).status, 400)
      }
      await admin.request('/api/admin/projects-order', { method: 'PUT', body: { slugs } })
    })

    test('galereya izohlari rasm soniga mos saqlanadi', async () => {
      const texts = fullTexts()
      texts.uz.galleryAlt = ['Birinchi', 'Ortiqcha']
      const gallery = [{ src: '/works/iau.webp', width: 10, height: 10, extra: 'x' }]
      const { data } = await admin.request('/api/admin/projects', { method: 'POST', body: project({ slug: 'galereya', gallery, texts }) })
      assert.deepEqual(data.project.texts.uz.galleryAlt, ['Birinchi'])
      assert.deepEqual(data.project.texts.ru.galleryAlt, [''])
      assert.deepEqual(data.project.gallery, [{ src: '/works/iau.webp', width: 10, height: 10 }])
      await admin.request('/api/admin/projects/galereya', { method: 'DELETE', body: {} })
    })

    test('boshlang\'ich loyiha o\'zgarishsiz qayta saqlanadi', async () => {
      const { projects } = (await admin.request('/api/admin/projects')).data
      for (const p of projects) {
        const { status, data } = await admin.request(`/api/admin/projects/${p.slug}`, { method: 'PUT', body: p })
        assert.equal(status, 200, p.slug)
        assert.deepEqual(data.project.texts, p.texts, p.slug)
        assert.deepEqual(data.project.gallery, p.gallery, p.slug)
        assert.deepEqual(data.project.tech, p.tech, p.slug)
      }
    })
  })

  describe('mijozlar va fikrlar', () => {
    test('mijozlar saqlanadi, yangi kartaga id beriladi', async () => {
      const original = (await admin.request('/api/admin/clients')).data.clients
      const next = [...original, { name: 'Yangi', logo: '/clients/iau.webp', url: 'https://yangi.uz', slot: 3, project: '' }]
      const { status, data } = await admin.request('/api/admin/clients', { method: 'PUT', body: { clients: next } })
      assert.equal(status, 200)
      assert.match(data.clients.at(-1).id, /^[a-f0-9]{16}$/)
      assert.equal(data.clients.at(-1).url, 'https://yangi.uz/')
      assert.equal((await anon.request('/api/public/content')).data.clients.length, original.length + 1)
      assert.equal((await admin.request('/api/admin/clients', { method: 'PUT', body: { clients: original } })).status, 200)
    })

    test('noto\'g\'ri mijoz rad etiladi', async () => {
      const ok = { name: 'A', logo: '/clients/iau.webp' }
      const bad = [
        [{ ...ok, url: 'javascript:alert(1)' }], [{ ...ok, name: ' ' }], [{ ...ok, logo: '' }], [{ ...ok, logo: 'https://evil.example/x.png' }],
        [{ ...ok, slot: 0 }], [{ ...ok, slot: 1.5 }], [{ ...ok, slot: 1 }, { ...ok, slot: 1 }], 'x', null,
      ]
      for (const clients of bad) assert.equal((await admin.request('/api/admin/clients', { method: 'PUT', body: { clients } })).status, 400, JSON.stringify(clients))
    })

    test('fikr hamma tilda to\'liq bo\'lishi kerak', async () => {
      const quote = { uz: 'Zo\'r', ru: 'Отлично', en: 'Great' }
      const role = { uz: 'Direktor', ru: '', en: '' }
      const missing = await admin.request('/api/admin/testimonials', { method: 'PUT', body: { testimonials: [{ name: 'Ali', quote: { ...quote, en: '' }, role }] } })
      assert.equal(missing.status, 400)
      assert.match(missing.data.error, /EN/)
      assert.equal((await admin.request('/api/admin/testimonials', { method: 'PUT', body: { testimonials: [{ name: 'Ali', quote, role, photo: 'javascript:x' }] } })).status, 400)

      const saved = await admin.request('/api/admin/testimonials', { method: 'PUT', body: { testimonials: [{ name: 'Ali', quote, role }] } })
      assert.equal(saved.status, 200)
      assert.equal((await anon.request('/api/public/content')).data.testimonials[0].quote.en, 'Great')
      await admin.request('/api/admin/testimonials', { method: 'PUT', body: { testimonials: [] } })
    })
  })

  describe('sozlamalar', () => {
    test('aloqa ma\'lumotlari yangilanadi, Telegram @siz saqlanadi', async () => {
      const { status, data } = await admin.request('/api/admin/settings', { method: 'PUT', body: { email: 'info@fibertech.uz', telegram: '@fibertech_uz' } })
      assert.equal(status, 200)
      assert.deepEqual(data.contact, { email: 'info@fibertech.uz', telegram: 'fibertech_uz' })
      assert.deepEqual((await anon.request('/api/public/content')).data.contact, data.contact)
      await admin.request('/api/admin/settings', { method: 'PUT', body: { email: 'hello@fibertech.uz', telegram: 'fibertech' } })
    })

    test('noto\'g\'ri aloqa ma\'lumoti rad etiladi', async () => {
      for (const body of [{ email: 'yomon', telegram: 'fibertech' }, { email: 'a@b.uz', telegram: 'x' }, { email: 'a@b.uz', telegram: 'javascript:alert' }, { email: 'a@b.uz', telegram: 'a/../b' }, {}]) {
        assert.equal((await admin.request('/api/admin/settings', { method: 'PUT', body })).status, 400, JSON.stringify(body))
      }
    })

    test('kalitlarsiz integratsiyalar o\'chiq turadi, xato bermaydi', async () => {
      const { data } = await admin.request('/api/admin/settings')
      assert.deepEqual(data.telegram, { configured: false })
      assert.deepEqual(data.searchConsole, { configured: false })
      assert.deepEqual((await admin.request('/api/admin/search-console')).data, { configured: false })
      assert.equal((await admin.request('/api/admin/settings/test-telegram', { method: 'POST', body: {} })).status, 409)
    })
  })

  describe('blog', () => {
    const texts = Object.fromEntries(['uz', 'ru', 'en'].map((l) => [l, { category: 'K', title: `S ${l}`, excerpt: 'Q', sections: [{ p: ['Matn'] }] }]))
    const post = (over = {}) => ({ slug: 'rasmli', date: '2026-11-07', art: 0, status: 'published', texts, ...over })

    test('muqova rasmi saqlanadi va saytga chiqadi, tashqi manzil o\'tmaydi', async () => {
      const cover = (await admin.request('/api/admin/uploads', { method: 'POST', raw: PNG, headers: { 'content-type': 'image/png' } })).data.url
      for (const bad of ['https://evil.example/x.png', '/works/iau.webp', 'javascript:x']) {
        assert.equal((await admin.request('/api/admin/posts', { method: 'POST', body: post({ cover: bad }) })).status, 400, bad)
      }
      assert.equal((await admin.request('/api/admin/posts', { method: 'POST', body: post({ cover }) })).status, 201)
      assert.equal((await anon.request('/api/public/content')).data.posts.find((p) => p.slug === 'rasmli').cover, cover)
      const cleared = await admin.request('/api/admin/posts/rasmli', { method: 'PUT', body: post({ cover: '' }) })
      assert.equal(cleared.data.post.cover, '')
      await admin.request('/api/admin/posts/rasmli', { method: 'DELETE', body: {} })
    })
  })
})

describe('Telegram bildirishnomasi', () => {
  let dir
  let server
  let telegram
  let received = []
  let respondWith = 200

  before(async () => {
    telegram = createServer((req, res) => {
      let body = ''
      req.on('data', (chunk) => { body += chunk })
      req.on('end', () => {
        received.push({ url: req.url, body: JSON.parse(body) })
        res.writeHead(respondWith, { 'content-type': 'application/json' }).end('{}')
      })
    })
    await new Promise((done) => { telegram.listen(0, '127.0.0.1', done) })
    dir = mkdtempSync(join(tmpdir(), 'fibertech-test-'))
    server = await startServer({
      TELEGRAM_BOT_TOKEN: 'SECRET-TOKEN',
      TELEGRAM_CHAT_ID: '-100123',
      TELEGRAM_API_BASE: `http://127.0.0.1:${telegram.address().port}`,
    }, dir)
  })
  after(async () => {
    await server.stop()
    telegram.close()
    rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
  })

  const waitForNotified = async (admin, name, wanted) => {
    for (let i = 0; i < 40; i += 1) {
      const found = (await admin.request('/api/admin/leads')).data.leads.find((l) => l.name === name)
      if (found?.notified === wanted) return found
      await new Promise((done) => { setTimeout(done, 50) })
    }
    throw new Error(`notified != ${wanted}`)
  }

  test('ariza Telegram\'ga oddiy matn bo\'lib boradi', async () => {
    const anon = client(server.base)
    const admin = client(server.base)
    await admin.login()
    received = []
    assert.equal((await anon.request('/api/public/leads', { method: 'POST', body: lead({ name: 'Bold <b>Ali</b>', message: 'Salom' }) })).status, 201)
    await waitForNotified(admin, 'Bold <b>Ali</b>', 1)
    assert.equal(received.length, 1)
    assert.equal(received[0].url, '/botSECRET-TOKEN/sendMessage')
    assert.equal(received[0].body.chat_id, '-100123')
    assert.equal(received[0].body.parse_mode, undefined)
    assert.match(received[0].body.text, /Bold <b>Ali<\/b>/)
    assert.match(received[0].body.text, /\+998901234567/)
    assert.deepEqual((await admin.request('/api/admin/settings')).data.telegram, { configured: true })
  })

  test('Telegram ishlamasa ham ariza saqlanadi, belgilanadi va token logga tushmaydi', async () => {
    const anon = client(server.base)
    const admin = client(server.base)
    await admin.login()
    respondWith = 500
    assert.equal((await anon.request('/api/public/leads', { method: 'POST', body: lead({ name: 'Yetmagan' }) })).status, 201)
    await waitForNotified(admin, 'Yetmagan', -1)
    assert.equal((await admin.request('/api/admin/settings/test-telegram', { method: 'POST', body: {} })).status, 502)
    respondWith = 200
    assert.equal((await admin.request('/api/admin/settings/test-telegram', { method: 'POST', body: {} })).status, 200)
    assert.ok(!server.log().includes('SECRET-TOKEN'))
  })
})

describe('eski bazadan yangilanish', () => {
  test('ishlayotgan saytning bazasi buzilmaydi va to\'ldiriladi', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'fibertech-test-'))
    mkdirSync(join(dir, 'data'))
    const db = new DatabaseSync(join(dir, 'data', 'test.db'))
    db.exec(`
      CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE sessions (token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);
      CREATE TABLE posts (slug TEXT PRIMARY KEY, date TEXT NOT NULL, art INTEGER NOT NULL, status TEXT NOT NULL, texts TEXT NOT NULL, updated_at INTEGER NOT NULL);
      CREATE TABLE page_views (
        id INTEGER PRIMARY KEY, day TEXT NOT NULL, visitor TEXT NOT NULL, path TEXT NOT NULL, entry INTEGER NOT NULL, source_type TEXT, ref_host TEXT, ref_url TEXT,
        search_engine TEXT, search_term TEXT, utm_source TEXT, utm_campaign TEXT, country TEXT, device TEXT, lang TEXT
      );
    `)
    const texts = JSON.stringify(Object.fromEntries(['uz', 'ru', 'en'].map((l) => [l, { category: 'K', title: 'Eski', excerpt: 'Q', sections: [{ p: ['M'] }] }])))
    const prices = [{ from: 1, tiers: [1, 2, 3] }, { from: 7, tiers: [7, 12, 20] }, { from: 12, tiers: [12, 22, 40] }, { from: 25 }, { from: 20 }, { from: 3 }, { from: 5 }, { from: 4 }]
    const set = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
    set.run('prices', JSON.stringify(prices))
    set.run('visitorSecret', JSON.stringify('secret'))
    set.run('seeded', 'true')
    db.prepare('INSERT INTO posts VALUES (?, ?, ?, ?, ?, ?)').run('eski-maqola', '2026-11-06', 2, 'published', texts, 1)
    db.prepare("INSERT INTO page_views (day, visitor, path, entry, source_type) VALUES (?, 'v', '/', 1, 'direct')").run(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent' }).format(new Date()))
    db.close()

    const server = await startServer({}, dir)
    try {
      const anon = client(server.base)
      const admin = client(server.base)
      await admin.login()
      const { data } = await anon.request('/api/public/content')
      assert.deepEqual(data.posts.map((p) => [p.slug, p.cover]), [['eski-maqola', '']])
      assert.equal(data.prices[0].from, 1)
      assert.equal(data.projects.length, 4)
      const report = (await admin.request('/api/admin/analytics?days=7')).data
      assert.equal(report.totals.views, 1)
      assert.deepEqual(report.conversions, { form: 0, telegram: 0, email: 0, visitors: 0, rate: 0, bySource: [] })
      assert.equal((await admin.request('/api/admin/posts/eski-maqola', {
        method: 'PUT', body: { date: '2026-11-06', art: 2, status: 'published', texts: Object.fromEntries(['uz', 'ru', 'en'].map((l) => [l, { category: 'K', title: 'Yangi', excerpt: 'Q', sections: [{ p: ['M'] }] }])) },
      })).status, 200)
    } finally {
      await server.stop()
    }

    // Ikkinchi ishga tushish: admin paneldagi o'zgarishlar seed bilan bosilib ketmaydi.
    const again = await startServer({}, dir)
    try {
      const { data } = await client(again.base).request('/api/public/content')
      assert.equal(data.posts[0].texts.uz.title, 'Yangi')
    } finally {
      await again.stop()
      rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
    }
  })
})
