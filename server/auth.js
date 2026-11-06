import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const SESSION_MS = 12 * 60 * 60 * 1000
const MAX_FAILURES = 5
const LOCK_MS = 15 * 60 * 1000
const COOKIE = 'ft_admin'

const sha256 = (value) => createHash('sha256').update(value).digest('hex')

export function createAuth(db, { password, secureCookie }) {
  // Parol xotirada ham ochiq saqlanmaydi, solishtirish vaqti parolga bog'liq emas.
  const salt = randomBytes(16)
  const expected = scryptSync(password, salt, 64)
  const failures = new Map()

  const cookie = (value, maxAge) =>
    `${COOKIE}=${value}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secureCookie ? '; Secure' : ''}`

  const tokenFrom = (req) => {
    for (const part of (req.headers.cookie ?? '').split(';')) {
      const [name, value] = part.trim().split('=')
      if (name === COOKIE) return value
    }
    return null
  }

  return {
    isLocked(ip) {
      const entry = failures.get(ip)
      if (!entry) return false
      if (Date.now() - entry.since > LOCK_MS) {
        failures.delete(ip)
        return false
      }
      return entry.count >= MAX_FAILURES
    },

    // Muvaffaqiyatli bo'lsa Set-Cookie qiymatini qaytaradi.
    login(ip, attempt) {
      const ok = typeof attempt === 'string' && timingSafeEqual(scryptSync(attempt, salt, 64), expected)
      if (!ok) {
        const entry = failures.get(ip) ?? { count: 0, since: Date.now() }
        entry.count += 1
        failures.set(ip, entry)
        return null
      }
      failures.delete(ip)
      const token = randomBytes(32).toString('hex')
      db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now())
      db.prepare('INSERT INTO sessions (token_hash, expires_at) VALUES (?, ?)').run(sha256(token), Date.now() + SESSION_MS)
      return cookie(token, SESSION_MS / 1000)
    },

    logout(req) {
      const token = tokenFrom(req)
      if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token))
      return cookie('', 0)
    },

    isAuthed(req) {
      const token = tokenFrom(req)
      if (!token) return false
      const row = db.prepare('SELECT expires_at FROM sessions WHERE token_hash = ?').get(sha256(token))
      return Boolean(row && row.expires_at > Date.now())
    },
  }
}
