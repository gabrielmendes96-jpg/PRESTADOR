// Cria as categorias novas, grava os termos alternativos (sinônimos) e os serviços de cada uma.
//   node scripts/seed-categorias.mjs            -> valida e gera supabase/44_categorias_novas.sql (não grava no banco)
//   node scripts/seed-categorias.mjs --aplicar  -> também grava no banco (idempotente)
// Exige o SQL 43 (colunas termos / termos_busca) já aplicado.
import fs from 'node:fs'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { novas, termosExistentes } from '../supabase/seed/categorias-novas.mjs'

dotenv.config({ path: '.env.test', quiet: true })
const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const { data: categorias } = await admin.from('categorias').select('id, ordem')
const { data: topicos } = await admin.from('topicos').select('id')
const idsExistentes = new Set(categorias.map(c => c.id))
const idsTopicos = new Set(topicos.map(t => t.id))
const problemas = []
const vistos = new Set()
for (const c of novas) {
  if (!/^[a-z0-9_]+$/.test(c.id)) problemas.push(`id inválido: ${c.id}`)
  if (vistos.has(c.id)) problemas.push(`id repetido: ${c.id}`); vistos.add(c.id)
  if (!idsTopicos.has(c.topico)) problemas.push(`${c.id}: grupo inexistente "${c.topico}"`)
  if (!c.nome || c.nome.length > 60) problemas.push(`${c.id}: nome vazio ou longo demais`)
  const nomes = new Set()
  for (const sv of c.servicos) {
    if (sv.length < 3 || sv.length > 80) problemas.push(`${c.id}: serviço com tamanho inválido "${sv}"`)
    if (nomes.has(sv.toLowerCase())) problemas.push(`${c.id}: serviço repetido "${sv}"`); nomes.add(sv.toLowerCase())
  }
}
for (const id of Object.keys(termosExistentes)) if (!idsExistentes.has(id) && !vistos.has(id)) problemas.push(`termos para categoria inexistente: ${id}`)
console.log(`categorias novas: ${novas.length} (${novas.filter(c => idsExistentes.has(c.id)).length} já existem no banco) | serviços: ${novas.reduce((n, c) => n + c.servicos.length, 0)} | categorias com termos alternativos novos: ${Object.keys(termosExistentes).length}`)
if (problemas.length) { console.log('PROBLEMAS:\n' + problemas.join('\n')); process.exit(1) }

// SQL para ambientes novos.
const esc = s => String(s).replace(/'/g, "''")
let ordem = Math.max(...categorias.map(c => c.ordem || 0))
const linhasCat = novas.map(c => { const o = idsExistentes.has(c.id) ? (categorias.find(x => x.id === c.id).ordem) : ++ordem; c._ordem = o; return `  ('${c.id}', '${esc(c.nome)}', '${c.emoji}', ${o}, false, '${c.topico}', '${esc(c.termos)}')` })
let sql = `-- 44: categorias novas, termos alternativos e serviços\n-- Gerado por scripts/seed-categorias.mjs a partir de supabase/seed/categorias-novas.mjs. Exige o 43. Idempotente.\nbegin;\n\n`
sql += `insert into categorias (id, nome, emoji, ordem, personalizada, topico_id, termos) values\n${linhasCat.join(',\n')}\non conflict (id) do update set termos = excluded.termos;\n\n`
sql += `insert into topico_categorias (topico_id, categoria_id)\nselect d.topico_id, d.categoria_id from (values\n${novas.map(c => `  ('${c.topico}', '${c.id}')`).join(',\n')}\n) as d(topico_id, categoria_id)\nwhere not exists (select 1 from topico_categorias t where t.topico_id = d.topico_id and t.categoria_id = d.categoria_id);\n\n`
for (const [id, termos] of Object.entries(termosExistentes)) sql += `update categorias set termos = '${esc(termos)}' where id = '${id}';\n`
sql += '\n'
for (const c of novas) sql += `insert into servicos_catalogo (categoria_id, nome)\nselect d.categoria_id, d.nome from (values\n${c.servicos.map(sv => `  ('${c.id}', '${esc(sv)}')`).join(',\n')}\n) as d(categoria_id, nome)\nwhere exists (select 1 from categorias c where c.id = d.categoria_id)\non conflict (categoria_id, nome) do nothing;\n\n`
sql += 'commit;\n'
fs.writeFileSync('supabase/44_categorias_novas.sql', sql)
console.log('supabase/44_categorias_novas.sql gerado')

if (process.argv.includes('--aplicar')) {
  const { count: antes } = await admin.from('categorias').select('id', { count: 'exact', head: true })
  const { count: servAntes } = await admin.from('servicos_catalogo').select('id', { count: 'exact', head: true })

  for (const c of novas) {
    const { error } = await admin.from('categorias').upsert({ id: c.id, nome: c.nome, emoji: c.emoji, ordem: c._ordem, personalizada: false, topico_id: c.topico, termos: c.termos }, { onConflict: 'id' })
    if (error) throw new Error(`categoria ${c.id}: ${error.message}`)
    const { data: ja } = await admin.from('topico_categorias').select('categoria_id').eq('topico_id', c.topico).eq('categoria_id', c.id)
    if (!ja.length) { const { error: e2 } = await admin.from('topico_categorias').insert({ topico_id: c.topico, categoria_id: c.id }); if (e2) throw new Error(`grupo ${c.id}: ${e2.message}`) }
    const linhas = c.servicos.map(nome => ({ categoria_id: c.id, nome }))
    const { error: e3 } = await admin.from('servicos_catalogo').upsert(linhas, { onConflict: 'categoria_id,nome', ignoreDuplicates: true })
    if (e3) throw new Error(`serviços ${c.id}: ${e3.message}`)
  }
  for (const [id, termos] of Object.entries(termosExistentes)) {
    const { error } = await admin.from('categorias').update({ termos }).eq('id', id)
    if (error) throw new Error(`termos ${id}: ${error.message}`)
  }
  const { count: depois } = await admin.from('categorias').select('id', { count: 'exact', head: true })
  const { count: servDepois } = await admin.from('servicos_catalogo').select('id', { count: 'exact', head: true })
  console.log(`banco: categorias ${antes} -> ${depois} | serviços ${servAntes} -> ${servDepois}`)
}
