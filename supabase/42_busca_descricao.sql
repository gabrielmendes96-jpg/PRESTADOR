-- 42 — A busca passa a olhar também a descrição que o profissional escreveu (sem acento, minúscula)
--
-- Ex.: a descrição da CENTRALCAR cita "Insulfilm, Alarme, Travas, Som, Engates": agora quem busca
-- por qualquer uma dessas palavras a encontra, mesmo sem hashtag cadastrada.
-- Aditivo: o app atual continua funcionando. Pode ser executado mais de uma vez.
begin;

alter table prestadores add column if not exists descricao_busca text generated always as (public.sem_acento(descricao)) stored;

-- A visão usa "p.*": é recriada (mesma definição) para incluir a coluna nova.
drop view if exists prestadores_completo;

create view prestadores_completo as
select
  p.*,
  case when p.mostrar_whatsapp and p.plano_id = 'premium' then pv.whatsapp end as whatsapp,
  case when p.mostrar_idade then pv.idade end as idade,
  coalesce(round(avg(a.nota)::numeric, 1), 0) as avaliacao_media,
  count(a.id) as total_avaliacoes,
  coalesce(round(avg(a.pontualidade)::numeric, 1), 0) as media_pontualidade,
  coalesce(round(avg(a.qualidade)::numeric, 1), 0) as media_qualidade,
  coalesce(round(avg(a.preco)::numeric, 1), 0) as media_preco,
  coalesce(round(avg(a.limpeza)::numeric, 1), 0) as media_limpeza,
  coalesce(round(avg(a.comunicacao)::numeric, 1), 0) as media_comunicacao,
  exists (
    select 1 from boosts b
    where b.prestador_id = p.id
      and b.status = 'ativo'
      and b.aparece_busca is true
      and b.expira_em > now()
  ) as boost_ativo,
  case p.plano_id when 'premium' then 3 when 'profissional' then 2 else 1 end as plano_rank
from prestadores p
left join prestador_privado pv on pv.prestador_id = p.id
left join avaliacoes a on a.prestador_id = p.id
group by p.id, pv.prestador_id;

grant select on prestadores_completo to anon, authenticated;

commit;
