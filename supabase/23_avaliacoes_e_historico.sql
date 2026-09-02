-- ============================================================
-- REPUTAÇÃO DE VERDADE: nota 0-10, histórico, suporte obrigatório
-- ============================================================
-- Corrige um bug real encontrado nesta rodada: o formulário de
-- avaliação salva em `preco_avaliacao`/`tempo_servico`/`higiene`, mas
-- a média pública (view prestadores_completo) só lê
-- `pontualidade/qualidade/preco/limpeza` — ou seja, "Preço" e
-- "Limpeza" no perfil público estão zerados desde sempre. Unificamos
-- em 5 critérios, todos realmente usados: Pontualidade, Qualidade,
-- Preço, Limpeza, Comunicação (comunicacao já existe como coluna, só
-- nunca entrou na média).
--
-- Junto: migra a escala de notas de 1-5 pra 0-10, cria a base pra
-- "marcar concluído" sem pagamento pelo app, e o suporte obrigatório
-- em disputa (RPC responder_disputa).
--
-- Copie este arquivo inteiro no SQL Editor do Supabase e rode.
-- ATENÇÃO: a conversão de notas antigas (multiplicar por 2) é
-- destrutiva e não deve rodar mais de uma vez — depois de rodar este
-- arquivo com sucesso, não rode de novo.
-- ============================================================

-- 1) Solta os constraints antigos (1-5) primeiro — se o dobro de uma
-- nota "5" (vira 10) tentar entrar enquanto o limite antigo ainda diz
-- "no máximo 5", o banco recusa. Precisa soltar antes de converter.
alter table avaliacoes drop constraint if exists avaliacoes_nota_check;
alter table avaliacoes drop constraint if exists avaliacoes_pontualidade_check;
alter table avaliacoes drop constraint if exists avaliacoes_qualidade_check;
alter table avaliacoes drop constraint if exists avaliacoes_preco_check;
alter table avaliacoes drop constraint if exists avaliacoes_limpeza_check;
alter table avaliacoes drop constraint if exists avaliacoes_comunicacao_check;
alter table avaliacoes_cliente drop constraint if exists avaliacoes_cliente_nota_check;

-- 2) Migração de escala — SÓ RODA UMA VEZ.
update avaliacoes set
  nota = nota * 2,
  pontualidade = pontualidade * 2,
  qualidade = qualidade * 2,
  preco = preco * 2,
  limpeza = limpeza * 2,
  comunicacao = comunicacao * 2
where nota <= 5;

update avaliacoes_cliente set nota = nota * 2 where nota <= 5;

-- 3) Constraints novos (0-10)
alter table avaliacoes add constraint avaliacoes_nota_check check (nota between 0 and 10);
alter table avaliacoes add constraint avaliacoes_pontualidade_check check (pontualidade between 0 and 10);
alter table avaliacoes add constraint avaliacoes_qualidade_check check (qualidade between 0 and 10);
alter table avaliacoes add constraint avaliacoes_preco_check check (preco between 0 and 10);
alter table avaliacoes add constraint avaliacoes_limpeza_check check (limpeza between 0 and 10);
alter table avaliacoes add constraint avaliacoes_comunicacao_check check (comunicacao between 0 and 10);
alter table avaliacoes_cliente add constraint avaliacoes_cliente_nota_check check (nota between 0 and 10);

-- 3) Resgata "comunicacao" na média pública (mesma view de
-- 09_corrigir_view_prestadores_completo.sql, só adicionando uma coluna)
drop view if exists prestadores_completo;

create view prestadores_completo as
select
  p.*,
  coalesce(round(avg(a.nota)::numeric, 1), 0) as avaliacao_media,
  count(a.id) as total_avaliacoes,
  coalesce(round(avg(a.pontualidade)::numeric, 1), 0) as media_pontualidade,
  coalesce(round(avg(a.qualidade)::numeric, 1), 0) as media_qualidade,
  coalesce(round(avg(a.preco)::numeric, 1), 0) as media_preco,
  coalesce(round(avg(a.limpeza)::numeric, 1), 0) as media_limpeza,
  coalesce(round(avg(a.comunicacao)::numeric, 1), 0) as media_comunicacao
from prestadores p
left join avaliacoes a on a.prestador_id = p.id
group by p.id;

grant select on prestadores_completo to anon, authenticated;

-- 4) Serviço concluído sem pagamento pelo app — pedidos_servico.status
-- já previa 'concluido' desde o schema original, só nunca foi usado.
alter table pedidos_servico add column if not exists concluido_em timestamptz;

-- 5) Suporte obrigatório: prestador precisa responder a uma disputa aberta.
alter table pedidos_servico
  add column if not exists disputa_resposta_prestador text,
  add column if not exists disputa_respondida_em timestamptz,
  add column if not exists disputa_penalizada_em timestamptz;

create or replace function responder_disputa(p_pedido_id uuid, p_resposta text)
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
  set disputa_resposta_prestador = p_resposta, disputa_respondida_em = now()
  where id = p_pedido_id and disputa_aberta_em is not null and disputa_respondida_em is null;
end;
$$;

grant execute on function responder_disputa(uuid, text) to authenticated;
