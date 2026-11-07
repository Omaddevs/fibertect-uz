import { useEffect, useRef, useState } from 'react'
import { Info, TrendingDown, TrendingUp } from 'lucide-react'
import { api, formatNumber } from './api.js'

const SEARCH_CONSOLE_URL = 'https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Afibertech.uz'
const RANGES = [7, 30, 90]
const SOURCE_LABELS = { search: 'Qidiruv tizimlari', social: 'Ijtimoiy tarmoqlar', link: 'Boşqa saytlardagi havolalar', direct: 'Töğridan-töğri kirganlar' }
const DEVICE_LABELS = { desktop: 'Kompyuter', mobile: 'Telefon', tablet: 'Planşet' }
const countryNames = new Intl.DisplayNames(['en'], { type: 'region' })
const MONTHS = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek']

const countryName = (code) => {
  try {
    return countryNames.of(code)
  } catch {
    return code
  }
}
const pageLabel = (path) => (path === '/' ? 'Boş sahifa' : path === '/blog' ? 'Blog' : path)
const shortDay = (day) => {
  const [, m, d] = day.split('-').map(Number)
  return `${d}-${MONTHS[m - 1]}`
}

function Delta({ now, before }) {
  if (!before) return <span className="adm-tile__hint">Oldingi davr uçun ma’lumot yöq</span>
  const change = Math.round(((now - before) / before) * 100)
  const Icon = change < 0 ? TrendingDown : TrendingUp
  return (
    <span className="adm-tile__hint">
      <Icon size={15} aria-hidden="true" />
      {change > 0 ? '+' : ''}{change}% oldingi davrga nisbatan
    </span>
  )
}

function Tile({ label, value, children }) {
  return (
    <div className="adm-card adm-tile">
      <p className="adm-tile__label">{label}</p>
      <p className="adm-tile__value">{formatNumber(value)}</p>
      {children}
    </div>
  )
}

