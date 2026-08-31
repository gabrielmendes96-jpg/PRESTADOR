// api/verificar-liberacao-automatica.js
// Libera automaticamente pagamentos retidos cujo prestador marcou
// "entreguei" há mais de 3 dias sem o cliente confirmar — protege o
// prestador de um cliente que some. Chamado pelo Vercel Cron (GET) ou
// manualmente pelo admin (POST), mesmo padrão de
// api/verificar-tempo-resposta.js.
import { liberarPagamentoServico } from './_liberarPagamentoServico.js'

const DIAS_SEGURANCA = 3

function autorizado(req) {
  const auth = req.headers['authorization'] || ''
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (process.env.CRON_SECRET && bearer === process.env.CRON_SECRET) return true
  if (req.headers['x-cron-token'] === process.env.ASAAS_WEBHOOK_TOKEN) return true
  return false
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!autorizado(req)) {
    return res.status(401).json({ error: 'Não autorizado' })
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  const dataCorte = new Date(Date.now() - DIAS_SEGURANCA * 24 * 60 * 60 * 1000).toISOString()

  try {
    const { data: pendentes } = await supabase
      .from('pedidos_servico')
      .select('id')
      .eq('status_pagamento', 'retido')
      .not('entregue_em', 'is', null)
      .lte('entregue_em', dataCorte)

    let liberados = 0
    for (const pedido of (pendentes || [])) {
      const resultado = await liberarPagamentoServico(supabase, pedido.id)
      if (resultado.ok) liberados++
    }

    return res.status(200).json({ ok: true, verificados: pendentes?.length || 0, liberados })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
