import { describe, it, expect } from 'vitest'
import { agruparPorTopico } from './agruparCategorias'

const cats = [
  { id: 'a', nome: 'Pintor' }, { id: 'b', nome: 'Eletricista' }, { id: 'c', nome: 'Encanador' }, { id: 'd', nome: 'Sem grupo' },
]

describe('agruparPorTopico', () => {
  it('agrupa por tópico, em ordem alfabética dentro de cada um', () => {
    const g = agruparPorTopico(cats, [{ id: 't1', nome: 'Casa', categorias: ['a', 'c', 'b'] }])
    expect(g[0].nome).toBe('Casa')
    expect(g[0].categorias.map(c => c.nome)).toEqual(['Eletricista', 'Encanador', 'Pintor'])
  })
  it('categoria em dois tópicos aparece só no primeiro', () => {
    const g = agruparPorTopico(cats, [
      { id: 't1', nome: 'Casa', categorias: ['a'] },
      { id: 't2', nome: 'Reformas', categorias: ['a', 'b'] },
    ])
    expect(g.map(x => x.categorias.map(c => c.id))).toEqual([['a'], ['b'], ['c', 'd']])
  })
  it('o que está fora de qualquer tópico vai para "Outras"; tópico vazio some', () => {
    const g = agruparPorTopico(cats, [{ id: 't1', nome: 'Vazio', categorias: [] }, { id: 't2', nome: 'Casa', categorias: ['a'] }])
    expect(g.map(x => x.nome)).toEqual(['Casa', 'Outras'])
    expect(g[1].categorias.map(c => c.id)).toEqual(['b', 'c', 'd'])
  })
  it('ignora categoria de tópico que não existe na lista', () => {
    const g = agruparPorTopico(cats, [{ id: 't1', nome: 'Casa', categorias: ['zzz', 'a'] }])
    expect(g[0].categorias).toHaveLength(1)
  })
})
