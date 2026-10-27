// api/assinatura.js
// Consulta e cancelamento da assinatura do prestador logado. Uma rota só,
// com "acao", pra não gastar outra função serverless (limite de 12 no
// plano Hobby da Vercel).
//   { acao: 'status' }   -> assinatura vigente (plano, ciclo, validade, renovação)
//   { acao: 'cancelar' } -> cancela a RENOVAÇÃO AUTOMÁTICA; o plano segue
//                           valendo até a data já paga.
import { verificarUsuario } from './_verificarUsuario.js'
import { checkRateLimit } from './_rateLimit.js'
import { cancelarAssinaturaAsaas } from './_asaas.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const usuario = await verificarUsuario(req)
  if (!usuario) return res.status(401).json({ error: 'Não autenticado' })

  if (!(await checkRateLimit(`assinatura:${usuario.id}`, 20, 60))) {
    return res.status(429).json({ error: 'Muitas requisições. Tente novamente em 1 minuto.' })
  }

  const { acao } = req.body || {}
  if (!['status', 'cancelar'].includes(acao)) return res.status(400).json({ error: 'Ação inválida' })

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  const { data: prestador } = await supabase.from('prestadores').select('id').eq('user_id', usuario.id).single()
  if (!prestador) return res.status(404).json({ error: 'Perfil de prestador não encontrado' })

  if (acao === 'status') {
    const { data: vigente } = await supabase
      .from('assinaturas')
      .select('plano_id, ciclo, status, valor, data_vencimento, recorrente, pago_em, metodo_pagamento')
      .eq('prestador_id', prestador.id)
      .in('status', ['ativo', 'pago'])
      .order('pago_em', { ascending: false })
      .limit(1)
      .maybeSingle()

    return res.status(200).json({ assinatura: vigente || null })
  }

  const { data: recorrentes } = await supabase
    .from('assinaturas')
    .select('id, asaas_subscription_id')
    .eq('prestador_id', prestador.id)
    .eq('recorrente', true)
    .not('asaas_subscription_id', 'is', null)

  if (!recorrentes?.length) {
    return res.status(400).json({ error: 'Você não tem renovação automática ativa.' })
  }

  for (const id of new Set(recorrentes.map(r => r.asaas_subscription_id))) {
    const r = await cancelarAssinaturaAsaas(id)
    if (!r.ok) {
      console.error(`Falha ao cancelar a assinatura ${id}:`, r.motivo)
      return res.status(502).json({ error: 'Não foi possível cancelar agora. Tente novamente em instantes.' })
    }
  }

  await supabase.from('assinaturas').update({ recorrente: false }).in('id', recorrentes.map(r => r.id))
  return res.status(200).json({ ok: true })
}
