// Tilga bog'liq bo'lmagan ma'lumotlar. Barcha matnlar: src/i18n/translations.js
// Aloqa, loyihalar, mijozlar va fikrlar admin paneldan boshqariladi: editable.js
import { defaultPrices } from './editable.js'
import { AppWindow, Bot, Building2, Globe, LayoutDashboard, LayoutTemplate, Lightbulb, Palette, PenTool, ShoppingBag, Smartphone } from 'lucide-react'

// Matnlari translations.js dagi `nav` bo'limida, oxirgisi header'dagi oq tugma.
export const nav = [
  { key: 'about', href: '/about' },
  { key: 'services', href: '/services' },
  { key: 'works', href: '/projects' },
  { key: 'blog', href: '/blog' },
  { key: 'contact', href: '/contact' },
]

// Tartibi translations.js dagi `services.items` bilan bir xil.
export const serviceIcons = [Globe, AppWindow, Smartphone, PenTool, Bot, Lightbulb]
export const serviceImages = ['web', 'app', 'phone', 'ui', 'bot', 'brand'].map((n) => `/services/${n}.webp`)

// Narxlar editable.js da, admin paneldan o'zgartiriladi. Tartibi translations.js dagi `pricing.items` bilan bir xil.
// `service`: aloqa formasida tanlanadigan xizmat, `services.items` dagi tartib raqami.
export const pricing = [
  { icon: LayoutTemplate, service: 0 },
  { icon: Building2, service: 0 },
  { icon: ShoppingBag, service: 0 },
  { icon: LayoutDashboard, service: 1 },
  { icon: Smartphone, service: 2 },
  { icon: Bot, service: 4 },
  { icon: PenTool, service: 3 },
  { icon: Palette, service: 5 },
].map((item, i) => ({ ...item, ...defaultPrices[i] }))

// Karta bosilganda `/services/<slug>` sahifasi ochiladi. Yangi xizmat routes.js ga ham yoziladi.
// `service`: `services.items` dagi tartib raqami, `pricing`: yuqoridagi `pricing` dagi tartib raqamlari.
// Qolgan narxlar shu sahifadagi "Boshqa xizmatlar" qismida chiqadi.
export const serviceDetails = [
  { slug: 'websites', service: 0, pricing: [0, 1, 2] },
  { slug: 'web-apps', service: 1, pricing: [3] },
  { slug: 'mobile-apps', service: 2, pricing: [4] },
  { slug: 'ui-ux', service: 3, pricing: [6] },
  { slug: 'telegram-bots', service: 4, pricing: [5] },
  { slug: 'branding', service: 5, pricing: [7] },
]

// Lentadagi texnologiyalar: `icon` kaliti src/data/techIcons.js dan.
export const technologies = [
  { name: 'React', icon: 'react', color: '#61dafb' },
  { name: 'TypeScript', icon: 'typescript', color: '#4a9be0' },
  { name: 'JavaScript', icon: 'javascript', color: '#f7df1e' },
  { name: 'Node.js', icon: 'nodejs', color: '#6cc24a' },
  { name: 'Python', icon: 'python', color: '#ffd43b' },
  { name: 'PostgreSQL', icon: 'postgresql', color: '#6a9bf0' },
  { name: 'Docker', icon: 'docker', color: '#2496ed' },
  { name: 'Swift', icon: 'swift', color: '#f05138' },
  { name: 'Kotlin', icon: 'kotlin', color: '#a97bff' },
  { name: 'Flutter', icon: 'flutter', color: '#54c5f8' },
  { name: 'Go', icon: 'go', color: '#00add8' },
]

// Faqat loyiha sahifasida ko'rinadigan texnologiyalar (lentaga chiqmaydi).
export const projectTechnologies = [
  { name: 'React Router', icon: 'reactrouter', color: '#f44250' },
  { name: 'Vite', icon: 'vite', color: '#a77bff' },
  { name: 'Framer Motion', icon: 'framer', color: '#fafafa' },
  { name: 'Swiper', icon: 'swiper', color: '#8a66ff' },
  { name: 'Django REST Framework', icon: 'django', color: '#44b78b' },
  { name: 'Nginx', icon: 'nginx', color: '#2fb26a' },
  { name: 'Laravel', icon: 'laravel', color: '#ff5a4f' },
  { name: 'Next.js', icon: 'nextjs', color: '#fafafa' },
  { name: 'Payload CMS', icon: 'payload', color: '#fafafa' },
  { name: 'next-intl', icon: 'nextintl', color: '#7cc4ff' },
  { name: 'React Hook Form', icon: 'reacthookform', color: '#ec5990' },
  { name: 'Zod', icon: 'zod', color: '#7c9fe6' },
  { name: 'MinIO', icon: 'minio', color: '#f0566e' },
  { name: 'Nodemailer', icon: 'nodemailer', color: '#3fbf9b' },
  { name: 'ESLint', icon: 'eslint', color: '#9a8cff' },
  { name: 'Vitest', icon: 'vitest', color: '#a3d13a' },
  { name: 'Playwright', icon: 'playwright', color: '#4cc26b' },
  { name: 'axe', icon: 'axe', color: '#ffb35c' },
  { name: 'Leaflet', icon: 'leaflet', color: '#6cc24a' },
  { name: 'Socket.IO', icon: 'socketio', color: '#fafafa' },
  { name: 'Caddy', icon: 'caddy', color: '#4aa8dc' },
  { name: 'Tailwind CSS', icon: 'tailwindcss', color: '#38bdf8' },
  { name: 'TanStack Query', icon: 'tanstackquery', color: '#ff4154' },
  { name: 'Three.js', icon: 'threejs', color: '#fafafa' },
  { name: 'DOMPurify', icon: 'dompurify', color: '#7cc4ff' },
  { name: 'lucide-react', icon: 'lucide', color: '#f56565' },
  { name: 'Tiptap', icon: 'tiptap', color: '#fafafa' },
  { name: 'react-easy-crop', icon: 'reacteasycrop', color: '#61dafb' },
  { name: 'Express', icon: 'express', color: '#fafafa' },
  { name: 'Prisma', icon: 'prisma', color: '#7f8cf0' },
  { name: 'JWT', icon: 'jwt', color: '#f0566e' },
  { name: 'bcryptjs', icon: 'bcryptjs', color: '#ffb35c' },
  { name: 'ExcelJS', icon: 'exceljs', color: '#2fb26a' },
  { name: 'sanitize-html', icon: 'sanitizehtml', color: '#7cc4ff' },
  { name: 'aiogram', icon: 'aiogram', color: '#2aabee' },
  { name: 'SQLAlchemy', icon: 'sqlalchemy', color: '#e8604c' },
  { name: 'asyncpg', icon: 'asyncpg', color: '#6a9bf0' },
  { name: 'Alembic', icon: 'alembic', color: '#c7a76b' },
  { name: 'Pydantic', icon: 'pydantic', color: '#e92063' },
  { name: 'APScheduler', icon: 'apscheduler', color: '#4cc26b' },
  { name: 'edge-tts', icon: 'edgetts', color: '#3fbf9b' },
  { name: 'HTTPX', icon: 'httpx', color: '#a77bff' },
  { name: 'AIOHTTP', icon: 'aiohttp', color: '#6a9bf0' },
  { name: 'Docker Compose', icon: 'dockercompose', color: '#2496ed' },
  { name: 'oxlint', icon: 'oxlint', color: '#4fd1c5' },
  { name: 'tsx', icon: 'tsx', color: '#4a9be0' },
  { name: 'concurrently', icon: 'concurrently', color: '#ffd43b' },
]
