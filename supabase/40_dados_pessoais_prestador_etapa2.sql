-- 40 — WhatsApp e idade do prestador em tabela privada (ETAPA 2 de 2)
--
-- SÓ RODE DEPOIS de: (1) ter rodado o 39 e (2) o app novo (que lê e grava WhatsApp e idade em
-- "prestador_privado") já estar publicado.
--
-- Tira WhatsApp e idade da tabela pública "prestadores" e recria a visão da busca entregando
-- cada um SÓ quando o profissional permitiu:
--   - WhatsApp: só se "mostrar_whatsapp" estiver ligado E o plano for Premium (regra do produto,
--     que antes só valia na tela);
--   - idade: só se "mostrar_idade" estiver ligado.
-- Em uma transação: se qualquer parte falhar, nada é aplicado. Pode ser executado mais de uma vez.
begin;

-- Rede de segurança: copia o que ainda estiver só nas colunas antigas (nunca sobrescreve o novo).
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'prestadores' and column_name = 'whatsapp') then
    insert into prestador_privado (prestador_id, whatsapp, idade)
    select id,
           case when whatsapp is not null and char_length(whatsapp) between 8 and 30 then whatsapp end,
           case when idade between 14 and 120 then idade end
    from prestadores
    where whatsapp is not null or idade is not null
    on conflict (prestador_id) do nothing;
  end if;
end $$;

drop view if exists prestadores_completo;

alter table prestadores drop column if exists whatsapp;
alter table prestadores drop column if exists idade;

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
