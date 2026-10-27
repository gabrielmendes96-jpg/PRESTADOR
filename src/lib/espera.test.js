import { describe, it, expect } from 'vitest'
import { formatarEspera, aplicarModelo, etapaPorId, RESPOSTAS_PADRAO } from './espera.js'

const base = new Date('2026-10-26T12:00:00Z')
const antes = (minutos) => new Date(base.getTime() - minutos * 60000).toISOString()

describe('formatarEspera', () => {
  it('mostra "agora" para menos de 1 minuto', () => {
    expect(formatarEspera(antes(0), base)).toBe('agora')
  })
  it('mostra minutos, horas e dias', () => {
    expect(formatarEspera(antes(25), base)).toBe('há 25 min')
    expect(formatarEspera(antes(60 * 3 + 10), base)).toBe('há 3 h')
    expect(formatarEspera(antes(60 * 24), base)).toBe('há 1 dia')
    expect(formatarEspera(antes(60 * 24 * 3 + 5), base)).toBe('há 3 dias')
  })
  it('não devolve tempo negativo se o relógio do cliente estiver adiantado', () => {
    expect(formatarEspera(antes(-30), base)).toBe('agora')
  })
})

describe('aplicarModelo', () => {
  it('troca nome (só o primeiro) e serviço', () => {
    expect(aplicarModelo('Oi, {nome}! Sobre {servico}.', { nome: 'Maria da Silva', servico: 'troca de chuveiro' }))
      .toBe('Oi, Maria! Sobre troca de chuveiro.')
  })
  it('usa textos neutros quando falta nome ou serviço e preserva os "___" pro prestador preencher', () => {
    expect(aplicarModelo('{nome}: {servico} por R$ ___', {})).toBe('cliente: o serviço por R$ ___')
  })
  it('todos os modelos padrão têm título e texto', () => {
    for (const r of RESPOSTAS_PADRAO) {
      expect(r.titulo.length).toBeGreaterThan(1)
      expect(r.texto.length).toBeGreaterThan(10)
    }
  })
})

describe('etapaPorId', () => {
  it('volta pra "novo" quando a etapa é desconhecida', () => {
    expect(etapaPorId('inexistente').id).toBe('novo')
    expect(etapaPorId('agendado').label).toBe('Agendado')
  })
})
