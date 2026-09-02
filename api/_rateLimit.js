// api/_rateLimit.js
// Rate limiting real, apoiado numa tabela no Supabase (ver
// supabase/25_rate_limit_real.sql) — a versão anterior guardava a
// contagem num Map() em memória do processo, que não é compartilhado
// entre instâncias serverless da Vercel, então na prática nunca limitava
// nada de verdade em produção.

export async function checkRateLimit(chave, maxRequests = 10, windowSeconds = 60) {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  const { data, error } = await supabase.rpc('verificar_rate_limit', {
    p_chave: chave, p_max: maxRequests, p_janela_segundos: windowSeconds,
  })
  if (error) {
    console.error('Erro ao checar rate limit:', error)
    return true // falha aberta — melhor deixar passar do que derrubar o endpoint
  }
  return data
}

export function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
}
