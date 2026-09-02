-- ============================================================
-- ENDURECER pedidos_servico: colunas que só o servidor pode escrever
-- ============================================================
-- Achado da auditoria de segurança: a política de RLS de update em
-- pedidos_servico dá ao cliente (dono) permissão irrestrita sobre TODAS
-- as colunas da própria linha — não só as que ele deveria poder mudar
-- (data_agendada, pasta_id, abrir disputa). Isso abre duas brechas reais:
--
-- 1) Qualquer cliente, direto pelo console do navegador, podia rodar
--    `supabase.from('pedidos_servico').update({ pago: true })` no
--    próprio pedido e furar a cobrança de R$9 pra publicar — sem nunca
--    chamar debitar_credito().
-- 2) O mesmo valia pras colunas do pagamento protegido: um cliente mal
--    intencionado podia setar `status_pagamento: 'liberado'` direto no
--    banco (enganando o prestador com um "pago" falso, já que a
--    transferência PIX de verdade só acontece via liberarPagamentoServico,
--    no servidor), ou reescrever `valor_acordado` pra um valor menor
--    bem depois de combinado — inclusive depois do pagamento já retido.
--
-- Este script tranca essas colunas com REVOKE de coluna (um cliente
-- autenticado não consegue mais tocar nelas via API/RLS, mas as funções
-- SECURITY DEFINER e o backend com service role continuam funcionando
-- normalmente, porque essas escritas acontecem com o dono da função/tabela,
-- não com o papel "authenticated"). Testado: não quebra nenhum fluxo
-- existente — nenhuma dessas colunas é escrita direto pelo cliente hoje,
-- exceto `pago`, que passa a ser setado dentro da própria debitar_credito()
-- (ver troca de assinatura abaixo).
--
-- Copie este arquivo inteiro no SQL Editor do Supabase e rode.
-- ============================================================

-- 1) Tranca as colunas que só o servidor (service role) ou uma função
-- SECURITY DEFINER específica (marcar_servico_entregue, responder_disputa)
-- devem escrever. Revoga tanto UPDATE quanto INSERT — sem isso, um
-- cliente podia criar um pedido novo já com `pago: true` direto no
-- INSERT, pulando a cobrança por completo. Um cliente sem privilégio na
-- coluna ainda consegue inserir a linha normalmente contanto que não
-- mencione essa coluna — ela cai no valor padrão (false/nulo).
revoke insert (
  pago, status_pagamento, pago_servico_em, entregue_em, liberado_em,
  concluido_em, disputa_respondida_em, disputa_resposta_prestador, disputa_penalizada_em
), update (
  pago, status_pagamento, pago_servico_em, entregue_em, liberado_em,
  concluido_em, disputa_respondida_em, disputa_resposta_prestador, disputa_penalizada_em
) on pedidos_servico from authenticated;

-- 2) debitar_credito() passa a marcar o pedido como pago na MESMA
-- transação em que desconta o crédito — elimina a janela em que o
-- cliente podia setar `pago = true` sem ter pago nada. Assinatura muda
-- (agora exige o id do pedido), então o nome antigo sem argumento é
-- removido pra não sobrar uma versão insegura ainda chamável.
drop function if exists debitar_credito();

create or replace function debitar_credito(p_pedido_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_saldo int;
begin
  select creditos_disponiveis into v_saldo from creditos_cliente where user_id = auth.uid();
  if v_saldo is null or v_saldo < 1 then
    raise exception 'Créditos insuficientes';
  end if;

  update creditos_cliente set creditos_disponiveis = v_saldo - 1 where user_id = auth.uid();

  update pedidos_servico set pago = true
  where id = p_pedido_id and cliente_user_id = auth.uid() and pago = false;

  return v_saldo - 1;
end;
$$;

grant execute on function debitar_credito(uuid) to authenticated;

-- 3) valor_acordado continua editável pelo cliente (é assim que
-- aceitarCandidatura() grava o preço combinado, em DetalhePedido.jsx) —
-- mas só ATÉ o pagamento começar. Depois de status_pagamento deixar de
-- ser nulo (retido/liberando/liberado), travamos qualquer edição que não
-- venha do service role, fechando a janela de reescrever o preço depois
-- de já ter sido cobrado.
create or replace function bloquear_edicao_valor_acordado()
returns trigger
language plpgsql
as $$
begin
  if NEW.valor_acordado is distinct from OLD.valor_acordado
     and OLD.status_pagamento is not null
     and auth.role() <> 'service_role' then
    raise exception 'O valor combinado não pode mais ser alterado depois que o pagamento foi iniciado.';
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_bloquear_valor_acordado on pedidos_servico;
create trigger trg_bloquear_valor_acordado
  before update on pedidos_servico
  for each row execute function bloquear_edicao_valor_acordado();
