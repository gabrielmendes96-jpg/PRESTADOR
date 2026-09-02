import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkRateLimit, getClientIp } from './_rateLimit.js'

const rpcMock = vi.fn()
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ rpc: rpcMock }),
}))

describe('checkRateLimit', () => {
  beforeEach(() => {
    rpcMock.mockReset()
  })

  it('repassa o resultado da função verificar_rate_limit no banco', async () => {
    rpcMock.mockResolvedValue({ data: true, error: null })
    expect(await checkRateLimit('rota:1.2.3.4', 5, 60)).toBe(true)
    expect(rpcMock).toHaveBeenCalledWith('verificar_rate_limit', {
      p_chave: 'rota:1.2.3.4', p_max: 5, p_janela_segundos: 60,
    })
  })

  it('bloqueia quando a função de banco retorna false', async () => {
    rpcMock.mockResolvedValue({ data: false, error: null })
    expect(await checkRateLimit('rota:1.2.3.4', 5, 60)).toBe(false)
  })

  it('falha aberta se a checagem no banco der erro (não derruba o endpoint)', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'timeout' } })
    expect(await checkRateLimit('rota:1.2.3.4', 5, 60)).toBe(true)
  })
})

describe('getClientIp', () => {
  it('prioriza x-forwarded-for', () => {
    const req = { headers: { 'x-forwarded-for': '9.9.9.9, 10.0.0.1' } }
    expect(getClientIp(req)).toBe('9.9.9.9')
  })

  it('usa x-real-ip quando não há x-forwarded-for', () => {
    const req = { headers: { 'x-real-ip': '8.8.8.8' } }
    expect(getClientIp(req)).toBe('8.8.8.8')
  })

  it('usa o socket remoteAddress como último recurso', () => {
    const req = { headers: {}, socket: { remoteAddress: '127.0.0.1' } }
    expect(getClientIp(req)).toBe('127.0.0.1')
  })

  it('retorna "unknown" quando nada está disponível', () => {
    const req = { headers: {} }
    expect(getClientIp(req)).toBe('unknown')
  })
})
