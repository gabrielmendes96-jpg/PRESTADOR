import { describe, it, expect } from 'vitest'
import { pontuarPrestador, rankearPrestadores, pontuarPedido, rankearPedidos, avaliarPerfil } from './oportunidades'

const base = { id: 'p', avaliacao: 0, totalAvaliacoes: 0, disponivel: true, pontosResposta: 0, plano: 'basico', cidade: 'Araraquara', estado: 'SP' }

describe('pontuarPrestador', () => {
  it('quem tem muitas avaliações boas vence quem tem nota 10 com 1 voto só', () => {
    const solido = pontuarPrestador({ ...base, avaliacao: 9.2, totalAvaliacoes: 25 })
    const sorte = pontuarPrestador({ ...base, avaliacao: 10, totalAvaliacoes: 1 })
    expect(solido.pontos).toBeGreaterThan(sorte.pontos)
  })
  it('explica em português o porquê, no máximo 3 motivos', () => {
    const r = pontuarPrestador({ ...base, avaliacao: 9.5, totalAvaliacoes: 12, pontosResposta: 8, distanciaReal: 3.2, raioAtendimento: 30 }, { servicoDeclarado: true })
    expect(r.motivos.length).toBeLessThanOrEqual(3)
    expect(r.motivos.join(' ')).toMatch(/Nota 9,5 \(12 avaliações\)|A 3,2 km de você|Faz exatamente esse serviço/)
  })
  it('perto vale mais que longe', () => {
    const perto = pontuarPrestador({ ...base, distanciaReal: 2 })
    const longe = pontuarPrestador({ ...base, distanciaReal: 80 })
    expect(perto.pontos).toBeGreaterThan(longe.pontos)
  })
  it('sem localização, mesma cidade (com ou sem acento) conta como perto', () => {
    const r = pontuarPrestador({ ...base, cidade: 'São Carlos' }, { cidade: 'sao carlos' })
    expect(r.motivos.join(' ')).toMatch(/Atende em São Carlos/)
  })
  it('plano e impulsionamento só desempatam: não superam uma nota muito melhor', () => {
    const pago = pontuarPrestador({ ...base, plano: 'premium', boost_ativo: true, avaliacao: 6, totalAvaliacoes: 5 })
    const bom = pontuarPrestador({ ...base, plano: 'basico', avaliacao: 9.5, totalAvaliacoes: 20 })
    expect(bom.pontos).toBeGreaterThan(pago.pontos)
  })
  it('profissional novo, sem avaliações, não zera nem quebra', () => {
    const r = pontuarPrestador({ ...base })
    expect(r.pontos).toBeGreaterThan(0)
    expect(Array.isArray(r.motivos)).toBe(true)
  })
  it('aceita os nomes de coluna do banco (snake_case)', () => {
    const r = pontuarPrestador({ avaliacao_media: 9, total_avaliacoes: 10, plano_id: 'premium', pontos_resposta: 7, raio_atendimento: 20 })
    expect(r.pontos).toBeGreaterThan(40)
  })
})

describe('rankearPrestadores', () => {
  it('ordena do melhor para o pior e respeita o limite', () => {
    const lista = [
      { ...base, id: 'a', avaliacao: 6, totalAvaliacoes: 3 },
      { ...base, id: 'b', avaliacao: 9.5, totalAvaliacoes: 30 },
      { ...base, id: 'c', avaliacao: 8, totalAvaliacoes: 10 },
    ]
    const r = rankearPrestadores(lista, {}, 2)
    expect(r.map(p => p.id)).toEqual(['b', 'c'])
    expect(r[0].oportunidade.pontos).toBeGreaterThanOrEqual(r[1].oportunidade.pontos)
  })
  it('quem marcou o serviço pedido ganha vantagem', () => {
    const lista = [{ ...base, id: 'a' }, { ...base, id: 'b' }]
    const r = rankearPrestadores(lista, { idsComServico: new Set(['b']) })
    expect(r[0].id).toBe('b')
  })
  it('lista vazia ou nula não quebra', () => {
    expect(rankearPrestadores([])).toEqual([])
    expect(rankearPrestadores(null)).toEqual([])
  })
})

const agora = new Date('2026-11-24T12:00:00Z')
const horasAtras = (h) => new Date(agora - h * 3600000).toISOString()
const eu = { categoria_id: 'eletricista', cidade: 'Araraquara', estado: 'SP' }

