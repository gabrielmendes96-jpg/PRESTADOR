import { describe, it, expect } from 'vitest'
import { rotuloDoStatusDoPedido } from './pedidoStatus'

describe('rotuloDoStatusDoPedido', () => {
  it('traduz os status conhecidos', () => {
    expect(rotuloDoStatusDoPedido('em_andamento')).toBe('Em andamento')
    expect(rotuloDoStatusDoPedido('expirado')).toBe('Expirou sem resposta')
  })
  it('status novo ou desconhecido nunca mostra o underline', () => {
    expect(rotuloDoStatusDoPedido('aguardando_pagamento')).toBe('aguardando pagamento')
    expect(rotuloDoStatusDoPedido(null)).toBe('')
  })
})
