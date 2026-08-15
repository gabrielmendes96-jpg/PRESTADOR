// api/webhook-asaas.js
// Função serverless do Vercel que recebe notificações do Asaas
// quando um pagamento é confirmado

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verificar token de autenticação
  const token = req.headers['asaas-access-token']
  if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const evento = req.body

  // Só processa pagamentos confirmados ou recebidos
  if (!['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED'].includes(evento.event)) {
    return res.status(200).json({ ok: true })
  }

  const pagamento = evento.payment
  const externalReference = pagamento?.externalReference // formato: "tipo:userId:extra"

  if (!externalReference) {
    return res.status(200).json({ ok: true })
  }

  const [tipo, userId, extra] = externalReference.split(':')

  // Importar cliente Supabase com service role (acesso total)
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    if (tipo === 'mensalidade') {
      const planoId = extra
      // Buscar dados do usuário
      const { data: userData } = await supabase.auth.admin.getUserById(userId)
      const nomeUsuario = userData?.user?.user_metadata?.nome || 'Prestador'
      const emailUsuario = userData?.user?.email

      await supabase
        .from('prestadores')
        .update({ plano_id: planoId, plano_status: 'ativo' })
        .eq('user_id', userId)

      await supabase.from('assinaturas').insert({
        prestador_id: (await supabase.from('prestadores').select('id').eq('user_id', userId).single()).data?.id,
        plano_id: planoId,
        status: 'pago',
        metodo_pagamento: pagamento.billingType === 'PIX' ? 'pix' : 'cartao',
        valor: pagamento.value,
        pago_em: new Date().toISOString(),
      })

      // Enviar email de confirmação
      if (emailUsuario) {
        await fetch(`${req.headers.host ? 'https://' + req.headers.host : ''}/api/enviar-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': process.env.INTERNAL_API_SECRET,
          },
          body: JSON.stringify({
            tipo: 'pagamento_confirmado',
            destinatario: emailUsuario,
            dados: { nome: nomeUsuario, valor: pagamento.value, plano: planoId }
          })
        })
      }

      // Se esse pagamento é da primeira mensalidade de alguém que entrou
      // por indicação, ativa a indicação e credita meses grátis pro
      // indicador se ele acabou de bater uma meta (5/10/20/50/100).
      const { data: indicacaoPendente } = await supabase
        .from('indicacoes')
        .select('id, indicador_user_id')
        .eq('indicado_user_id', userId)
        .eq('status', 'pendente')
        .maybeSingle()

      if (indicacaoPendente) {
        await supabase.from('indicacoes').update({ status: 'ativo' }).eq('id', indicacaoPendente.id)

        const { count: totalAtivas } = await supabase
          .from('indicacoes')
          .select('id', { count: 'exact', head: true })
          .eq('indicador_user_id', indicacaoPendente.indicador_user_id)
          .eq('status', 'ativo')

        const NIVEIS_INDICACAO = [
          { meta: 5, meses: 1 }, { meta: 10, meses: 2 }, { meta: 20, meses: 4 },
          { meta: 50, meses: 12 }, { meta: 100, meses: 999 },
        ]
        const nivelCruzado = NIVEIS_INDICACAO.find(n => n.meta === totalAtivas)

        if (nivelCruzado) {
          const { data: indicadorPrestador } = await supabase
            .from('prestadores')
            .select('id, meses_gratis_disponiveis')
            .eq('user_id', indicacaoPendente.indicador_user_id)
            .single()

          if (indicadorPrestador) {
            await supabase
              .from('prestadores')
              .update({ meses_gratis_disponiveis: (indicadorPrestador.meses_gratis_disponiveis || 0) + nivelCruzado.meses })
              .eq('id', indicadorPrestador.id)
          }
        }
      }
    }

    if (tipo === 'creditos') {
      // Adicionar créditos ao cliente
      const qtdCreditos = parseInt(extra)

      const { data: existente } = await supabase
        .from('creditos_cliente')
        .select('id, creditos_disponiveis')
        .eq('user_id', userId)
        .single()

      if (existente) {
        await supabase
          .from('creditos_cliente')
          .update({ creditos_disponiveis: existente.creditos_disponiveis + qtdCreditos })
          .eq('user_id', userId)
      } else {
        await supabase
          .from('creditos_cliente')
          .insert({ user_id: userId, creditos_disponiveis: qtdCreditos })
      }

      // Atualizar status da compra
      await supabase
        .from('compras_creditos')
        .update({ status: 'pago' })
        .eq('user_id', userId)
        .eq('status', 'pendente')
        .order('criado_em', { ascending: false })
        .limit(1)
    }

    if (tipo === 'boost') {
      const DIAS_BOOST = { '7dias': 7, '15dias': 15, '30dias': 30 }
      const dias = DIAS_BOOST[extra]

      const { data: prestador } = await supabase
        .from('prestadores')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (prestador && dias) {
        const inicio = new Date()
        const expira = new Date(inicio.getTime() + dias * 24 * 60 * 60 * 1000)

        await supabase.from('boosts').insert({
          prestador_id: prestador.id,
          plano: extra,
          valor: pagamento.value,
          status: 'ativo',
          inicio_em: inicio.toISOString(),
          expira_em: expira.toISOString(),
          aparece_home: true,
          aparece_busca: true,
        })
      }
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Erro no webhook:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
