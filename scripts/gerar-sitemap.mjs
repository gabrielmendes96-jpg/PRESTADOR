// Gera dist/sitemap.xml depois do build, listando as páginas estáticas
// e todas as combinações categoria×cidade das páginas de SEO
// (SEOCategoria.jsx, SEOCidadeCategoria.jsx). Roda como "postbuild" —
// não precisa de banco de dados, usa a mesma fonte de categorias/
// cidades que as páginas em si (src/lib/seoConfig.js), então nunca
// fica desatualizado em relação ao que as páginas realmente cobrem.
import { writeFileSync } from 'fs'
import { SEO_CATEGORIAS, SEO_CIDADES, SITE_URL } from '../src/lib/seoConfig.js'

const paginasEstaticas = [
  { path: '/', prioridade: '1.0' },
  { path: '/busca', prioridade: '0.9' },
  { path: '/como-funciona', prioridade: '0.6' },
  { path: '/planos', prioridade: '0.6' },
  { path: '/cadastro-pro', prioridade: '0.6' },
]

const urls = []

for (const p of paginasEstaticas) {
  urls.push({ loc: `${SITE_URL}${p.path}`, prioridade: p.prioridade })
}

for (const categoria of Object.keys(SEO_CATEGORIAS)) {
  urls.push({ loc: `${SITE_URL}/s/${categoria}`, prioridade: '0.8' })
  for (const cidade of SEO_CIDADES) {
    const cidadeSlug = cidade.toLowerCase().replace(/ /g, '-')
    urls.push({ loc: `${SITE_URL}/s/${categoria}/${cidadeSlug}`, prioridade: '0.7' })
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <priority>${u.prioridade}</priority>\n  </url>`).join('\n')}
</urlset>
`

writeFileSync('dist/sitemap.xml', xml)
console.log(`sitemap.xml gerado com ${urls.length} URLs.`)
