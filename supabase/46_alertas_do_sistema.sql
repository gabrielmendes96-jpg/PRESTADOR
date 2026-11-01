-- 46 — Alertas do sistema (erros de tela do app e problemas de pagamento)
--
-- O app registra aqui quando uma tela quebra (ErrorBoundary) e o servidor registra quando algo importante falha
-- (pagamento que não achou o usuário, cancelamento de assinatura que falhou). A aba "Alertas" do painel admin lista tudo.
--  - qualquer visitante pode registrar SÓ erros de tela (tipo 'erro_tela'), com tamanhos limitados;
--  - ninguém lê, exceto o admin (e o servidor);
--  - trava global: no máximo 30 erros de tela por minuto (impede encher o banco de propósito).
-- Aditivo. Pode ser executado mais de uma vez.
begin;

create table if not exists alertas_sistema (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (char_length(tipo) between 3 and 40),
  mensagem text not null check (char_length(mensagem) between 1 and 500),
  detalhe text check (detalhe is null or char_length(detalhe) <= 1500),
  pagina text check (pagina is null or char_length(pagina) <= 200),
  criado_em timestamptz not null default now()
);
create index if not exists idx_alertas_sistema_criado on alertas_sistema (criado_em desc);

alter table alertas_sistema enable row level security;

drop policy if exists "alertas: qualquer um registra erro de tela" on alertas_sistema;
create policy "alertas: qualquer um registra erro de tela" on alertas_sistema
  for insert to anon, authenticated
  with check (tipo = 'erro_tela');

drop policy if exists "alertas: admin le" on alertas_sistema;
create policy "alertas: admin le" on alertas_sistema
  for select to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') = 'gabrielmendes96@gmail.com');

revoke all on alertas_sistema from anon, authenticated;
grant insert (tipo, mensagem, detalhe, pagina) on alertas_sistema to anon, authenticated;
grant select on alertas_sistema to authenticated;

-- security definer: a função precisa CONTAR os erros recentes, e quem registra (visitante) não pode ler a tabela.
create or replace function alertas_limitar_erros_de_tela()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.tipo = 'erro_tela' and (
    select count(*) from alertas_sistema where tipo = 'erro_tela' and criado_em > now() - interval '1 minute'
  ) >= 30 then
    return null; -- descarta em silêncio
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_alertas_limitar on alertas_sistema;
create trigger trg_alertas_limitar
  before insert on alertas_sistema
  for each row execute function alertas_limitar_erros_de_tela();

commit;
