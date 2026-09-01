// Confirma que quem está chamando é o admin de verdade, via sessão
// Supabase real — não um token fixo espalhado no bundle do cliente
// (era assim antes: Admin.jsx mandava 'x-cron-token': 'prestador-webhook-2026'
// literal no código-fonte, visível pra qualquer um que abrisse o
// bundle JS публico e chamasse os endpoints direto, sem nunca logar).
import { verificarUsuario } from './_verificarUsuario.js'

const ADMIN_EMAIL = 'gabrielmendes96@gmail.com'

export async function verificarAdmin(req) {
  const usuario = await verificarUsuario(req)
  if (!usuario || usuario.email !== ADMIN_EMAIL) return null
  return usuario
}
