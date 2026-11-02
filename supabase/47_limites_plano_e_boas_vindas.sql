-- 47 — Limites do plano Básico no portfólio + créditos de boas-vindas para clientes novos.
--
-- 1) A página de Planos promete "até 10 fotos" no Básico, mas nada impedia mais que isso.
--    Agora o banco recusa a 11ª foto de quem está no Básico (ou com plano pago que não está ativo).
--    O que já existe não é apagado; só impede novos itens acima do limite.
--
-- 2) Cliente novo ganha 2 pedidos grátis (uma única vez), para não pagar R$ 9 por um pedido
--    numa plataforma que ainda tem poucos prestadores. Quem já tem registro de créditos
--    (comprou ou usou indicação) não recebe de novo. Para desligar a promoção, é só
--    trocar o valor 2 por 0 na função abaixo.

create or replace function public.limitar_portfolio_por_plano()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plano text;
  v_status text;
  v_total int;
begin
  select plano_id, plano_status into v_plano, v_status from prestadores where id = NEW.prestador_id;
  if coalesce(v_plano, 'basico') in ('profissional', 'premium') and coalesce(v_status, '') = 'ativo' then
    return NEW;
  end if;
  select count(*) into v_total from portfolio_prestador where prestador_id = NEW.prestador_id;
  if v_total >= 10 then
    raise exception 'O plano Básico permite até 10 fotos no portfólio. Mude de plano para adicionar mais.';
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_limitar_portfolio_por_plano on portfolio_prestador;
create trigger trg_limitar_portfolio_por_plano
  before insert on portfolio_prestador
  for each row execute function public.limitar_portfolio_por_plano();

create or replace function public.dar_creditos_de_boas_vindas()
returns int
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Faça login para continuar';
  end if;
  if exists (select 1 from creditos_cliente where user_id = auth.uid()) then
    return 0;
  end if;
  insert into creditos_cliente (user_id, creditos_disponiveis) values (auth.uid(), 2);
  return 2;
end;
$$;

grant execute on function public.dar_creditos_de_boas_vindas() to authenticated;
