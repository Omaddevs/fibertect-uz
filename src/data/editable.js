// Admin paneldan o'zgartiriladigan ma'lumotlarning boshlang'ich qiymatlari. Shu fayl server bazasini
// birinchi marta to'ldiradi, server ishlamasa sayt ham shularni ko'rsatadi. Toza JS: serverda ham ishlaydi.
import { blogPostTexts } from '../i18n/blogPosts.js'
import { translations } from '../i18n/translations.js'

const LANGS = ['uz', 'ru', 'en']

// Telegram: @ belgisisiz foydalanuvchi nomi.
export const defaultContact = { email: 'hello@fibertech.uz', telegram: 'fibertech' }

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

// `gallery`: rasm va o'lchamlari. Matnlar birinchi ishga tushishda translations.js dan olinadi, keyin bazada yashaydi.
const PROJECTS = [
  {
    slug: 'iau',
    image: '/works/iau.webp',
    width: 1472,
    height: 1068,
    wide: true,
    sample: false,
    logo: '/clients/iau.webp',
    url: 'https://iau.uz/',
    tech: ['react', 'reactrouter', 'vite', 'framer', 'swiper', 'django', 'nginx'],
    // `galleryAlt` translations.js dagi `works.items` da, tartibi shu ro'yxat bilan bir xil.
    gallery: [
      { src: '/works/iau-laptop.webp', width: 1122, height: 1402 },
      { src: '/works/iau-phone.webp', width: 1122, height: 1402 },
    ],
  },
  {
    slug: 'oak',
    image: '/works/oak.webp',
    width: 1672,
    height: 941,
    sample: false,
    logo: '/clients/oak.webp',
    url: 'https://oak.uz/',
    tech: ['nextjs', 'typescript', 'postgresql', 'payload', 'nextintl', 'reacthookform', 'zod', 'minio', 'nodemailer', 'docker', 'nginx', 'eslint', 'vitest', 'playwright', 'axe'],
    gallery: [
      { src: '/works/oak-hands.webp', width: 1166, height: 1349 },
      { src: '/works/oak-phone.webp', width: 1121, height: 1403 },
      { src: '/works/oak-laptop.webp', width: 1122, height: 1402 },
    ],
  },
  {
    slug: 'taxiline',
    image: '/works/taxiline.webp',
    width: 1448,
    height: 1086,
    sample: false,
    logo: '/clients/taxiline.webp',
    url: 'https://taxiline.uz/',
    tech: [
      'react', 'vite', 'javascript', 'tailwindcss', 'reactrouter', 'tanstackquery', 'leaflet', 'threejs', 'socketio', 'dompurify', 'lucide',
      'typescript', 'tiptap', 'reacteasycrop',
      'nodejs', 'express', 'prisma', 'zod', 'jwt', 'bcryptjs', 'nodemailer', 'exceljs', 'sanitizehtml',
      'python', 'aiogram', 'sqlalchemy', 'asyncpg', 'alembic', 'pydantic', 'apscheduler', 'edgetts', 'httpx', 'aiohttp',
      'postgresql', 'docker', 'dockercompose', 'caddy', 'nginx',
      'vitest', 'oxlint', 'tsx', 'concurrently',
    ],
    gallery: [
      { src: '/works/taxiline-desktop.webp', width: 1254, height: 1254 },
      { src: '/works/taxiline-phone.webp', width: 1449, height: 1085 },
    ],
  },
  {
    slug: 'ayolqadami',
    image: '/works/ayolqadami.webp',
    width: 1448,
    height: 1086,
    wide: true,
    sample: false,
    logo: '/clients/ayolqadami.webp',
    url: 'https://ayolqadami.uz/',
    tech: ['react', 'vite', 'leaflet', 'caddy'],
    gallery: [
      { src: '/works/ayolqadami-devices.webp', width: 1618, height: 972 },
      { src: '/works/ayolqadami-laptop.webp', width: 1024, height: 1535 },
    ],
  },
]

export const defaultProjects = PROJECTS.map((project, i) => ({
  ...project,
  status: 'published',
  texts: Object.fromEntries(LANGS.map((lang) => [lang, translations[lang].works.items[i]])),
}))

// `slot`: bento to'rdagi karta raqami (1 dan), bo'sh bo'lsa birinchi bo'sh kartaga tushadi.
// `project`: loyiha manzili, mijoz nomi shu orqali har bir tilda chiqadi.
export const defaultClients = [
  { id: 'iau', name: 'International Agriculture University', logo: '/clients/iau.webp', url: 'https://iau.uz/', slot: 1, project: 'iau' },
  { id: 'oak', name: 'Oliy attestatsiya komissiyasi', logo: '/clients/oak.webp', url: 'https://oak.uz/', slot: 6, project: 'oak' },
  { id: 'taxiline', name: 'TaxiLine', logo: '/clients/taxiline.webp', url: 'https://taxiline.uz/', slot: 5, project: 'taxiline' },
  { id: 'ayolqadami', name: 'AyolQadami', logo: '/clients/ayolqadami.webp', url: 'https://ayolqadami.uz/', slot: 2, project: 'ayolqadami' },
]

// Haqiqiy, ruxsat bilan olingan fikrlar. `quote` va `role` har bir tilda yoziladi.
export const defaultTestimonials = []
