// Confirma que quem está chamando é o admin de verdade, via sessão
// Supabase real — não um token fixo espalhado no bundle do cliente
// (era assim antes: Admin.jsx mandava 'x-cron-token': 'prestador-webhook-2026'
// literal no código-fonte, visível pra qualquer um que abrisse o
// bundle JS публico e chamasse os endpoints direto, sem nunca logar).
import { createClient } from '@supabase/supabase-js'
import { verificarUsuario } from './_verificarUsuario.js'

// Reserva enquanto a tabela "admins" (supabase/49) não for conferida: este e-mail continua sendo administrador.
const ADMIN_EMAIL = 'gabrielmendes96@gmail.com'

export async function verificarAdmin(req) {
  const usuario = await verificarUsuario(req)
  if (!usuario) return null
  if (usuario.email === ADMIN_EMAIL) return usuario

  // Administradores cadastrados no banco: a pessoa só consegue ler a própria linha (RLS), usando o token dela.
  const token = (req.headers.authorization || '').slice(7)
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data } = await supabase.from('admins').select('user_id').eq('user_id', usuario.id).maybeSingle()
  return data ? usuario : null
}
