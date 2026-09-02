// Libera o pagamento retido de um pedido pro prestador, via transferência
// PIX (Asaas), já descontada a comissão da plataforma. Chamado tanto por
// api/confirmar-servico-concluido.js (cliente confirma manualmente) quanto
// por api/verificar-liberacao-automatica.js (cron, 3 dias de segurança) —
// centralizado aqui pra não duplicar a chamada de transferência nos dois.
import { registrarServicoConcluido } from './_registrarServicoConcluido.js'

const COMISSAO_PLATAFORMA = 0.15

export async function liberarPagamentoServico(supabase, pedidoId) {
  const { data: pedido } = await supabase
    .from('pedidos_servico')
    .select('id, valor_acordado, cliente_user_id, titulo, categoria_id, entregue_em')
    .eq('id', pedidoId)
    .single()

  if (!pedido) return { ok: false, motivo: 'Pedido não encontrado' }

  // Reivindica a liberação atomicamente — se outro processo (ex: o cron
  // e um clique manual quase ao mesmo tempo) já mudou o status, esta
  // atualização não afeta nenhuma linha e a gente aborta sem transferir
  // duas vezes.
  const { data: reivindicado } = await supabase
    .from('pedidos_servico')
    .update({ status_pagamento: 'liberando' })
    .eq('id', pedidoId)
    .eq('status_pagamento', 'retido')
    .select('id')
    .maybeSingle()

  if (!reivindicado) return { ok: false, motivo: 'Pagamento não está retido (já liberado ou ainda não pago)' }

  const { data: candidatura } = await supabase
    .from('candidaturas')
    .select('prestador_id, prestadores(id, user_id, chave_pix, tipo_chave_pix)')
    .eq('pedido_id', pedidoId)
    .eq('status', 'aceito')
    .single()

  const prestador = candidatura?.prestadores

  if (!prestador?.chave_pix || !prestador?.tipo_chave_pix) {
    // Sem chave configurada não tem pra onde mandar — volta pra 'retido'
    // pra poder tentar de novo mais tarde, em vez de travar em 'liberando'.
    await supabase.from('pedidos_servico').update({ status_pagamento: 'retido' }).eq('id', pedidoId)
    console.error(`Liberação bloqueada — prestador sem chave PIX (pedido ${pedidoId})`)
    return { ok: false, motivo: 'Prestador ainda não configurou dados de recebimento' }
  }

  const ASAAS_URL = process.env.ASAAS_SANDBOX === 'true'
    ? 'https://sandbox.asaas.com/api/v3'
    : 'https://api.asaas.com/api/v3'
  const ASAAS_KEY = process.env.ASAAS_SANDBOX === 'true'
    ? process.env.ASAAS_KEY_SANDBOX
    : process.env.ASAAS_KEY_PROD

  const valorLiquido = Math.round(pedido.valor_acordado * (1 - COMISSAO_PLATAFORMA) * 100) / 100

  try {
    const resTransfer = await fetch(`${ASAAS_URL}/transfers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', access_token: ASAAS_KEY },
      body: JSON.stringify({
        value: valorLiquido,
        pixAddressKey: prestador.chave_pix,
        pixAddressKeyType: prestador.tipo_chave_pix,
        description: `Repasse Prestador App — pedido ${pedidoId}`,
      }),
    })
    const transferencia = await resTransfer.json()

    if (transferencia.errors) {
      await supabase.from('pedidos_servico').update({ status_pagamento: 'retido' }).eq('id', pedidoId)
      console.error(`Erro ao transferir pagamento do pedido ${pedidoId}:`, transferencia.errors)
      return { ok: false, motivo: transferencia.errors[0]?.description || 'Erro ao transferir' }
    }

    // A Asaas exige aprovação (SMS/app, ou o webhook de
    // api/validar-saque-asaas.js se configurado) antes de executar de
    // verdade — a resposta aqui costuma vir como PENDING, não DONE. Só
    // marcamos 'liberado' quando a transferência já foi efetivada; caso
    // contrário fica em 'liberando' até um evento de transferência da
    // Asaas confirmar (webhook de transferências — ainda não
    // implementado nesta rodada, ver observação no plano).
    if (transferencia.status !== 'DONE') {
      console.log(`Transferência do pedido ${pedidoId} criada com status ${transferencia.status} — aguardando confirmação da Asaas.`)
      return { ok: true, pendente: true, status: transferencia.status }
    }

    await supabase.from('pedidos_servico').update({
      status_pagamento: 'liberado',
      liberado_em: new Date().toISOString(),
    }).eq('id', pedidoId)

    await registrarServicoConcluido(supabase, pedido)

    await supabase.from('notificacoes').insert([
      {
        user_id: prestador.user_id, titulo: 'Pagamento liberado!',
        corpo: `Você recebeu R$${valorLiquido.toFixed(2)} pelo serviço.`,
        tipo: 'pagamento', url: `/pedidos/${pedidoId}`,
      },
      {
        user_id: pedido.cliente_user_id, titulo: 'Pagamento confirmado',
        corpo: 'O valor foi liberado para o prestador.',
        tipo: 'pagamento', url: `/pedidos/${pedidoId}`,
      },
    ])

    return { ok: true, valorLiquido }
  } catch (error) {
    await supabase.from('pedidos_servico').update({ status_pagamento: 'retido' }).eq('id', pedidoId)
    console.error(`Erro ao liberar pagamento do pedido ${pedidoId}:`, error)
    return { ok: false, motivo: 'Erro interno ao transferir' }
  }
}
