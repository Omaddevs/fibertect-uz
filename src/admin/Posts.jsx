import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Check, CircleDashed, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react'
import ServiceArt from '../components/ServiceArt.jsx'
import { formatBody, parseBody } from '../lib/postFormat.js'
import { api } from './api.js'

const LANGS = [
  { code: 'uz', label: 'Özbekça' },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
]
const ART_NAMES = ['Sayt', 'Boşqaruv paneli', 'Mobil ilova', 'Dizayn', 'Telegram bot', 'Brending']
const BODY_HINT = '## Bölim sarlavhasi\n\nOddiy xatboşi. Xatboşilar orasida böş qator qoldiring.\n\n- Röyxat bandi\n- Yana bir band'

const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent' }).format(new Date())
const slugify = (title) => title
  .toLowerCase()
  .replace(/ş/g, 'sh').replace(/ç/g, 'ch').replace(/ğ/g, 'g').replace(/ö/g, 'o')
  .replace(/['’‘`]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 80)

const emptyText = () => ({ category: '', title: '', excerpt: '', body: '' })
const newDraft = () => ({
  isNew: true,
  slug: '',
  date: today(),
  art: 0,
  status: 'draft',
  texts: { uz: emptyText(), ru: emptyText(), en: emptyText() },
})
const toDraft = (post) => ({
  ...post,
  texts: Object.fromEntries(LANGS.map(({ code }) => {
    const t = post.texts[code] ?? {}
    return [code, { category: t.category ?? '', title: t.title ?? '', excerpt: t.excerpt ?? '', body: formatBody(t.sections) }]
  })),
})
const toPayload = (draft) => ({
  slug: draft.slug,
  date: draft.date,
  art: draft.art,
  status: draft.status,
  texts: Object.fromEntries(LANGS.map(({ code }) => {
    const { body, ...rest } = draft.texts[code]
    return [code, { ...rest, sections: parseBody(body) }]
  })),
})
const isComplete = (t) => Boolean(t.category.trim() && t.title.trim() && t.excerpt.trim() && t.body.trim())

function StatusBadge({ status }) {
  const published = status === 'published'
  const Icon = published ? Check : CircleDashed
  return (
    <span className={`adm-badge ${published ? 'adm-badge--on' : ''}`}>
      <Icon size={14} strokeWidth={2} aria-hidden="true" />
      {published ? 'E’lon qilingan' : 'Qoralama'}
    </span>
  )
}

function Editor({ initial, onBack, onSaved }) {
  const [draft, setDraft] = useState(initial)
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial))
  const [lang, setLang] = useState('uz')
  const [slugTouched, setSlugTouched] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  const text = draft.texts[lang]
  const dirty = JSON.stringify(draft) !== baseline
  const preview = useMemo(() => parseBody(text.body), [text.body])

  useEffect(() => {
    if (!dirty) return undefined
    const warn = (e) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const setText = (field, value) => {
    setNotice('')
    setDraft((d) => {
      const next = { ...d, texts: { ...d.texts, [lang]: { ...d.texts[lang], [field]: value } } }
      if (d.isNew && !slugTouched && lang === 'uz' && field === 'title') next.slug = slugify(value)
      return next
    })
  }
  const set = (patch) => {
    setNotice('')
    setDraft((d) => ({ ...d, ...patch }))
  }

  const back = () => {
    if (!dirty || window.confirm('Saqlanmagan özgarişlar yöqoladi. Çiqasizmi?')) onBack()
  }

  const save = async (status) => {
    setError('')
    setSaving(true)
    const payload = toPayload({ ...draft, status })
    try {
      const { post } = draft.isNew
        ? await api('/posts', { method: 'POST', body: payload })
        : await api(`/posts/${draft.slug}`, { method: 'PUT', body: payload })
      const next = toDraft(post)
      setDraft(next)
      setBaseline(JSON.stringify(next))
      setNotice(status === 'published' ? 'E’lon qilindi, saytda körinadi.' : 'Qoralama saqlandi.')
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <header className="adm-head">
        <div>
          <button type="button" className="adm-link" onClick={back}>
            <ArrowLeft size={17} aria-hidden="true" />
            Maqolalar röyxati
          </button>
          <h1>{draft.isNew ? 'Yangi maqola' : 'Maqolani tahrirlaş'}</h1>
        </div>
        <div className="adm-head__actions">
          <StatusBadge status={draft.status} />
          <button type="button" className="adm-btn" disabled={saving} onClick={() => save('draft')}>
            {draft.status === 'published' ? 'Qoralamaga oliş' : 'Qoralama saqlaş'}
          </button>
          <button type="button" className="adm-btn adm-btn--primary" disabled={saving} onClick={() => save('published')}>
            {saving ? 'Saqlanmoqda…' : draft.status === 'published' ? 'Yangilaş' : 'E’lon qiliş'}
          </button>
        </div>
      </header>

      {error && <p className="adm-error" role="alert">{error}</p>}
      {notice && <p className="adm-success" role="status"><Check size={17} aria-hidden="true" /> {notice}</p>}

      <div className="adm-editor">
        <div className="adm-editor__form">
          <section className="adm-card adm-panel">
            <div className="adm-tabs" role="tablist" aria-label="Til">
              {LANGS.map(({ code, label }) => (
                <button key={code} type="button" role="tab" aria-selected={lang === code} onClick={() => setLang(code)}>
                  {label}
                  <i className={isComplete(draft.texts[code]) ? 'is-done' : ''} aria-label={isComplete(draft.texts[code]) ? 'töldirilgan' : 'töldirilmagan'} />
                </button>
              ))}
            </div>

            <label className="adm-field">
              <span>Sarlavha</span>
              <input lang={lang} value={text.title} maxLength={200} onChange={(e) => setText('title', e.target.value)} />
            </label>
            <div className="adm-row">
              <label className="adm-field">
                <span>Kategoriya</span>
                <input lang={lang} value={text.category} maxLength={60} onChange={(e) => setText('category', e.target.value)} />
              </label>
            </div>
            <label className="adm-field">
              <span>Qisqa tavsif</span>
              <textarea lang={lang} rows={2} value={text.excerpt} maxLength={500} onChange={(e) => setText('excerpt', e.target.value)} />
            </label>
            <label className="adm-field">
              <span>Matn</span>
              <textarea className="adm-body" lang={lang} rows={16} value={text.body} placeholder={BODY_HINT} onChange={(e) => setText('body', e.target.value)} />
              <small>## bilan bölim sarlavhasi, - bilan röyxat bandi, böş qator bilan yangi xatboşi.</small>
            </label>
          </section>

          <section className="adm-card adm-panel">
            <h2>Sozlamalar</h2>
            <div className="adm-row">
              <label className="adm-field">
                <span>Sana</span>
                <input type="date" value={draft.date} onChange={(e) => set({ date: e.target.value })} />
              </label>
              <label className="adm-field">
                <span>Manzil</span>
                <input
                  value={draft.slug}
                  disabled={!draft.isNew}
                  maxLength={80}
                  onChange={(e) => {
                    setSlugTouched(true)
                    set({ slug: e.target.value.toLowerCase() })
                  }}
                />
                <small>{draft.isNew ? 'Lotin harflari, raqam va chiziqça.' : 'Havolalar buzilmasligi uçun özgarmaydi.'}</small>
              </label>
            </div>
            <fieldset className="adm-arts">
              <legend>Muqova</legend>
              {ART_NAMES.map((name, i) => (
                <label key={name} className={draft.art === i ? 'is-active' : ''}>
                  <input type="radio" name="art" checked={draft.art === i} onChange={() => set({ art: i })} />
                  <span className="adm-arts__img"><ServiceArt index={i} slice /></span>
                  <small>{name}</small>
                </label>
              ))}
            </fieldset>
          </section>
        </div>

        <aside className="adm-card adm-preview" aria-label="Oldindan köriş">
          <p className="adm-preview__label">Oldindan köriş · {lang.toUpperCase()}</p>
          <div className="adm-preview__cover"><ServiceArt index={draft.art} slice /></div>
          {text.category && <span className="blog-meta__tag">{text.category}</span>}
          <h2 className="adm-preview__title">{text.title || 'Sarlavha'}</h2>
          {text.excerpt && <p className="adm-preview__lead">{text.excerpt}</p>}
          <div className="blog-post adm-preview__body">
            {preview.map((s, n) => (
              <section className="blog-post__section" key={n}>
                {s.h && <h2>{s.h}</h2>}
                {s.p.map((para, k) => <p key={k}>{para}</p>)}
                {s.list && <ul>{s.list.map((item, k) => <li key={k}>{item}</li>)}</ul>}
              </section>
            ))}
          </div>
        </aside>
      </div>
    </>
  )
}

export default function Posts() {
  const [posts, setPosts] = useState(null)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    api('/posts').then((data) => setPosts(data.posts)).catch((err) => setError(err.message))
  }, [])

  useEffect(load, [load])

  const remove = async (post) => {
    if (!window.confirm(`“${post.texts.uz?.title || post.slug}” maqolasi butunlay öçirilsinmi?`)) return
    setError('')
    try {
      await api(`/posts/${post.slug}`, { method: 'DELETE' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (editing) {
    return <Editor key={editing.slug || 'new'} initial={editing} onBack={() => setEditing(null)} onSaved={load} />
  }

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Blog</h1>
          <p>Maqolalarni yozing, tahrirlang va saytga e’lon qiling.</p>
        </div>
        <button type="button" className="adm-btn adm-btn--primary" onClick={() => setEditing(newDraft())}>
          <Plus size={18} aria-hidden="true" />
          Yangi maqola
        </button>
      </header>

      {error && <p className="adm-error" role="alert">{error}</p>}
      {!posts && !error && <p className="adm-empty" role="status">Yuklanmoqda…</p>}
      {posts?.length === 0 && <p className="adm-card adm-empty adm-empty--box">Hali maqola yöq. Birinçisini yozing.</p>}

      {posts?.length > 0 && (
        <ul className="adm-posts">
          {posts.map((post) => (
            <li className="adm-card adm-post" key={post.slug}>
              <span className="adm-post__cover"><ServiceArt index={post.art} slice /></span>
              <div className="adm-post__text">
                <h2>{post.texts.uz?.title || post.slug}</h2>
                <p>{post.date} · {post.texts.uz?.category || 'Kategoriyasiz'}</p>
              </div>
              <StatusBadge status={post.status} />
              <div className="adm-post__actions">
                {post.status === 'published' && (
                  <a className="adm-icon" href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" aria-label="Saytda köriş" title="Saytda köriş">
                    <ExternalLink size={18} aria-hidden="true" />
                  </a>
                )}
                <button type="button" className="adm-icon" aria-label="Tahrirlaş" title="Tahrirlaş" onClick={() => setEditing(toDraft(post))}>
                  <Pencil size={18} aria-hidden="true" />
                </button>
                <button type="button" className="adm-icon adm-icon--danger" aria-label="Öçiriş" title="Öçiriş" onClick={() => remove(post)}>
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
