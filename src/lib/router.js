// Kichik router: manzillar toza (fibertech.uz/blog), `#` ishlatilmaydi.
// Sahifa ichidagi havolalar oddiy <a href="/blog"> bo'lib qoladi: yangi oynada ochiladi, Google ham o'qiydi.
import { useSyncExternalStore } from 'react'
import { BLOG_PATH, SECTIONS, SERVICE_SLUGS, SITE_URL, slugAfter } from '../data/routes.js'

const listeners = new Set()
const normalize = (pathname) => pathname.replace(/\/+$/, '') || '/'
let current = normalize(window.location.pathname)

export const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
export const usePath = () => useSyncExternalStore(subscribe, () => current)

// Bo'lim manzillari bosh sahifaning o'zi: Google ularni bitta sahifa deb bilsin.
function updateCanonical() {
  const url = SECTIONS[current] || current === '/' ? SITE_URL : `${SITE_URL}${current}`
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', url)
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', url)
}

function scrollToCurrent() {
  if (current === '/') window.scrollTo({ top: 0 })
  else if (SECTIONS[current]) document.getElementById(SECTIONS[current])?.scrollIntoView()
}

function changed() {
  updateCanonical()
  listeners.forEach((listener) => listener())
}

export function navigate(path, { replace = false } = {}) {
  const next = normalize(path)
  const same = next === current
  window.history[replace || same ? 'replaceState' : 'pushState'](null, '', next)
  current = next
  if (!same) changed()
  // Ochiq sahifa yopilib, bosh sahifa ko'ringandan keyin aylantiriladi.
  requestAnimationFrame(scrollToCurrent)
}

const isKnownClientPath = (path) => {
  if (path === '/' || path === BLOG_PATH || SECTIONS[path] || slugAfter(path, BLOG_PATH)) return true
  const project = slugAfter(path, '/projects')
  // Loyihalar serverdan keladi: mavjudligini ma'lumot yuklangach Works tekshiradi.
  if (project) return /^[a-z0-9-]+$/.test(project)
  const service = slugAfter(path, '/services')
  return service ? SERVICE_SLUGS.includes(service) : false
}

// Eski `#` havolalar (masalan, saqlab qo'yilgan /#blog) yangi manzilga o'tadi.
function legacyPath() {
  const hash = window.location.hash.slice(1)
  if (!hash || hash === 'main') return null
  if (hash === 'top') return '/'
  if (hash === 'works') return '/projects'
  if (hash.startsWith('project/')) return `/projects/${hash.slice(8)}`
  if (hash.startsWith('service/')) return `/services/${hash.slice(8)}`
  return `/${hash}`
}

function onClick(e) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const link = e.target.closest?.('a[href]')
  if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return

  const href = link.getAttribute('href')
  // Sahifa ichidagi o'tish (skip-link): manzil o'zgarmaydi.
  if (href.startsWith('#')) {
    e.preventDefault()
    const target = document.getElementById(href.slice(1))
    target?.setAttribute('tabindex', '-1')
    target?.focus()
    target?.scrollIntoView()
    return
  }

  const url = new URL(link.href)
  if (url.origin !== window.location.origin || url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/')) return
  e.preventDefault()
  navigate(url.pathname)
}

export function startRouter() {
  const legacy = legacyPath()
  const initial = normalize(legacy ?? current)
  current = isKnownClientPath(initial) ? initial : '/'
  window.history.replaceState(null, '', current + window.location.search)
  updateCanonical()

  document.addEventListener('click', onClick)
  // Orqaga tugmasi: brauzer aylantirish joyini o'zi tiklaydi.
  window.addEventListener('popstate', () => {
    current = normalize(window.location.pathname)
    changed()
  })
}

// To'g'ridan-to'g'ri /contact ochilganda: sahifa chizilgandan keyin o'sha bo'limga o'tadi.
// Rasm va shriftlar joyni o'zgartirishi mumkin, shuning uchun yuklanish tugagach yana bir marta.
export function scrollToInitialSection() {
  if (!SECTIONS[current]) return
  const root = document.documentElement
  const jump = () => {
    root.style.scrollBehavior = 'auto'
    scrollToCurrent()
    root.style.scrollBehavior = ''
  }
  jump()
  if (document.readyState !== 'complete') window.addEventListener('load', jump, { once: true })
}
