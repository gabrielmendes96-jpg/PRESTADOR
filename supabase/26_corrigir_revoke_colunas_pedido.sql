-- ============================================================
-- CORREÇÃO do script 24: o REVOKE por coluna não tinha efeito nenhum
-- ============================================================
-- Testado direto contra o banco depois de rodar o script 24: um cliente
-- ainda conseguia fazer `update({ pago: true })` na própria linha sem
-- erro nenhum. Causa raiz (sutileza do modelo de permissões do
-- Postgres): quando já existe uma permissão de UPDATE/INSERT concedida
-- pra TABELA INTEIRA (é o que o Supabase configura por padrão pro papel
-- "authenticated"), revogar uma coluna específica não subtrai nada dela
-- — a permissão de tabela inteira continua valendo pra todas as colunas,
-- porque o Postgres trata permissão de coluna e de tabela como registros
-- independentes, e o REVOKE só cancela um GRANT feito NO MESMO NÍVEL.
--
-- A forma certa: revogar o UPDATE/INSERT da TABELA INTEIRA do papel
-- "authenticated", e devolver, coluna por coluna, só as que o cliente
-- realmente precisa escrever direto (todo o resto passa a exigir
-- service role ou uma função SECURITY DEFINER, que continuam
-- funcionando normalmente — elas escrevem como dono da função, não como
-- "authenticated").
--
-- Copie este arquivo inteiro no SQL Editor do Supabase e rode.
-- ============================================================

revoke insert on pedidos_servico from authenticated;
revoke update on pedidos_servico from authenticated;

-- Colunas que o cliente preenche ao publicar um pedido novo
-- (ver NovoPedido.jsx) — pago, status_pagamento e todo o resto ficam de
-- fora de propósito: usam o valor padrão da coluna (false/nulo).
grant insert (
  cliente_user_id, cliente_nome, titulo, descricao, categoria_id,
  cidade, estado, orcamento_min, orcamento_max, prazo, valor_pago, status
) on pedidos_servico to authenticated;

-- Colunas que o cliente/prestador atualizam direto pela API hoje (ver
-- DetalhePedido.jsx e PerfilCliente.jsx): aceitar candidatura (status +
-- valor_acordado — este último ainda trava depois que o pagamento
-- começa, por causa do trigger do script 24), agendar data, organizar
-- em pasta, e abrir disputa.
grant update (
  status, valor_acordado, data_agendada, pasta_id,
  disputa_aberta_em, disputa_motivo
) on pedidos_servico to authenticated;
