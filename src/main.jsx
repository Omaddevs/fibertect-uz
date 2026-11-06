import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource-variable/syne'
import '@fontsource-variable/instrument-sans'
import '@fontsource-variable/space-grotesk'
// Kirill harflari uchun: faqat ruscha matn ko'rsatilganda yuklanadi.
import '@fontsource-variable/montserrat'
import '@fontsource-variable/manrope'
import './index.css'

import App from './App.jsx'
import { SiteDataProvider } from './data/SiteData.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import { startRouter } from './lib/router.js'
import { startTracking } from './lib/track.js'

startRouter()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <SiteDataProvider>
        <App />
      </SiteDataProvider>
    </LanguageProvider>
  </StrictMode>,
)

startTracking()
