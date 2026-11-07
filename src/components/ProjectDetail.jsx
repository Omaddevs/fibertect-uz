import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Share2 } from 'lucide-react'
import { technologies, projectTechnologies } from '../data/content.js'
import { useSiteData } from '../data/SiteData.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { techIcons } from '../data/techIcons.js'
import { PROJECTS_PATH } from '../data/routes.js'
import { navigate } from '../lib/router.js'
import { Wordmark } from './Logo.jsx'

const allTech = [...technologies, ...projectTechnologies]
const MIN_CAROUSEL_CHIPS = 16
const SECONDS_PER_CHIP = 2.5

// Loyihalar orasida o'tish tarixni ko'paytirmaydi: "orqaga" darhol sahifaga qaytaradi.
function goTo(e, slug) {
  e.preventDefault()
  navigate(`${PROJECTS_PATH}/${slug}`, { replace: true })
}

function Story({ label, text }) {
  return (
    <div className="project-card">
      <div className="project-card__inner">
        <h2 className="project__label">{label}</h2>
        <p>{text}</p>
      </div>
    </div>
  )
}

// Birinchi ro'yxat haqiqiy, qolganlari uzluksiz aylanish uchun nusxa. Ro'yxatlar soni doim juft:
// lenta -50% ga surilganda aynan bir xil kadrga tushadi. Kam chipli loyihada bo'sh joy qolmasligi
// uchun ro'yxat takrorlanadi, davomiylik chip soniga bog'liq: tezlik hamma loyihada bir xil.
function TechCarousel({ keys }) {
  const repeat = Math.ceil(MIN_CAROUSEL_CHIPS / keys.length)

  return (
    <div className="project__carousel" style={{ '--carousel-time': `${keys.length * repeat * SECONDS_PER_CHIP}s` }}>
      <div className="marquee__track">
        {Array.from({ length: repeat * 2 }, (_, copy) => (
          <ul className="project__tech" key={copy} aria-hidden={copy > 0 || undefined}>
            {keys.map((key) => {
              const tech = allTech.find((x) => x.icon === key)
              return (
                <li className="project__tech-chip" key={key}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={tech.color} aria-hidden="true">
                    <path d={techIcons[key]} />
                  </svg>
                  {tech.name}
                </li>
              )
            })}
          </ul>
        ))}
      </div>
    </div>
  )
}

// Yopilganda fokus chaqirgan elementga qaytadi, orqa sahifa aylanmaydi.
export function useDetailPage(onClose) {
  useEffect(() => {
    const opener = document.activeElement
    const app = document.getElementById('root')
    app.inert = true
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      app.inert = false
      window.removeEventListener('keydown', onKey)
      opener?.focus?.({ preventScroll: true })
    }
  }, [onClose])
}

export default function ProjectDetail({ slug, onClose }) {
  const { t, lang } = useLanguage()
  const { projects } = useSiteData()
  const { works, nav } = t
  const d = works.detail
  const root = useRef(null)
  const [copied, setCopied] = useState(false)

  const index = projects.findIndex((p) => p.slug === slug)
  const project = projects[index]
  const copy = project.texts[lang]
  const techKeys = project.tech.filter((key) => allTech.some((x) => x.icon === key))

  // Asosiy rasm va galereya bitta mozaikada.
  const shots = [
    { src: project.image, width: project.width, height: project.height, alt: copy.alt },
    ...project.gallery.map((g, i) => ({ ...g, alt: copy.galleryAlt?.[i] ?? '' })),
  ]

  useDetailPage(onClose)

  // Boshqa loyihaga o'tganda yuqoridan boshlanadi.
  useEffect(() => {
    root.current?.scrollTo(0, 0)
    root.current?.focus({ preventScroll: true })
  }, [slug])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  // Telefonda tizim oynasi ochiladi, kompyuterda havola nusxalanadi.
  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: copy.name, url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
      }
    } catch {
      // Foydalanuvchi oynani yopgan yoki brauzer ruxsat bermagan: xabar shart emas.
    }
  }

  return createPortal(
    <div className="project" ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${copy.name}, ${copy.category}`}>
      <div className="project__wrap">
        <span className="project__glow" aria-hidden="true" />

        <div className="project__bar">
          <a href="/" aria-label={t.a11y.home}><Wordmark /></a>
          <button type="button" className="project__back" onClick={onClose}>
            <ArrowLeft size={18} strokeWidth={1.6} aria-hidden="true" />
            {d.back}
          </button>
        </div>

        <div className="project__body">
          <nav className="project__crumbs" aria-label={d.breadcrumb}>
            <a href="/">{d.home}</a>
            <span aria-hidden="true">/</span>
            <a href={PROJECTS_PATH}>{nav.works}</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{copy.name}</span>
          </nav>

          <article className="project-card">
            <div className="project-card__inner">
              <div className="project__top">
                {project.logo && (
                  <span className="project__logo">
                    <img src={project.logo} alt="" />
                  </span>
                )}

                {techKeys.length > 0 && (
                  <div className="project__stack">
                    <h2 className="project__label">{d.tech}</h2>
                    <TechCarousel keys={techKeys} />
                  </div>
                )}

                <div className="project__actions">
                  <button type="button" className="project__action" onClick={share}>
                    {copied ? <Check size={16} strokeWidth={1.8} aria-hidden="true" /> : <Share2 size={16} strokeWidth={1.8} aria-hidden="true" />}
                    <span aria-live="polite">{copied ? d.copied : d.share}</span>
                  </button>
                  {project.url && (
                    <a className="project__action project__action--primary" href={project.url} target="_blank" rel="noopener noreferrer">
                      {d.visit}
                      <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>

              <header className="project__head">
                <h1 className="project__name">{copy.name}</h1>
                <p className="project__lead">{copy.summary}</p>
                <ul className="project__chips">
                  <li className="project__chip project__chip--main">{copy.category}</li>
                  {project.sample && <li className="project__chip project__chip--sample">{d.sample}</li>}
                  {copy.services.map((s) => <li className="project__chip" key={s}>{s}</li>)}
                </ul>
              </header>

              {/* flex-grow rasm nisbatiga teng: qatorda hamma rasm bir xil balandlikda, kesilmaydi.
                  4 va undan ko'p rasmda birinchisi alohida qatorni egallaydi. */}
              <div className={`project__mosaic ${shots.length > 3 ? 'project__mosaic--lead' : ''}`}>
                {shots.map((shot, i) => (
                  <figure className="project__shot" style={{ flexGrow: shot.width / shot.height }} key={`${shot.src}-${i}`}>
                    <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading={i === 0 ? undefined : 'lazy'} />
                  </figure>
                ))}
              </div>
            </div>
          </article>

          <div className="project__story">
            <Story label={d.task} text={copy.task} />
            <Story label={d.solution} text={copy.solution} />
            <Story label={d.result} text={copy.result} />
          </div>

          <h2 className="project__section-title">{d.more}</h2>
          <ul className="project__related">
            {projects.map((p, i) => {
              if (i === index) return null
              const w = p.texts[lang]
              return (
                <li key={p.slug}>
                  <a className="project-rel" href={`${PROJECTS_PATH}/${p.slug}`} onClick={(e) => goTo(e, p.slug)}>
                    <img src={p.image} alt="" width={p.width} height={p.height} loading="lazy" />
                    <span className="project-rel__text">
                      <span className="project-rel__name">{w.name}</span>
                      <span className="project-rel__tag">{w.category}</span>
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>

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
