import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { api, formatNumber } from './api.js'

const STATUSES = [
  { id: 'new', label: 'Yangi' },
  { id: 'contacted', label: 'Gaplaşildi' },
  { id: 'won', label: 'Şartnoma' },
  { id: 'lost', label: 'Rad etildi' },
]

const dateFormat = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Tashkent', dateStyle: 'short', timeStyle: 'short' })

// Telefon yoki Telegram bo'lsa bosiladigan havola, aks holda oddiy matn.
export function reachHref(reach) {
  const value = reach.trim()
  const handle = value.match(/^(?:@|https?:\/\/t\.me\/)([A-Za-z0-9_]{4,32})$/)
  if (handle) return `https://t.me/${handle[1]}`
  if (/^\+?[\d\s()-]{7,20}$/.test(value)) return `tel:${value.replace(/[\s()-]/g, '')}`
  return null
}

function LeadCard({ lead, onChange, onRemove }) {
  const [note, setNote] = useState(lead.note)
  const [error, setError] = useState('')
  const href = reachHref(lead.reach)

  const save = async (patch) => {
    setError('')
    try {
      const { lead: updated } = await api(`/leads/${lead.id}`, { method: 'PUT', body: { status: lead.status, note, ...patch } })
      onChange(updated)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <li className={`adm-card adm-lead ${lead.status === 'new' ? 'adm-lead--new' : ''}`}>
      <header className="adm-lead__head">
        <div>
          <h2>{lead.name}</h2>
          <p className="adm-lead__meta">
            {href ? <a href={href} target="_blank" rel="noreferrer">{lead.reach}</a> : lead.reach}
            {lead.service && <> · {lead.service}</>}
            {' · '}{dateFormat.format(lead.createdAt)}
          </p>
        </div>
        <div className="adm-lead__actions">
          <label className="adm-select">
            <span className="adm-sr">Holat</span>
            <select value={lead.status} onChange={(e) => save({ status: e.target.value })}>
              {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
          <button type="button" className="adm-icon adm-icon--danger" aria-label="Öçiriş" title="Öçiriş" onClick={() => onRemove(lead)}>
            <Trash2 size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      <p className="adm-lead__message">{lead.message}</p>

      {lead.notified === -1 && (
        <p className="adm-lead__warn"><AlertTriangle size={15} aria-hidden="true" /> Telegram xabari yetib bormadi.</p>
      )}

      <label className="adm-field">
        <span>Izoh (faqat sizga körinadi)</span>
        <textarea rows={2} value={note} maxLength={3000} onChange={(e) => setNote(e.target.value)} onBlur={() => note !== lead.note && save({ note })} />
      </label>
      {error && <p className="adm-error adm-error--inline" role="alert">{error}</p>}
    </li>
  )
}

export default function Leads({ onLeadsChanged }) {
  const [leads, setLeads] = useState(null)
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')

  const load = useCallback(() => {
    api('/leads').then((data) => setLeads(data.leads)).catch((err) => setError(err.message))
  }, [])

  useEffect(load, [load])

  const counts = useMemo(() => {
    const result = { all: leads?.length ?? 0 }
    for (const { id } of STATUSES) result[id] = leads?.filter((l) => l.status === id).length ?? 0
    return result
  }, [leads])

  const shown = leads?.filter((l) => filter === 'all' || l.status === filter)

  const changed = (updated) => {
    setLeads((all) => all.map((l) => (l.id === updated.id ? updated : l)))
    onLeadsChanged?.()
  }

  const remove = async (lead) => {
    if (!window.confirm(`${lead.name}: ariza butunlay öçirilsinmi?`)) return
    setError('')
    try {
      await api(`/leads/${lead.id}`, { method: 'DELETE' })
      setLeads((all) => all.filter((l) => l.id !== lead.id))
      onLeadsChanged?.()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Arizalar</h1>
          <p>Saytdagi forma orqali yuborilgan arizalar.</p>
        </div>
        <div className="adm-segment" role="group" aria-label="Holat böyiça">
          {[{ id: 'all', label: 'Hammasi' }, ...STATUSES].map((s) => (
            <button key={s.id} type="button" aria-pressed={filter === s.id} onClick={() => setFilter(s.id)}>
              {s.label} {formatNumber(counts[s.id])}
            </button>
          ))}
        </div>
      </header>

      {error && <p className="adm-error" role="alert">{error}</p>}
      {!leads && !error && <p className="adm-empty" role="status">Yuklanmoqda…</p>}
      {shown?.length === 0 && (
        <p className="adm-card adm-empty adm-empty--box">{filter === 'all' ? 'Hali ariza yöq. Yangi ariza şu yerda körinadi.' : 'Bu holatda ariza yöq.'}</p>
      )}

      {shown?.length > 0 && (
        <ul className="adm-leads">
          {shown.map((lead) => <LeadCard key={lead.id} lead={lead} onChange={changed} onRemove={remove} />)}
        </ul>
      )}
    </>
  )
}
