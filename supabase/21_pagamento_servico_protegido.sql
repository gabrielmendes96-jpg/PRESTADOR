-- ============================================================
-- PAGAMENTO PROTEGIDO DO SERVIÇO (com comissão da plataforma)
-- ============================================================
-- Cliente paga o valor combinado com o prestador direto no app; o
-- dinheiro fica "retido" na conta da plataforma até o cliente confirmar
-- a conclusão (ou até vencer o prazo de segurança de 3 dias após o
-- prestador marcar "entreguei") — só então é transferido via PIX pro
-- prestador, já descontada a comissão de 15% (a comissão nunca sai da
-- conta da plataforma, simplesmente não é repassada).
--
-- Por que PIX direto e não split nativo da Asaas: o split reparte o
-- dinheiro na hora da cobrança, incompatível com "reter até liberar".
-- E split exigiria o prestador virar subconta Asaas (cadastro cheio de
-- CPF/CNPJ, renda, endereço) só pra poder receber — uma chave PIX é bem
-- mais simples e é o que todo brasileiro já usa no dia a dia.
--
-- Copie este arquivo inteiro no SQL Editor do Supabase e rode.
-- ============================================================

alter table pedidos_servico
  add column if not exists valor_acordado numeric,
  add column if not exists status_pagamento text, -- null | 'retido' | 'liberando' | 'liberado'
  add column if not exists pago_servico_em timestamptz,
  add column if not exists entregue_em timestamptz,
  add column if not exists liberado_em timestamptz;

alter table prestadores
  add column if not exists chave_pix text,
  add column if not exists tipo_chave_pix text; -- 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP'

-- O prestador não tem permissão de update em pedidos_servico (só o
-- cliente, dono do pedido, tem hoje) — esta função dá só a permissão
-- mínima necessária pra ele marcar "entreguei", sem abrir a política
-- geral. Mesmo padrão de segurança de debitar_credito() e
-- incrementar_pontos_resposta_bonus() (security definer + checagem
-- interna via auth.uid(), nunca confia em id vindo do cliente).
create or replace function marcar_servico_entregue(p_pedido_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prestador_id uuid;
begin
  select id into v_prestador_id from prestadores where user_id = auth.uid();
  if v_prestador_id is null then
    raise exception 'Você precisa ter um perfil de prestador';
  end if;

  if not exists (
    select 1 from candidaturas
    where pedido_id = p_pedido_id and prestador_id = v_prestador_id and status = 'aceito'
  ) then
    raise exception 'Você não é o prestador responsável por este pedido';
  end if;

  update pedidos_servico
  set entregue_em = now()
  where id = p_pedido_id and status_pagamento = 'retido' and entregue_em is null;
end;
$$;

grant execute on function marcar_servico_entregue(uuid) to authenticated;

-- Bug pré-existente descoberto testando esta fase: a política de select
-- de pedidos_servico só permite "dono ou status='aberto'" — assim que o
-- pedido vira 'em_andamento', o PRÓPRIO prestador contratado não
-- consegue mais ver o pedido (nem pra marcar "entreguei", nem nada).
-- Sem essa política a Fase 3+4 inteira não funciona pro lado do
-- prestador depois que uma candidatura é aceita.
--
-- Não dá pra checar isso com uma subquery direta em candidaturas: a
-- própria política de select de candidaturas também consulta
-- pedidos_servico (pra ver se quem pergunta é o dono do pedido),
-- gerando recursão infinita. Uma função security definer quebra o
-- ciclo — ela roda com o dono da função (que ignora RLS), então a
-- consulta interna não reaciona a política de candidaturas.
create or replace function prestador_tem_candidatura(p_pedido_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from candidaturas c
    join prestadores p on p.id = c.prestador_id
    where c.pedido_id = p_pedido_id and p.user_id = p_user_id
  );
$$;

drop policy if exists "Prestador candidato ve o pedido" on pedidos_servico;
create policy "Prestador candidato ve o pedido" on pedidos_servico
  for select using (prestador_tem_candidatura(id, auth.uid()));
