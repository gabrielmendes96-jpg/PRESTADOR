import { describe, it, expect } from 'vitest'
import { rotuloDoDia, mesmoDia } from './datas'

const agora = new Date(2026, 10, 2, 15, 0) // 2 nov 2026, 15h

describe('rotuloDoDia', () => {
  it('hoje e ontem, mesmo perto da meia-noite', () => {
    expect(rotuloDoDia(new Date(2026, 10, 2, 0, 5), agora)).toBe('Hoje')
    expect(rotuloDoDia(new Date(2026, 10, 1, 23, 55), agora)).toBe('Ontem')
  })
  it('mensagem de 2 dias atrás mostra a data por extenso, sem o ano', () => {
    expect(rotuloDoDia(new Date(2026, 9, 31, 10, 0), agora)).toMatch(/31 de outubro/)
  })
  it('ano diferente mostra a data completa', () => {
    expect(rotuloDoDia(new Date(2025, 11, 25, 10, 0), agora)).toBe('25/12/2025')
  })
})

describe('mesmoDia', () => {
  it('compara o dia do calendário', () => {
    expect(mesmoDia(new Date(2026, 10, 2, 0, 1), new Date(2026, 10, 2, 23, 59))).toBe(true)
    expect(mesmoDia(new Date(2026, 10, 1, 23, 59), new Date(2026, 10, 2, 0, 1))).toBe(false)
  })
})
