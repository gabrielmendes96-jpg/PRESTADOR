// Helpers compartilhados pelos testes de integração — rodam contra o
// Supabase real (produção), usando contas descartáveis criadas e
// apagadas a cada execução. Nunca usar isto fora de tests/integration.
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.test' })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
  throw new Error(
    'Faltam variáveis de ambiente. Copie .env.test.example para .env.test e preencha, ' +
    'depois rode com: node --env-file=.env.test ou configure seu shell antes de "npm run test:integration".'
  )
}

// Cliente com service role — ignora RLS, só para setup/limpeza.
export const admin = createClient(SUPABASE_URL, SERVICE_KEY)

const SUFIXO = Date.now()
const SENHA_TESTE = 'TesteIntegracao123!'

// Cria um usuário de verdade (já confirmado, sem precisar clicar em
// e-mail) e faz login normal com a anon key — a sessão resultante é
// idêntica à de um usuário real, sujeita às mesmas regras de RLS.
export async function criarUsuarioTeste(papel, metadata = {}) {
  const email = `teste-${papel}-${SUFIXO}@example.com`

  const { data: criado, error: erroCriar } = await admin.auth.admin.createUser({
    email,
    password: SENHA_TESTE,
    email_confirm: true,
    user_metadata: { nome: `Teste ${papel}`, ...metadata },
  })
  if (erroCriar) throw erroCriar

  const cliente = createClient(SUPABASE_URL, ANON_KEY)
  const { data: sessao, error: erroLogin } = await cliente.auth.signInWithPassword({ email, password: SENHA_TESTE })
  if (erroLogin) throw erroLogin

  return { userId: criado.user.id, email, cliente, session: sessao.session }
}

// Chama um handler de api/*.js diretamente em Node, sem precisar do
// servidor rodando — simula req/res do jeito que a Vercel manda.
export async function invocarFuncao(handler, { method = 'POST', body = {}, headers = {} } = {}) {
  const req = { method, body, headers, socket: {} }
  let statusCode = 200
  let jsonBody = null
  const res = {
    status(codigo) { statusCode = codigo; return res },
    json(objeto) { jsonBody = objeto; return res },
  }
  await handler(req, res)
  return { statusCode, body: jsonBody }
}

// Pega uma categoria qualquer já existente, pra satisfazer o vínculo
// obrigatório de categoria_id sem depender de um id fixo.
export async function pegarCategoriaTeste() {
  const { data, error } = await admin.from('categorias').select('id').limit(1).single()
  if (error) throw error
  return data.id
}

// Apaga, na ordem certa, tudo que os testes criaram — roda mesmo se
// algum passo do teste tiver falhado no meio do caminho.
export async function limpar(state) {
  if (state.avaliacaoId) await admin.from('avaliacoes').delete().eq('id', state.avaliacaoId)
  if (state.conversaId) {
    await admin.from('mensagens').delete().eq('conversa_id', state.conversaId)
    await admin.from('conversas').delete().eq('id', state.conversaId)
  }
  if (state.candidaturaId) await admin.from('candidaturas').delete().eq('id', state.candidaturaId)
  if (state.pedidoId) await admin.from('pedidos_servico').delete().eq('id', state.pedidoId)
  if (state.prestadorId) {
    await admin.from('assinaturas').delete().eq('prestador_id', state.prestadorId)
    await admin.from('boosts').delete().eq('prestador_id', state.prestadorId)
    await admin.from('prestadores').delete().eq('id', state.prestadorId)
  }
  if (state.clienteUserId) {
    await admin.from('creditos_cliente').delete().eq('user_id', state.clienteUserId)
    await admin.from('compras_creditos').delete().eq('user_id', state.clienteUserId)
    await admin.from('perfis_cliente').delete().eq('user_id', state.clienteUserId)
    await admin.auth.admin.deleteUser(state.clienteUserId).catch(() => {})
  }
  if (state.prestadorUserId) {
    await admin.auth.admin.deleteUser(state.prestadorUserId).catch(() => {})
  }
}

export { SENHA_TESTE }
