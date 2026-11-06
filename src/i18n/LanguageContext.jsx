import { createContext, useContext, useEffect, useState } from 'react'
import { languages, translations } from './translations.js'

const STORAGE_KEY = 'fibertech-lang'
const DEFAULT_LANG = 'uz'

function readStoredLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved && translations[saved] ? saved : DEFAULT_LANG
  } catch {
    return DEFAULT_LANG
  }
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(readStoredLang)
  const t = translations[lang]

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // Brauzer saqlashni taqiqlagan bo'lsa, til faqat shu sahifada amal qiladi.
    }
  }, [lang, t])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, languages }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
