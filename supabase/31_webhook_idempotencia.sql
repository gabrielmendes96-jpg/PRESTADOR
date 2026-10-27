-- ============================================================
-- IDEMPOTÊNCIA do webhook de pagamento (Asaas)
-- ============================================================
-- A Asaas manda DOIS eventos pro mesmo pagamento de cartão:
-- PAYMENT_CONFIRMED (quando aprova) e PAYMENT_RECEIVED (quando o saldo
-- fica disponível), e ainda reenvia o webhook se a resposta demorar ou
-- falhar. api/webhook-asaas.js tratava cada evento como um pagamento
-- novo — então uma compra de 5 créditos no cartão entregava 10, um
-- boost virava dois registros, e a mensalidade gerava duas assinaturas
-- e dois e-mails.
--
-- Esta tabela guarda o id de cada pagamento já processado. O webhook
-- tenta inserir o id antes de fazer qualquer coisa: se já existir
-- (violação de chave primária), é um evento repetido e ele só responde
-- 200 sem repetir o efeito.
--
-- Só o backend (service role) acessa — RLS ligada e nenhuma policy.
--
-- Copie este arquivo inteiro no SQL Editor do Supabase e rode.
-- ============================================================

create table if not exists webhook_pagamentos_processados (
  payment_id text primary key,
  evento text,
  processado_em timestamptz not null default now()
);

alter table webhook_pagamentos_processados enable row level security;
