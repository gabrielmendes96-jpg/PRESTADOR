-- ============================================================
-- BLOQUEAR AUTOACEITE: prestador não pode aceitar a própria candidatura
-- ============================================================
-- Achado na revisão geral desta rodada: testei diretamente contra o
-- banco e confirmei que um prestador conseguia rodar
-- `supabase.from('candidaturas').update({ status: 'aceito' })` na
-- própria candidatura, sem o cliente (dono do pedido) fazer nada — a
-- policy de RLS de update em `candidaturas` permite que o prestador dono
-- da linha edite qualquer coluna dela, incluindo `status`, que deveria
-- ser decisão exclusiva do cliente.
--
-- O impacto prático é limitado (o fluxo de pagamento protegido exige
-- também que `pedidos_servico.status = 'em_andamento'`, que só o
-- cliente consegue setar via aceitarCandidatura()), mas ainda assim é um
-- estado inconsistente e uma porta que não deveria existir — um
-- prestador não pode decidir sozinho que foi "aceito".
--
-- Corrige com um trigger (mesmo padrão já usado em
-- bloquear_edicao_plano_prestador e bloquear_edicao_valor_acordado):
-- mudar o status só é permitido pra quem é dono do pedido (o cliente) ou
-- pelo service role (backend).
--
-- Copie este arquivo inteiro no SQL Editor do Supabase e rode.
-- ============================================================

create or replace function bloquear_autoaceite_candidatura()
returns trigger
language plpgsql
as $$
declare
  v_cliente_user_id uuid;
begin
  if NEW.status is distinct from OLD.status and auth.role() <> 'service_role' then
    select cliente_user_id into v_cliente_user_id from pedidos_servico where id = NEW.pedido_id;
    if v_cliente_user_id is distinct from auth.uid() then
      raise exception 'Só o cliente dono do pedido pode aceitar ou recusar uma candidatura';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_bloquear_autoaceite_candidatura on candidaturas;
create trigger trg_bloquear_autoaceite_candidatura
  before update on candidaturas
  for each row execute function bloquear_autoaceite_candidatura();
