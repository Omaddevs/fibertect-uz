import { createContext, useContext, useEffect, useState } from 'react'
import { pricing as basePricing } from './content.js'
import { defaultPosts, defaultPrices } from './editable.js'

const fallback = { prices: defaultPrices, posts: defaultPosts }
const SiteDataContext = createContext(fallback)

// Narx va maqolalar serverdan olinadi. Server javob bermasa, sayt koddagi qiymatlar bilan ishlayveradi.
export function SiteDataProvider({ children }) {
  const [data, setData] = useState(fallback)

  useEffect(() => {
    fetch('/api/public/content')
      .then((r) => (r.ok ? r.json() : null))
      .then((remote) => {
        if (remote?.prices?.length === defaultPrices.length && Array.isArray(remote.posts)) setData(remote)
      })
      .catch(() => {})
  }, [])

  const pricing = basePricing.map((item, i) => ({ ...item, ...data.prices[i] }))
  return <SiteDataContext.Provider value={{ pricing, posts: data.posts }}>{children}</SiteDataContext.Provider>
}

export function useSiteData() {
  const value = useContext(SiteDataContext)
  return value.pricing ? value : { pricing: basePricing, posts: defaultPosts }
}
