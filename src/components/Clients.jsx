import { useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { ArrowLeft, ArrowRight, Building2, User } from 'lucide-react'
import { clients, testimonials } from '../data/content.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

// Namunaviy kartalar faqat `npm run dev` rejimida ko'rinadi. Build qilingan saytga
// chiqmaydi: u yerda faqat content.js dagi haqiqiy ma'lumotlar ko'rsatiladi.
const SAMPLES = import.meta.env.DEV
const MIN_CLIENT_CARDS = 8
const SAMPLE_QUOTES = 4

// Mijoz "Bizning ishlar"dagi loyiha bo'lsa, nomi joriy tilda shu loyihadan olinadi.
const clientName = (c, t) => t.works.items[c.project]?.name ?? c.name

function ClientGrid({ t }) {
  // Bento naqshi buzilmasligi uchun to'r 4 ga karrali songacha bo'sh kartalar bilan to'ldiriladi.
  const lastCard = Math.max(clients.length, ...clients.map((c) => c.slot ?? 0))
  const total = Math.max(MIN_CLIENT_CARDS, Math.ceil(lastCard / 4) * 4)
  const cards = Array(total).fill(null)
  clients.filter((c) => c.slot).forEach((c) => { cards[c.slot - 1] = c })
  clients.filter((c) => !c.slot).forEach((c) => { cards[cards.indexOf(null)] = c })

  return (
    <div className="clients__block">
      <p className="testimonials__overline">{t.clients.overline}</p>
      <h2 className="testimonials__title">{t.clients.title}</h2>
      <ul className="clients__grid">
        {cards.map((c, i) =>
          c ? (
            <li className="client-card" key={c.name}>
              {c.url ? (
                <a className="client-card__inner" href={c.url} target="_blank" rel="noopener noreferrer">
                  <img src={c.logo} alt={clientName(c, t)} loading="lazy" />
                </a>
              ) : (
                <span className="client-card__inner">
                  <img src={c.logo} alt={clientName(c, t)} loading="lazy" />
                </span>
              )}
            </li>
          ) : (
            <li className="client-card" key={`empty-${i}`} aria-hidden="true">
              <span className="client-card__inner" />
            </li>
          ),
        )}
      </ul>
    </div>
  )
}

function QuoteCard({ logo, logoAlt, text, name, role, photo }) {
  return (
    <figure className="quote-card">
      <div className="quote-card__inner">
        <svg className="quote-card__mark" viewBox="0 0 32 24" aria-hidden="true">
          <path d="M0 24V13C0 5.5 4.5 1 12 0v5c-3.6.9-5.5 3-5.7 6H12v13H0Zm19 0V13c0-7.5 4.5-12 12-13v5c-3.6.9-5.5 3-5.7 6H31v13H19Z" />
        </svg>
        <blockquote className="quote-card__text">{text}</blockquote>
        <figcaption className="quote-card__person">
          <span className="quote-card__avatar">
            {photo ? <img src={photo} alt="" loading="lazy" /> : <User size={24} strokeWidth={1.5} aria-hidden="true" />}
          </span>
          <span className="quote-card__who">
            <span className="quote-card__name">{name}</span>
            <span className="quote-card__role">{role}</span>
          </span>
          <span className="quote-card__logo">
            {logo ? <img src={logo} alt={logoAlt} loading="lazy" /> : <Building2 size={28} strokeWidth={1.3} aria-hidden="true" />}
          </span>
        </figcaption>
      </div>
    </figure>
  )
}

const pad = (n) => String(n).padStart(2, '0')

function Testimonials({ t, lang }) {
  const swiper = useRef(null)
  const [position, setPosition] = useState({ index: 0, total: 1 })
  const samples = SAMPLES && testimonials.length === 0
  const items = samples
    ? Array.from({ length: SAMPLE_QUOTES }, (_, i) => ({
        key: i,
        text: t.testimonials.quote,
        name: t.testimonials.name,
        role: t.testimonials.role,
      }))
    : testimonials.map((q) => ({
        key: q.name,
        text: q.quote[lang],
        name: q.name,
        role: q.role[lang],
        photo: q.photo,
        logo: q.logo,
        logoAlt: q.company,
      }))
  const speed = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300
  // Hisoblagich kartalarni emas, haqiqiy o'tish qadamlarini sanaydi: hammasi ekranga
  // sig'sa (masalan, desktopda 2 ta fikr), strelkalar va chiziq ko'rinmaydi.
  const sync = (instance) =>
    setPosition(
      instance.params.loop
        ? { index: instance.realIndex, total: items.length }
        : { index: instance.snapIndex, total: instance.snapGrid.length },
    )
  const canSlide = position.total > 1

  return (
    <div className="clients__block">
      <div className="testimonials__head">
        <div>
          <p className="testimonials__overline">{t.testimonials.overline}</p>
          <h2 className="testimonials__title">{t.testimonials.title}</h2>
        </div>
        {canSlide && (
          <div className="testimonials__controls">
            <span className="testimonials__count" aria-hidden="true">
              <b>{pad(position.index + 1)}</b> / {pad(position.total)}
            </span>
            <div className="services__arrows">
              <button type="button" className="services__arrow" aria-label={t.testimonials.prev} onClick={() => swiper.current?.slidePrev()}>
                <ArrowLeft size={18} strokeWidth={1.6} aria-hidden="true" />
              </button>
              <button type="button" className="services__arrow" aria-label={t.testimonials.next} onClick={() => swiper.current?.slideNext()}>
                <ArrowRight size={18} strokeWidth={1.6} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Swiper
        className="clients__swiper"
        onSwiper={(instance) => {
          swiper.current = instance
        }}
        onInit={sync}
        onSlideChange={sync}
        onSnapGridLengthChange={sync}
        loop={items.length >= 4}
        speed={speed}
        slidesPerView={1.06}
        spaceBetween={16}
        breakpoints={{ 721: { slidesPerView: 2, spaceBetween: 24 } }}
      >
        {items.map(({ key, ...card }) => (
          <SwiperSlide key={key}>
            <QuoteCard {...card} />
          </SwiperSlide>
        ))}
      </Swiper>

      {canSlide && (
        <div className="testimonials__progress" aria-hidden="true">
          <span style={{ width: `${((position.index + 1) / position.total) * 100}%` }} />
        </div>
      )}
    </div>
  )
}

export default function Clients() {
  const { t, lang } = useLanguage()
  const showClients = SAMPLES || clients.length > 0
  const showQuotes = SAMPLES || testimonials.length > 0
  if (!showClients && !showQuotes) return null

  return (
    <section className="clients" id="clients">
      <div className="clients__inner">
        {showClients && <ClientGrid t={t} />}
        {showQuotes && <Testimonials t={t} lang={lang} />}
      </div>
    </section>
  )
}
