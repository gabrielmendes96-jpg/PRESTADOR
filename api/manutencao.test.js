import { describe, it, expect } from 'vitest'
import { expirarPedidosAntigos } from './manutencao.js'

// Supabase de mentira: cada consulta devolve o que foi combinado e registra o que foi gravado.
function bancoFalso({ pedidos }) {
  const gravado = { updates: [], notificacoes: [] }
  const consulta = (tabela) => {
    const filtros = {}
    const q = {
      select: () => q,
      eq: (c, v) => { filtros[c] = v; return q },
      lt: (c, v) => { filtros['lt_' + c] = v; return q },
      gte: (c, v) => { filtros['gte_' + c] = v; return q },
      limit: () => q,
      update: (dados) => { gravado.updates.push({ dados, filtros }); return q },
      insert: (linha) => { gravado.notificacoes.push(linha); return Promise.resolve({ error: null }) },
      then: (ok) => ok(filtros.lt_criado_em && filtros.gte_criado_em ? { data: pedidos.avisar, error: null } : { data: pedidos.expirar, error: null }),
    }
    return q
  }
  return { gravado, from: consulta }
}

describe('expirarPedidosAntigos', () => {
  it('fecha os pedidos com mais de 30 dias e avisa o cliente', async () => {
    const banco = bancoFalso({ pedidos: { expirar: [{ id: 'p1', titulo: 'Trocar chuveiro', cliente_user_id: 'u1' }], avisar: [] } })
    const r = await expirarPedidosAntigos(banco)
    expect(r).toMatchObject({ ok: true, expirados: 1, avisados: 0 })
    expect(banco.gravado.updates[0].dados).toEqual({ status: 'expirado' })
    expect(banco.gravado.updates[0].filtros.status).toBe('aberto') // nunca fecha pedido que já está em andamento
    expect(banco.gravado.notificacoes[0].user_id).toBe('u1')
    expect(banco.gravado.notificacoes[0].corpo).toContain('Trocar chuveiro')
  })
  it('avisa aos 23 dias sem fechar o pedido', async () => {
    const banco = bancoFalso({ pedidos: { expirar: [], avisar: [{ id: 'p2', titulo: 'Pintar sala', cliente_user_id: 'u2' }] } })
    const r = await expirarPedidosAntigos(banco)
    expect(r).toMatchObject({ expirados: 0, avisados: 1 })
    expect(banco.gravado.updates).toHaveLength(0)
    expect(banco.gravado.notificacoes[0].url).toBe('/pedidos/p2')
  })
  it('não quebra quando não há nada a fazer', async () => {
    const r = await expirarPedidosAntigos(bancoFalso({ pedidos: { expirar: null, avisar: null } }))
    expect(r).toMatchObject({ ok: true, expirados: 0, avisados: 0 })
  })
})
