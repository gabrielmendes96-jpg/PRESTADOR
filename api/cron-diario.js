// api/cron-diario.js
// O plano gratuito da Vercel só permite crons rodando no máximo 1x por
// dia (e no máximo 2 crons no total) — por isso os três jobs que
// antes tinham agendamento próprio (alguns a cada 30min/6h) foram
// consolidados aqui num único cron diário. Os endpoints individuais
// continuam existindo e funcionando (os botões manuais do Admin.jsx
// chamam eles direto), só não são mais agendados sozinhos no
// vercel.json.
import verificarTempoResposta from './verificar-tempo-resposta.js'
import verificarInadimplencia from './verificar-inadimplencia.js'
import verificarLiberacaoAutomatica from './verificar-liberacao-automatica.js'

function autorizado(req) {
  const auth = req.headers['authorization'] || ''
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (process.env.CRON_SECRET && bearer === process.env.CRON_SECRET) return true
  if (req.headers['x-cron-token'] === process.env.ASAAS_WEBHOOK_TOKEN) return true
  return false
}

// Reinvoca um handler existente sem um round-trip HTTP de verdade —
// mesmo padrão usado em tests/integration/setup.js (invocarFuncao).
function invocar(handler, req) {
  return new Promise((resolve) => {
    let statusCode = 200
    const res = {
      status(codigo) { statusCode = codigo; return res },
      json(objeto) { resolve({ statusCode, body: objeto }) },
    }
    handler(req, res)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!autorizado(req)) {
    return res.status(401).json({ error: 'Não autorizado' })
  }

  // Os três endpoints já checam sua própria autorização — repassando
  // o mesmo header aqui garante que passam nessa checagem também.
  const reqInterno = { method: 'POST', headers: req.headers, body: {} }

  const [tempoResposta, inadimplencia, liberacaoAutomatica] = await Promise.all([
    invocar(verificarTempoResposta, reqInterno),
    invocar(verificarInadimplencia, reqInterno),
    invocar(verificarLiberacaoAutomatica, reqInterno),
  ])

  return res.status(200).json({ ok: true, tempoResposta, inadimplencia, liberacaoAutomatica })
}
