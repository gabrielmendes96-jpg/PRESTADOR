import { describe, it, expect } from 'vitest'
import { toggleSelecionado } from './comparacaoLogica'

describe('toggleSelecionado', () => {
  it('adiciona um id que ainda não está na lista', () => {
    expect(toggleSelecionado(['a'], 'b', 3)).toEqual(['a', 'b'])
  })

  it('remove um id que já está na lista', () => {
    expect(toggleSelecionado(['a', 'b'], 'a', 3)).toEqual(['b'])
  })

  it('não adiciona além do limite máximo', () => {
    expect(toggleSelecionado(['a', 'b', 'c'], 'd', 3)).toEqual(['a', 'b', 'c'])
  })

  it('permite remover mesmo quando já está no limite', () => {
    expect(toggleSelecionado(['a', 'b', 'c'], 'b', 3)).toEqual(['a', 'c'])
  })

  it('não modifica a lista original (imutabilidade)', () => {
    const original = ['a', 'b']
    const resultado = toggleSelecionado(original, 'c', 3)
    expect(original).toEqual(['a', 'b'])
    expect(resultado).toEqual(['a', 'b', 'c'])
  })
})
