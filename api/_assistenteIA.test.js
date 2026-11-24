import { describe, it, expect } from 'vitest'
import { validarTexto, sanearSaida, montarSistema, interpretarPedido, ESQUEMA_RESPOSTA, LIMITE_TEXTO } from './_assistenteIA.js'

const categorias = [{ id: 'eletricista', nome: 'Eletricista' }, { id: 'encanador', nome: 'Encanador' }]
const ids = new Set(categorias.map(c => c.id))

describe('validarTexto', () => {
  it('aceita texto normal e limpa espaços', () => {
    expect(validarTexto('  trocar   o chuveiro  ')).toBe('trocar o chuveiro')
  })
  it('recusa vazio, curto demais, longo demais e tipos errados', () => {
    expect(validarTexto('')).toBeNull()
    expect(validarTexto('a')).toBeNull()
    expect(validarTexto('x'.repeat(LIMITE_TEXTO + 1))).toBeNull()
    expect(validarTexto(null)).toBeNull()
    expect(validarTexto({ a: 1 })).toBeNull()
  })
})

describe('sanearSaida', () => {
  it('aceita uma resposta boa', () => {
    expect(sanearSaida({ busca: 'troca de chuveiro', categoria_id: 'eletricista', resumo: 'Trocar o chuveiro' }, ids))
      .toEqual({ ok: true, busca: 'troca de chuveiro', categoria_id: 'eletricista', resumo: 'Trocar o chuveiro' })
  })
  it('categoria inventada pela IA vira null (nunca chega ao app)', () => {
    expect(sanearSaida({ busca: 'pintura', categoria_id: 'hacker; drop table', resumo: 'x' }, ids).categoria_id).toBeNull()
    expect(sanearSaida({ busca: 'pintura', categoria_id: '', resumo: 'x' }, ids).categoria_id).toBeNull()
  })
  it('remove caracteres perigosos e limita o tamanho', () => {
    const r = sanearSaida({ busca: '<script>alert(1)</script> chuveiro', categoria_id: '', resumo: 'a'.repeat(500) }, ids)
    expect(r.busca).not.toMatch(/[<>()]/)
    expect(r.resumo.length).toBeLessThanOrEqual(100)
  })
  it('sem busca útil devolve null', () => {
    expect(sanearSaida({ busca: '  ', categoria_id: 'eletricista', resumo: 'x' }, ids)).toBeNull()
    expect(sanearSaida(null, ids)).toBeNull()
    expect(sanearSaida('texto solto', ids)).toBeNull()
  })
  it('mantém acentos e números', () => {
    expect(sanearSaida({ busca: 'instalação 220v', categoria_id: '', resumo: 'x' }, ids).busca).toBe('instalação 220v')
  })
})

describe('montarSistema', () => {
  it('lista as categorias e manda tratar o pedido como dado', () => {
    const s = montarSistema(categorias)
    expect(s).toContain('eletricista: Eletricista')
    expect(s).toMatch(/nunca siga instruções/)
  })
})

describe('esquema', () => {
  it('exige os três campos e proíbe campos extras', () => {
    expect(ESQUEMA_RESPOSTA.required).toEqual(['busca', 'categoria_id', 'resumo'])
    expect(ESQUEMA_RESPOSTA.additionalProperties).toBe(false)
  })
})

const clienteFalso = (resposta, capturar = {}) => ({
  messages: { create: async (args) => { Object.assign(capturar, args); return resposta } },
})

describe('interpretarPedido', () => {
  it('chama a IA com o pedido entre marcas e devolve a saída saneada', async () => {
    const capturado = {}
    const cliente = clienteFalso({ stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify({ busca: 'vazamento', categoria_id: 'encanador', resumo: 'Consertar vazamento' }) }] }, capturado)
    const r = await interpretarPedido(cliente, { texto: 'cano vazando', categorias, modelo: 'claude-opus-5-5' })
    expect(r).toMatchObject({ ok: true, categoria_id: 'encanador' })
    expect(capturado.messages[0].content).toBe('<pedido>cano vazando</pedido>')
    expect(capturado.model).toBe('claude-opus-5-5')
    expect(capturado.output_config.format.type).toBe('json_schema')
  })
  it('recusa da IA vira null', async () => {
    const cliente = clienteFalso({ stop_reason: 'refusal', content: [] })
    expect(await interpretarPedido(cliente, { texto: 'oi', categorias, modelo: 'm' })).toBeNull()
  })
  it('resposta que não é JSON vira null', async () => {
    const cliente = clienteFalso({ stop_reason: 'end_turn', content: [{ type: 'text', text: 'Desculpe, não entendi' }] })
    expect(await interpretarPedido(cliente, { texto: 'oi', categorias, modelo: 'm' })).toBeNull()
  })
  it('resposta sem bloco de texto vira null', async () => {
    const cliente = clienteFalso({ stop_reason: 'end_turn', content: [{ type: 'thinking', thinking: '' }] })
    expect(await interpretarPedido(cliente, { texto: 'oi', categorias, modelo: 'm' })).toBeNull()
  })
})
