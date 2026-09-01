import { describe, it, expect, vi, afterEach } from 'vitest'
import { checkRateLimit, getClientIp } from './_rateLimit.js'

describe('checkRateLimit', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('permite requisições dentro do limite', () => {
    const ip = `1.1.1.${Math.random()}`
    expect(checkRateLimit(ip, 3, 60000)).toBe(true)
    expect(checkRateLimit(ip, 3, 60000)).toBe(true)
    expect(checkRateLimit(ip, 3, 60000)).toBe(true)
  })

  it('bloqueia a partir da requisição que excede o limite', () => {
    const ip = `2.2.2.${Math.random()}`
    expect(checkRateLimit(ip, 2, 60000)).toBe(true)
    expect(checkRateLimit(ip, 2, 60000)).toBe(true)
    expect(checkRateLimit(ip, 2, 60000)).toBe(false)
  })

  it('libera novamente depois que a janela de tempo expira', () => {
    vi.useFakeTimers()
    const ip = `3.3.3.${Math.random()}`
    expect(checkRateLimit(ip, 1, 1000)).toBe(true)
    expect(checkRateLimit(ip, 1, 1000)).toBe(false)

    vi.advanceTimersByTime(1100)

    expect(checkRateLimit(ip, 1, 1000)).toBe(true)
  })

  it('mantém contadores independentes por IP', () => {
    const ipA = `4.4.4.${Math.random()}`
    const ipB = `5.5.5.${Math.random()}`
    expect(checkRateLimit(ipA, 1, 60000)).toBe(true)
    expect(checkRateLimit(ipB, 1, 60000)).toBe(true)
    expect(checkRateLimit(ipA, 1, 60000)).toBe(false)
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
