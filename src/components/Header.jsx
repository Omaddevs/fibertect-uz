import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { nav } from '../data/content.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import LanguageSwitch from './LanguageSwitch.jsx'
import { Wordmark } from './Logo.jsx'

export default function Header() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const close = () => setOpen(false)
  const links = nav.slice(0, -1)
  const cta = nav[nav.length - 1]

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="container header__row">
        <a className="header__logo" href="/" aria-label={t.a11y.home}>
          <Wordmark />
        </a>

        <div className="header__right">
          <nav className="header__nav" aria-label={t.a11y.mainNav}>
            {links.map((l) => (
              <a key={l.href} href={l.href}>{t.nav[l.key]}</a>
            ))}
          </nav>

          <LanguageSwitch />

          <a className="cta-btn cta-btn--primary header__cta" href={cta.href}>
            {t.nav[cta.key]}
            <span className="cta-btn__icon">
              <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
            </span>
          </a>

          <button
            type="button"
            className="header__toggle"
            aria-label={open ? t.a11y.closeMenu : t.a11y.openMenu}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="header__toggle-line header__toggle-line--top" aria-hidden="true" />
            <span className="header__toggle-line header__toggle-line--bottom" aria-hidden="true" />
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" className="mobile-menu" aria-label={t.a11y.mobileNav}>
          {nav.map((l) => (
            <a key={l.href} href={l.href} onClick={close}>{t.nav[l.key]}</a>
          ))}
        </nav>
      )}
    </header>
  )
}
