// Valida o token de sessão do Supabase enviado no header Authorization.
// Usado pelas rotas que agem em nome de um usuário (pagamento, assinatura,
// exclusão de conta) para garantir que ninguém possa agir em nome de outro
// usuário só enviando um userId qualquer no corpo da requisição.
import { createClient } from '@supabase/supabase-js'

export async function verificarUsuario(req) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return null

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) return null

  return data.user
}
