import { describe, it, expect } from 'vitest'
import { getCategoriaIcone, CATEGORIA_FALLBACK } from './categoriaIcones'

describe('getCategoriaIcone', () => {
  it('resolve por id direto do mapa', () => {
    const resultado = getCategoriaIcone('eletricista')
    expect(resultado.color).toBe('#D97706')
    expect(resultado).not.toBe(CATEGORIA_FALLBACK)
  })

  it('aceita um objeto de categoria com id', () => {
    const resultado = getCategoriaIcone({ id: 'jardineiro', nome: 'Jardineiro' })
    expect(resultado.color).toBe('#15803D')
  })

  it('cai no fallback por palavra-chave quando o id não está no mapa direto', () => {
    const resultado = getCategoriaIcone({ id: 'novo-servico-x', nome: 'Reforma de banheiro' })
    expect(resultado.color).toBe('#EA580C') // categoria de construção/obra
  })

  it('usa o nome quando a entrada é uma string sem id no mapa', () => {
    const resultado = getCategoriaIcone('Aula de matemática')
    expect(resultado.color).toBe('#4338CA') // educação
  })

  it('retorna o fallback genérico quando nada corresponde', () => {
    expect(getCategoriaIcone('categoria-totalmente-desconhecida')).toBe(CATEGORIA_FALLBACK)
    expect(getCategoriaIcone(undefined)).toBe(CATEGORIA_FALLBACK)
  })
})
