import { describe, it, expect } from 'vitest'
import { perguntasPara, validar, montarBriefing, textoDoBriefing, resumoCurto, modeloDeOrcamento, briefingValido, LIMITE_RESPOSTA, LIMITE_OBSERVACOES } from './briefing'

const ids = (perguntas) => perguntas.map(p => p.id)

describe('perguntasPara', () => {
  it('automotivo pergunta veículo, ano e problema', () => {
    const p = perguntasPara('automotivo', 'mecanico')
    expect(ids(p)).toEqual(expect.arrayContaining(['veiculo', 'ano', 'problema', 'quando', 'observacoes']))
  })
  it('imóvel pergunta tipo, local e tamanho (ex.: da parede)', () => {
    const p = perguntasPara('pintura', 'pintor')
    expect(ids(p)).toEqual(expect.arrayContaining(['tipo_imovel', 'local', 'medidas']))
    expect(p.find(x => x.id === 'medidas').rotulo).toMatch(/tamanho/i)
  })
  it('elétrica e hidráulica perguntam quantidade, não metragem de parede', () => {
    expect(ids(perguntasPara('eletrica', 'eletricista'))).toContain('quantidade')
    expect(ids(perguntasPara('hidraulica', 'encanador'))).toContain('quantidade')
  })
  it('categorias que fogem do padrão usam o conjunto certo', () => {
    expect(ids(perguntasPara('eletrica', 'assistencia_eletrodomesticos'))).toContain('marca_modelo')
    expect(ids(perguntasPara('educacao', 'instrutor_direcao'))).toContain('materia')
    expect(ids(perguntasPara('automotivo', 'laudo_cautelar'))).toContain('veiculo')
    expect(ids(perguntasPara('limpeza', 'passadeira_lavanderia'))).toContain('tamanho')
  })
  it('grupo desconhecido ou vazio cai no conjunto genérico', () => {
    expect(ids(perguntasPara('inexistente', 'qualquer'))).toContain('necessidade')
    expect(ids(perguntasPara(undefined, undefined))).toContain('necessidade')
  })
  it('todo conjunto termina em Observações e tem ids únicos', () => {
    for (const topico of ['automotivo', 'construcao', 'eletrica', 'limpeza', 'jardim', 'tecnologia', 'saude', 'beleza', 'educacao', 'eventos', 'alimentacao', 'transporte', 'seguranca', 'animais', 'juridico', 'design', 'moda']) {
      const p = perguntasPara(topico, null)
      expect(p[p.length - 1].id).toBe('observacoes')
      expect(new Set(ids(p)).size).toBe(p.length)
    }
  })
  it('tem poucas perguntas obrigatórias (ficha rápida)', () => {
    for (const topico of ['automotivo', 'construcao', 'eletrica', 'eventos', 'educacao']) {
      expect(perguntasPara(topico, null).filter(p => p.obrigatoria).length).toBeLessThanOrEqual(4)
    }
  })
})

describe('validar', () => {
  const perguntas = perguntasPara('automotivo', 'mecanico')
  it('exige os campos obrigatórios', () => {
    const erros = validar(perguntas, {})
    expect(Object.keys(erros)).toEqual(expect.arrayContaining(['veiculo', 'ano', 'problema']))
  })
  it('aceita uma ficha completa', () => {
    expect(validar(perguntas, { veiculo: 'Fiat Uno', ano: '2018', problema: 'barulho ao frear', quando: 'Esta semana' })).toEqual({})
  })
  it('recusa ano fora da faixa ou que não é número', () => {
    expect(validar(perguntas, { veiculo: 'Uno', ano: '1800', problema: 'x' }).ano).toBeTruthy()
    expect(validar(perguntas, { veiculo: 'Uno', ano: 'abc', problema: 'x' }).ano).toBeTruthy()
  })
  it('recusa opção que não existe na lista', () => {
    expect(validar(perguntas, { veiculo: 'Uno', ano: '2018', problema: 'x', quando: 'Qualquer coisa' }).quando).toBeTruthy()
  })
  it('limita o tamanho das respostas', () => {
    const longa = 'a'.repeat(LIMITE_RESPOSTA + 1)
    expect(validar(perguntas, { veiculo: longa, ano: '2018', problema: 'x' }).veiculo).toBeTruthy()
    expect(validar(perguntas, { veiculo: 'Uno', ano: '2018', problema: 'x', observacoes: 'a'.repeat(LIMITE_OBSERVACOES) })).toEqual({})
    expect(validar(perguntas, { veiculo: 'Uno', ano: '2018', problema: 'x', observacoes: 'a'.repeat(LIMITE_OBSERVACOES + 1) }).observacoes).toBeTruthy()
  })
  it('espaços em branco contam como vazio', () => {
    expect(validar(perguntas, { veiculo: '   ', ano: '2018', problema: 'x' }).veiculo).toBeTruthy()
  })
})

describe('briefing', () => {
  const perguntas = perguntasPara('automotivo', 'mecanico')
  const respostas = { veiculo: 'Fiat Uno', ano: '2018', problema: 'barulho ao frear', quando: 'Esta semana', observacoes: 'Só posso à tarde.' }
  const briefing = montarBriefing(perguntas, respostas)

  it('guarda só o que foi respondido, na ordem das perguntas', () => {
    expect(briefing.map(i => i.valor)).toEqual(['Fiat Uno', '2018', 'barulho ao frear', 'Esta semana', 'Só posso à tarde.'])
    expect(briefing.every(i => i.rotulo && i.valor)).toBe(true)
  })
  it('monta o texto da primeira mensagem', () => {
    const t = textoDoBriefing(briefing, 'Troca de óleo')
    expect(t).toContain('📋 Pedido de orçamento — Troca de óleo')
    expect(t).toContain('• Marca e modelo do veículo: Fiat Uno')
    expect(t).toContain('Observações: Só posso à tarde.')
    expect(t.split('\n')[0]).toBe('📋 Pedido de orçamento — Troca de óleo')
  })
  it('formata datas no padrão brasileiro', () => {
    const t = textoDoBriefing([{ rotulo: 'Data do evento', valor: '2026-12-24' }], '')
    expect(t).toContain('24/12/2026')
  })
  it('texto vazio quando não há ficha', () => {
    expect(textoDoBriefing(null, 'x')).toBe('')
    expect(textoDoBriefing([], 'x')).toBe('')
  })
  it('resumo curto traz os 3 primeiros campos, sem observações', () => {
    expect(resumoCurto(briefing)).toBe('Fiat Uno · 2018 · barulho ao frear')
    expect(resumoCurto(undefined)).toBe('')
  })
  it('modelo de orçamento tem valor, prazo e validade', () => {
    const m = modeloDeOrcamento('Troca de óleo')
    expect(m).toContain('Orçamento — Troca de óleo')
    expect(m).toMatch(/Valor total/)
    expect(m).toMatch(/Prazo/)
    expect(m).toMatch(/Validade/)
  })
  it('briefingValido recusa formatos estranhos vindos do banco', () => {
    expect(briefingValido(briefing)).toBe(true)
    expect(briefingValido(null)).toBe(false)
    expect(briefingValido({})).toBe(false)
    expect(briefingValido([{ rotulo: 'a' }])).toBe(false)
    expect(briefingValido([null])).toBe(false)
  })
})
