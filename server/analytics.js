import { createHash } from 'node:crypto'

const TIME_ZONE = 'Asia/Tashkent'
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|curl|wget|python|axios/i
const SEARCH_ENGINES = [
  [/(^|\.)google\./, 'Google'],
  [/(^|\.)yandex\.|(^|\.)ya\.ru$/, 'Yandex'],
  [/(^|\.)bing\.com$/, 'Bing'],
  [/(^|\.)duckduckgo\.com$/, 'DuckDuckGo'],
  [/(^|\.)yahoo\./, 'Yahoo'],
  [/(^|\.)mail\.ru$/, 'Mail.ru'],
]
const SOCIAL = /(^|\.)(t\.me|telegram\.org|instagram\.com|facebook\.com|fb\.com|x\.com|twitter\.com|linkedin\.com|youtube\.com|tiktok\.com|vk\.com)$/
const SEARCH_PARAMS = ['q', 'text', 'query', 'p', 'wd']

export const dayOf = (date = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)

const clip = (value, max) => (typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null)

export function classifyReferrer(referrer, ownHost) {
  const direct = { sourceType: 'direct', host: null, url: null, engine: null, term: null }
  if (!referrer) return direct
  let url
  try {
    url = new URL(referrer)
  } catch {
    return direct
  }
  if (!/^https?:$/.test(url.protocol)) return direct
  const host = url.hostname.replace(/^www\./, '').toLowerCase()
  if (url.host === ownHost) return direct

  // Havolaning so'rov qismi saqlanmaydi: unda shaxsiy ma'lumot bo'lishi mumkin. Faqat qidiruv so'zi olinadi.
  const clean = `${url.protocol}//${url.host}${url.pathname}`.slice(0, 300)
  const engine = SEARCH_ENGINES.find(([re]) => re.test(host))?.[1]
  if (engine) {
    const term = SEARCH_PARAMS.map((p) => url.searchParams.get(p)).find(Boolean)
    return { sourceType: 'search', host, url: clean, engine, term: clip(term?.toLowerCase(), 120) }
  }
  return { sourceType: SOCIAL.test(host) ? 'social' : 'link', host, url: clean, engine: null, term: null }
}

export const EVENT_TYPES = ['form', 'telegram', 'email']

