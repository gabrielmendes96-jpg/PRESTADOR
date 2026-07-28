// api/rate-limit.js
// Utilitário de rate limiting simples em memória
// Para produção use Redis ou Upstash

const requests = new Map()

export function checkRateLimit(ip, maxRequests = 10, windowMs = 60000) {
  const now = Date.now()
  const windowStart = now - windowMs

  if (!requests.has(ip)) {
    requests.set(ip, [])
  }

  // Limpar requisições antigas
  const reqs = requests.get(ip).filter(time => time > windowStart)
  reqs.push(now)
  requests.set(ip, reqs)

  return reqs.length <= maxRequests
}

export function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
}
