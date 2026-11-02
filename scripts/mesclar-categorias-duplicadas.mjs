// Remove categorias que existem duas vezes com o mesmo nome (sobras da primeira carga de categorias).
//   node scripts/mesclar-categorias-duplicadas.mjs            -> só mostra o que faria (não grava)
//   node scripts/mesclar-categorias-duplicadas.mjs --aplicar  -> grava uma cópia de segurança e apaga as repetidas
// Só apaga se a repetida NÃO estiver em uso (nenhum prestador, pedido ou serviço marcado por prestador).
// A categoria mantida herda o tópico (grupo) da repetida quando ela ainda não tem nenhum.
import fs from 'node:fs'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.test', quiet: true })
const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const aplicar = process.argv.includes('--aplicar')

// repetida -> a que fica
const MESCLAR = {
  aula_informatica: 'aula_informatica_edu',
  fotografo: 'fotografia',
  confeiteiro_ali: 'confeiteiro',
  cftv_seguranca: 'cftv',
  petisco: 'adestrador',
}

const contar = async (tabela, coluna, valor) => {
  const { count, error } = await admin.from(tabela).select('*', { count: 'exact', head: true }).eq(coluna, valor)
  if (error) throw new Error(`${tabela}: ${error.message}`)
  return count || 0
}

const backup = { categorias: [], servicos_catalogo: [], topico_categorias: [] }
let abortar = false

for (const [repetida, fica] of Object.entries(MESCLAR)) {
  const { data: pareadas } = await admin.from('categorias').select('*').in('id', [repetida, fica])
  const a = pareadas.find(c => c.id === repetida), b = pareadas.find(c => c.id === fica)
  if (!a) { console.log(`- ${repetida}: já não existe, nada a fazer`); continue }
  if (!b) { console.log(`! ${repetida}: a categoria que deveria ficar (${fica}) não existe; pulando`); abortar = true; continue }
  if (a.nome.trim().toLowerCase() !== b.nome.trim().toLowerCase()) { console.log(`! ${repetida}: nomes diferentes ("${a.nome}" x "${b.nome}"); pulando`); abortar = true; continue }

  const { data: servicos } = await admin.from('servicos_catalogo').select('id').eq('categoria_id', repetida)
  const idsServicos = (servicos || []).map(s => s.id)
  let emUso = (await contar('prestadores', 'categoria_id', repetida)) + (await contar('pedidos_servico', 'categoria_id', repetida))
  if (idsServicos.length) {
    const { count } = await admin.from('prestador_servicos').select('*', { count: 'exact', head: true }).in('servico_id', idsServicos)
    emUso += count || 0
  }
  if (emUso) { console.log(`! ${repetida}: em uso (${emUso} registros); NÃO será apagada`); abortar = true; continue }

  const { data: relA } = await admin.from('topico_categorias').select('*').eq('categoria_id', repetida)
  const { data: relB } = await admin.from('topico_categorias').select('*').eq('categoria_id', fica)
  const herdar = (!relB?.length && relA?.length) ? relA.map(r => ({ topico_id: r.topico_id, categoria_id: fica })) : []

  console.log(`${aplicar ? 'APAGA' : 'apagaria'} ${repetida} ("${a.nome}", ${idsServicos.length} serviços) e mantém ${fica}` + (herdar.length ? ` (herda tópico ${herdar.map(h => h.topico_id).join(',')})` : ''))
  backup.categorias.push(a)
  backup.topico_categorias.push(...(relA || []))
  if (idsServicos.length) backup.servicos_catalogo.push(...(await admin.from('servicos_catalogo').select('*').eq('categoria_id', repetida)).data)

  if (aplicar) {
    if (herdar.length) await admin.from('topico_categorias').insert(herdar)
    await admin.from('topico_categorias').delete().eq('categoria_id', repetida)
    await admin.from('servicos_catalogo').delete().eq('categoria_id', repetida)
    const { error } = await admin.from('categorias').delete().eq('id', repetida)
    if (error) { console.log(`  erro ao apagar ${repetida}: ${error.message}`); abortar = true }
  }
}

if (aplicar && backup.categorias.length) {
  const arquivo = `categorias-duplicadas-backup-${Date.now()}.json`
  fs.writeFileSync(arquivo, JSON.stringify(backup, null, 2))
  console.log(`Cópia de segurança: ${arquivo}`)
}
if (!aplicar) console.log('\n(simulação — nada foi gravado; use --aplicar para executar)')
process.exit(abortar ? 1 : 0)
