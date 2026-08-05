-- ============================================================
-- PRESTADOR — RLS de notificacoes e push_tokens
-- ============================================================
-- notificacoes e push_tokens não aparecem em nenhum dos scripts
-- anteriores (01_schema.sql é anterior a essas tabelas — mesmo caso já
-- documentado em 04_auditoria_rls.sql para conversas/candidaturas). O
-- sintoma reportado (prestador não vê nenhum aviso de mensagem nova,
-- mesmo a mensagem chegando certinho) bate exatamente com o que
-- acontece quando RLS está ativado numa tabela mas não existe uma
-- policy de SELECT: o insert feito pelo servidor (service role, em
-- api/enviar-push.js) funciona normalmente, mas a consulta que o
-- próprio usuário faz pra ler seu sino de notificações
-- (buscarNaoLidas em src/lib/notificacoes.js) volta vazia, porque o
-- Postgres nega por padrão qualquer leitura sem policy explícita.
--
-- Este script garante RLS ativado + as policies mínimas necessárias:
-- cada usuário só enxerga e só marca como lida as PRÓPRIAS
-- notificações; o insert continua reservado ao servidor (service role
-- sempre ignora RLS), então não crio policy de insert pra
-- authenticated/anon de propósito — ninguém além do backend deveria
-- conseguir criar notificação em nome de outra pessoa.
--
-- Também garante que a tabela está na publicação de Realtime — sem
-- isso, mesmo com RLS correto, o sino não atualiza sozinho enquanto o
-- app está aberto (só ao recarregar a página).
-- ============================================================

alter table notificacoes enable row level security;

drop policy if exists "Usuario ve suas notificacoes" on notificacoes;
create policy "Usuario ve suas notificacoes" on notificacoes
  for select using (auth.uid() = user_id);

drop policy if exists "Usuario marca suas notificacoes como lidas" on notificacoes;
create policy "Usuario marca suas notificacoes como lidas" on notificacoes
  for update using (auth.uid() = user_id);

alter table push_tokens enable row level security;

drop policy if exists "Usuario gerencia seus tokens push" on push_tokens;
create policy "Usuario gerencia seus tokens push" on push_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'notificacoes'
  ) then
    alter publication supabase_realtime add table notificacoes;
  end if;
end $$;
