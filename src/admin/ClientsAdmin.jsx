import { useEffect, useState } from 'react'
import { Check, Plus, Trash2 } from 'lucide-react'
import { api } from './api.js'
import { ImageField, LangTabs, useUnsavedWarning } from './shared.jsx'

// Yangi karta uchun id.
const tempId = () => `new-${Math.random().toString(36).slice(2, 10)}`
const perLang = () => ({ uz: '', ru: '', en: '' })

// Ro'yxatni butunligicha saqlaydigan bo'lim.
function useListEditor(path, field) {
  const [saved, setSaved] = useState(null)
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api(path)
      .then((data) => {
        setSaved(data[field])
        setItems(data[field])
      })
      .catch((err) => setError(err.message))
  }, [path, field])

  const dirty = JSON.stringify(saved) !== JSON.stringify(items)
  useUnsavedWarning(dirty)

  const update = (id, patch) => {
    setNotice(false)
    setItems((all) => all.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }
  const add = (item) => {
    setNotice(false)
    setItems((all) => [...all, item])
  }
  const remove = (id) => {
    setNotice(false)
    setItems((all) => all.filter((item) => item.id !== id))
  }
  const save = async () => {
    setError('')
    setSaving(true)
    try {
      const data = await api(path, { method: 'PUT', body: { [field]: items } })
      setSaved(data[field])
      setItems(data[field])
      setNotice(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }
  const reset = () => {
    setError('')
    setItems(saved)
  }

  return { items, error, notice, saving, dirty, update, add, remove, save, reset }
}

function SaveRow({ list }) {
  return (
    <>
      {list.error && <p className="adm-error adm-error--inline" role="alert">{list.error}</p>}
      {list.notice && !list.dirty && <p className="adm-success" role="status"><Check size={17} aria-hidden="true" /> Saqlandi, saytda yangilandi.</p>}
      {list.dirty && (
        <div className="adm-list-save">
          <button type="button" className="adm-btn" onClick={list.reset}>Bekor qiliş</button>
          <button type="button" className="adm-btn adm-btn--primary" disabled={list.saving} onClick={list.save}>
            {list.saving ? 'Saqlanmoqda…' : 'Saqlaş'}
          </button>
        </div>
      )}
    </>
  )
}

function ClientsPanel({ projects }) {
  const list = useListEditor('/clients', 'clients')

  return (
    <section className="adm-card adm-panel">
      <div className="adm-panel__head">
        <div>
          <h2>Mijozlar logotiplari</h2>
          <p>Faqat ruxsat olingan kompaniyalarni qöşing.</p>
        </div>
        <button type="button" className="adm-btn" disabled={!list.items} onClick={() => list.add({ id: tempId(), name: '', logo: '', url: '', slot: null, project: '' })}>
          <Plus size={17} aria-hidden="true" />
          Mijoz qöşiş
        </button>
      </div>

      {!list.items && !list.error && <p className="adm-empty" role="status">Yuklanmoqda…</p>}
      {list.items?.length === 0 && <p className="adm-empty">Hali mijoz yöq.</p>}

      {list.items?.map((client) => (
        <article className="adm-item" key={client.id}>
          <ImageField label="Logotip" value={client.logo} removable={false} onChange={({ url }) => list.update(client.id, { logo: url })} />
          <div className="adm-item__fields">
            <div className="adm-row">
              <label className="adm-field">
                <span>Nomi</span>
                <input value={client.name} maxLength={120} onChange={(e) => list.update(client.id, { name: e.target.value })} />
              </label>
              <label className="adm-field">
                <span>Sayt manzili</span>
                <input value={client.url ?? ''} maxLength={300} placeholder="https://" onChange={(e) => list.update(client.id, { url: e.target.value })} />
              </label>
            </div>
            <div className="adm-row">
              <label className="adm-field">
                <span>Örni</span>
                <input
                  inputMode="numeric"
                  value={client.slot ?? ''}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '')
                    list.update(client.id, { slot: digits ? Number(digits) : null })
                  }}
                />
                <small>Törda kartaning raqami. Böş bölsa, birinçi böş öringa tuşadi.</small>
              </label>
              <label className="adm-field">
                <span>Boğliq loyiha</span>
                <select value={client.project ?? ''} onChange={(e) => list.update(client.id, { project: e.target.value })}>
                  <option value="">Yöq</option>
                  {projects?.map((p) => <option key={p.slug} value={p.slug}>{p.texts.uz?.name || p.slug}</option>)}
                </select>
                <small>Tanlansa, nom har bir tilda loyihadan olinadi.</small>
              </label>
            </div>
          </div>
          <button type="button" className="adm-icon adm-icon--danger" aria-label={`${client.name || 'Mijoz'}: öçiriş`} title="Öçiriş" onClick={() => list.remove(client.id)}>
            <Trash2 size={18} aria-hidden="true" />
          </button>
        </article>
      ))}

      <SaveRow list={list} />
    </section>
  )
}

