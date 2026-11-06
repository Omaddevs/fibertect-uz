// Sayt manzillari. Toza JS: serverda ham ishlaydi (sitemap.xml, 404 javobi).
export const SITE_URL = 'https://fibertech.uz'

// Bosh sahifadagi bo'limlar: manzil => bo'lim id si.
export const SECTIONS = {
  '/about': 'about',
  '/services': 'services',
  '/projects': 'works',
  '/contact': 'contact',
}

// content.js dagi `projects` va `serviceDetails` manzillari bilan bir xil bo'lsin.
export const PROJECT_SLUGS = ['iau', 'oak', 'taxiline', 'ayolqadami']
export const SERVICE_SLUGS = ['websites', 'web-apps', 'mobile-apps', 'ui-ux', 'telegram-bots', 'branding']

export const PROJECTS_PATH = '/projects'
export const SERVICES_PATH = '/services'
export const BLOG_PATH = '/blog'

// Manzil oxiridagi slug: slugAfter('/blog/x', '/blog') => 'x', mos kelmasa null.
export function slugAfter(path, base) {
  return path.startsWith(`${base}/`) ? path.slice(base.length + 1) : null
}

export function isKnownPath(path, postSlugs) {
  if (path === '/' || path === BLOG_PATH || SECTIONS[path]) return true
  const project = slugAfter(path, PROJECTS_PATH)
  if (project) return PROJECT_SLUGS.includes(project)
  const service = slugAfter(path, SERVICES_PATH)
  if (service) return SERVICE_SLUGS.includes(service)
  const post = slugAfter(path, BLOG_PATH)
  return post ? postSlugs.includes(post) : false
}
