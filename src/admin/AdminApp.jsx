import { useCallback, useEffect, useState } from 'react'
import { ArrowUpRight, BarChart3, Eye, EyeOff, FileText, LogOut, Tag } from 'lucide-react'
import { Wordmark } from '../components/Logo.jsx'
import Analytics from './Analytics.jsx'
import { SESSION_EXPIRED, api } from './api.js'
import Posts from './Posts.jsx'
import Prices from './Prices.jsx'

const SECTIONS = [
  { id: 'stats', path: '/admin', label: 'Statistika', icon: BarChart3, Page: Analytics },
  { id: 'prices', path: '/admin/prices', label: 'Narxlar', icon: Tag, Page: Prices },
  { id: 'posts', path: '/admin/blog', label: 'Blog', icon: FileText, Page: Posts },
]

function Login({ onDone }) {
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api('/login', { method: 'POST', body: { password } })
      onDone()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <main className="adm-login">
      <span className="adm-login__glow" aria-hidden="true" />
      <form className="adm-card adm-login__card" onSubmit={submit}>
        <Wordmark />
        <h1>Admin panel</h1>
        <label className="adm-field">
          <span>Parol</span>
          <span className="adm-password">
            <input
              type={visible ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              required
            />
            <button type="button" aria-label={visible ? 'Parolni yaşiriş' : 'Parolni körsatiş'} onClick={() => setVisible((v) => !v)}>
              {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </span>
        </label>
        {error && <p className="adm-error" role="alert">{error}</p>}
        <button className="adm-btn adm-btn--primary adm-btn--wide" disabled={busy}>
          {busy ? 'Tekşirilmoqda…' : 'Kiriş'}
        </button>
      </form>
    </main>
  )
}

const sectionFromPath = () => {
  const path = window.location.pathname.replace(/\/+$/, '')
  return SECTIONS.find((s) => s.path === path)?.id ?? 'stats'
}

export default function AdminApp() {
  const [authed, setAuthed] = useState(null)
  const [section, setSection] = useState(sectionFromPath)

  useEffect(() => {
    api('/me').then(() => setAuthed(true)).catch(() => setAuthed(false))
    const expired = () => setAuthed(false)
    const onPop = () => setSection(sectionFromPath())
    window.addEventListener(SESSION_EXPIRED, expired)
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener(SESSION_EXPIRED, expired)
      window.removeEventListener('popstate', onPop)
    }
  }, [])

  const go = (e, item) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    window.history.pushState(null, '', item.path)
    setSection(item.id)
  }

  const logout = useCallback(async () => {
    await api('/logout', { method: 'POST' }).catch(() => {})
    setAuthed(false)
  }, [])

  if (authed === null) return <div className="adm-loading" role="status">Yuklanmoqda…</div>
  if (!authed) return <Login onDone={() => setAuthed(true)} />

  const { Page } = SECTIONS.find((s) => s.id === section)

  return (
    <div className="adm">
      <aside className="adm-side">
        <a className="adm-side__logo" href="/admin" aria-label="Admin panel" onClick={(e) => go(e, SECTIONS[0])}><Wordmark /></a>
        <nav className="adm-side__nav" aria-label="Admin bölimlari">
          {SECTIONS.map((item) => {
            const { id, path, label, icon: Icon } = item
            return (
            <a key={id} href={path} onClick={(e) => go(e, item)} aria-current={section === id ? 'page' : undefined}>
              <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
              {label}
            </a>
            )
          })}
        </nav>
        <div className="adm-side__foot">
          <a href="/" target="_blank" rel="noreferrer">
            <ArrowUpRight size={18} strokeWidth={1.7} aria-hidden="true" />
            Saytni oçiş
          </a>
          <button type="button" onClick={logout}>
            <LogOut size={18} strokeWidth={1.7} aria-hidden="true" />
            Çiqiş
          </button>
        </div>
      </aside>
      <main className="adm-main">
        <Page />
      </main>
    </div>
  )
}
