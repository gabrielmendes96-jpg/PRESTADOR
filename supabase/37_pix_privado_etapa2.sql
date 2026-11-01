-- 37 — Chave PIX em tabela privada (ETAPA 2 de 2)
--
-- SÓ RODE DEPOIS de: (1) ter rodado o 36 e (2) o app novo (que lê e grava a chave na
-- tabela "prestador_pix") já estar publicado.
--
-- Remove as colunas da chave PIX da tabela pública "prestadores" e recria a visão da
-- busca ("prestadores_completo") sem elas.
-- Pode ser executado mais de uma vez sem problema.

-- Rede de segurança: copia qualquer chave que ainda esteja só na coluna antiga
-- (nunca sobrescreve o que já foi salvo na tabela nova).
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'prestadores' and column_name = 'chave_pix') then
    insert into prestador_pix (prestador_id, chave_pix, tipo_chave_pix)
    select id, chave_pix, tipo_chave_pix
    from prestadores
    where chave_pix is not null
      and tipo_chave_pix in ('CPF', 'CNPJ', 'EMAIL', 'PHONE', 'EVP')
    on conflict (prestador_id) do nothing;
  end if;
end $$;

-- A visão usa "p.*", então precisa sair antes das colunas e voltar depois.
drop view if exists prestadores_completo;

alter table prestadores drop column if exists chave_pix;
alter table prestadores drop column if exists tipo_chave_pix;

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
