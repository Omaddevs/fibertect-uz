import { useCallback, useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { projects } from '../data/content.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { PROJECTS_PATH, slugAfter } from '../data/routes.js'
import { navigate, usePath } from '../lib/router.js'
import ProjectDetail from './ProjectDetail.jsx'
import Reveal from './Reveal.jsx'

export default function Works() {
  const { works } = useLanguage().t
  const requested = slugAfter(usePath(), PROJECTS_PATH)
  const slug = projects.some((p) => p.slug === requested) ? requested : null
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
      navigate(PROJECTS_PATH)
    }
  }, [])

  return (
    <section className="works" id="works">
      <h2 className="works__title">
        {works.title.plain} {works.title.serif}
      </h2>

      <div className="works__grid">
        {projects.map((p, i) => {
          const w = works.items[i]
          return (
            <Reveal className={`work ${p.wide ? 'work--wide' : ''}`} key={p.slug}>
              <a
                className="work-card"
                href={`${PROJECTS_PATH}/${p.slug}`}
                aria-label={works.order(w.name, w.category)}
                onClick={() => {
                  openedHere.current = true
                }}
              >
                <span className="work-card__inner">
                  <span className="work-card__media">
                    <img src={p.image} alt={w.alt} width={p.width} height={p.height} loading="lazy" />
                  </span>
                  <span className="work-card__foot">
                    <span className="work-card__info">
                      <span className="work-card__name">{w.name}</span>
                      <span className="work-card__tag">{w.category}</span>
                    </span>
                    <span className="work-card__arrow">
                      <ArrowRight size={18} strokeWidth={1.6} aria-hidden="true" />
                    </span>
                  </span>
                </span>
              </a>
            </Reveal>
          )
        })}
      </div>

      {slug && <ProjectDetail slug={slug} onClose={close} />}
    </section>
  )
}
