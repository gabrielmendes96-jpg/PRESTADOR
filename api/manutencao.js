// api/manutencao.js
// Consolida três varreduras de manutenção num único endpoint — o plano
// Hobby da Vercel limita o total de Serverless Functions (12), e cada
// arquivo em api/ conta como uma. Chamado internamente por
// api/cron-diario.js (import direto, sem HTTP) e manualmente pelos
// três botões de Admin.jsx, autenticado pela sessão real do admin (ver
// api/_verificarAdmin.js) — nada de token fixo no código do cliente.
import { estourouPrazo } from '../src/lib/tempoResposta.js'
import { liberarPagamentoServico } from './_liberarPagamentoServico.js'
import { verificarAdmin } from './_verificarAdmin.js'

// Desconta pontos de agilidade de prestadores que estouraram o prazo
// de 2h úteis pra responder um cliente (ver src/lib/tempoResposta.js).
export async function verificarTempoResposta(supabase) {
  const { data: aguardando } = await supabase
    .from('conversas')
    .select('id, prestador_id, cliente_aguardando_desde, prestadores(user_id)')
    .not('cliente_aguardando_desde', 'is', null)
    .is('penalizado_em', null)

  const agora = new Date().toISOString()
  let penalizados = 0

  for (const conversa of (aguardando || [])) {
    if (!estourouPrazo(conversa.cliente_aguardando_desde, agora)) continue

    const { data: prestadorAtual } = await supabase
      .from('prestadores')
      .select('pontos_resposta')
      .eq('id', conversa.prestador_id)
      .single()

    await supabase.from('prestadores').update({
      pontos_resposta: Math.max(0, (prestadorAtual?.pontos_resposta || 0) - 5),
    }).eq('id', conversa.prestador_id)

    await supabase.from('conversas').update({ penalizado_em: agora }).eq('id', conversa.id)

    if (conversa.prestadores?.user_id) {
      await supabase.from('notificacoes').insert({
        user_id: conversa.prestadores.user_id,
        titulo: 'Você demorou pra responder um cliente',
        corpo: 'Respostas rápidas mantêm sua pontuação de agilidade em dia.',
        tipo: 'mensagem',
        url: '/mensagens',
      })
    }

    penalizados++
  }

  return { ok: true, verificadas: aguardando?.length || 0, penalizados }
}

// Suspende prestadores com assinatura vencida há mais de 5 dias, e
// reativa quem pagou recentemente.
export async function verificarInadimplencia(supabase) {
  const gracePeriod = new Date()
  gracePeriod.setDate(gracePeriod.getDate() - 5)
  const dataCorte = gracePeriod.toISOString().split('T')[0]

  const { data: vencidas } = await supabase
    .from('assinaturas')
    .select('*, prestadores(id, user_id, nome)')
    .eq('status', 'ativo')
    .lt('data_vencimento', dataCorte)
    .not('recorrente', 'is', true)

  let suspensos = 0

  for (const ass of (vencidas || [])) {
    await supabase.from('prestadores').update({ plano_status: 'suspenso' }).eq('id', ass.prestador_id)
    await supabase.from('assinaturas').update({
      status: 'suspenso',
      tentativas_cobranca: (ass.tentativas_cobranca || 0) + 1,
    }).eq('id', ass.id)

    if (ass.prestadores?.user_id) {
      await supabase.from('notificacoes').insert({
        user_id: ass.prestadores.user_id,
        titulo: 'Seu plano foi suspenso',
        corpo: 'Renove sua assinatura para voltar a aparecer nas buscas.',
        tipo: 'pagamento',
        url: '/planos',
      })
    }

    suspensos++
  }

  const { data: pagosRecentemente } = await supabase
    .from('assinaturas')
    .select('prestador_id')
    .eq('status', 'pago')
    .gte('pago_em', dataCorte)

  for (const ass of (pagosRecentemente || [])) {
    await supabase.from('prestadores').update({ plano_status: 'ativo' }).eq('id', ass.prestador_id)
    await supabase.from('assinaturas').update({ status: 'ativo' }).eq('prestador_id', ass.prestador_id).eq('status', 'pago')
  }

  return { ok: true, suspensos, reativados: pagosRecentemente?.length || 0 }
}

// Libera pagamentos retidos há mais de 3 dias desde que o prestador
// marcou "entreguei", sem o cliente ter confirmado antes.
export async function verificarLiberacaoAutomatica(supabase) {
  const DIAS_SEGURANCA = 3
  const dataCorte = new Date(Date.now() - DIAS_SEGURANCA * 24 * 60 * 60 * 1000).toISOString()

  const { data: pendentes } = await supabase
    .from('pedidos_servico')
    .select('id')
    .eq('status_pagamento', 'retido')
    .not('entregue_em', 'is', null)
    .lte('entregue_em', dataCorte)
    .is('disputa_aberta_em', null) // pedido disputado nunca libera sozinho

  let liberados = 0
  for (const pedido of (pendentes || [])) {
    const resultado = await liberarPagamentoServico(supabase, pedido.id)
    if (resultado.ok) liberados++
  }

  return { ok: true, verificados: pendentes?.length || 0, liberados }
}

const TAREFAS = {
  'tempo-resposta': verificarTempoResposta,
  'inadimplencia': verificarInadimplencia,
  'liberacao-automatica': verificarLiberacaoAutomatica,
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const usuarioAdmin = await verificarAdmin(req)
  if (!usuarioAdmin) {
    return res.status(401).json({ error: 'Não autorizado' })
  }

  const fn = TAREFAS[req.body?.tarefa]
  if (!fn) return res.status(400).json({ error: 'Tarefa inválida' })

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  try {
    const resultado = await fn(supabase)
    return res.status(200).json(resultado)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
