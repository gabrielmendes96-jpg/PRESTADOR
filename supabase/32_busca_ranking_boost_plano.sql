-- ============================================================
-- BUSCA: ordenação por boost ativo e plano (o que os planos prometem)
-- ============================================================
-- Achado na revisão: "Topo das buscas na cidade" (Premium), "Destaque
-- nos resultados de busca" (Profissional) e o produto Impulsionar (boost,
-- que grava aparece_busca/aparece_home) são vendidos, mas NENHUM código
-- de busca olhava plano ou boost — a ordem era a do banco, sem critério.
--
-- Esta view ganha duas colunas pra permitir ordenar no servidor (e
-- paginar de verdade):
--   boost_ativo  true se há um boost ativo, não expirado, com aparece_busca
--   plano_rank   3 = premium, 2 = profissional, 1 = demais
--
-- A ordem padrão passa a ser: boost ativo > plano > nota > agilidade.
-- (Ajustável em src/lib/hooks.js, em ORDENACOES.)
--
-- Copie este arquivo inteiro no SQL Editor do Supabase e rode.
-- ============================================================

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
left join avaliacoes a on a.prestador_id = p.id
group by p.id;

grant select on prestadores_completo to anon, authenticated;
