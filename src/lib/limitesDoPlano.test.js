import { describe, it, expect } from 'vitest'
import { limitesDoPlano, planoEfetivo } from './limitesDoPlano'

describe('limitesDoPlano', () => {
  it('Básico: 10 fotos e 5 categorias', () => {
    expect(limitesDoPlano('basico', 'ativo')).toEqual({ fotos: 10, categorias: 5 })
  })
  it('Profissional e Premium ativos: sem limite', () => {
    expect(limitesDoPlano('profissional', 'ativo').fotos).toBe(Infinity)
    expect(limitesDoPlano('premium', 'ativo').categorias).toBe(Infinity)
  })
  it('plano pago mas suspenso ou vencido volta a valer como Básico', () => {
    expect(planoEfetivo('premium', 'suspenso')).toBe('basico')
    expect(limitesDoPlano('profissional', 'vencido').fotos).toBe(10)
  })
  it('sem plano ou plano desconhecido vale como Básico', () => {
    expect(limitesDoPlano(null, null).fotos).toBe(10)
    expect(limitesDoPlano('inexistente', 'ativo').fotos).toBe(10)
  })
})
