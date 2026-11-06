import { defaultPrices } from '../src/data/editable.js'

export const LANGS = ['uz', 'ru', 'en']
const MAX_PRICE = 100_000_000_000
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
const ART_COUNT = 6

const isPrice = (n) => Number.isInteger(n) && n > 0 && n <= MAX_PRICE
const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

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
  return { value: { slug, date, art, status, texts } }
}
