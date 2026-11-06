import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext.jsx'

export default function LanguageSwitch() {
  const { lang, setLang, t, languages } = useLanguage()
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  const current = languages.find((l) => l.code === lang)

  useEffect(() => {
    if (!open) return
    const onPointer = (e) => {
      if (!root.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="lang" ref={root}>
      <button
        type="button"
        className="lang__button"
        aria-label={`${t.a11y.language}: ${current.label}`}
        aria-expanded={open}
        aria-controls="lang-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <Globe size={17} strokeWidth={1.6} aria-hidden="true" />
        {current.short}
        <ChevronDown className="lang__chevron" size={15} strokeWidth={1.8} aria-hidden="true" />
      </button>

      {open && (
        <ul id="lang-menu" className="lang__menu">
          {languages.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                lang={l.code}
                aria-current={l.code === lang ? 'true' : undefined}
                onClick={() => {
                  setLang(l.code)
                  setOpen(false)
                }}
              >
                {l.label}
                {l.code === lang && <Check size={16} strokeWidth={2} aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
