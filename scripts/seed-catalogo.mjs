// Carrega o catálogo de serviços (supabase/seed/catalogo-servicos.mjs) no banco e gera supabase/35_catalogo_completo.sql.
//   node scripts/seed-catalogo.mjs            -> valida, gera o .sql e mostra o relatório (não grava no banco)
//   node scripts/seed-catalogo.mjs --aplicar  -> também grava no banco (idempotente: ignora o que já existe)
import fs from 'node:fs'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import catalogo from '../supabase/seed/catalogo-servicos.mjs'

dotenv.config({ path: '.env.test', quiet: true })
const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const { data: categorias, error } = await admin.from('categorias').select('id, nome')
if (error) throw error
const idsValidos = new Set(categorias.map(c => c.id))

const linhas = []
const problemas = []
for (const [categoria, nomes] of Object.entries(catalogo)) {
  if (!idsValidos.has(categoria)) { problemas.push(`categoria inexistente: ${categoria}`); continue }
  const vistos = new Set()
  for (const bruto of nomes) {
    const nome = bruto.trim()
    if (nome.length < 3 || nome.length > 80) problemas.push(`${categoria}: tamanho inválido "${nome}"`)
    if (vistos.has(nome.toLowerCase())) { problemas.push(`${categoria}: repetido "${nome}"`); continue }
    vistos.add(nome.toLowerCase())
    linhas.push({ categoria_id: categoria, nome })
  }
}

const semServico = categorias.filter(c => !catalogo[c.id]?.length).map(c => c.id)
console.log(`categorias no banco: ${categorias.length} | com serviços no catálogo: ${categorias.length - semServico.length} | serviços: ${linhas.length}`)
if (semServico.length) console.log('SEM serviços:', semServico.join(', '))
if (problemas.length) { console.log('PROBLEMAS:\n' + problemas.join('\n')); process.exit(1) }

// Arquivo SQL (para ambientes novos): um insert por categoria, tudo idempotente.
const esc = s => s.replace(/'/g, "''")
let sql = `-- 35: catálogo completo de serviços (todas as categorias)\n-- Gerado por scripts/seed-catalogo.mjs a partir de supabase/seed/catalogo-servicos.mjs.\n-- Pode ser rodado mais de uma vez: o que já existe é ignorado.\n\n`
for (const [categoria, nomes] of Object.entries(catalogo)) {
  if (!idsValidos.has(categoria)) continue
  const valores = [...new Set(nomes.map(n => n.trim()))].map(n => `  ('${categoria}', '${esc(n)}')`).join(',\n')
  sql += `insert into servicos_catalogo (categoria_id, nome)\nselect d.categoria_id, d.nome from (values\n${valores}\n) as d(categoria_id, nome)\nwhere exists (select 1 from categorias c where c.id = d.categoria_id)\non conflict (categoria_id, nome) do nothing;\n\n`
}
fs.writeFileSync('supabase/35_catalogo_completo.sql', sql)
console.log('supabase/35_catalogo_completo.sql gerado')

if (process.argv.includes('--aplicar')) {
  const { count: antes } = await admin.from('servicos_catalogo').select('id', { count: 'exact', head: true })
  for (let i = 0; i < linhas.length; i += 200) {
    const { error: erro } = await admin.from('servicos_catalogo')
      .upsert(linhas.slice(i, i + 200), { onConflict: 'categoria_id,nome', ignoreDuplicates: true })
    if (erro) throw erro
  }
  const { count: depois } = await admin.from('servicos_catalogo').select('id', { count: 'exact', head: true })
  console.log(`banco: ${antes} -> ${depois} serviços (+${depois - antes})`)
}
