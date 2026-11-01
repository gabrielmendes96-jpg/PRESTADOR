-- 45 — Ficha de orçamento na conversa
--
-- O cliente preenche perguntas rápidas (veículo, tamanho da parede, data do evento...) antes de abrir a conversa;
-- as respostas ficam em conversas.briefing como uma lista [{ "rotulo": "...", "valor": "..." }].
--  - limite de tamanho: no máximo 20 itens e ~8 KB (impede lixo ou abuso);
--  - só o CLIENTE da conversa altera a ficha (o profissional lê, mas não reescreve o pedido do cliente).
-- Aditivo: o app atual continua funcionando. Pode ser executado mais de uma vez.
begin;

alter table conversas add column if not exists briefing jsonb;

alter table conversas drop constraint if exists conversas_briefing_check;
alter table conversas add constraint conversas_briefing_check
  check (briefing is null or (jsonb_typeof(briefing) = 'array' and jsonb_array_length(briefing) <= 20 and pg_column_size(briefing) <= 8000));

create or replace function conversa_proteger_briefing()
returns trigger
language plpgsql
as $$
begin
  if NEW.briefing is distinct from OLD.briefing and auth.role() <> 'service_role' and auth.uid() is distinct from OLD.cliente_user_id then
    raise exception 'Só o cliente pode alterar a ficha do pedido';
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_conversa_proteger_briefing on conversas;
create trigger trg_conversa_proteger_briefing
  before update on conversas
  for each row execute function conversa_proteger_briefing();

commit;
