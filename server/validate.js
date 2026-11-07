import { randomBytes } from 'node:crypto'
import { defaultPrices } from '../src/data/editable.js'
import { UPLOAD_PATH } from './uploads.js'

export const LANGS = ['uz', 'ru', 'en']
const MAX_PRICE = 100_000_000_000
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
const ART_COUNT = 6

const isPrice = (n) => Number.isInteger(n) && n > 0 && n <= MAX_PRICE
const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '')
// Saytdagi yoki yuklangan rasm. Tashqi manzil va ".." o'tmaydi.
const IMAGE_PATH = /^\/(?!\/)(?!.*\.\.)[\w./-]+\.(?:webp|png|jpe?g|svg)$/
const isImage = (value) => typeof value === 'string' && value.length <= 200 && IMAGE_PATH.test(value)
const isSize = (n) => Number.isInteger(n) && n > 0 && n <= 20000
const isEmptyOrImage = (value) => value === '' || value === undefined || value === null || isImage(value)

// Faqat http va https: "javascript:" havolasi saytga tushmasin. Xato bo'lsa null.
function webUrl(value) {
  const raw = text(value, 300)
  if (!raw) return ''
  try {
    const url = new URL(raw)
    return /^https?:$/.test(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

// Xato bo'lsa { error }, to'g'ri bo'lsa { value } qaytaradi.
export function validatePrices(input) {
  if (!Array.isArray(input) || input.length !== defaultPrices.length) return { error: 'Narxlar röyxati notöğri.' }
  const value = []
  for (let i = 0; i < input.length; i += 1) {
    const base = defaultPrices[i]
    if (base.tiers) {
      const tiers = input[i]?.tiers
      if (!Array.isArray(tiers) || tiers.length !== base.tiers.length || !tiers.every(isPrice)) {
        return { error: 'Har bir daraja uçun musbat butun narx kiriting.', index: i }
      }
      if (tiers.some((n, k) => k > 0 && n <= tiers[k - 1])) {
        return { error: 'Har bir keyingi daraja oldingisidan qimmat bölişi kerak.', index: i }
      }
      value.push({ from: tiers[0], tiers })
    } else {
      if (!isPrice(input[i]?.from)) return { error: 'Musbat butun narx kiriting.', index: i }
      value.push({ from: input[i].from })
    }
  }
  return { value }
}

function cleanSections(sections) {
  if (!Array.isArray(sections)) return []
  return sections.slice(0, 60).map((s) => {
    const h = text(s?.h, 200)
    const p = (Array.isArray(s?.p) ? s.p : []).slice(0, 40).map((x) => text(x, 6000)).filter(Boolean)
    const list = (Array.isArray(s?.list) ? s.list : []).slice(0, 60).map((x) => text(x, 1000)).filter(Boolean)
    return { ...(h ? { h } : {}), p, ...(list.length ? { list } : {}) }
  }).filter((s) => s.h || s.p.length || s.list)
}

export const LEAD_STATUSES = ['new', 'contacted', 'won', 'lost']

export function validateLead(input) {
  const name = text(input?.name, 100)
  const reach = text(input?.reach, 100)
  const message = text(input?.message, 3000)
  if (name.length < 2) return { error: 'Ismingizni kiriting.' }
  if (reach.length < 3) return { error: 'Telefon yoki Telegram manzilingizni kiriting.' }
  if (message.length < 3) return { error: 'Loyiha haqida qisqaça yozing.' }
  return {
    value: { name, reach, message, service: text(input?.service, 100), lang: LANGS.includes(input?.lang) ? input.lang : 'uz' },
  }
}

export function validateLeadUpdate(input) {
  if (!LEAD_STATUSES.includes(input?.status)) return { error: 'Holat notöğri.' }
  return { value: { status: input.status, note: text(input?.note, 3000) } }
}

export function validateContact(input) {
  const email = text(input?.email, 120)
  const telegram = text(input?.telegram, 40).replace(/^@/, '')
  if (!/^[^\s@"<>]+@[^\s@"<>]+\.[^\s@"<>]+$/.test(email)) return { error: 'Email manzilni töğri kiriting.' }
  if (!/^[A-Za-z][A-Za-z0-9_]{3,31}$/.test(telegram)) return { error: 'Telegram manzili 4-32 belgi: lotin harflari, raqam va pastki çiziq.' }
  return { value: { email, telegram } }
}

function strings(value, maxItems, maxLength) {
  return (Array.isArray(value) ? value : []).slice(0, maxItems).map((x) => text(x, maxLength))
}

export function validateProject(input, { requireSlug }) {
  const slug = text(input?.slug, 80)
  if (requireSlug && !SLUG.test(slug)) return { error: 'Manzil faqat lotin harflari, raqam va çiziqçadan iborat bölsin.' }

  const status = input?.status
  if (status !== 'draft' && status !== 'published') return { error: 'Holat notöğri.' }

  const url = webUrl(input?.url)
  if (url === null) return { error: 'Sayt manzili http:// yoki https:// bilan boşlansin.' }
  if (!isEmptyOrImage(input?.logo)) return { error: 'Logotip notöğri.' }

  const image = input?.image
  const hasImage = isImage(image) && isSize(input?.width) && isSize(input?.height)
  if (image && !hasImage) return { error: 'Asosiy rasm notöğri.' }
  if (status === 'published' && !hasImage) return { error: 'E’lon qiliş uçun asosiy rasm kerak.' }

  const rawGallery = Array.isArray(input?.gallery) ? input.gallery : []
  if (rawGallery.length > 12) return { error: 'Galereyada 12 tagaça rasm bölsin.' }
  if (!rawGallery.every((g) => isImage(g?.src) && isSize(g?.width) && isSize(g?.height))) return { error: 'Galereya rasmi notöğri.' }
  const gallery = rawGallery.map(({ src, width, height }) => ({ src, width, height }))

  const tech = strings(input?.tech, 60, 40)
  if (!tech.every((key) => /^[a-z0-9]+$/.test(key))) return { error: 'Texnologiya notöğri.' }

  const texts = {}
  for (const lang of LANGS) {
    const t = input?.texts?.[lang] ?? {}
    const clean = {
      name: text(t.name, 200),
      category: text(t.category, 100),
      alt: text(t.alt, 300),
      galleryAlt: gallery.map((_, i) => text(t.galleryAlt?.[i], 300)),
      summary: text(t.summary, 1500),
      task: text(t.task, 4000),
      solution: text(t.solution, 4000),
      result: text(t.result, 4000),
      services: strings(t.services, 12, 80).filter(Boolean),
    }
    if (status === 'published' && !(clean.name && clean.category && clean.summary && clean.task && clean.solution && clean.result)) {
      return { error: `E’lon qiliş uçun ${lang.toUpperCase()} tilida nom, kategoriya, tavsif, vazifa, yeçim va natija kerak.` }
    }
    texts[lang] = clean
  }

  return {
    value: {
      slug, status, url, tech, gallery, texts,
      image: hasImage ? image : '',
      width: hasImage ? input.width : 0,
      height: hasImage ? input.height : 0,
      logo: input?.logo || '',
      wide: input?.wide === true,
      sample: input?.sample === true,
    },
  }
}

// Berilgan id saqlanadi, yangi kartaga shu yerda beriladi.
function idFor(value, used) {
  const id = typeof value === 'string' && /^[a-z0-9-]{1,40}$/.test(value) && !used.has(value) ? value : randomBytes(8).toString('hex')
  used.add(id)
  return id
}

export function validateClients(input) {
  if (!Array.isArray(input) || input.length > 64) return { error: 'Mijozlar röyxati notöğri.' }
  const used = new Set()
  const slots = new Set()
  const value = []
  for (const c of input) {
    const name = text(c?.name, 120)
    if (!name) return { error: 'Har bir mijozga nom kiriting.' }
    if (!isImage(c?.logo)) return { error: `${name}: logotip yuklang.` }
    const url = webUrl(c?.url)
    if (url === null) return { error: `${name}: sayt manzili http:// yoki https:// bilan boşlansin.` }
    const slot = c?.slot === null || c?.slot === undefined || c?.slot === '' ? null : c.slot
    if (slot !== null && (!Number.isInteger(slot) || slot < 1 || slot > 64)) return { error: `${name}: örin raqami 1 dan 64 gaça bölsin.` }
    if (slot !== null && slots.has(slot)) return { error: `${slot}-örin ikki mijozga berilgan.` }
    if (slot !== null) slots.add(slot)
    const project = text(c?.project, 80)
    value.push({ id: idFor(c?.id, used), name, logo: c.logo, url, slot, project: SLUG.test(project) ? project : '' })
  }
  return { value }
}

export function validateTestimonials(input) {
  if (!Array.isArray(input) || input.length > 30) return { error: 'Fikrlar röyxati notöğri.' }
  const used = new Set()
  const value = []
  for (const q of input) {
    const name = text(q?.name, 120)
    if (!name) return { error: 'Har bir fikrga muallif ismini kiriting.' }
    if (!isEmptyOrImage(q?.photo) || !isEmptyOrImage(q?.logo)) return { error: `${name}: rasm notöğri.` }
    const quote = {}
    const role = {}
    for (const lang of LANGS) {
      quote[lang] = text(q?.quote?.[lang], 1500)
      role[lang] = text(q?.role?.[lang], 150)
      if (!quote[lang]) return { error: `${name}: ${lang.toUpperCase()} tilida fikr matnini yozing.` }
    }
    value.push({ id: idFor(q?.id, used), name, company: text(q?.company, 120), photo: q?.photo || '', logo: q?.logo || '', quote, role })
  }
  return { value }
}

export function validatePost(input, { requireSlug }) {
  const slug = text(input?.slug, 80)
  if (requireSlug && !SLUG.test(slug)) return { error: 'Manzil faqat lotin harflari, raqam va chiziqçadan iborat bölsin.' }

  const date = text(input?.date, 10)
  const parsed = new Date(`${date}T00:00:00Z`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    return { error: 'Sanani töğri kiriting.' }
  }

  const art = input?.art
  if (!Number.isInteger(art) || art < 0 || art >= ART_COUNT) return { error: 'Muqovani tanlang.' }

  const status = input?.status
  if (status !== 'draft' && status !== 'published') return { error: 'Holat notöğri.' }

  const cover = input?.cover || ''
  if (cover && !UPLOAD_PATH.test(cover)) return { error: 'Muqova rasmi notöğri.' }

  const texts = {}
  for (const lang of LANGS) {
    const t = input?.texts?.[lang] ?? {}
    texts[lang] = {
      category: text(t.category, 60),
      title: text(t.title, 200),
      excerpt: text(t.excerpt, 500),
      sections: cleanSections(t.sections),
    }
    if (status === 'published' && (!texts[lang].title || !texts[lang].excerpt || !texts[lang].category || !texts[lang].sections.length)) {
      return { error: `E’lon qiliş uçun ${lang.toUpperCase()} tilida sarlavha, kategoriya, qisqa tavsif va matn kerak.` }
    }
  }
  return { value: { slug, date, art, cover, status, texts } }
}
