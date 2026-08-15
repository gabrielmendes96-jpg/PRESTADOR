import { useEffect } from 'react'
import { SITE_URL } from './seoConfig'

function definirMeta(seletor, criarTag) {
  let tag = document.querySelector(seletor)
  if (!tag) {
    tag = criarTag()
    document.head.appendChild(tag)
  }
  return tag
}

// Atualiza title, meta description, canonical, Open Graph e um bloco
// JSON-LD (schema.org) pra página atual. Usado pelas páginas de SEO
// (SEOCategoria.jsx, SEOCidadeCategoria.jsx) — cada rota tem seu
// próprio título/descrição/URL em vez de reaproveitar os genéricos do
// index.html pra todo mundo.
export function useSEO({ title, description, path, jsonLd }) {
  useEffect(() => {
    if (title) document.title = title

    if (description) {
      const meta = definirMeta('meta[name="description"]', () => {
        const el = document.createElement('meta')
        el.name = 'description'
        return el
      })
      meta.content = description
    }

    if (path) {
      const url = `${SITE_URL}${path}`

      const canonical = definirMeta('link[rel="canonical"]', () => {
        const el = document.createElement('link')
        el.rel = 'canonical'
        return el
      })
      canonical.href = url

      const ogUrl = definirMeta('meta[property="og:url"]', () => {
        const el = document.createElement('meta')
        el.setAttribute('property', 'og:url')
        return el
      })
      ogUrl.content = url
    }

    if (title) {
      const ogTitle = definirMeta('meta[property="og:title"]', () => {
        const el = document.createElement('meta')
        el.setAttribute('property', 'og:title')
        return el
      })
      ogTitle.content = title
    }

    if (description) {
      const ogDesc = definirMeta('meta[property="og:description"]', () => {
        const el = document.createElement('meta')
        el.setAttribute('property', 'og:description')
        return el
      })
      ogDesc.content = description
    }

    let scriptJsonLd = null
    if (jsonLd) {
      scriptJsonLd = document.createElement('script')
      scriptJsonLd.type = 'application/ld+json'
      scriptJsonLd.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(scriptJsonLd)
    }

    return () => {
      if (scriptJsonLd) document.head.removeChild(scriptJsonLd)
    }
  }, [title, description, path, jsonLd])
}
