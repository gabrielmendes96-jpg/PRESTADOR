import { describe, it, expect } from 'vitest'
import { pluralDe } from './seoConfig'

describe('pluralDe', () => {
  it('usa o plural cadastrado quando existe', () => {
    expect(pluralDe({ nome: 'Faz-tudo (Marido de Aluguel)', plural: 'faz-tudo e maridos de aluguel' })).toBe('faz-tudo e maridos de aluguel')
  })
  it('categoria sem plural cadastrado nunca quebra a página', () => {
    expect(pluralDe({ nome: 'Pedreiro' })).toBe('pedreiros')
    expect(pluralDe({ nome: 'Encanador' })).toBe('encanadores')
    expect(pluralDe({ nome: 'Eletricista' })).toBe('eletricistas')
    expect(pluralDe({ nome: 'Eletricistas' })).toBe('eletricistas')
    expect(pluralDe({ nome: 'Cozinheiro Particular' })).toBe('profissionais em cozinheiro particular')
    expect(pluralDe({ nome: 'Aula de Inglês' })).toBe('profissionais em aula de inglês')
  })
  it('sem nome devolve um texto neutro', () => {
    expect(pluralDe({})).toBe('profissionais')
    expect(pluralDe(undefined)).toBe('profissionais')
  })
})
