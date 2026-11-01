-- 36 — Chave PIX em tabela privada (ETAPA 1 de 2)
--
-- Problema: a chave PIX do prestador (CPF, e-mail, telefone...) ficava na tabela
-- "prestadores", que qualquer visitante sem login consegue ler.
--
-- Esta etapa só CRIA a tabela privada e COPIA as chaves atuais. Nada é removido,
-- então o app em produção continua funcionando normalmente. Depois de rodar este
-- arquivo, avise para o app novo ser publicado; só então rode o 37.
-- Pode ser executado mais de uma vez sem problema.

create table if not exists prestador_pix (
  prestador_id uuid primary key references prestadores(id) on delete cascade,
  chave_pix text not null check (char_length(chave_pix) between 3 and 140),
  tipo_chave_pix text not null check (tipo_chave_pix in ('CPF', 'CNPJ', 'EMAIL', 'PHONE', 'EVP')),
  atualizado_em timestamptz not null default now()
);

alter table prestador_pix enable row level security;

-- Só o próprio profissional lê e altera a sua chave. O servidor (service role) ignora o RLS
-- e é quem usa a chave para fazer o repasse.
drop policy if exists "pix: dono gerencia" on prestador_pix;
create policy "pix: dono gerencia" on prestador_pix
  for all to authenticated
  using (exists (select 1 from prestadores p where p.id = prestador_pix.prestador_id and p.user_id = auth.uid()))
  with check (exists (select 1 from prestadores p where p.id = prestador_pix.prestador_id and p.user_id = auth.uid()));

revoke all on prestador_pix from anon;
revoke all on prestador_pix from authenticated;
grant select, insert, update, delete on prestador_pix to authenticated;

-- Copia as chaves que já existem (sem sobrescrever o que já estiver na tabela nova).
insert into prestador_pix (prestador_id, chave_pix, tipo_chave_pix)
select id, chave_pix, tipo_chave_pix
from prestadores
where chave_pix is not null
  and tipo_chave_pix in ('CPF', 'CNPJ', 'EMAIL', 'PHONE', 'EVP')
on conflict (prestador_id) do nothing;
