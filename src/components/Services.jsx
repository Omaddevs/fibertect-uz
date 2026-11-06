import { useCallback, useEffect, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { serviceDetails, serviceIcons } from '../data/content.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import ServiceArt from './ServiceArt.jsx'
import { SERVICES_PATH, slugAfter } from '../data/routes.js'
import { navigate, usePath } from '../lib/router.js'
import ServiceDetail from './ServiceDetail.jsx'

// Rasm ramkasining shakli (290x337 maydonda), rasmga nisbatan cho'ziladi.
const FRAME =
  'M12 0H66Q74 0 74 8V20Q74 28 82 28H259Q271 28 271 40V87Q271 95 279 95H282Q290 95 290 103V302Q290 310 282 310H280Q272 310 272 318V325Q272 337 260 337H28Q16 337 16 325V121Q16 113 8 113Q0 113 0 105V12Q0 0 12 0Z'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Services() {
  const { services } = useLanguage().t
  const swiper = useRef(null)
  const speed = reducedMotion() ? 0 : 300
  const requested = slugAfter(usePath(), SERVICES_PATH)
  const slug = serviceDetails.some((d) => d.slug === requested) ? requested : null
  // Sahifa ichidan ochilganmi: shunda "orqaga" foydalanuvchini o'sha joyiga qaytaradi.
  const openedHere = useRef(false)

  useEffect(() => {
    if (!slug) openedHere.current = false
  }, [slug])

  const close = useCallback(() => {
    if (openedHere.current) {
      openedHere.current = false
      window.history.back()
    } else {
      navigate(SERVICES_PATH)
    }
  }, [])

  return (
    <section className="services" id="services">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <clipPath id="service-frame" clipPathUnits="objectBoundingBox">
          <path d={FRAME} transform={`scale(${1 / 290} ${1 / 337})`} />
        </clipPath>
      </svg>

      <div className="services__head">
        <h2>{services.title}</h2>
        <div className="services__arrows">
          <button type="button" className="services__arrow" aria-label={services.prev} onClick={() => swiper.current?.slidePrev()}>
            <ArrowLeft size={18} strokeWidth={1.6} aria-hidden="true" />
          </button>
          <button type="button" className="services__arrow" aria-label={services.next} onClick={() => swiper.current?.slideNext()}>
            <ArrowRight size={18} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>
      </div>

      <Swiper
        className="services__swiper"
        onSwiper={(instance) => {
          swiper.current = instance
        }}
        loop
        speed={speed}
        slidesPerView={1.06}
        spaceBetween={16}
        breakpoints={{
          721: { slidesPerView: 1.15, spaceBetween: 24 },
          1200: { slidesPerView: 1.6, spaceBetween: 60 },
        }}
      >
        {services.items.map((item, i) => {
          const Icon = serviceIcons[i]
          const detail = serviceDetails.find((d) => d.service === i)
          return (
            <SwiperSlide key={i}>
              <article className="service-card">
                <a
                  className="service-card__inner"
                  href={`${SERVICES_PATH}/${detail.slug}`}
                  draggable={false}
                  onClick={() => {
                    openedHere.current = true
                  }}
                >
                  <div className="service-card__media">
                    <ServiceArt index={i} alt={item.alt} />
                  </div>
                  <div className="service-card__content">
                    <h3 className="service-card__title">
                      <Icon size={40} strokeWidth={1.4} aria-hidden="true" />
                      {item.title}
                    </h3>
                    <p className="service-card__text">{item.text}</p>
                    <div className="service-card__foot">
                      <p className="service-card__scope">{item.scope}</p>
                      <div className="service-card__row">
                        <span className="service-card__tag">{item.tag}</span>
                        <span className="service-card__more">
                          {services.detail.more}
                          <ArrowRight size={18} strokeWidth={1.6} aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              </article>
            </SwiperSlide>
          )
        })}
      </Swiper>

      {slug && <ServiceDetail slug={slug} onClose={close} />}
    </section>
  )
}
