import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronRight } from 'lucide-react'
import { serviceDetails } from '../data/content.js'
import { useSiteData } from '../data/SiteData.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { Wordmark } from './Logo.jsx'
import { useDetailPage } from './ProjectDetail.jsx'

// O'zbek va rus tillarida xonalar bo'sh joy bilan (3 000 000), ingliz tilida vergul bilan (3,000,000).
const formatPrice = (n, lang) => new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'ru-RU').format(n)

// Karta bosilganda aloqa formasidagi mos xizmat o'zi tanlanadi.
function selectService(title) {
  const input = document.querySelector(`input[name="service"][value="${CSS.escape(title)}"]`)
  if (input) input.checked = true
}

export default function ServiceDetail({ slug, onClose }) {
  const { t, lang } = useLanguage()
  const { pricing } = useSiteData()
  const { services, pricing: p, a11y } = t
  const d = services.detail
  const root = useRef(null)
  const detail = serviceDetails.find((x) => x.slug === slug)
  const service = services.items[detail.service]
  const others = p.items.map((_, i) => i).filter((i) => !detail.pricing.includes(i))

  useDetailPage(onClose)

  useEffect(() => {
    root.current?.focus({ preventScroll: true })
  }, [])

  return createPortal(
    <div className="project" ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-label={service.title}>
      <div className="project__wrap">
        <span className="project__glow" aria-hidden="true" />

        <div className="project__bar">
          <a href="/" aria-label={a11y.home}><Wordmark /></a>
          <button type="button" className="project__back" onClick={onClose}>
            <ArrowLeft size={18} strokeWidth={1.6} aria-hidden="true" />
            {d.back}
          </button>
        </div>

        <div className="project__body">
          <header className="project__intro">
            <h1 className="project__title">{service.title}</h1>
            <p className="project__summary">{service.text}</p>
          </header>

          <ul className="offer-grid">
            {detail.pricing.map((i) => {
              const { icon: Icon, from, tiers, service: target } = pricing[i]
              const item = p.items[i]
              return (
                <li className="offer-card" key={item.title}>
                  <a className="offer-card__inner" href="/contact" onClick={() => selectService(services.items[target].title)}>
                    <div className="offer-card__top">
                      <span className="offer-card__icon">
                        <Icon size={26} strokeWidth={1.6} aria-hidden="true" />
                      </span>
                      <span className="offer-card__time">{item.time}</span>
                    </div>

                    <h2 className="offer-card__title">{item.title}</h2>
                    <p className="offer-card__sub">{item.sub}</p>
                    <p className="offer-card__text">{item.text}</p>

                    {tiers && (
                      <div className="offer-tiers">
                        <p className="offer-tiers__title">{p.tiersTitle}</p>
                        <ul>
                          {tiers.map((price, n) => (
                            <li className="offer-tier" key={item.tiers[n].name}>
                              <div>
                                <p className="offer-tier__name">{item.tiers[n].name}</p>
                                <p className="offer-tier__text">{item.tiers[n].text}</p>
                              </div>
                              <p className="offer-tier__price">{formatPrice(price, lang)} {p.currency}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="offer-card__foot">
                      {tiers ? (
                        <p className="offer-card__price offer-card__price--range">
                          {formatPrice(from, lang)} – {formatPrice(tiers[tiers.length - 1], lang)}
                          <small>{p.currency}</small>
                        </p>
                      ) : (
                        <p className="offer-card__price">
                          {p.prefix && <small>{p.prefix}</small>}
                          {formatPrice(from, lang)}
                          <small>{p.unit}</small>
                        </p>
                      )}
                      <span className="offer-card__arrow">
                        <ChevronRight size={28} strokeWidth={1.6} aria-hidden="true" />
                      </span>
                    </div>
                  </a>
                </li>
              )
            })}
          </ul>

          <section className="offer-others">
            <h2 className="offer-others__title">{d.others}</h2>
            <ul className="price-grid">
              {others.map((i) => {
                const { icon: Icon, from, service: target } = pricing[i]
                const item = p.items[i]
                return (
                  <li className="price-card" key={item.title}>
                    <a className="price-card__inner" href="/contact" onClick={() => selectService(services.items[target].title)}>
                      <div className="price-card__top">
                        <span className="price-card__icon">
                          <Icon size={24} strokeWidth={1.6} aria-hidden="true" />
                        </span>
                        <span className="price-card__time">{item.time}</span>
                      </div>

                      <h3 className="price-card__title">{item.title}</h3>
                      <p className="price-card__sub">{item.sub}</p>
                      <p className="price-card__text">{item.text}</p>

                      <div className="price-card__foot">
                        <p className="price-card__price">
                          {p.prefix && <small>{p.prefix}</small>}
                          {formatPrice(from, lang)}
                        </p>
                        <div className="price-card__row">
                          <span className="price-card__unit">{p.unit}</span>
                          <span className="price-card__arrow">
                            <ArrowUpRight size={20} strokeWidth={1.8} aria-hidden="true" />
                          </span>
                        </div>
                      </div>
                    </a>
                  </li>
                )
              })}
            </ul>
          </section>

          <p className="offer-note">{p.note}</p>

          <div className="project-card project__cta">
            <div className="project-card__inner">
              <h2>{d.ctaTitle}</h2>
              <p>{d.ctaText}</p>
              <a href="/contact">
                {d.ctaButton}
                <ArrowRight size={20} strokeWidth={1.6} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
