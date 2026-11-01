// Gera dist/sitemap.xml depois do build ("postbuild"):
//  - páginas estáticas;
//  - uma página por CATEGORIA, para todas as categorias do banco (se o banco não responder no build, usa só as de seoConfig);
//  - categoria × cidade apenas para as categorias de src/lib/seoConfig.js (as que têm texto próprio), para não
//    encher o Google de páginas parecidas e vazias.
import { writeFileSync } from 'fs'
import dotenv from 'dotenv'
import { SEO_CATEGORIAS, SEO_CIDADES, SITE_URL } from '../src/lib/seoConfig.js'

dotenv.config({ quiet: true })
dotenv.config({ path: '.env.test', quiet: true })

// Todas as categorias do banco (leitura pública); falha em silêncio e cai na lista do seoConfig.
async function categoriasDoBanco() {
  const url = process.env.VITE_SUPABASE_URL
  const chave = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !chave) return []
  try {
    const r = await fetch(`${url}/rest/v1/categorias?select=id&order=ordem`, { headers: { apikey: chave, Authorization: `Bearer ${chave}` } })
    if (!r.ok) return []
    return (await r.json()).map(c => c.id).filter(id => /^[a-z0-9_]+$/.test(id))
  } catch { return [] }
}

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

const todasAsCategorias = [...new Set([...Object.keys(SEO_CATEGORIAS), ...(await categoriasDoBanco())])]
for (const categoria of todasAsCategorias) urls.push({ loc: `${SITE_URL}/s/${categoria}`, prioridade: SEO_CATEGORIAS[categoria] ? '0.8' : '0.6' })
for (const categoria of Object.keys(SEO_CATEGORIAS)) {
  for (const cidade of SEO_CIDADES) {
    const cidadeSlug = encodeURIComponent(cidade.toLowerCase().replace(/ /g, '-'))
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
