-- 41 — Busca que ignora acento e maiúsculas ("mecanico" acha "Mecânico", "sao paulo" acha "São Paulo")
--
-- Cria uma versão "sem acento" (minúscula) de cada texto pesquisado, guardada em colunas geradas
-- automaticamente a partir do original: nada precisa ser preenchido à mão e o original não muda.
-- A tela passa a pesquisar nessas colunas, com o termo digitado também sem acento.
-- Aditivo: o app atual continua funcionando normalmente. Pode ser executado mais de uma vez.
begin;

create extension if not exists unaccent with schema extensions;

-- Marcada como "imutável" (o unaccent original não é), o que o Postgres exige para colunas geradas.
create or replace function public.sem_acento(texto text)
returns text
language sql
immutable
parallel safe
as $$ select lower(extensions.unaccent('extensions.unaccent'::regdictionary, coalesce(texto, ''))) $$;

alter table categorias add column if not exists nome_busca text generated always as (public.sem_acento(nome)) stored;
alter table servicos_catalogo add column if not exists nome_busca text generated always as (public.sem_acento(nome)) stored;
alter table servicos_prestador add column if not exists tag_busca text generated always as (public.sem_acento(tag)) stored;
alter table prestadores add column if not exists nome_busca text generated always as (public.sem_acento(nome)) stored;
alter table prestadores add column if not exists cidade_busca text generated always as (public.sem_acento(cidade)) stored;

-- A visão usa "p.*": é recriada (mesma definição) para incluir as colunas novas.
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