export function createAnalytics(db, { secret, countryOf }) {
  // IP manzil saqlanmaydi. Xesh har kuni o'zgaradi: odamni kunlar orasida kuzatib bo'lmaydi.
  const visitorOf = (day, ip, userAgent) => createHash('sha256').update(`${secret}|${day}|${ip}|${userAgent}`).digest('hex').slice(0, 24)
  const insertEvent = db.prepare('INSERT INTO events (day, visitor, type) VALUES (?, ?, ?)')

  const insert = db.prepare(`
    INSERT INTO page_views (day, visitor, path, entry, source_type, ref_host, ref_url, search_engine, search_term, utm_source, utm_campaign, country, device, lang)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  return {
    record({ payload, ip, userAgent, ownHost, headerCountry }) {
      if (!userAgent || BOT.test(userAgent)) return false
      const path = clip(payload?.path, 120)
      if (!path || !/^\/[\w/-]*$/.test(path)) return false

      const day = dayOf()
      const visitor = visitorOf(day, ip, userAgent)
      const entry = payload.entry === true
      const source = entry ? classifyReferrer(clip(payload.referrer, 2000), ownHost) : null
      const device = /mobile|android|iphone/i.test(userAgent) ? 'mobile' : /ipad|tablet/i.test(userAgent) ? 'tablet' : 'desktop'

      insert.run(
        day, visitor, path, entry ? 1 : 0,
        source?.sourceType ?? null, source?.host ?? null, source?.url ?? null, source?.engine ?? null,
        source ? (source.term ?? clip(payload.utmTerm?.toLowerCase?.(), 120)) : null,
        entry ? clip(payload.utmSource, 80) : null, entry ? clip(payload.utmCampaign, 80) : null,
        headerCountry ?? countryOf(ip), device, clip(payload.lang, 5),
      )
      return true
    },

    // Natija: ariza yuborildi, Telegram yoki email bosildi.
    recordEvent({ type, ip, userAgent }) {
      if (!EVENT_TYPES.includes(type) || !userAgent || BOT.test(userAgent)) return false
      const day = dayOf()
      insertEvent.run(day, visitorOf(day, ip, userAgent), type)
      return true
    },

    report(days) {
      const dayList = Array.from({ length: days }, (_, i) => dayOf(new Date(Date.now() - (days - 1 - i) * 86400000)))
      const from = dayList[0]
      const previousFrom = dayOf(new Date(Date.now() - (days * 2 - 1) * 86400000))

      const VISITORS = 'COUNT(DISTINCT day || visitor)'
      const perDay = new Map(db.prepare(`SELECT day, ${VISITORS} visitors, COUNT(*) views FROM page_views WHERE day >= ? GROUP BY day`).all(from).map((r) => [r.day, r]))
      const totals = db.prepare(`SELECT ${VISITORS} visitors, COUNT(*) views FROM page_views WHERE day >= ?`).get(from)
      const previous = db.prepare(`SELECT ${VISITORS} visitors, COUNT(*) views FROM page_views WHERE day >= ? AND day < ?`).get(previousFrom, from)
      const today = perDay.get(dayOf()) ?? { visitors: 0, views: 0 }

      const top = (column, where = '', limit = 10) => db.prepare(`
        SELECT ${column} name, ${VISITORS} visitors, COUNT(*) views FROM page_views
        WHERE day >= ? AND ${column} IS NOT NULL ${where}
        GROUP BY ${column} ORDER BY visitors DESC, views DESC LIMIT ${limit}
      `).all(from)

      const entries = db.prepare(`SELECT source_type name, ${VISITORS} visitors FROM page_views WHERE day >= ? AND entry = 1 GROUP BY source_type ORDER BY visitors DESC`).all(from)
      const knownCountries = db.prepare(`SELECT ${VISITORS} visitors FROM page_views WHERE day >= ? AND country IS NOT NULL`).get(from).visitors

      // Har bir natija tashrif buyuruvchining o'sha kundagi birinchi kirishi manbasiga yoziladi.
      const eventCounts = Object.fromEntries(db.prepare('SELECT type, COUNT(*) n FROM events WHERE day >= ? GROUP BY type').all(from).map((r) => [r.type, r.n]))
      const converted = db.prepare(`SELECT ${VISITORS} visitors FROM events WHERE day >= ?`).get(from).visitors
      const bySource = db.prepare(`
        SELECT COALESCE((
          SELECT pv.source_type FROM page_views pv
          WHERE pv.day = e.day AND pv.visitor = e.visitor AND pv.entry = 1 ORDER BY pv.id LIMIT 1
        ), 'direct') name, COUNT(DISTINCT e.day || e.visitor) visitors
        FROM events e WHERE e.day >= ? GROUP BY name ORDER BY visitors DESC
      `).all(from)

      return {
        days,
        conversions: {
          form: eventCounts.form ?? 0,
          telegram: eventCounts.telegram ?? 0,
          email: eventCounts.email ?? 0,
          visitors: converted,
          rate: totals.visitors ? Math.round((converted / totals.visitors) * 1000) / 10 : 0,
          bySource,
        },
        totals: { ...totals, today: today.visitors, todayViews: today.views, previousVisitors: previous.visitors, previousViews: previous.views },
        daily: dayList.map((day) => ({ day, visitors: perDay.get(day)?.visitors ?? 0, views: perDay.get(day)?.views ?? 0 })),
        sourceTypes: entries,
        links: top('ref_url', "AND source_type IN ('link', 'social', 'search')"),
        engines: top('search_engine'),
        terms: top('search_term'),
        campaigns: top('utm_source'),
        countries: top('country'),
        knownCountries,
        pages: top('path'),
        devices: top('device', '', 3),
      }
    },
  }
}