describe('pontuarPedido', () => {
  it('pedido de outra profissão não combina', () => {
    expect(pontuarPedido({ categoria_id: 'pintor', cidade: 'Araraquara', estado: 'SP', criado_em: horasAtras(1) }, eu, new Set(), agora).combina).toBe(false)
  })
  it('serviço que o prestador marcou vale mais que só a mesma profissão', () => {
    const p = { categoria_id: 'eletricista', servico_id: 's1', cidade: 'Araraquara', estado: 'SP', criado_em: horasAtras(2) }
    const marcado = pontuarPedido(p, eu, new Set(['s1']), agora)
    const generico = pontuarPedido(p, eu, new Set(), agora)
    expect(marcado.pontos).toBeGreaterThan(generico.pontos)
    expect(marcado.motivos[0]).toMatch(/serviço que você marcou/)
  })
  it('mesma cidade e pedido novo sobem a pontuação; pedido velho e longe desce', () => {
    const quente = pontuarPedido({ categoria_id: 'eletricista', cidade: 'araraquara', estado: 'SP', criado_em: horasAtras(1) }, eu, new Set(), agora)
    const frio = pontuarPedido({ categoria_id: 'eletricista', cidade: 'Recife', estado: 'PE', criado_em: horasAtras(24 * 20) }, eu, new Set(), agora)
    expect(quente.pontos).toBeGreaterThan(frio.pontos)
  })
  it('detecta urgência e orçamento informado nos motivos', () => {
    const r = pontuarPedido({ categoria_id: 'eletricista', cidade: 'Araraquara', estado: 'SP', criado_em: horasAtras(30), orcamento_max: 300, prazo: 'preciso para hoje' }, eu, new Set(), agora)
    expect(r.motivos.join(' ')).toMatch(/resolver logo|gastar/)
  })
  it('poucos concorrentes aumenta a pontuação quando a informação existe', () => {
    const p = { categoria_id: 'eletricista', cidade: 'Araraquara', estado: 'SP', criado_em: horasAtras(10) }
    expect(pontuarPedido({ ...p, totalCandidaturas: 0 }, eu, new Set(), agora).pontos).toBeGreaterThan(pontuarPedido({ ...p }, eu, new Set(), agora).pontos)
  })
})

describe('rankearPedidos', () => {
  it('só traz o que combina e ainda não foi respondido, melhor primeiro', () => {
    const pedidos = [
      { id: '1', categoria_id: 'pintor', cidade: 'Araraquara', estado: 'SP', criado_em: horasAtras(1) },
      { id: '2', categoria_id: 'eletricista', cidade: 'Araraquara', estado: 'SP', criado_em: horasAtras(2) },
      { id: '3', categoria_id: 'eletricista', cidade: 'Recife', estado: 'PE', criado_em: horasAtras(2) },
      { id: '4', categoria_id: 'eletricista', cidade: 'Araraquara', estado: 'SP', criado_em: horasAtras(1) },
    ]
    const r = rankearPedidos(pedidos, eu, new Set(), new Set(['4']), 10, agora)
    expect(r.map(p => p.id)).toEqual(['2', '3'])
  })
})

describe('avaliarPerfil', () => {
  it('perfil vazio: porcentagem baixa e dicas concretas, as mais valiosas primeiro', () => {
    const r = avaliarPerfil({ prestador: { disponivel: true }, totalServicosMarcados: 0, totalFotos: 0 })
    expect(r.percentual).toBeLessThan(40)
    expect(r.dicas[0]).toMatch(/Marque os serviços/)
  })
  it('perfil completo chega a 100% e não tem dicas', () => {
    const r = avaliarPerfil({
      prestador: { foto_perfil: 'x', descricao: 'a'.repeat(100), whatsapp: '1', disponivel: true, cidade: 'A', estado: 'SP' },
      totalServicosMarcados: 4, totalFotos: 5,
    })
    expect(r.percentual).toBe(100)
    expect(r.dicas).toEqual([])
  })
  it('avisa quando está marcado como indisponível', () => {
    const r = avaliarPerfil({ prestador: { foto_perfil: 'x', descricao: 'a'.repeat(100), whatsapp: '1', disponivel: false, cidade: 'A', estado: 'SP' }, totalServicosMarcados: 4, totalFotos: 5 })
    expect(r.dicas.join(' ')).toMatch(/indisponível/)
  })
})
