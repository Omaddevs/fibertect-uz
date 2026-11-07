import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { randomBytes } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
import { defaultClients, defaultContact, defaultPosts, defaultPrices, defaultProjects, defaultTestimonials } from '../src/data/editable.js'

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
    CREATE INDEX IF NOT EXISTS page_views_visitor ON page_views (day, visitor);
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY,
      day TEXT NOT NULL,
      visitor TEXT NOT NULL,
      type TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS events_day ON events (day);
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY,
      created_at INTEGER NOT NULL,
      name TEXT NOT NULL,
      reach TEXT NOT NULL,
      service TEXT NOT NULL,
      message TEXT NOT NULL,
      lang TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      note TEXT NOT NULL DEFAULT '',
      notified INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS leads_created ON leads (created_at);
  `)

  // Eski bazalarda bu ustun yo'q.
  if (!db.prepare('PRAGMA table_info(posts)').all().some((column) => column.name === 'cover')) {
    db.exec('ALTER TABLE posts ADD COLUMN cover TEXT')
  }

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
  if (getSetting('contact') === undefined) setSetting('contact', defaultContact)
  if (getSetting('projects') === undefined) setSetting('projects', defaultProjects)
  if (getSetting('clients') === undefined) setSetting('clients', defaultClients)
  if (getSetting('testimonials') === undefined) setSetting('testimonials', defaultTestimonials)
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
  cover: row.cover ?? '',
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
    create: (p) => db.prepare('INSERT INTO posts (slug, date, art, cover, status, texts, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(p.slug, p.date, p.art, p.cover, p.status, JSON.stringify(p.texts), Date.now()),
    update: (slug, p) => db.prepare('UPDATE posts SET date = ?, art = ?, cover = ?, status = ?, texts = ?, updated_at = ? WHERE slug = ?')
      .run(p.date, p.art, p.cover, p.status, JSON.stringify(p.texts), Date.now(), slug),
    remove: (slug) => db.prepare('DELETE FROM posts WHERE slug = ?').run(slug),
  }
}

const toLead = (row) => ({
  id: row.id,
  createdAt: row.created_at,
  name: row.name,
  reach: row.reach,
  service: row.service,
  message: row.message,
  lang: row.lang,
  status: row.status,
  note: row.note,
  notified: row.notified,
})

export function leadStore(db) {
  const byId = (id) => db.prepare('SELECT * FROM leads WHERE id = ?').get(id)
  return {
    list: () => db.prepare('SELECT * FROM leads ORDER BY created_at DESC, id DESC LIMIT 1000').all().map(toLead),
    get: (id) => {
      const row = byId(id)
      return row ? toLead(row) : null
    },
    newCount: () => db.prepare("SELECT COUNT(*) n FROM leads WHERE status = 'new'").get().n,
    create: (lead) => Number(db.prepare('INSERT INTO leads (created_at, name, reach, service, message, lang) VALUES (?, ?, ?, ?, ?, ?)')
      .run(Date.now(), lead.name, lead.reach, lead.service, lead.message, lead.lang).lastInsertRowid),
    update: (id, { status, note }) => db.prepare('UPDATE leads SET status = ?, note = ? WHERE id = ?').run(status, note, id),
    setNotified: (id, value) => db.prepare('UPDATE leads SET notified = ? WHERE id = ?').run(value, id),
    remove: (id) => db.prepare('DELETE FROM leads WHERE id = ?').run(id),
  }
}
