// Registra um serviço concluído no histórico (cliente e prestador) e
// incrementa prestadores.total_servicos. Chamado nos dois pontos onde um
// pedido vira "concluído": api/confirmar-servico-concluido.js (caminho sem
// pagamento pelo app) e api/_liberarPagamentoServico.js (pagamento
// protegido liberado). Precisa rodar com a service role — o trigger
// bloquear_edicao_plano_prestador (supabase/06_correcoes_adicionais.sql)
// só libera escrita em total_servicos pra auth.role() = 'service_role',
// nem uma função security definer chamada pelo cliente escaparia disso.
export async function registrarServicoConcluido(supabase, pedido) {
  const { data: candidatura } = await supabase
    .from('candidaturas')
    .select('prestador_id')
    .eq('pedido_id', pedido.id)
    .eq('status', 'aceito')
    .single()

  if (!candidatura) return

  await supabase.from('historico_servicos').insert({
    cliente_user_id: pedido.cliente_user_id,
    prestador_id: candidatura.prestador_id,
    titulo: pedido.titulo,
    categoria_id: pedido.categoria_id,
    data_servico: (pedido.entregue_em || new Date().toISOString()).slice(0, 10),
    valor: pedido.valor_acordado,
    status: 'concluido',
  })

  // Incremento atômico via função de banco (ver supabase/30_incremento_atomico_total_servicos.sql)
  // — ler o valor e escrever de volta em duas chamadas separadas perderia
  // incrementos se dois serviços do mesmo prestador concluíssem quase ao
  // mesmo tempo.
  await supabase.rpc('incrementar_total_servicos', { p_prestador_id: candidatura.prestador_id })
}
