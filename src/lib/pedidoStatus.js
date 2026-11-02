// Texto do status de um pedido, para mostrar à pessoa (no banco guardamos "em_andamento", não "em andamento").
const ROTULOS = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  expirado: 'Expirou sem resposta',
}

export const rotuloDoStatusDoPedido = (status) => ROTULOS[status] || (status ? status.replace(/_/g, ' ') : '')

// Dias sem resposta até o pedido aberto expirar, e quantos dias antes avisamos o cliente.
export const DIAS_PARA_EXPIRAR = 30
export const DIAS_DO_AVISO = 23
