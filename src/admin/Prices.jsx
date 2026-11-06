import { useEffect, useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { pricing as meta } from '../data/content.js'
import { translations } from '../i18n/translations.js'
import { api, formatNumber } from './api.js'

const items = translations.uz.pricing.items
const parse = (value) => {
  const digits = value.replace(/\D/g, '')
  return digits ? Number(digits) : 0
}
const rowError = (row) => {
  const values = row.tiers ?? [row.from]
  if (values.some((n) => !n)) return 'Har bir narxni kiriting.'
  if (row.tiers?.some((n, i) => i > 0 && n <= row.tiers[i - 1])) return 'Har bir keyingi daraja oldingisidan qimmat bölişi kerak.'
  return ''
}

function PriceInput({ label, value, onChange, invalid }) {
  return (
    <label className="adm-field">
      <span>{label}</span>
      <span className="adm-price-input">
        <input
          inputMode="numeric"
          value={value ? formatNumber(value) : ''}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange(parse(e.target.value))}
        />
        <small>söm</small>
      </span>
    </label>
  )
}

export default function Prices() {
  const [saved, setSaved] = useState(null)
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    api('/prices')
      .then(({ prices }) => {
        setSaved(prices)
        setRows(prices)
      })
      .catch((err) => setError(err.message))
  }, [])

  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(rows), [saved, rows])
  const invalid = rows?.some((row) => rowError(row))

  useEffect(() => {
    if (!dirty) return undefined
    const warn = (e) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const setRow = (index, row) => {
    setStatus('')
    setRows((all) => all.map((r, i) => (i === index ? { ...row, from: row.tiers ? row.tiers[0] : row.from } : r)))
  }

  const save = async () => {
    setError('')
    setStatus('saving')
    try {
      const { prices } = await api('/prices', { method: 'PUT', body: { prices: rows } })
      setSaved(prices)
      setRows(prices)
      setStatus('saved')
    } catch (err) {
      setError(err.message)
      setStatus('')
    }
  }

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Xizmat narxlari</h1>
          <p>Saqlangan narx saytda darhol yangilanadi.</p>
        </div>
      </header>

      {error && <p className="adm-error" role="alert">{error}</p>}
      {!rows && !error && <p className="adm-empty" role="status">Yuklanmoqda…</p>}

      {rows && (
        <div className="adm-prices">
          {rows.map((row, i) => {
            const { icon: Icon } = meta[i]
            const item = items[i]
            const problem = rowError(row)
            return (
              <section className="adm-card adm-price" key={item.title}>
                <header>
                  <span className="adm-price__icon"><Icon size={22} strokeWidth={1.6} aria-hidden="true" /></span>
                  <div>
                    <h2>{item.title}</h2>
                    <p>{item.sub} · {item.time}</p>
                  </div>
                  <p className="adm-price__total">
                    {row.tiers ? `${formatNumber(row.tiers[0])} – ${formatNumber(row.tiers[row.tiers.length - 1])}` : formatNumber(row.from)} söm
                  </p>
                </header>
                {row.tiers ? (
                  <div className="adm-price__tiers">
                    {row.tiers.map((price, n) => (
                      <PriceInput
                        key={item.tiers[n].name}
                        label={item.tiers[n].name}
                        value={price}
                        invalid={Boolean(problem)}
                        onChange={(value) => setRow(i, { ...row, tiers: row.tiers.map((p, k) => (k === n ? value : p)) })}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="adm-price__tiers">
                    <PriceInput label="Boşlanğiç narx" value={row.from} invalid={Boolean(problem)} onChange={(value) => setRow(i, { from: value })} />
                  </div>
                )}
                {problem && <p className="adm-error adm-error--inline">{problem}</p>}
              </section>
            )
          })}
        </div>
      )}

      {rows && (dirty || status === 'saved') && (
        <div className="adm-savebar" role="status">
          <span>
            {status === 'saved' && !dirty ? <><Check size={18} aria-hidden="true" /> Saqlandi, saytda yangilandi</> : 'Saqlanmagan özgarişlar bor'}
          </span>
          {dirty && (
            <div>
              <button type="button" className="adm-btn" onClick={() => { setRows(saved); setStatus('') }}>Bekor qiliş</button>
              <button type="button" className="adm-btn adm-btn--primary" disabled={invalid || status === 'saving'} onClick={save}>
                {status === 'saving' ? 'Saqlanmoqda…' : 'Saqlaş'}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
