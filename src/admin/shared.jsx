import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { uploadImage } from './api.js'

export const LANGS = [
  { code: 'uz', label: 'Özbekça' },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
]

// Saqlanmagan o'zgarish bilan sahifa yopilsa, brauzer ogohlantiradi.
export function useUnsavedWarning(dirty) {
  useEffect(() => {
    if (!dirty) return undefined
    const warn = (e) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
}

export function LangTabs({ lang, onChange, isComplete }) {
  return (
    <div className="adm-tabs" role="tablist" aria-label="Til">
      {LANGS.map(({ code, label }) => (
        <button key={code} type="button" role="tab" aria-selected={lang === code} onClick={() => onChange(code)}>
          {label}
          <i className={isComplete(code) ? 'is-done' : ''} aria-label={isComplete(code) ? 'töldirilgan' : 'töldirilmagan'} />
        </button>
      ))}
    </div>
  )
}

// Rasm tanlash tugmasi. Natija: { url, width, height }.
export function UploadButton({ label = 'Rasm yuklaş', onUploaded, onError, className = 'adm-btn' }) {
  const input = useRef(null)
  const [busy, setBusy] = useState(false)

  const pick = async (e) => {
    const file = e.target.files?.[0]
    // Bir xil faylni qayta tanlash ham ishlasin.
    e.target.value = ''
    if (!file) return
    setBusy(true)
    onError?.('')
    try {
      onUploaded(await uploadImage(file))
    } catch (err) {
      onError?.(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <input ref={input} className="adm-file" type="file" accept="image/png,image/jpeg,image/webp" tabIndex={-1} aria-hidden="true" onChange={pick} />
      <button type="button" className={className} disabled={busy} onClick={() => input.current.click()}>
        <ImagePlus size={17} aria-hidden="true" />
        {busy ? 'Yuklanmoqda…' : label}
      </button>
    </>
  )
}

export function ImageField({ label, value, onChange, hint, removable = true }) {
  const [error, setError] = useState('')
  return (
    <div className="adm-image">
      <span className="adm-image__label">{label}</span>
      <div className="adm-image__row">
        <span className="adm-image__preview">{value ? <img src={value} alt="" /> : <ImagePlus size={22} aria-hidden="true" />}</span>
        <div className="adm-image__actions">
          <UploadButton label={value ? 'Almaştiriş' : 'Rasm yuklaş'} onError={setError} onUploaded={onChange} />
          {value && removable && (
            <button type="button" className="adm-icon adm-icon--danger" aria-label={`${label}: öçiriş`} title="Öçiriş" onClick={() => onChange({ url: '', width: 0, height: 0 })}>
              <Trash2 size={17} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      {hint && <small className="adm-image__hint">{hint}</small>}
      {error && <p className="adm-error adm-error--inline" role="alert">{error}</p>}
    </div>
  )
}
