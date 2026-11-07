import { createContext, useContext, useEffect, useState } from 'react'
import { pricing as basePricing } from './content.js'
import { defaultClients, defaultContact, defaultPosts, defaultPrices, defaultProjects, defaultTestimonials } from './editable.js'

const fallback = {
  prices: defaultPrices,
  posts: defaultPosts,
  projects: defaultProjects,
  clients: defaultClients,
  testimonials: defaultTestimonials,
  contact: defaultContact,
}

const toView = (data, loaded) => ({
  loaded,
  pricing: basePricing.map((item, i) => ({ ...item, ...data.prices[i] })),
  posts: data.posts,
  projects: data.projects,
  clients: data.clients,
  testimonials: data.testimonials,
  contact: {
    email: data.contact.email,
    telegram: { label: `@${data.contact.telegram}`, href: `https://t.me/${data.contact.telegram}` },
  },
})

const SiteDataContext = createContext(toView(fallback, false))

// Ma'lumotlar serverdan olinadi. Server javob bermasa, sayt koddagi qiymatlar bilan ishlayveradi.
export function SiteDataProvider({ children }) {
  const [view, setView] = useState(() => toView(fallback, false))

  useEffect(() => {
    fetch('/api/public/content')
      .then((r) => (r.ok ? r.json() : null))
      .then((remote) => {
        const valid = remote?.prices?.length === defaultPrices.length && Array.isArray(remote.posts) && Array.isArray(remote.projects)
          && Array.isArray(remote.clients) && Array.isArray(remote.testimonials) && remote.contact?.email
        setView((current) => (valid ? toView(remote, true) : { ...current, loaded: true }))
      })
      .catch(() => setView((current) => ({ ...current, loaded: true })))
  }, [])

  return <SiteDataContext.Provider value={view}>{children}</SiteDataContext.Provider>
}

export const useSiteData = () => useContext(SiteDataContext)
