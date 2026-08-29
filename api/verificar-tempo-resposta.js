// api/verificar-tempo-resposta.js
// Varre conversas esperando resposta do prestador há mais de 2h úteis
// e desconta pontos. Chamado pelo Vercel Cron (GET) ou manualmente
// pelo admin (POST) — ver vercel.json e src/pages/Admin.jsx.
import { estourouPrazo } from '../src/lib/tempoResposta.js'

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

  try {
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

    return res.status(200).json({ ok: true, verificadas: aguardando?.length || 0, penalizados })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
