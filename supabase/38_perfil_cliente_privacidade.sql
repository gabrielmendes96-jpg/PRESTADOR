-- 38 — Privacidade do perfil do cliente: cada pessoa escolhe o que mostra
--
-- Problema: a política "Prestador ve perfil publico" deixava QUALQUER pessoa (inclusive visitante sem
-- login) ler a linha inteira de perfis_cliente, com telefone, sempre que "perfil_publico" estivesse ligado.
--
-- Agora:
--  1) a tabela perfis_cliente só é lida/alterada pelo próprio dono;
--  2) o que outros veem vem da visão perfis_cliente_publico, que já esconde o que a pessoa não quis
--     mostrar (telefone vem desligado por padrão) e só é entregue a quem está logado.
-- Pode ser executado mais de uma vez sem problema.
begin;

alter table perfis_cliente add column if not exists mostrar_telefone boolean not null default false;
alter table perfis_cliente add column if not exists mostrar_localizacao boolean not null default true;
alter table perfis_cliente add column if not exists mostrar_bio boolean not null default true;

drop policy if exists "Prestador ve perfil publico" on perfis_cliente;

drop view if exists perfis_cliente_publico;
create view perfis_cliente_publico as
select
  user_id,
  case when mostrar_bio then bio end as bio,
  case when mostrar_localizacao then cidade end as cidade,
  case when mostrar_localizacao then estado end as estado,
  case when mostrar_telefone then telefone end as telefone
from perfis_cliente
where perfil_publico = true;

revoke all on perfis_cliente_publico from anon;
grant select on perfis_cliente_publico to authenticated;

commit;
