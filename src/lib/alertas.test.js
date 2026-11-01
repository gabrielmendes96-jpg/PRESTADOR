import { describe, it, expect } from 'vitest'
import { montarAlerta } from './alertas'

describe('montarAlerta', () => {
  it('monta o registro de erro de tela com os limites do banco', () => {
    const erro = new Error('x'.repeat(2000))
    erro.stack = 's'.repeat(5000)
    const a = montarAlerta(erro, { componentStack: 'c'.repeat(3000), pagina: '/p'.repeat(300) })
    expect(a.tipo).toBe('erro_tela')
    expect(a.mensagem.length).toBeLessThanOrEqual(500)
    expect(a.detalhe.length).toBeLessThanOrEqual(1500)
    expect(a.pagina.length).toBeLessThanOrEqual(200)
  })
  it('aceita erro que não é Error (texto, nulo, objeto)', () => {
    expect(montarAlerta('quebrou', { pagina: '/a' }).mensagem).toBe('quebrou')
    expect(montarAlerta(null, { pagina: '/a' }).mensagem).toBe('Erro desconhecido')
    expect(montarAlerta({ message: 'oi' }, { pagina: '/a' }).mensagem).toBe('oi')
  })
  it('detalhe é nulo quando não há pilha', () => {
    expect(montarAlerta('só texto', { pagina: '/a' }).detalhe).toBeNull()
  })
})
