// api/confirmar-servico-concluido.js
// O cliente confirma que o serviço foi concluído e libera o pagamento
// retido pro prestador. Pode ser chamado a qualquer momento enquanto o
// pagamento estiver 'retido' — não precisa esperar o prestador marcar
// "entreguei" primeiro (isso só serve pra abrir o prazo de segurança
// automático, ver api/verificar-liberacao-automatica.js).
import { verificarUsuario } from './_verificarUsuario.js'
import { liberarPagamentoServico } from './_liberarPagamentoServico.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const usuarioAutenticado = await verificarUsuario(req)
  if (!usuarioAutenticado) return res.status(401).json({ error: 'Não autenticado' })

  const { pedidoId } = req.body
  if (!pedidoId) return res.status(400).json({ error: 'Dados incompletos' })

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  const { data: pedido } = await supabase
    .from('pedidos_servico')
    .select('id, cliente_user_id')
    .eq('id', pedidoId)
    .single()

  if (!pedido || pedido.cliente_user_id !== usuarioAutenticado.id) {
    return res.status(404).json({ error: 'Pedido não encontrado' })
  }

  const resultado = await liberarPagamentoServico(supabase, pedidoId)
  if (!resultado.ok) return res.status(400).json({ error: resultado.motivo })

  return res.status(200).json({ ok: true })
}
