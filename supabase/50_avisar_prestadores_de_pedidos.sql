-- 50 — Avisa os prestadores certos quando um pedido novo é publicado.
--
-- Quando um pedido fica "aberto" e pago (isto é, quando o cliente publica de verdade, com crédito),
-- até 30 prestadores Premium (o plano que pode responder pedidos), ativos e disponíveis, que combinam com o pedido
-- recebem uma notificação dentro do app com o link para o pedido. "Combinam" quer dizer: mesma profissão OU marcaram o
-- serviço pedido, e atendem o mesmo estado; quem é da mesma cidade vem primeiro.
-- O dono do pedido nunca é avisado do próprio pedido.

create or replace function public.avisar_prestadores_do_pedido()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.status = 'aberto'
     and NEW.pago is true
     and (TG_OP = 'INSERT' or OLD.pago is distinct from true) then
    insert into notificacoes (user_id, titulo, corpo, tipo, url)
    select p.user_id,
           'Novo pedido que combina com você',
           '"' || left(NEW.titulo, 80) || '" em ' || coalesce(nullif(NEW.cidade, ''), 'sua região'),
           'oportunidade',
           '/pedidos/' || NEW.id
      from prestadores p
     where p.plano_id = 'premium'
       and p.plano_status = 'ativo'
       and p.disponivel is not false
       and p.user_id is not null
       and p.user_id is distinct from NEW.cliente_user_id
       and (NEW.estado is null or p.estado = NEW.estado)
       and (
         p.categoria_id = NEW.categoria_id
         or (NEW.servico_id is not null and exists (
              select 1 from prestador_servicos ps where ps.prestador_id = p.id and ps.servico_id = NEW.servico_id))
       )
     order by (case when lower(coalesce(p.cidade, '')) = lower(coalesce(NEW.cidade, '')) then 0 else 1 end), p.criado_em
     limit 30;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_avisar_prestadores_do_pedido on public.pedidos_servico;
create trigger trg_avisar_prestadores_do_pedido
  after insert or update of pago on public.pedidos_servico
  for each row execute function public.avisar_prestadores_do_pedido();
