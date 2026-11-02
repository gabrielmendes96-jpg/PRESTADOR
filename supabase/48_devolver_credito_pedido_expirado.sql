-- 48 — Pedido que expira sem NENHUMA resposta devolve o crédito ao cliente.
--
-- O cliente paga 1 crédito para publicar. Se ninguém se candidatou em 30 dias, ele não recebeu o
-- serviço pelo qual pagou: o crédito volta. Pedido que teve candidatura (mesmo recusada) não devolve,
-- porque houve resposta.
--
-- É uma única operação no banco: fecha o pedido E devolve o crédito juntos, e só uma vez
-- (se o pedido já não está "aberto", não faz nada). Só o servidor (cron diário) pode chamar;
-- cliente nenhum consegue pedir devolução de crédito por conta própria.

create or replace function public.expirar_pedido(p_pedido_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pedido pedidos_servico%rowtype;
  v_respostas int;
begin
  update pedidos_servico set status = 'expirado'
   where id = p_pedido_id and status = 'aberto'
   returning * into v_pedido;
  if not found then
    return 'ignorado';
  end if;

  select count(*) into v_respostas from candidaturas where pedido_id = p_pedido_id;

  if v_pedido.pago is true and v_respostas = 0 and v_pedido.cliente_user_id is not null then
    update creditos_cliente set creditos_disponiveis = coalesce(creditos_disponiveis, 0) + 1
     where user_id = v_pedido.cliente_user_id;
    if not found then
      insert into creditos_cliente (user_id, creditos_disponiveis) values (v_pedido.cliente_user_id, 1);
    end if;
    return 'expirado_com_credito';
  end if;

  return 'expirado';
end;
$$;

revoke all on function public.expirar_pedido(uuid) from public, anon, authenticated;
grant execute on function public.expirar_pedido(uuid) to service_role;
