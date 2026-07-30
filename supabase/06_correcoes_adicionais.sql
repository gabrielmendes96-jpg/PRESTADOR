-- ============================================================
-- PRESTADOR — Segunda rodada de correções (varredura geral)
-- ============================================================
-- Copie este arquivo inteiro no SQL Editor do Supabase e rode.
-- Cobre 5 problemas encontrados numa auditoria mais ampla do app:
--
-- 1) creditos_cliente: mesmo depois do 05_endurecer_rls.sql, o
--    dono da linha ainda podia definir seus próprios créditos
--    para qualquer valor via API direta (bypassa completamente
--    a correção de "comprar créditos sem pagar"). Substituímos
--    a escrita direta por duas funções de banco que só fazem
--    exatamente a operação de negócio permitida.
-- 2) candidaturas: existiam DUAS políticas de insert — uma exige
--    plano Premium, outra não exige nada. No Postgres, políticas
--    permissivas se somam (OR), então a trava do Premium não
--    valia nada na prática.
-- 3) pedidos_servico: mesma situação — uma política deixa TODOS
--    os pedidos públicos (mesmo fechados/privados), anulando a
--    política mais cuidadosa que só libera pedidos com status
--    "aberto" ou do próprio dono.
-- 4) prestadores: nada impedia um prestador de mudar o próprio
--    plano_id/plano_status direto pela API (mesmo problema já
--    corrigido em assinaturas, agora fechado na própria tabela
--    de prestadores com um gatilho).
-- 5) emails_log e zonas_quentes: ligadas ao painel de Admin, que
--    hoje só é protegido no navegador (verifica o e-mail no
--    React) — sem nada equivalente no banco, qualquer um lia o
--    log de e-mails ou alterava zonas pela API direta.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Créditos: só por função de banco, nunca por escrita direta
-- ------------------------------------------------------------
drop policy if exists "Sistema insere créditos" on creditos_cliente;
drop policy if exists "Sistema atualiza créditos" on creditos_cliente;

-- Resgata o bônus de indicação (3 créditos) de forma atômica e
-- só uma vez por usuário — reproduz exatamente a regra que já
-- existia em Indicacao.jsx, só que validada no servidor.
create or replace function resgatar_indicacao(p_codigo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_indicador_id uuid;
  v_ja_indicado boolean;
  v_credito_id uuid;
  v_saldo_atual int;
  v_tipo text;
begin
  select user_id, tipo into v_indicador_id, v_tipo
  from codigos_indicacao where codigo = p_codigo;

  if v_indicador_id is null then
    raise exception 'Código de indicação inválido';
  end if;

  if v_indicador_id = auth.uid() then
    raise exception 'Você não pode usar seu próprio código';
  end if;

  select exists(select 1 from indicacoes where indicado_user_id = auth.uid())
    into v_ja_indicado;
  if v_ja_indicado then
    raise exception 'Você já usou um código de indicação';
  end if;

  insert into indicacoes (codigo_id, indicador_user_id, indicado_user_id, tipo, status)
  select id, user_id, auth.uid(), tipo, 'pendente'
  from codigos_indicacao where codigo = p_codigo;

  select id, creditos_disponiveis into v_credito_id, v_saldo_atual
  from creditos_cliente where user_id = auth.uid();

  if v_credito_id is null then
    insert into creditos_cliente (user_id, creditos_disponiveis) values (auth.uid(), 3);
  else
    update creditos_cliente set creditos_disponiveis = v_saldo_atual + 3 where id = v_credito_id;
  end if;
end;
$$;

grant execute on function resgatar_indicacao(text) to authenticated;

-- Debita 1 crédito do usuário logado (usado ao publicar um pedido).
-- Só desconta se houver saldo — impossível ficar negativo.
create or replace function debitar_credito()
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
  return v_saldo - 1;
end;
$$;

grant execute on function debitar_credito() to authenticated;

-- ------------------------------------------------------------
-- 2) candidaturas: remove a política duplicada que anulava a
--    exigência de plano Premium
-- ------------------------------------------------------------
drop policy if exists "Prestador cria candidatura" on candidaturas;

-- ------------------------------------------------------------
-- 3) pedidos_servico: remove a política que expunha tudo
-- ------------------------------------------------------------
drop policy if exists "Pedidos visíveis a todos" on pedidos_servico;

-- ------------------------------------------------------------
-- 4) prestadores: plano_id/plano_status/total_servicos só podem
--    mudar via função de servidor (service role) ou pelo admin —
--    nunca diretamente pelo próprio prestador.
-- ------------------------------------------------------------
create or replace function bloquear_edicao_plano_prestador()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'service_role'
     and coalesce(auth.jwt() ->> 'email', '') <> 'gabrielmendes96@gmail.com' then
    NEW.plano_id := OLD.plano_id;
    NEW.plano_status := OLD.plano_status;
    NEW.total_servicos := OLD.total_servicos;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_bloquear_edicao_plano on prestadores;
create trigger trg_bloquear_edicao_plano
before update on prestadores
for each row execute function bloquear_edicao_plano_prestador();

-- ------------------------------------------------------------
-- 5) emails_log e zonas_quentes: exigir que seja realmente você
--    (o e-mail admin), não só o front-end esconder o botão
-- ------------------------------------------------------------
drop policy if exists "Admin ve emails" on emails_log;
create policy "Somente admin ve emails" on emails_log
  for select using (coalesce(auth.jwt() ->> 'email', '') = 'gabrielmendes96@gmail.com');

drop policy if exists "Admin atualiza zona" on zonas_quentes;
create policy "Somente admin atualiza zona" on zonas_quentes
  for update using (coalesce(auth.jwt() ->> 'email', '') = 'gabrielmendes96@gmail.com');
