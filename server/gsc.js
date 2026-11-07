// Google Search Console: qidirilgan so'zlar, bosishlar va o'rinlar.
// Kirish service account orqali, kalit fayli bo'lmasa bo'lim shunchaki o'chiq turadi.
import { createSign } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dayOf } from './analytics.js'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
const API = 'https://www.googleapis.com/webmasters/v3/sites'
const CACHE_MS = 12 * 60 * 60 * 1000
const ERROR_CACHE_MS = 5 * 60 * 1000
const RANGE_DAYS = 28
const TIMEOUT_MS = 15000

const base64url = (value) => Buffer.from(value).toString('base64url')

function signedJwt(key, nowMs) {
  const iat = Math.floor(nowMs / 1000)
  const body = `${base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${base64url(JSON.stringify({
    iss: key.client_email, scope: SCOPE, aud: TOKEN_URL, iat, exp: iat + 3600,
  }))}`
  return `${body}.${createSign('RSA-SHA256').update(body).sign(key.private_key, 'base64url')}`
}

const toRow = (row) => ({
  key: row.keys?.[0] ?? '',
  clicks: row.clicks ?? 0,
  impressions: row.impressions ?? 0,
  ctr: row.ctr ?? 0,
  position: row.position ?? 0,
})

export function createSearchConsole({ keyFile, site, fetchImpl = globalThis.fetch, now = Date.now }) {
  let cache = null

  async function call(url, init) {
    const response = await fetchImpl(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) })
    if (!response.ok) throw Object.assign(new Error('google'), { httpStatus: response.status })
    return response.json()
  }

  async function load() {
    const key = JSON.parse(readFileSync(keyFile, 'utf8'))
    if (!key.client_email || !key.private_key) throw Object.assign(new Error('key'), { badKey: true })

    let assertion
    try {
      assertion = signedJwt(key, now())
    } catch {
      throw Object.assign(new Error('key'), { badKey: true })
    }

    const { access_token: token } = await call(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
    })

    const to = dayOf(new Date(now()))
    const from = dayOf(new Date(now() - (RANGE_DAYS - 1) * 86400000))
    const query = (body) => call(`${API}/${encodeURIComponent(site)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: from, endDate: to, ...body }),
    })
    const [totals, queries, pages] = await Promise.all([
      query({}),
      query({ dimensions: ['query'], rowLimit: 25 }),
      query({ dimensions: ['page'], rowLimit: 10 }),
    ])
    return {
      configured: true,
      from,
      to,
      fetchedAt: now(),
      totals: toRow(totals.rows?.[0] ?? {}),
      queries: (queries.rows ?? []).map(toRow),
      pages: (pages.rows ?? []).map(toRow),
    }
  }

  function explain(error) {
    if (error.httpStatus === 403) return 'Service account uçun Search Console’da ruxsat berilmagan yoki sayt manzili notöğri.'
    if (error.httpStatus === 400 || error.httpStatus === 401) return 'Google kalitni qabul qilmadi. Kalit faylini tekşiring.'
    if (error.badKey || error instanceof SyntaxError) return 'Kalit fayli notöğri.'
    return 'Google bilan boğlanib bölmadi. Keyinroq qayta urinib köring.'
  }

  return {
    get configured() {
      return existsSync(keyFile)
    },
    async report() {
      if (!existsSync(keyFile)) return { configured: false }
      if (cache && now() < cache.until) return cache.value
      try {
        const value = await load()
        cache = { value, until: now() + CACHE_MS }
        return value
      } catch (error) {
        console.error(`Search Console: ${error.httpStatus ?? error.name}`)
        const value = { configured: true, error: explain(error) }
        cache = { value, until: now() + ERROR_CACHE_MS }
        return value
      }
    },
  }
}
