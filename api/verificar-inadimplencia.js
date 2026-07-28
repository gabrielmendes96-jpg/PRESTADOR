// api/verificar-inadimplencia.js
// Verifica assinaturas vencidas e suspende perfis
// Chamar via cron diário ou manualmente pelo admin

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Verificar token de segurança
  const token = req.headers['x-cron-token']
  if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return res.status(401).json({ error: 'Não autorizado' })
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  const hoje = new Date().toISOString().split('T')[0]
  const gracePeriod = new Date()
  gracePeriod.setDate(gracePeriod.getDate() - 5) // 5 dias de tolerância
  const dataCorte = gracePeriod.toISOString().split('T')[0]

  try {
    // Buscar assinaturas vencidas há mais de 5 dias
    const { data: vencidas } = await supabase
      .from('assinaturas')
      .select('*, prestadores(id, user_id, nome)')
      .eq('status', 'ativo')
      .lt('data_vencimento', dataCorte)
      .not('recorrente', 'is', true)

    let suspensos = 0

    for (const ass of (vencidas || [])) {
      // Suspender prestador
      await supabase.from('prestadores').update({
        plano_status: 'suspenso'
      }).eq('id', ass.prestador_id)

      // Atualizar assinatura
      await supabase.from('assinaturas').update({
        status: 'suspenso',
        tentativas_cobranca: (ass.tentativas_cobranca || 0) + 1
      }).eq('id', ass.id)

      // Notificar prestador
      if (ass.prestadores?.user_id) {
        await supabase.from('notificacoes').insert({
          user_id: ass.prestadores.user_id,
          titulo: 'Seu plano foi suspenso',
          corpo: 'Renove sua assinatura para voltar a aparecer nas buscas.',
          tipo: 'pagamento',
          url: '/planos'
        })
      }

      suspensos++
    }

    // Reativar prestadores que pagaram
    const { data: pagosRecentemente } = await supabase
      .from('assinaturas')
      .select('prestador_id')
      .eq('status', 'pago')
      .gte('pago_em', dataCorte)

    for (const ass of (pagosRecentemente || [])) {
      await supabase.from('prestadores').update({
        plano_status: 'ativo'
      }).eq('id', ass.prestador_id)

      await supabase.from('assinaturas').update({
        status: 'ativo'
      }).eq('prestador_id', ass.prestador_id).eq('status', 'pago')
    }

    return res.status(200).json({
      ok: true,
      suspensos,
      reativados: pagosRecentemente?.length || 0
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
