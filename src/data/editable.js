// Admin paneldan o'zgartiriladigan ma'lumotlarning boshlang'ich qiymatlari. Shu fayl server bazasini
// birinchi marta to'ldiradi, server ishlamasa sayt ham shularni ko'rsatadi. Toza JS: serverda ham ishlaydi.
import { blogPostTexts } from '../i18n/blogPosts.js'

// So'mda. Tartibi translations.js dagi `pricing.items` bilan bir xil.
// `tiers`: darajalar narxi (birinchisi `from` ga teng, oxirgisi eng yuqori narx).
export const defaultPrices = [
  { from: 3000000, tiers: [3000000, 5000000, 8000000] },
  { from: 7000000, tiers: [7000000, 12000000, 20000000] },
  { from: 12000000, tiers: [12000000, 22000000, 40000000] },
  { from: 25000000 },
  { from: 20000000 },
  { from: 3000000 },
  { from: 5000000 },
  { from: 4000000 },
]

// `art`: muqova, ServiceArt dagi tartib raqami.
const POSTS = [
  { slug: 'landing-or-corporate-website', date: '2026-11-06', art: 0 },
  { slug: 'prepare-before-ordering-a-website', date: '2026-11-06', art: 1 },
  { slug: 'telegram-bot-for-business', date: '2026-11-06', art: 4 },
]

export const defaultPosts = POSTS.map((post, i) => ({
  ...post,
  texts: { uz: blogPostTexts.uz[i], ru: blogPostTexts.ru[i], en: blogPostTexts.en[i] },
}))
