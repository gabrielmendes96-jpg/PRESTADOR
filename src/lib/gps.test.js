import { describe, it, expect } from 'vitest'
import { calcularDistancia, formatarDistancia } from './gps'

describe('calcularDistancia', () => {
  it('retorna 0 para o mesmo ponto', () => {
    expect(calcularDistancia(-23.5505, -46.6333, -23.5505, -46.6333)).toBe(0)
  })

  it('calcula a distância aproximada entre São Paulo e Rio de Janeiro', () => {
    const km = calcularDistancia(-23.5505, -46.6333, -22.9068, -43.1729)
    expect(km).toBeGreaterThan(350)
    expect(km).toBeLessThan(400)
  })

  it('retorna null quando falta alguma coordenada', () => {
    expect(calcularDistancia(null, -46.6333, -22.9068, -43.1729)).toBeNull()
    expect(calcularDistancia(-23.5505, undefined, -22.9068, -43.1729)).toBeNull()
  })
})

describe('formatarDistancia', () => {
  it('formata distâncias menores que 1km em metros', () => {
    expect(formatarDistancia(0.35)).toBe('350m')
  })

  it('formata distâncias maiores ou iguais a 1km em km', () => {
    expect(formatarDistancia(12.4)).toBe('12.4 km')
  })

  it('retorna null quando a distância é null ou undefined', () => {
    expect(formatarDistancia(null)).toBeNull()
    expect(formatarDistancia(undefined)).toBeNull()
  })
})
