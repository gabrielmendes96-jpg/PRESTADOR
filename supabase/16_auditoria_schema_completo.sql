-- ============================================================
-- PRESTADOR — Auditoria de schema completo (somente leitura)
-- ============================================================
-- Lista todas as tabelas, colunas, tipos e valores padrão do banco
-- real, pra eu conseguir reconstruir supabase/01_schema.sql fiel à
-- produção (o arquivo atual está desatualizado — faltam tabelas e
-- colunas criadas depois, fora dos scripts numerados).
-- ============================================================

select
  c.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
from information_schema.columns c
where c.table_schema = 'public'
order by c.table_name, c.ordinal_position;
