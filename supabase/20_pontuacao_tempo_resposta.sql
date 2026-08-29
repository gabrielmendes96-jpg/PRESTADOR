-- ============================================================
-- PRESTADOR — Pontuação por tempo de resposta
-- ============================================================
-- +2 pontos quando o prestador responde dentro de 2h úteis (8h-22h,
-- horário de Brasília); -5 pontos quando estoura (aplicado por
-- api/verificar-tempo-resposta.js, rodando com a service role).
--
-- Não precisa de RLS nova: conversas/prestadores já têm política de
-- update pra dono/participante, e a penalidade roda com a service
-- role, que já ignora RLS. Copie este arquivo inteiro no SQL Editor
-- do Supabase e rode.
-- ============================================================

alter table prestadores add column if not exists pontos_resposta int not null default 0;
alter table conversas add column if not exists cliente_aguardando_desde timestamptz;
alter table conversas add column if not exists penalizado_em timestamptz;

-- Bônus de resposta rápida — o próprio prestador chama isso ao
-- responder dentro do prazo (ver src/pages/Chat.jsx). Delta fixo em
-- +2 dentro da função (não é parâmetro), então não dá pra um cliente
-- malicioso mandar um delta arbitrário — só mexe na própria linha
-- (auth.uid()), mesmo padrão de segurança já usado em
-- debitar_credito() (supabase/06_correcoes_adicionais.sql).
create or replace function incrementar_pontos_resposta_bonus()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_novo int;
begin
  update prestadores
  set pontos_resposta = pontos_resposta + 2
  where user_id = auth.uid()
  returning pontos_resposta into v_novo;
  return v_novo;
end;
$$;

grant execute on function incrementar_pontos_resposta_bonus() to authenticated;
