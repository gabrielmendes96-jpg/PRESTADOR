// api/webhook-asaas.js
// Função serverless do Vercel que recebe notificações do Asaas
// quando um pagamento é confirmado

import { cancelarAssinaturaAsaas, buscarClienteAsaas } from './_asaas.js'

// Descobre de quem é o pagamento e o que ele compra. Pagamentos avulsos
// trazem nosso externalReference ("tipo:userId:extra[:ciclo]"). Já as
// cobranças de uma assinatura recorrente (a primeira e as renovações
// automáticas) nem sempre repassam esse campo — a documentação da Asaas
// não garante — então o caminho de reserva usa o que a Asaas sempre manda
// nelas: `subscription` (a assinatura) e `customer` (o cliente, que nós
// criamos com externalReference = id do usuário).
async function resolverReferencia(supabase, pagamento) {
  if (pagamento?.externalReference) {
    const [tipo, userId, extra, cicloRaw] = pagamento.externalReference.split(':')
    return { tipo, userId, extra, cicloRaw }
  }
  if (!pagamento?.subscription) return null

  // Renovação: a assinatura já é conhecida.
  const { data: conhecida } = await supabase
    .from('assinaturas')
    .select('plano_id, ciclo, prestadores(user_id)')
    .eq('asaas_subscription_id', pagamento.subscription)
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (conhecida?.prestadores?.user_id) {
    return { tipo: 'mensalidade', userId: conhecida.prestadores.user_id, extra: conhecida.plano_id, cicloRaw: conhecida.ciclo }
  }

  // Primeiro pagamento: o usuário vem do cliente da Asaas, e o plano e o
  // ciclo, do registro "pendente" criado quando o checkout foi gerado.
  const cliente = pagamento.customer ? await buscarClienteAsaas(pagamento.customer) : null
  const userId = cliente?.externalReference
  if (!userId) return null

  const { data: prestador } = await supabase.from('prestadores').select('id').eq('user_id', userId).single()
  if (!prestador) return null

  const { data: pendente } = await supabase
    .from('assinaturas')
    .select('plano_id, ciclo')
    .eq('prestador_id', prestador.id)
    .eq('status', 'pendente')
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!pendente) return null

  return { tipo: 'mensalidade', userId, extra: pendente.plano_id, cicloRaw: pendente.ciclo }
}

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

  // Importar cliente Supabase com service role (acesso total)
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const referencia = await resolverReferencia(supabase, pagamento)
  if (!referencia) {
    if (pagamento?.subscription) {
      // Cobrança de assinatura que não conseguimos ligar a nenhum usuário —
      // responde 200 (um erro aqui faria a Asaas pausar a fila de webhooks),
      // mas deixa o rastro pra investigar.
      console.error('Pagamento de assinatura sem correspondência:', pagamento.id, pagamento.subscription)
    }
    return res.status(200).json({ ok: true })
  }
  const { tipo, userId, extra, cicloRaw } = referencia

  // Idempotência: a Asaas manda PAYMENT_CONFIRMED e depois PAYMENT_RECEIVED
  // pro mesmo pagamento de cartão, e reenvia webhooks que demoram a
  // responder. Registrar o id do pagamento antes de processar garante que
  // só o primeiro evento tem efeito (ver supabase/31_webhook_idempotencia.sql).
  const paymentId = pagamento.id
  let marcadorCriado = false
  if (paymentId) {
    const { error: erroMarcador } = await supabase
      .from('webhook_pagamentos_processados')
      .insert({ payment_id: paymentId, evento: evento.event })

    if (erroMarcador?.code === '23505') {
      return res.status(200).json({ ok: true, duplicado: true })
    }
    if (erroMarcador) {
      // Não derruba o pagamento por causa disso — segue sem a proteção.
      console.error('Não foi possível registrar o marcador de idempotência:', erroMarcador)
    } else {
      marcadorCriado = true
    }
  }

  try {
    if (tipo === 'mensalidade') {
      const planoId = extra
      // Ciclo comprado — mensal, semestral ou anual. Referências antigas
      // (de antes dos pacotes existirem) não têm esse 4º campo, então
      // cai no mensal por padrão.
      const MESES_POR_CICLO = { mensal: 1, semestral: 6, anual: 12 }
      const ciclo = MESES_POR_CICLO[cicloRaw] ? cicloRaw : 'mensal'

      const { data: prestadorAtual } = await supabase.from('prestadores').select('id').eq('user_id', userId).single()

      // Assinaturas anteriores ainda vigentes. Duas coisas dependem delas:
      // 1) Renovar o MESMO plano antes de vencer soma o tempo que sobrava
      //    (quem paga adiantado não perde dias).
      // 2) A assinatura antiga precisa ser encerrada — senão a rotina de
      //    inadimplência (verificarInadimplencia) ainda a enxerga como
      //    vencida e suspende quem acabou de renovar.
      // Cobranças de assinatura recorrente trazem o id da assinatura na Asaas.
      const subscriptionId = pagamento.subscription || null

      const baseVencimento = new Date()
      if (prestadorAtual?.id) {
        const { data: vigentes } = await supabase
          .from('assinaturas')
          .select('id, plano_id, data_vencimento, asaas_subscription_id')
          .eq('prestador_id', prestadorAtual.id)
          .in('status', ['ativo', 'pago'])

        const restante = (vigentes || [])
          .filter(v => v.plano_id === planoId && v.data_vencimento)
          .map(v => new Date(v.data_vencimento))
          .sort((a, b) => b - a)[0]
        if (restante && restante > baseVencimento) baseVencimento.setTime(restante.getTime())

        if (vigentes?.length) {
          await supabase.from('assinaturas').update({ status: 'encerrado' }).in('id', vigentes.map(v => v.id))
        }

        // Troca de plano, ciclo ou forma de pagamento: a assinatura
        // automática antiga precisa parar, senão o cartão continua sendo
        // cobrado em paralelo. (Renovação da MESMA assinatura não entra
        // aqui: o id é o mesmo.) Uma falha ao cancelar não pode desfazer o
        // pagamento já confirmado, só fica registrada.
        const antigas = [...new Set((vigentes || []).map(v => v.asaas_subscription_id).filter(id => id && id !== subscriptionId))]
        for (const antiga of antigas) {
          const r = await cancelarAssinaturaAsaas(antiga)
          if (!r.ok) console.error(`Não foi possível cancelar a assinatura antiga ${antiga}:`, r.motivo)
        }

        // O registro "pendente" criado no checkout já cumpriu o papel.
        await supabase.from('assinaturas').delete().eq('prestador_id', prestadorAtual.id).eq('status', 'pendente')
      }

      const dataVencimento = new Date(baseVencimento)
      dataVencimento.setMonth(dataVencimento.getMonth() + MESES_POR_CICLO[ciclo])

      // Buscar dados do usuário
      const { data: userData } = await supabase.auth.admin.getUserById(userId)
      const nomeUsuario = userData?.user?.user_metadata?.nome || 'Prestador'
      const emailUsuario = userData?.user?.email

      await supabase
        .from('prestadores')
        .update({ plano_id: planoId, plano_status: 'ativo' })
        .eq('user_id', userId)

      await supabase.from('assinaturas').insert({
        prestador_id: prestadorAtual?.id,
        plano_id: planoId,
        status: 'pago',
        metodo_pagamento: pagamento.billingType === 'PIX' ? 'pix' : 'cartao',
        valor: pagamento.value,
        pago_em: new Date().toISOString(),
        ciclo,
        data_vencimento: dataVencimento.toISOString().split('T')[0],
        proxima_cobranca: subscriptionId ? dataVencimento.toISOString().split('T')[0] : null,
        asaas_subscription_id: subscriptionId,
        recorrente: !!subscriptionId,
      })

      // Enviar email de confirmação. Falha de e-mail não pode derrubar o
      // webhook: o pagamento já foi aplicado e uma nova tentativa refaria
      // tudo desde o começo.
      if (emailUsuario) {
        try {
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
        } catch (erroEmail) {
          console.error('Falha ao enviar e-mail de confirmação:', erroEmail)
        }
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
        await supabase
          .from('indicacoes')
          .update({ status: 'ativo', ativado_em: new Date().toISOString() })
          .eq('id', indicacaoPendente.id)

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

            // Marca justamente a indicação que completou a meta — serve
            // de registro de qual indicação "pagou" a recompensa.
            await supabase.from('indicacoes').update({ recompensa_aplicada: true }).eq('id', indicacaoPendente.id)
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

    if (tipo === 'servico') {
      const pedidoId = extra

      // Idempotente: .is('status_pagamento', null) garante que um
      // reenvio do mesmo webhook pela Asaas não retenha o pagamento
      // duas vezes nem sobrescreva um status já avançado.
      const { data: atualizados } = await supabase
        .from('pedidos_servico')
        .update({
          status_pagamento: 'retido',
          pago_servico_em: new Date().toISOString(),
        })
        .eq('id', pedidoId)
        .is('status_pagamento', null)
        .select('id, cliente_user_id, titulo')

      const pedido = atualizados?.[0]
      if (pedido) {
        const { data: candidatura } = await supabase
          .from('candidaturas')
          .select('prestadores(user_id)')
          .eq('pedido_id', pedidoId)
          .eq('status', 'aceito')
          .single()

        const notificacoes = [
          {
            user_id: pedido.cliente_user_id,
            titulo: 'Pagamento confirmado',
            corpo: `Seu pagamento por "${pedido.titulo}" está protegido até a conclusão do serviço.`,
            tipo: 'pagamento', url: `/pedidos/${pedidoId}`,
          },
        ]
        if (candidatura?.prestadores?.user_id) {
          notificacoes.push({
            user_id: candidatura.prestadores.user_id,
            titulo: 'Cliente pagou pelo serviço',
            corpo: `O pagamento de "${pedido.titulo}" está protegido — você recebe após a conclusão.`,
            tipo: 'pagamento', url: `/pedidos/${pedidoId}`,
          })
        }
        await supabase.from('notificacoes').insert(notificacoes)
      }
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Erro no webhook:', error)
    // Libera o marcador pra Asaas poder reenviar e a gente tentar de novo —
    // senão um erro passageiro aqui faria o pagamento nunca ser aplicado.
    if (marcadorCriado) {
      await supabase.from('webhook_pagamentos_processados').delete().eq('payment_id', paymentId)
    }
    return res.status(500).json({ error: 'Internal server error' })
  }
}