function Testimonial({ item, list }) {
  const [lang, setLang] = useState('uz')
  const setLangField = (field, value) => list.update(item.id, { [field]: { ...item[field], [lang]: value } })

  return (
    <article className="adm-item">
      <div className="adm-item__images">
        <ImageField label="Surat" value={item.photo} onChange={({ url }) => list.update(item.id, { photo: url })} />
        <ImageField label="Logotip" value={item.logo} onChange={({ url }) => list.update(item.id, { logo: url })} />
      </div>
      <div className="adm-item__fields">
        <div className="adm-row">
          <label className="adm-field">
            <span>Muallif</span>
            <input value={item.name} maxLength={120} onChange={(e) => list.update(item.id, { name: e.target.value })} />
          </label>
          <label className="adm-field">
            <span>Kompaniya</span>
            <input value={item.company} maxLength={120} onChange={(e) => list.update(item.id, { company: e.target.value })} />
          </label>
        </div>
        <LangTabs lang={lang} onChange={setLang} isComplete={(code) => Boolean(item.quote[code]?.trim())} />
        <label className="adm-field">
          <span>Lavozimi</span>
          <input lang={lang} value={item.role[lang] ?? ''} maxLength={150} onChange={(e) => setLangField('role', e.target.value)} />
        </label>
        <label className="adm-field">
          <span>Fikr</span>
          <textarea lang={lang} rows={3} value={item.quote[lang] ?? ''} maxLength={1500} onChange={(e) => setLangField('quote', e.target.value)} />
        </label>
      </div>
      <button type="button" className="adm-icon adm-icon--danger" aria-label={`${item.name || 'Fikr'}: öçiriş`} title="Öçiriş" onClick={() => list.remove(item.id)}>
        <Trash2 size={18} aria-hidden="true" />
      </button>
    </article>
  )
}

function TestimonialsPanel() {
  const list = useListEditor('/testimonials', 'testimonials')

  return (
    <section className="adm-card adm-panel">
      <div className="adm-panel__head">
        <div>
          <h2>Mijozlar fikrlari</h2>
          <p>Faqat haqiqiy, ruxsat bilan olingan fikrlar. Röyxat böş bölsa, saytda bu qism körinmaydi.</p>
        </div>
        <button
          type="button"
          className="adm-btn"
          disabled={!list.items}
          onClick={() => list.add({ id: tempId(), name: '', company: '', photo: '', logo: '', quote: perLang(), role: perLang() })}
        >
          <Plus size={17} aria-hidden="true" />
          Fikr qöşiş
        </button>
      </div>

      {!list.items && !list.error && <p className="adm-empty" role="status">Yuklanmoqda…</p>}
      {list.items?.length === 0 && <p className="adm-empty">Hali fikr yöq.</p>}
      {list.items?.map((item) => <Testimonial key={item.id} item={item} list={list} />)}

      <SaveRow list={list} />
    </section>
  )
}

export default function ClientsAdmin() {
  const [projects, setProjects] = useState(null)

  useEffect(() => {
    api('/projects').then((data) => setProjects(data.projects)).catch(() => setProjects([]))
  }, [])

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Mijozlar</h1>
          <p>Logotiplar va mijozlar fikrlari.</p>
        </div>
      </header>
      <ClientsPanel projects={projects} />
      <TestimonialsPanel />
    </>
  )
}
