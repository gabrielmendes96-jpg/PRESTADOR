-- 39 — WhatsApp e idade do prestador em tabela privada (ETAPA 1 de 2)
--
-- Problema: o botão "mostrar WhatsApp" do painel só escondia o botão na tela; o número continuava
-- legível por qualquer pessoa pela API. O mesmo vale para a idade.
--
-- Esta etapa só CRIA a tabela privada, COPIA os dados atuais e adiciona a opção "mostrar idade"
-- (desligada por padrão). Nada é removido: o app em produção continua funcionando.
-- Rode a etapa 2 (40) só depois do app novo estar publicado.
-- Pode ser executado mais de uma vez sem problema.
begin;

create table if not exists prestador_privado (
  prestador_id uuid primary key references prestadores(id) on delete cascade,
  whatsapp text check (whatsapp is null or char_length(whatsapp) between 8 and 30),
  idade integer check (idade is null or idade between 14 and 120),
  atualizado_em timestamptz not null default now()
);

alter table prestador_privado enable row level security;

drop policy if exists "privado: dono gerencia" on prestador_privado;
create policy "privado: dono gerencia" on prestador_privado
  for all to authenticated
  using (exists (select 1 from prestadores p where p.id = prestador_privado.prestador_id and p.user_id = auth.uid()))
  with check (exists (select 1 from prestadores p where p.id = prestador_privado.prestador_id and p.user_id = auth.uid()));

revoke all on prestador_privado from anon;
revoke all on prestador_privado from authenticated;
grant select, insert, update, delete on prestador_privado to authenticated;

alter table prestadores add column if not exists mostrar_idade boolean not null default false;

insert into prestador_privado (prestador_id, whatsapp, idade)
select id,
       case when whatsapp is not null and char_length(whatsapp) between 8 and 30 then whatsapp end,
       case when idade between 14 and 120 then idade end
from prestadores
where whatsapp is not null or idade is not null
on conflict (prestador_id) do nothing;

commit;
