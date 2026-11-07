import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { BLOG_PATH, slugAfter } from '../data/routes.js'
import { useSiteData } from '../data/SiteData.jsx'
import { imageFromParagraph } from '../lib/postFormat.js'
import { navigate, usePath } from '../lib/router.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import BlogScene from './BlogScene.jsx'
import { Wordmark } from './Logo.jsx'
import { useDetailPage } from './ProjectDetail.jsx'
import ServiceArt from './ServiceArt.jsx'

const WORDS_PER_MINUTE = 200

function readingTime(text) {
  const words = text.sections
    .flatMap((s) => [s.h ?? '', ...s.p, ...(s.list ?? [])])
    .join(' ')
    .split(/\s+/).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

// Brauzerlarda o'zbekcha oy nomlari kafolatlanmagan ("2026 M11 6" chiqishi mumkin), shuning uchun o'zimizniki.
const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr']

function formatDate(iso, lang) {
  const [year, month, day] = iso.split('-').map(Number)
  if (lang === 'uz') return `${year}-yil ${day}-${UZ_MONTHS[month - 1]}`
  return new Intl.DateTimeFormat(lang, { dateStyle: 'long' }).format(new Date(year, month - 1, day))
}

function PostCover({ post }) {
  return post.cover ? <img className="blog-cover-img" src={post.cover} alt="" loading="lazy" /> : <ServiceArt index={post.art} slice />
}

function Paragraph({ text }) {
  const image = imageFromParagraph(text)
  if (!image) return <p>{text}</p>
  return (
    <figure className="blog-post__figure">
      <img src={image.src} alt={image.alt} loading="lazy" />
      {image.alt && <figcaption>{image.alt}</figcaption>}
    </figure>
  )
}

function PostMeta({ post, text, lang, b }) {
  const date = formatDate(post.date, lang)
  return (
    <p className="blog-meta">
      <span className="blog-meta__tag">{text.category}</span>
      <time dateTime={post.date}>{date}</time>
      <span aria-hidden="true">·</span>
      <span>{b.readTime(readingTime(text))}</span>
    </p>
  )
}

function PostCard({ post, text, lang, b }) {
  return (
    <li className="blog-card">
      <a className="blog-card__inner" href={`${BLOG_PATH}/${post.slug}`}>
        <span className="blog-card__cover">
          <PostCover post={post} />
        </span>
        <span className="blog-card__body">
          <PostMeta post={post} text={text} lang={lang} b={b} />
          <h2 className="blog-card__title">{text.title}</h2>
          <span className="blog-card__excerpt">{text.excerpt}</span>
          <span className="blog-card__more">
            {b.read}
            <ArrowRight size={18} strokeWidth={1.6} aria-hidden="true" />
          </span>
        </span>
      </a>
    </li>
  )
}

function BlogPage({ slug, onClose }) {
  const { t, lang } = useLanguage()
  const b = t.blog
  const root = useRef(null)
  const { posts } = useSiteData()
  const index = posts.findIndex((p) => p.slug === slug)
  const isPost = index >= 0
  const text = posts[index]?.texts[lang]

  useDetailPage(onClose)

  // Ro'yxat va maqola orasida o'tganda yuqoridan boshlanadi.
  useEffect(() => {
    root.current?.scrollTo(0, 0)
    root.current?.focus({ preventScroll: true })
  }, [slug])

  useEffect(() => {
    document.title = `${isPost ? text.title : b.title} — FiberTech`
    return () => {
      document.title = t.meta.title
    }
  }, [isPost, text, b.title, t.meta.title])

  return createPortal(
    <div className="project" ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-label={isPost ? text.title : b.title}>
      <div className="project__wrap">
        {isPost && <span className="project__glow" aria-hidden="true" />}

        <div className="project__bar">
          <a href="/" aria-label={t.a11y.home}><Wordmark /></a>
          <a className="project__back" href={isPost ? BLOG_PATH : '/'}>
            <ArrowLeft size={18} strokeWidth={1.6} aria-hidden="true" />
            {isPost ? b.backToList : b.back}
          </a>
        </div>

        {!isPost && (
          <header className="blog-hero">
            <div className="blog-hero__text">
              <p className="blog-hero__chip">{b.title}</p>
              <h1 className="blog-hero__title">{b.heroTitle}</h1>
              <p className="blog-hero__lead">{b.lead}</p>
            </div>
            <BlogScene label={b.sceneLabel} />
          </header>
        )}

        <div className="project__body">
          {isPost ? (
            <>
              <nav className="project__crumbs" aria-label={t.works.detail.breadcrumb}>
                <a href="/">{t.works.detail.home}</a>
                <span aria-hidden="true">/</span>
                <a href={BLOG_PATH}>{b.title}</a>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{text.category}</span>
              </nav>

              <article className="blog-post">
                <header>
                  <PostMeta post={posts[index]} text={text} lang={lang} b={b} />
                  <h1 className="blog-post__title">{text.title}</h1>
                  <p className="blog-post__lead">{text.excerpt}</p>
                </header>

                <div className="blog-post__cover">
                  <PostCover post={posts[index]} />
                </div>

                {text.sections.map((s, n) => (
                  <section className="blog-post__section" key={n}>
                    {s.h && <h2>{s.h}</h2>}
                    {s.p.map((para, k) => <Paragraph key={k} text={para} />)}
                    {s.list && (
                      <ul>
                        {s.list.map((item, k) => <li key={k}>{item}</li>)}
                      </ul>
                    )}
                  </section>
                ))}
              </article>

              <h2 className="project__section-title">{b.more}</h2>
              <ul className="blog-grid blog-grid--more">
                {posts.map((p, i) =>
                  i === index ? null : <PostCard key={p.slug} post={p} text={p.texts[lang]} lang={lang} b={b} />,
                )}
              </ul>
            </>
          ) : (
            <ul className="blog-grid">
              {posts.map((p) => <PostCard key={p.slug} post={p} text={p.texts[lang]} lang={lang} b={b} />)}
            </ul>
          )}

          <div className="project-card project__cta">
            <div className="project-card__inner">
              <h2>{b.ctaTitle}</h2>
              <p>{b.ctaText}</p>
              <a href="/contact">
                {b.ctaButton}
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

export default function Blog() {
  const path = usePath()
  const isBlog = path === BLOG_PATH || path.startsWith(`${BLOG_PATH}/`)

  // Escape: maqoladan ro'yxatga, ro'yxatdan bosh sahifaga.
  const close = useCallback(() => {
    navigate(window.location.pathname === BLOG_PATH ? '/' : BLOG_PATH)
  }, [])

  return isBlog ? <BlogPage slug={slugAfter(path, BLOG_PATH) ?? ''} onClose={close} /> : null
}
