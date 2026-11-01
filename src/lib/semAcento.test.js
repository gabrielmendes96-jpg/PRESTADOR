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

import { filtrarOpcoes } from './semAcento'

describe('filtrarOpcoes', () => {
  const opcoes = [
    { value: 'faz_tudo', label: 'Faz-tudo (Marido de Aluguel)', busca: 'marido de aluguel, faz tudo, pequenos reparos' },
    { value: 'ar_condicionado', label: 'Ar-condicionado', busca: 'split, climatizacao' },
    { value: 'encanador', label: 'Encanador', busca: 'bombeiro hidraulico' },
    { value: 'eletricista', label: 'Eletricista', busca: '' },
  ]
  const valores = (digitado) => filtrarOpcoes(opcoes, digitado).map(o => o.value)

  it('"faz tudo" e "marido de aluguel" acham a mesma categoria', () => {
    expect(valores('faz tudo')).toEqual(['faz_tudo'])
    expect(valores('FAZ-TUDO')).toEqual(['faz_tudo'])
    expect(valores('marido de aluguel')).toEqual(['faz_tudo'])
    expect(valores('Marido de Aluguel')).toEqual(['faz_tudo'])
  })
  it('hífen e espaço são equivalentes', () => {
    expect(valores('ar condicionado')).toEqual(['ar_condicionado'])
    expect(valores('ar-condicionado')).toEqual(['ar_condicionado'])
  })
  it('acha por termo alternativo, sem acento e com acento', () => {
    expect(valores('bombeiro hidráulico')).toEqual(['encanador'])
    expect(valores('climatização')).toEqual(['ar_condicionado'])
  })
  it('sem texto devolve tudo; sem correspondência devolve vazio', () => {
    expect(valores('')).toHaveLength(4)
    expect(valores('zzzz')).toEqual([])
  })
})
