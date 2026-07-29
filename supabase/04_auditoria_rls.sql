-- ============================================================
-- PRESTADOR — Auditoria de Row Level Security (RLS)
-- ============================================================
-- Script SOMENTE LEITURA. Não altera nada no banco.
-- Rode no SQL Editor do Supabase e cole o resultado das duas
-- consultas de volta para revisão.
--
-- Por quê: o arquivo supabase/01_schema.sql deste repositório
-- está desatualizado em relação ao banco em produção (várias
-- tabelas usadas pelo app hoje — ex: portfolio_prestador,
-- conversas, candidaturas, pedidos, midias_avaliacao — não
-- aparecem nele). Sem acesso direto ao Supabase, não dá para
-- saber se o RLS dessas tabelas mais novas está configurado
-- corretamente. Este script lista o estado real.
-- ============================================================

-- 1) Quais tabelas do schema "public" têm RLS ligado?
select
  tablename,
  rowsecurity as rls_ativado
from pg_tables
where schemaname = 'public'
order by tablename;

-- 2) Quais políticas existem em cada tabela (o que cada uma permite)?
select
  tablename,
  policyname,
  cmd as operacao,      -- select | insert | update | delete
  qual as condicao_leitura,
  with_check as condicao_escrita
from pg_policies
where schemaname = 'public'
order by tablename, cmd;

-- ============================================================
-- O que procurar no resultado:
-- - Toda tabela que guarda dado de usuário (pedidos, candidaturas,
--   conversas, mensagens, portfolio_prestador, midias_avaliacao,
--   assinaturas, visualizacoes_perfil) deve aparecer com
--   rls_ativado = true na consulta 1.
-- - Toda tabela com RLS ativado deve ter pelo menos uma linha na
--   consulta 2 — RLS ligado SEM nenhuma política bloqueia todo
--   acesso (o que quebra o app) ou, pior, dependendo da tabela,
--   pode ter sido criada só com policies "using (true)" liberando
--   tudo pra todo mundo sem perceber.
-- ============================================================
