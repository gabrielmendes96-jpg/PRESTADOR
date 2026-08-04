-- ============================================================
-- PRESTADOR — Corrige view prestadores_completo (foto de perfil sumida)
-- ============================================================
-- A view prestadores_completo foi criada antes da coluna foto_perfil
-- (e possivelmente outras) existir na tabela prestadores. No Postgres,
-- "select p.*" dentro de uma view fica travado nas colunas que
-- existiam no momento da criação — colunas adicionadas depois nunca
-- aparecem nela, mesmo que a tabela real já tenha o dado. Por isso a
-- foto funciona no painel do prestador (lê a tabela prestadores
-- direto) mas não em nenhuma tela pública — busca, perfil, comparar
-- (que leem prestadores_completo).
--
-- Este script recria a view do zero, sem apagar nenhum dado — só a
-- "janela" de leitura é reconstruída, pegando automaticamente todas
-- as colunas atuais de prestadores.
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
  coalesce(round(avg(a.limpeza)::numeric, 1), 0) as media_limpeza
from prestadores p
left join avaliacoes a on a.prestador_id = p.id
group by p.id;

grant select on prestadores_completo to anon, authenticated;
