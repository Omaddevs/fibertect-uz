import { useEffect, useState } from 'react'
import { Check, CircleDashed } from 'lucide-react'
import { api } from './api.js'
import { useUnsavedWarning } from './shared.jsx'

function Integration({ title, on, children }) {
  const Icon = on ? Check : CircleDashed
  return (
    <section className="adm-card adm-panel">
      <div className="adm-panel__head">
        <h2>{title}</h2>
        <span className={`adm-badge ${on ? 'adm-badge--on' : ''}`}>
          <Icon size={14} strokeWidth={2} aria-hidden="true" />
          {on ? 'Ulangan' : 'Ulanmagan'}
        </span>
      </div>
      {children}
    </section>
  )
}

export default function Settings() {
  const [data, setData] = useState(null)
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [test, setTest] = useState({ busy: false, message: '', failed: false })

  useEffect(() => {
    api('/settings')
      .then((result) => {
        setData(result)
        setForm(result.contact)
      })
      .catch((err) => setError(err.message))
  }, [])

  const dirty = Boolean(data) && JSON.stringify(data.contact) !== JSON.stringify(form)
  useUnsavedWarning(dirty)

  const change = (patch) => {
    setSaved(false)
    setForm((f) => ({ ...f, ...patch }))
  }

  const save = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const result = await api('/settings', { method: 'PUT', body: form })
      setData(result)
      setForm(result.contact)
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const sendTest = async () => {
    setTest({ busy: true, message: '', failed: false })
    try {
      await api('/settings/test-telegram', { method: 'POST' })
      setTest({ busy: false, message: 'Sinov xabari yuborildi.', failed: false })
    } catch (err) {
      setTest({ busy: false, message: err.message, failed: true })
    }
  }

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Sozlamalar</h1>
          <p>Saytdagi aloqa ma’lumotlari va ulangan xizmatlar.</p>
        </div>
      </header>

      {!data && !error && <p className="adm-empty" role="status">Yuklanmoqda…</p>}
      {!data && error && <p className="adm-error" role="alert">{error}</p>}

      {data && (
        <>
          <form className="adm-card adm-panel" onSubmit={save}>
            <h2>Aloqa ma’lumotlari</h2>
            <div className="adm-row">
              <label className="adm-field">
                <span>Email</span>
                <input type="email" value={form.email} maxLength={120} required onChange={(e) => change({ email: e.target.value })} />
              </label>
              <label className="adm-field">
                <span>Telegram</span>
                <input value={form.telegram} maxLength={40} required onChange={(e) => change({ telegram: e.target.value })} />
                <small>@ belgisisiz, masalan fibertech</small>
              </label>
            </div>
            {error && <p className="adm-error adm-error--inline" role="alert">{error}</p>}
            {saved && !dirty && <p className="adm-success" role="status"><Check size={17} aria-hidden="true" /> Saqlandi, saytda yangilandi.</p>}
            <div className="adm-list-save">
              <button type="submit" className="adm-btn adm-btn--primary" disabled={!dirty || saving}>{saving ? 'Saqlanmoqda…' : 'Saqlaş'}</button>
            </div>
          </form>

          <Integration title="Telegram bildirişnomalari" on={data.telegram.configured}>
            {data.telegram.configured ? (
              <>
                <p className="adm-muted">Yangi ariza kelganda Telegram’ga xabar yuboriladi.</p>
                {test.message && <p className={test.failed ? 'adm-error adm-error--inline' : 'adm-success'} role="status">{test.message}</p>}
                <div className="adm-list-save">
                  <button type="button" className="adm-btn" disabled={test.busy} onClick={sendTest}>{test.busy ? 'Yuborilmoqda…' : 'Sinov xabari yuboriş'}</button>
                </div>
              </>
            ) : (
              <p className="adm-muted">Arizalar panelda saqlanadi, lekin Telegram’ga xabar kelmaydi. Ulaş uçun serverdagi .env fayliga TELEGRAM_BOT_TOKEN va TELEGRAM_CHAT_ID yoziladi.</p>
            )}
          </Integration>

          <Integration title="Google Search Console" on={data.searchConsole.configured}>
            <p className="adm-muted">
              {data.searchConsole.configured
                ? 'Qidirilgan sözlar Statistika sahifasida körinadi.'
                : 'Google’dagi sözlar va örinlar panelda körinişi uçun service account kaliti serverga yuklanadi. Hozirça ularni Search Console’ning özida köriş mumkin.'}
            </p>
          </Integration>
        </>
      )}
    </>
  )
}
