-- ============================================================
-- RATE LIMITING de verdade — tabela compartilhada em vez de memória
-- ============================================================
-- api/_rateLimit.js guardava a contagem de requisições num Map() em
-- memória do processo Node. Isso NUNCA funcionou de verdade em produção:
-- cada instância serverless da Vercel tem sua própria memória isolada, e
-- não existe garantia nenhuma de que duas requisições da mesma pessoa
-- caiam na mesma instância — o comum, sob qualquer tráfego real, é cair
-- em instâncias diferentes o tempo todo, fazendo o contador nunca passar
-- de 1. Esta tabela substitui isso por um contador de verdade,
-- compartilhado entre todas as instâncias.
--
-- Só o backend (service role) chama a função abaixo — por isso não há
-- nenhum grant pra anon/authenticated, e a tabela nunca fica exposta via
-- API do Supabase (o PostgREST só expõe o que tem grant explícito).
--
-- Copie este arquivo inteiro no SQL Editor do Supabase e rode.
-- ============================================================

create table if not exists rate_limits (
  chave text primary key,
  contagem int not null default 1,
  janela_inicio timestamptz not null default now()
);

alter table rate_limits enable row level security;
-- Sem nenhuma policy de propósito — nada além do service role (que
-- ignora RLS) deve tocar nesta tabela.

create or replace function verificar_rate_limit(p_chave text, p_max int, p_janela_segundos int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_registro rate_limits;
begin
  select * into v_registro from rate_limits where chave = p_chave for update;

  if v_registro is null then
    insert into rate_limits (chave, contagem, janela_inicio) values (p_chave, 1, now());
    return true;
  end if;

  if now() - v_registro.janela_inicio > (p_janela_segundos || ' seconds')::interval then
    update rate_limits set contagem = 1, janela_inicio = now() where chave = p_chave;
    return true;
  end if;

  if v_registro.contagem >= p_max then
    return false;
  end if;

  update rate_limits set contagem = contagem + 1 where chave = p_chave;
  return true;
end;
$$;

-- Só pro backend (service role) chamar — nunca exposta pro cliente.
grant execute on function verificar_rate_limit(text, int, int) to service_role;

-- Limpeza — sem isso a tabela cresce pra sempre. Uma linha por
-- chave (rota+ip ou rota+usuário) é leve, mas não custa nada zerar as
-- que já expiraram há muito tempo. Chamada pelo cron diário existente
-- (ver api/cron-diario.js).
create or replace function limpar_rate_limits_antigos()
returns void
language sql
security definer
set search_path = public
as $$
  delete from rate_limits where janela_inicio < now() - interval '1 day';
$$;

grant execute on function limpar_rate_limits_antigos() to service_role;
