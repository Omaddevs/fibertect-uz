import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { randomBytes } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
import { defaultPosts, defaultPrices } from '../src/data/editable.js'

export function openDb(path) {
  mkdirSync(dirname(path), { recursive: true })
  const db = new DatabaseSync(path)
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS posts (
      slug TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      art INTEGER NOT NULL,
      status TEXT NOT NULL,
      texts TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS page_views (
      id INTEGER PRIMARY KEY,
      day TEXT NOT NULL,
      visitor TEXT NOT NULL,
      path TEXT NOT NULL,
      entry INTEGER NOT NULL,
      source_type TEXT,
      ref_host TEXT,
      ref_url TEXT,
      search_engine TEXT,
      search_term TEXT,
      utm_source TEXT,
      utm_campaign TEXT,
      country TEXT,
      device TEXT,
      lang TEXT
    );
    CREATE INDEX IF NOT EXISTS page_views_day ON page_views (day);
  `)

  const getSetting = (key) => {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key)
    return row ? JSON.parse(row.value) : undefined
  }
  const setSetting = (key, value) => {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
      .run(key, JSON.stringify(value))
  }

  // Birinchi ishga tushishda bazani saytdagi joriy narx va maqolalar bilan to'ldiramiz.
  if (getSetting('prices') === undefined) setSetting('prices', defaultPrices)
  if (getSetting('visitorSecret') === undefined) setSetting('visitorSecret', randomBytes(32).toString('hex'))
  if (getSetting('seeded') === undefined) {
    const insert = db.prepare('INSERT OR IGNORE INTO posts (slug, date, art, status, texts, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
    for (const p of defaultPosts) insert.run(p.slug, p.date, p.art, 'published', JSON.stringify(p.texts), Date.now())
    setSetting('seeded', true)
  }

  return { db, getSetting, setSetting }
}

const toPost = (row) => ({
  slug: row.slug,
  date: row.date,
  art: row.art,
  status: row.status,
  texts: JSON.parse(row.texts),
  updatedAt: row.updated_at,
})

export function postStore(db) {
  return {
    list: () => db.prepare('SELECT * FROM posts ORDER BY date DESC, updated_at DESC').all().map(toPost),
    published: () => db.prepare("SELECT * FROM posts WHERE status = 'published' ORDER BY date DESC, updated_at DESC").all().map(toPost),
    get: (slug) => {
      const row = db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug)
      return row ? toPost(row) : null
    },
    create: (p) => db.prepare('INSERT INTO posts (slug, date, art, status, texts, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(p.slug, p.date, p.art, p.status, JSON.stringify(p.texts), Date.now()),
    update: (slug, p) => db.prepare('UPDATE posts SET date = ?, art = ?, status = ?, texts = ?, updated_at = ? WHERE slug = ?')
      .run(p.date, p.art, p.status, JSON.stringify(p.texts), Date.now(), slug),
    remove: (slug) => db.prepare('DELETE FROM posts WHERE slug = ?').run(slug),
  }
}