// Bitta qator ma'lumot: egri chiziq, ustiga borganda vertikal chiziq va qiymat.
function VisitorsChart({ daily }) {
  const box = useRef(null)
  const [width, setWidth] = useState(800)
  const [hover, setHover] = useState(null)
  const height = 260
  const pad = { top: 16, right: 12, bottom: 28, left: 44 }

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)))
    observer.observe(box.current)
    return () => observer.disconnect()
  }, [])

  const peak = Math.max(...daily.map((d) => d.visitors), 1)
  const step = peak <= 4 ? 1 : Math.ceil(peak / 4 / 5) * 5
  const top = Math.ceil(peak / step) * step
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step)
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom
  const x = (i) => pad.left + (daily.length > 1 ? (i / (daily.length - 1)) * innerW : innerW / 2)
  const y = (v) => pad.top + innerH - (v / top) * innerH
  const line = daily.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(d.visitors).toFixed(1)}`).join('')
  const area = `${line}L${x(daily.length - 1).toFixed(1)} ${y(0)}L${x(0).toFixed(1)} ${y(0)}Z`
  const labelEvery = Math.ceil(daily.length / (width < 560 ? 4 : 8))

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const i = Math.round(((e.clientX - rect.left - pad.left) / innerW) * (daily.length - 1))
    setHover(Math.min(daily.length - 1, Math.max(0, i)))
  }
  const point = hover === null ? null : daily[hover]

  return (
    <div className="adm-chart" ref={box}>
      <svg width={width} height={height} role="img" aria-label="Kunlik tashrif buyuruvçilar grafigi" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="admArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9a7bff" stopOpacity=".32" />
            <stop offset="1" stopColor="#9a7bff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} stroke="#fff" strokeOpacity=".07" />
            <text x={pad.left - 10} y={y(t) + 4} textAnchor="end" className="adm-chart__tick">{formatNumber(t)}</text>
          </g>
        ))}
        {daily.map((d, i) => (i % labelEvery === 0 ? (
          <text key={d.day} x={x(i)} y={height - 8} textAnchor="middle" className="adm-chart__tick">{shortDay(d.day)}</text>
        ) : null))}
        <path d={area} fill="url(#admArea)" />
        <path d={line} fill="none" stroke="#9a7bff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {point && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={y(0)} stroke="#fff" strokeOpacity=".3" />
            <circle cx={x(hover)} cy={y(point.visitors)} r="5" fill="#9a7bff" stroke="#0b1026" strokeWidth="2" />
          </>
        )}
      </svg>
      {point && (
        <div className="adm-chart__tip" style={{ left: Math.min(Math.max(x(hover), 80), width - 80), top: Math.max(y(point.visitors) - 76, 0) }}>
          <b>{shortDay(point.day)}</b>
          <span>{formatNumber(point.visitors)} tashrif buyuruvçi</span>
          <span>{formatNumber(point.views)} sahifa köriş</span>
        </div>
      )}
    </div>
  )
}

function BarList({ rows, empty }) {
  if (!rows.length) return <p className="adm-empty">{empty}</p>
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <ol className="adm-bars">
      {rows.map((r) => (
        <li key={r.key ?? r.label}>
          <span className="adm-bars__row">
            <span className="adm-bars__label" title={r.title ?? r.label}>{r.badge && <i>{r.badge}</i>}{r.label}</span>
            <b>{formatNumber(r.value)}</b>
          </span>
          <span className="adm-bars__track"><span style={{ width: `${Math.max((r.value / max) * 100, 2)}%` }} /></span>
        </li>
      ))}
    </ol>
  )
}

const toRows = (items, label = (x) => x, extra) => items.map((i) => ({ label: label(i.name), value: i.visitors, ...extra?.(i) }))
const linkLabel = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

export default function Analytics() {
  const [days, setDays] = useState(30)
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let live = true
    setError('')
    api(`/analytics?days=${days}`)
      .then((data) => live && setReport(data))
      .catch((err) => live && setError(err.message))
    return () => {
      live = false
    }
  }, [days])

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Statistika</h1>
          <p>Saytga kim, qayerdan va qanday kirayotgani.</p>
        </div>
        <div className="adm-segment" role="group" aria-label="Davr">
          {RANGES.map((r) => (
            <button key={r} type="button" aria-pressed={days === r} onClick={() => setDays(r)}>{r} kun</button>
          ))}
        </div>
      </header>

      {error && <p className="adm-error" role="alert">{error}</p>}
      {!report && !error && <p className="adm-empty" role="status">Yuklanmoqda…</p>}

      {report && (
        <>
          <section className="adm-tiles" aria-label="Asosiy körsatkiçlar">
            <Tile label="Tashrif buyuruvçilar" value={report.totals.visitors}>
              <Delta now={report.totals.visitors} before={report.totals.previousVisitors} />
            </Tile>
            <Tile label="Sahifa körişlari" value={report.totals.views}>
              <Delta now={report.totals.views} before={report.totals.previousViews} />
            </Tile>
            <Tile label="Bugun kirganlar" value={report.totals.today}>
              <span className="adm-tile__hint">{formatNumber(report.totals.todayViews)} sahifa köriş</span>
            </Tile>
            <Tile label="Asosiy qurilma" value={report.devices[0]?.visitors ?? 0}>
              <span className="adm-tile__hint">{report.devices[0] ? DEVICE_LABELS[report.devices[0].name] : 'Ma’lumot yöq'}</span>
            </Tile>
          </section>

          <section className="adm-card adm-panel">
            <h2>Kunlik tashrif buyuruvçilar</h2>
            <VisitorsChart daily={report.daily} />
            <details className="adm-table-toggle">
              <summary>Jadval körinişida</summary>
              <div className="adm-scroll">
                <table className="adm-table">
                  <thead><tr><th>Kun</th><th>Tashrif buyuruvçi</th><th>Sahifa köriş</th></tr></thead>
                  <tbody>
                    {[...report.daily].reverse().map((d) => (
                      <tr key={d.day}><td>{d.day}</td><td>{formatNumber(d.visitors)}</td><td>{formatNumber(d.views)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </section>

          <div className="adm-grid">
            <section className="adm-card adm-panel">
              <h2>Top 10 davlat</h2>
              <BarList
                rows={report.countries.map((c) => ({ key: c.name, label: countryName(c.name), badge: c.name, value: c.visitors }))}
                empty="Hali ma’lumot yöq."
              />
            </section>

            <section className="adm-card adm-panel">
              <h2>Qayerdan kelishmoqda</h2>
              <BarList rows={toRows(report.sourceTypes, (n) => SOURCE_LABELS[n] ?? n)} empty="Hali ma’lumot yöq." />
              <h3>Havolalar</h3>
              <BarList
                rows={report.links.map((l) => ({ key: l.name, label: linkLabel(l.name), title: l.name, value: l.visitors }))}
                empty="Boşqa saytlardan kirganlar hali yöq."
              />
            </section>

            <section className="adm-card adm-panel">
              <h2>Qidiruv tizimlari</h2>
              <BarList rows={toRows(report.engines)} empty="Qidiruvdan kirganlar hali yöq." />
              <h3>Qidirilgan sözlar</h3>
              <BarList rows={toRows(report.terms)} empty="Hozirça sözlar yöq." />
              <p className="adm-note">
                <Info size={16} aria-hidden="true" />
                <span>
                  Google va köp qidiruv tizimlari qidirilgan sözni saytga bermaydi. Bu yerda faqat söz yetib kelgan holatlar körinadi.{' '}
                  <a href={SEARCH_CONSOLE_URL} target="_blank" rel="noreferrer">Google’dagi töliq röyxatni Search Console’da köring</a>.
                </span>
              </p>
            </section>

            <section className="adm-card adm-panel">
              <h2>Ommabop sahifalar</h2>
              <BarList rows={toRows(report.pages, pageLabel)} empty="Hali ma’lumot yöq." />
              {report.campaigns.length > 0 && (
                <>
                  <h3>Reklama kampaniyalari (UTM)</h3>
                  <BarList rows={toRows(report.campaigns)} empty="" />
                </>
              )}
            </section>
          </div>
        </>
      )}
    </>
  )
}
