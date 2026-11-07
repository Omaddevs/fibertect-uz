import { useCallback, useEffect, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowUp, Check, CircleDashed, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react'
import { projectTechnologies, technologies } from '../data/content.js'
import { api } from './api.js'
import { ImageField, LANGS, LangTabs, UploadButton, useUnsavedWarning } from './shared.jsx'

const ALL_TECH = [...technologies, ...projectTechnologies]

const slugify = (title) => title
  .toLowerCase()
  .replace(/ş/g, 'sh').replace(/ç/g, 'ch').replace(/ğ/g, 'g').replace(/ö/g, 'o')
  .replace(/['’‘`]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 80)

const emptyText = (galleryLength = 0) => ({
  name: '', category: '', alt: '', galleryAlt: Array(galleryLength).fill(''), summary: '', task: '', solution: '', result: '', services: '',
})

const newDraft = () => ({
  isNew: true,
  slug: '',
  status: 'draft',
  url: '',
  image: '',
  width: 0,
  height: 0,
  logo: '',
  wide: false,
  sample: false,
  tech: [],
  gallery: [],
  texts: { uz: emptyText(), ru: emptyText(), en: emptyText() },
})

const toDraft = (project) => ({
  ...newDraft(),
  ...project,
  isNew: false,
  wide: Boolean(project.wide),
  sample: Boolean(project.sample),
  logo: project.logo ?? '',
  url: project.url ?? '',
  texts: Object.fromEntries(LANGS.map(({ code }) => {
    const t = project.texts[code] ?? {}
    return [code, {
      ...emptyText(),
      ...t,
      galleryAlt: project.gallery.map((_, i) => t.galleryAlt?.[i] ?? ''),
      services: (t.services ?? []).join(', '),
    }]
  })),
})

const toPayload = ({ isNew, ...draft }, status) => ({
  ...draft,
  status,
  texts: Object.fromEntries(LANGS.map(({ code }) => {
    const t = draft.texts[code]
    return [code, { ...t, services: t.services.split(',').map((s) => s.trim()).filter(Boolean) }]
  })),
})

const isComplete = (t) => Boolean(t.name.trim() && t.category.trim() && t.summary.trim() && t.task.trim() && t.solution.trim() && t.result.trim())

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

function TextField({ label, value, onChange, lang, rows, maxLength, hint }) {
  return (
    <label className="adm-field">
      <span>{label}</span>
      {rows
        ? <textarea lang={lang} rows={rows} value={value} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />
        : <input lang={lang} value={value} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />}
      {hint && <small>{hint}</small>}
    </label>
  )
}

function Editor({ initial, onBack, onSaved }) {
  const [draft, setDraft] = useState(initial)
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial))
  const [lang, setLang] = useState('uz')
  const [slugTouched, setSlugTouched] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  const dirty = JSON.stringify(draft) !== baseline
  const text = draft.texts[lang]
  useUnsavedWarning(dirty)

  const set = (patch) => {
    setNotice('')
    setDraft((d) => ({ ...d, ...patch }))
  }
  const setText = (field, value) => {
    setNotice('')
    setDraft((d) => {
      const next = { ...d, texts: { ...d.texts, [lang]: { ...d.texts[lang], [field]: value } } }
      if (d.isNew && !slugTouched && lang === 'uz' && field === 'name') next.slug = slugify(value)
      return next
    })
  }

  // Galereya va uning izohlari bir xil tartibda o'zgaradi.
  const changeGallery = (gallery, mapAlt) => {
    setNotice('')
    setDraft((d) => ({
      ...d,
      gallery,
      texts: Object.fromEntries(LANGS.map(({ code }) => [code, { ...d.texts[code], galleryAlt: mapAlt(d.texts[code].galleryAlt) }])),
    }))
  }
  const addShot = ({ url, width, height }) => changeGallery([...draft.gallery, { src: url, width, height }], (alts) => [...alts, ''])
  const removeShot = (index) => changeGallery(draft.gallery.filter((_, i) => i !== index), (alts) => alts.filter((_, i) => i !== index))

  const toggleTech = (key) => set({ tech: draft.tech.includes(key) ? draft.tech.filter((k) => k !== key) : [...draft.tech, key] })

  const back = () => {
    if (!dirty || window.confirm('Saqlanmagan özgarişlar yöqoladi. Çiqasizmi?')) onBack()
  }

  const save = async (status) => {
    setError('')
    setSaving(true)
    try {
      const payload = toPayload(draft, status)
      const { project } = draft.isNew
        ? await api('/projects', { method: 'POST', body: payload })
        : await api(`/projects/${draft.slug}`, { method: 'PUT', body: payload })
      const next = toDraft(project)
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
            Loyihalar röyxati
          </button>
          <h1>{draft.isNew ? 'Yangi loyiha' : 'Loyihani tahrirlaş'}</h1>
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

      <section className="adm-card adm-panel">
        <LangTabs lang={lang} onChange={setLang} isComplete={(code) => isComplete(draft.texts[code])} />
        <div className="adm-row">
          <TextField label="Nomi" lang={lang} value={text.name} maxLength={200} onChange={(v) => setText('name', v)} />
          <TextField label="Kategoriya" lang={lang} value={text.category} maxLength={100} onChange={(v) => setText('category', v)} />
        </div>
        <TextField label="Qisqa tavsif" lang={lang} rows={3} value={text.summary} maxLength={1500} onChange={(v) => setText('summary', v)} />
        <TextField label="Vazifa" lang={lang} rows={4} value={text.task} maxLength={4000} onChange={(v) => setText('task', v)} />
        <TextField label="Yeçim" lang={lang} rows={4} value={text.solution} maxLength={4000} onChange={(v) => setText('solution', v)} />
        <TextField label="Natija" lang={lang} rows={4} value={text.result} maxLength={4000} onChange={(v) => setText('result', v)} />
        <TextField label="Xizmatlar" lang={lang} value={text.services} hint="Vergul bilan ajrating." onChange={(v) => setText('services', v)} />
        <TextField label="Asosiy rasm izohi" lang={lang} value={text.alt} maxLength={300} hint="Rasmda nima borligi: Google va ekran öquvçilar uçun." onChange={(v) => setText('alt', v)} />
      </section>

      <section className="adm-card adm-panel">
        <h2>Rasmlar</h2>
        <div className="adm-row">
          <ImageField
            label="Asosiy rasm"
            value={draft.image}
            removable={false}
            hint="Kartada va loyiha sahifasida körinadi."
            onChange={({ url, width, height }) => set({ image: url, width, height })}
          />
          <ImageField label="Logotip" value={draft.logo} hint="Ixtiyoriy." onChange={({ url }) => set({ logo: url })} />
        </div>

        <h3>Galereya</h3>
        {draft.gallery.length > 0 && (
          <ul className="adm-gallery">
            {draft.gallery.map((shot, i) => (
              <li key={`${shot.src}-${i}`}>
                <img src={shot.src} alt="" />
                <label className="adm-field">
                  <span>Izoh ({lang.toUpperCase()})</span>
                  <input
                    lang={lang}
                    value={text.galleryAlt[i] ?? ''}
                    maxLength={300}
                    onChange={(e) => setText('galleryAlt', text.galleryAlt.map((alt, k) => (k === i ? e.target.value : alt)))}
                  />
                </label>
                <button type="button" className="adm-icon adm-icon--danger" aria-label={`${i + 1}-rasmni öçiriş`} title="Öçiriş" onClick={() => removeShot(i)}>
                  <Trash2 size={17} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {draft.gallery.length < 12 && <UploadButton label="Galereyaga rasm qöşiş" onUploaded={addShot} onError={setError} />}
      </section>

      <section className="adm-card adm-panel">
        <h2>Sozlamalar</h2>
        <div className="adm-row">
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
            <small>{draft.isNew ? 'Lotin harflari, raqam va çiziqça.' : 'Havolalar buzilmasligi uçun özgarmaydi.'}</small>
          </label>
          <TextField label="Sayt manzili" value={draft.url} maxLength={300} hint="Ixtiyoriy, masalan https://misol.uz/" onChange={(v) => set({ url: v })} />
        </div>
        <label className="adm-check">
          <input type="checkbox" checked={draft.wide} onChange={(e) => set({ wide: e.target.checked })} />
          Kartani keng körsatiş
        </label>
        <label className="adm-check">
          <input type="checkbox" checked={draft.sample} onChange={(e) => set({ sample: e.target.checked })} />
          “Namunaviy loyiha” belgisi
        </label>

        <h3>Texnologiyalar</h3>
        <div className="adm-chips">
          {ALL_TECH.map((t) => (
            <label key={t.icon} className={draft.tech.includes(t.icon) ? 'is-active' : ''}>
              <input type="checkbox" checked={draft.tech.includes(t.icon)} onChange={() => toggleTech(t.icon)} />
              {t.name}
            </label>
          ))}
        </div>
      </section>
    </>
  )
}

export default function Projects() {
  const [projects, setProjects] = useState(null)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    api('/projects').then((data) => setProjects(data.projects)).catch((err) => setError(err.message))
  }, [])

  useEffect(load, [load])

  const remove = async (project) => {
    if (!window.confirm(`“${project.texts.uz?.name || project.slug}” loyihasi butunlay öçirilsinmi?`)) return
    setError('')
    try {
      await api(`/projects/${project.slug}`, { method: 'DELETE' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const move = async (index, step) => {
    const next = [...projects]
    const [item] = next.splice(index, 1)
    next.splice(index + step, 0, item)
    setError('')
    try {
      const data = await api('/projects-order', { method: 'PUT', body: { slugs: next.map((p) => p.slug) } })
      setProjects(data.projects)
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
          <h1>Loyihalar</h1>
          <p>“Bizning işlar” bölimi. Tartib saytda ham şunday böladi.</p>
        </div>
        <button type="button" className="adm-btn adm-btn--primary" onClick={() => setEditing(newDraft())}>
          <Plus size={18} aria-hidden="true" />
          Yangi loyiha
        </button>
      </header>

      {error && <p className="adm-error" role="alert">{error}</p>}
      {!projects && !error && <p className="adm-empty" role="status">Yuklanmoqda…</p>}
      {projects?.length === 0 && <p className="adm-card adm-empty adm-empty--box">Hali loyiha yöq. Birinçisini qöşing.</p>}

      {projects?.length > 0 && (
        <ul className="adm-posts">
          {projects.map((project, i) => (
            <li className="adm-card adm-post" key={project.slug}>
              <span className="adm-post__cover">{project.image && <img src={project.image} alt="" />}</span>
              <div className="adm-post__text">
                <h2>{project.texts.uz?.name || project.slug}</h2>
                <p>{project.texts.uz?.category || 'Kategoriyasiz'}</p>
              </div>
              <StatusBadge status={project.status} />
              <div className="adm-post__actions">
                <button type="button" className="adm-icon" aria-label="Yuqoriga" title="Yuqoriga" disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUp size={18} aria-hidden="true" />
                </button>
                <button type="button" className="adm-icon" aria-label="Pastga" title="Pastga" disabled={i === projects.length - 1} onClick={() => move(i, 1)}>
                  <ArrowDown size={18} aria-hidden="true" />
                </button>
                {project.status === 'published' && (
                  <a className="adm-icon" href={`/projects/${project.slug}`} target="_blank" rel="noreferrer" aria-label="Saytda köriş" title="Saytda köriş">
                    <ExternalLink size={18} aria-hidden="true" />
                  </a>
                )}
                <button type="button" className="adm-icon" aria-label="Tahrirlaş" title="Tahrirlaş" onClick={() => setEditing(toDraft(project))}>
                  <Pencil size={18} aria-hidden="true" />
                </button>
                <button type="button" className="adm-icon adm-icon--danger" aria-label="Öçiriş" title="Öçiriş" onClick={() => remove(project)}>
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
