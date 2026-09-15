-- ============================================================
-- PACOTES DE ASSINATURA: mensal, semestral (15% off) e anual (20% off)
-- ============================================================
-- Cada plano passa a ter três preços em vez de um só. A escala de
-- desconto (15% no semestral, 20% no anual) segue o padrão comum de
-- SaaS: recompensa quem se compromete por mais tempo, sem descontar
-- tanto a ponto de esvaziar a receita mensal.
--
-- Aproveitamos pra corrigir um bug real encontrado nesta rodada: a
-- tabela `assinaturas` tem uma coluna `data_vencimento` desde sempre,
-- mas NENHUM lugar do código a preenchia — nem o webhook que confirma o
-- pagamento. Isso significa que `verificarInadimplencia()`
-- (api/manutencao.js) nunca suspendeu ninguém de verdade, porque a
-- condição que ela procura (`data_vencimento` vencida) nunca acontecia.
-- Agora que o webhook passa a gravar `data_vencimento` (calculada a
-- partir do ciclo comprado), esse mecanismo volta a funcionar.
--
-- Copie este arquivo inteiro no SQL Editor do Supabase e rode.
-- ============================================================

alter table planos
  add column if not exists preco_mensal numeric,
  add column if not exists preco_semestral numeric,
  add column if not exists preco_anual numeric;

-- preco_mensal herda o valor que já existia em `preco` — não perde o
-- que já estava configurado.
update planos set preco_mensal = preco where preco_mensal is null;

update planos set preco_semestral = 249.90, preco_anual = 470.40 where id = 'basico';
update planos set preco_semestral = 504.90, preco_anual = 950.40 where id = 'profissional';
update planos set preco_semestral = 1014.90, preco_anual = 1910.40 where id = 'premium';

alter table assinaturas
  add column if not exists ciclo text default 'mensal';

alter table assinaturas drop constraint if exists assinaturas_ciclo_check;
alter table assinaturas add constraint assinaturas_ciclo_check
  check (ciclo in ('mensal', 'semestral', 'anual'));
