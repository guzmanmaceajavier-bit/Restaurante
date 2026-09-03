import { useEffect } from 'react'

interface SEOProps {
  title: string
  description?: string
  ogImage?: string
}

export function SEO({ title, description, ogImage }: SEOProps) {
  useEffect(() => {
    const base = 'Sabor y Origen'
    document.title = title ? `${title} | ${base}` : base

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        if (name.startsWith('og:')) {
          el.setAttribute('property', name)
        } else {
          el.setAttribute('name', name)
        }
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    if (description) {
      setMeta('description', description)
      setMeta('og:description', description)
    }
    if (ogImage) setMeta('og:image', ogImage)
    setMeta('og:title', title ? `${title} | ${base}` : base)
    setMeta('og:type', 'website')
  }, [title, description, ogImage])

  return null
}
