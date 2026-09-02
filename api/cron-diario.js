// api/cron-diario.js
// O plano gratuito da Vercel só permite crons rodando no máximo 1x por
// dia (e no máximo 2 crons no total) — por isso as três varreduras de
// manutenção (api/manutencao.js) rodam juntas aqui, uma vez por dia,
// em vez de cada uma ter seu próprio agendamento.
import { verificarTempoResposta, verificarInadimplencia, verificarLiberacaoAutomatica, verificarSuporteDisputa, limparRateLimits } from './manutencao.js'

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

  const [tempoResposta, inadimplencia, liberacaoAutomatica, suporteDisputa, rateLimits] = await Promise.all([
    verificarTempoResposta(supabase),
    verificarInadimplencia(supabase),
    verificarLiberacaoAutomatica(supabase),
    verificarSuporteDisputa(supabase),
    limparRateLimits(supabase),
  ])

  return res.status(200).json({ ok: true, tempoResposta, inadimplencia, liberacaoAutomatica, suporteDisputa, rateLimits })
}
