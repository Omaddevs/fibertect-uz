import { useEffect } from 'react'
import Blog from './components/Blog.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Founder from './components/Founder.jsx'
import Works from './components/Works.jsx'
import Services from './components/Services.jsx'
import Clients from './components/Clients.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import { useLanguage } from './i18n/LanguageContext.jsx'
import { scrollToInitialSection } from './lib/router.js'

export default function App() {
  const { t } = useLanguage()

  useEffect(scrollToInitialSection, [])

  return (
    <>
      <a className="skip-link" href="#main">
        {t.a11y.skip}
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Founder />
        <Services />
        <Works />
        <Clients />
        <Contact />
      </main>
      <Footer />
      <Blog />
    </>
  )
}
