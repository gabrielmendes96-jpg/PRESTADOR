-- ============================================================
-- PRESTADOR — Torna real o benefício de indicação pro indicador
-- ============================================================
-- Hoje o "indicado" (quem se cadastra pelo link) já ganha créditos de
-- verdade (resgatar_indicacao, 3 créditos). Mas o "indicador" (quem
-- indicou) nunca via benefício nenhum: a indicação nascia sempre como
-- 'pendente' e nada no sistema a virava 'ativo', então a barra de
-- progresso de níveis (5/10/20/50/100 indicados → meses grátis) nunca
-- andava, e mesmo se andasse não existia nada que aplicasse o "mês
-- grátis" de verdade em lugar nenhum.
--
-- Este script:
-- 1. Adiciona meses_gratis_disponiveis em prestadores — um saldo de
--    meses grátis acumulados, que o próprio prestador pode resgatar
--    quando quiser (em vez de pagar a mensalidade).
-- 2. Cria usar_mes_gratis(), no mesmo padrão de debitar_credito() —
--    consome 1 mês do saldo e ativa o plano sem cobrar nada na Asaas.
--
-- A ativação da indicação em si (pendente → ativo) e a concessão dos
-- meses ao bater uma meta acontecem em api/webhook-asaas.js, no exato
-- momento em que o indicado paga a primeira mensalidade — assim não
-- precisa de nenhum job periódico rodando.
-- ============================================================

alter table prestadores add column if not exists meses_gratis_disponiveis integer not null default 0;

create or replace function usar_mes_gratis()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prestador_id uuid;
  v_saldo int;
  v_plano_id text;
begin
  select id, meses_gratis_disponiveis, plano_id into v_prestador_id, v_saldo, v_plano_id
  from prestadores where user_id = auth.uid();

  if v_prestador_id is null then
    raise exception 'Perfil de prestador não encontrado';
  end if;

  if v_saldo is null or v_saldo < 1 then
    raise exception 'Sem meses grátis disponíveis';
  end if;

  update prestadores
  set meses_gratis_disponiveis = v_saldo - 1, plano_status = 'ativo'
  where id = v_prestador_id;

  insert into assinaturas (prestador_id, plano_id, status, metodo_pagamento, valor, pago_em)
  values (v_prestador_id, coalesce(v_plano_id, 'basico'), 'pago', 'indicacao', 0, now());
end;
$$;

grant execute on function usar_mes_gratis() to authenticated;
