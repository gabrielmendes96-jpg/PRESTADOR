import { describe, it, expect } from 'vitest'
import { semAcento } from './semAcento'

describe('semAcento', () => {
  it('remove acentos e cedilha', () => {
    expect(semAcento('Mecânico')).toBe('mecanico')
    expect(semAcento('São Paulo')).toBe('sao paulo')
    expect(semAcento('Instalação de caixa d\'água')).toBe('instalacao de caixa d\'agua')
    expect(semAcento('Conceição')).toBe('conceicao')
  })
  it('ignora maiúsculas', () => {
    expect(semAcento('ELETRICISTA')).toBe('eletricista')
    expect(semAcento('Édson')).toBe('edson')
  })
  it('aceita vazio, null e números', () => {
    expect(semAcento('')).toBe('')
    expect(semAcento(null)).toBe('')
    expect(semAcento(undefined)).toBe('')
    expect(semAcento(123)).toBe('123')
  })
  it('não altera o que já está sem acento', () => {
    expect(semAcento('troca de chuveiro')).toBe('troca de chuveiro')
  })
})
