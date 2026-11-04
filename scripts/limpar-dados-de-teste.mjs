// Limpa os dados de teste do banco de produção antes do lançamento.
//   node scripts/limpar-dados-de-teste.mjs            -> só mostra o que seria apagado (não grava nada)
//   node scripts/limpar-dados-de-teste.mjs --aplicar  -> salva uma cópia de segurança (JSON) e apaga
// NÃO mexe em: a conta do dono, a CENTRALCAR (conta real), os pedidos do dono, nem as conversas do dono com a CENTRALCAR.
import fs from 'node:fs'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.test', quiet: true })
const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const aplicar = process.argv.includes('--aplicar')

const EMAILS_DE_TESTE = [
  'gabrielmendes96+teste1@gmail.com',
  'debug-prestador-1789431216000@example.com',
  'debug-cliente-1789431216000@example.com',
  'teste-cliente-1788315507079@example.com',
  'teste-visualpg-prestador-1788216969122@example.com',
]
const PRESTADORES_FICTICIOS = ['Carlos Mendes', 'Ana Ferreira', 'Roberto Silva', 'Lucas Prado', 'Prestador Debug']
const DONOS_PROTEGIDOS = ['gabrielmendes96@gmail.com', 'centralcarararaquaraloja2@gmail.com']

const { data: lista } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
const usuarios = lista.users
const protegidos = new Set(usuarios.filter(u => DONOS_PROTEGIDOS.includes(u.email)).map(u => u.id))
const userIds = usuarios.filter(u => EMAILS_DE_TESTE.includes(u.email)).map(u => u.id)
if (userIds.some(id => protegidos.has(id))) throw new Error('Um usuário protegido está na lista de apagar. Abortando.')

const { data: todosPrest } = await admin.from('prestadores').select('id, nome, user_id')
const prestIds = todosPrest.filter(p => PRESTADORES_FICTICIOS.includes(p.nome) && !protegidos.has(p.user_id)).map(p => p.id)
if (todosPrest.some(p => prestIds.includes(p.id) && protegidos.has(p.user_id))) throw new Error('Prestador protegido na lista. Abortando.')

const pegar = async (tabela, coluna, ids) => {
  if (!ids.length) return []
  const { data, error } = await admin.from(tabela).select('*').in(coluna, ids)
  return error ? { erro: error.message } : data
}

const backup = {}
const relatorio = []
// Cada passo: tabela, coluna, ids. Os filhos vêm antes dos pais.
async function passo(tabela, coluna, ids) {
  if (!ids || !ids.length) return
  const linhas = await pegar(tabela, coluna, ids)
  if (linhas.erro) { relatorio.push(`  (pulado) ${tabela}.${coluna}: ${linhas.erro}`); return }
  if (!linhas.length) return
  backup[`${tabela}.${coluna}`] = linhas
  if (!aplicar) { relatorio.push(`  apagaria ${String(linhas.length).padStart(3)} em ${tabela} (${coluna})`); return }
  const { error } = await admin.from(tabela).delete().in(coluna, ids)
  relatorio.push(error ? `  ERRO ${tabela}.${coluna}: ${error.message}` : `  apagou  ${String(linhas.length).padStart(3)} em ${tabela} (${coluna})`)
}
const ids = (linhas) => (Array.isArray(linhas) ? linhas.map(l => l.id) : [])

// Pedidos, conversas e avaliações ligados ao que será apagado
const pedidos = ids(await pegar('pedidos_servico', 'cliente_user_id', userIds))
const conversasA = await pegar('conversas', 'prestador_id', prestIds)
const conversasB = await pegar('conversas', 'cliente_user_id', userIds)
const conversas = [...new Set([...ids(conversasA), ...ids(conversasB)])]
const avalA = await pegar('avaliacoes', 'prestador_id', prestIds)
const avalB = await pegar('avaliacoes', 'autor_user_id', userIds)
const avaliacoes = [...new Set([...ids(avalA), ...ids(avalB)])]
const zonas = (await admin.from('zonas_quentes').select('id')).data?.map(z => z.id) || []

console.log(aplicar ? '== APAGANDO ==' : '== SIMULAÇÃO (nada será gravado) ==')
console.log(`usuários: ${userIds.length} | prestadores fictícios: ${prestIds.length} | pedidos: ${pedidos.length} | conversas: ${conversas.length} | avaliações: ${avaliacoes.length} | zonas: ${zonas.length}\n`)

await passo('mensagens', 'conversa_id', conversas)
await passo('conversas', 'id', conversas)
await passo('midias_avaliacao', 'avaliacao_id', avaliacoes)
await passo('avaliacoes', 'id', avaliacoes)
await passo('candidaturas', 'pedido_id', pedidos)
await passo('candidaturas', 'prestador_id', prestIds)
await passo('midias_pedido', 'pedido_id', pedidos)
await passo('pedidos_servico', 'id', pedidos)
await passo('zona_interesses', 'zona_id', zonas)
await passo('zonas_quentes', 'id', zonas)
for (const t of ['portfolio_prestador', 'fotos_prestador', 'servicos_prestador', 'prestador_servicos', 'respostas_rapidas', 'prestador_pix', 'prestador_privado', 'assinaturas', 'boosts', 'historico_servicos', 'visualizacoes_perfil']) {
  await passo(t, 'prestador_id', prestIds)
}
await passo('prestadores', 'id', prestIds)
for (const t of ['notificacoes', 'push_tokens', 'creditos_cliente', 'compras_creditos', 'perfis_cliente', 'termos_aceitos', 'chamados_suporte', 'codigos_indicacao', 'destaques_cliente', 'pastas_pedidos', 'emails_log']) {
  await passo(t, t === 'emails_log' ? 'destinatario' : 'user_id', t === 'emails_log' ? EMAILS_DE_TESTE : userIds)
}
await passo('indicacoes', 'indicado_user_id', userIds)
await passo('indicacoes', 'indicador_user_id', userIds)

console.log(relatorio.join('\n'))

if (aplicar) {
  for (const id of userIds) {
    const u = usuarios.find(x => x.id === id)
    const { error } = await admin.auth.admin.deleteUser(id)
    console.log(error ? `  ERRO usuário ${u.email}: ${error.message}` : `  apagou usuário ${u.email}`)
  }
  const arquivo = `backup-dados-de-teste-${Date.now()}.json`
  fs.writeFileSync(arquivo, JSON.stringify({ usuarios: usuarios.filter(u => userIds.includes(u.id)).map(u => ({ id: u.id, email: u.email, criado: u.created_at })), ...backup }, null, 2))
  console.log(`\nCópia de segurança: ${arquivo}`)
} else {
  console.log(`\nUsuários que seriam apagados: ${userIds.length}`)
  for (const id of userIds) console.log('  ' + usuarios.find(x => x.id === id).email)
  console.log('\n(simulação — use --aplicar para executar)')
}
