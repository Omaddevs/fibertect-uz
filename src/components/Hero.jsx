import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import HeroScene from './HeroScene.jsx'

// Intro sahifa to'liq yuklangandan keyin boshlanadi.
const INTRO_DELAY = 300

export default function Hero() {
  const { hero } = useLanguage().t
  const [lit, setLit] = useState(false)

  useEffect(() => {
    let timer
    const start = () => {
      timer = setTimeout(() => setLit(true), INTRO_DELAY)
    }
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('load', start)
    }
  }, [])

  return (
    <section className={`hero ${lit ? 'is-lit' : ''}`} id="top">
      <HeroScene />
      <div className="hero__text">
        <h1 className="hero__title">
          {hero.title[0]}
          <br />
          {hero.title[1]}
        </h1>
        <p className="hero__lead">{hero.lead.join(' ')}</p>
        <div className="hero__actions">
          <a className="cta-btn cta-btn--primary" href="/contact">
            {hero.primary}
            <span className="cta-btn__icon">
              <ArrowUpRight size={22} strokeWidth={1.9} aria-hidden="true" />
            </span>
          </a>
          <a className="cta-btn cta-btn--ghost cta-btn--down" href="/projects">
            {hero.secondary}
            <span className="cta-btn__icon">
              <ArrowDown size={22} strokeWidth={1.8} aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
