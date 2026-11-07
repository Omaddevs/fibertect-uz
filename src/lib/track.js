// Tashriflarni serverga yuboradi. Cookie va shaxsiy ma'lumot ishlatilmaydi.
import { subscribe } from './router.js'

// Bosh sahifa bo'limlari (/about, /contact) alohida sahifa hisoblanmaydi.
const PAGE = /^\/(?:blog(?:\/[\w-]+)?|projects\/[\w-]+|services\/[\w-]+)$/

function pagePath() {
  const { pathname } = window.location
  return PAGE.test(pathname) ? pathname : '/'
}

function send(payload) {
  const body = JSON.stringify(payload)
  // text/plain: brauzer oldindan alohida ruxsat so'rovi yubormaydi, sahifa yopilayotganda ham yetib boradi.
  const blob = new Blob([body], { type: 'text/plain' })
  if (!navigator.sendBeacon?.('/api/track', blob)) {
    fetch('/api/track', { method: 'POST', body, keepalive: true }).catch(() => {})
  }
}

export function startTracking() {
  const params = new URLSearchParams(window.location.search)
  let last = pagePath()

  send({
    path: last,
    entry: true,
    referrer: document.referrer,
    lang: document.documentElement.lang,
    utmSource: params.get('utm_source') ?? '',
    utmCampaign: params.get('utm_campaign') ?? '',
    utmTerm: params.get('utm_term') ?? '',
  })

  // Natijalar: Telegram yoki email havolasi bosildi. Formani server o'zi sanaydi.
  document.addEventListener('click', (e) => {
    const href = e.target.closest?.('a[href]')?.getAttribute('href') ?? ''
    if (href.startsWith('https://t.me/')) send({ event: 'telegram' })
    else if (href.startsWith('mailto:')) send({ event: 'email' })
  })

  subscribe(() => {
    const path = pagePath()
    if (path === last) return
    last = path
    send({ path, lang: document.documentElement.lang })
  })
}
