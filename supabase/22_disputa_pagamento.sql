-- ============================================================
-- DISPUTA DO PAGAMENTO RETIDO
-- ============================================================
-- O cliente pode marcar que teve um problema com o serviço enquanto o
-- pagamento está retido — isso pausa a liberação automática de 3 dias
-- (ver api/manutencao.js, verificarLiberacaoAutomatica). A resolução da
-- disputa em si (quem decide, estorno parcial) fica pra uma próxima
-- rodada — por enquanto só existe "abrir", que já protege o cliente.
--
-- Não precisa de RLS nova: pedidos_servico já tem política de update
-- pro dono (cliente), que cobre essas duas colunas novas. Copie este
-- arquivo inteiro no SQL Editor do Supabase e rode.
-- ============================================================

alter table pedidos_servico
  add column if not exists disputa_aberta_em timestamptz,
  add column if not exists disputa_motivo text;
