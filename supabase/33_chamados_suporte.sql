-- ============================================================
-- SUPORTE DENTRO DO APP: chamados (formulário) + resposta do admin
-- ============================================================
-- O usuário abre um chamado em /suporte; o admin (você) vê todos na aba
-- "Suporte" do painel Admin, responde, e o usuário recebe uma notificação
-- no app. Nada de rota nova no servidor (a Vercel Hobby limita a 12
-- funções): tudo é tabela + regras + gatilhos no banco.
--
-- Segurança (mesmas lições do restante do projeto):
--  - O usuário só enxerga e cria os PRÓPRIOS chamados.
--  - Só o admin (e-mail abaixo) enxerga todos e escreve a resposta.a
--  - O usuário NÃO consegue escrever status, prioridade ou resposta:
--    o grant de coluna libera só o que o formulário preenche (revogar
--    coluna isolada não adiantaria — ver o comentário do script 26).
--  - Prioridade "alta" é calculada no banco (Premium ativo), nunca
--    enviada pelo cliente.
--  - Limite de 5 chamados por hora por usuário (anti-spam).
--
-- Copie este arquivo inteiro no SQL Editor do Supabase e rode.
-- ============================================================

create table if not exists chamados_suporte (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text,
  email text,
  categoria text not null default 'outro'
    check (categoria in ('pagamento', 'assinatura', 'servico', 'conta', 'sugestao', 'outro')),
  assunto text not null check (char_length(assunto) between 3 and 120),
  mensagem text not null check (char_length(mensagem) between 10 and 4000),
  status text not null default 'aberto' check (status in ('aberto', 'em_andamento', 'resolvido')),
  prioridade text not null default 'normal' check (prioridade in ('normal', 'alta')),
  resposta text check (resposta is null or char_length(resposta) <= 4000),
  respondido_em timestamptz,
  criado_em timestamptz not null default now()
);

create index if not exists idx_chamados_user on chamados_suporte(user_id, criado_em desc);
create index if not exists idx_chamados_fila on chamados_suporte(status, prioridade, criado_em);

alter table chamados_suporte enable row level security;

drop policy if exists "chamados: dono cria" on chamados_suporte;
create policy "chamados: dono cria" on chamados_suporte
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "chamados: dono le" on chamados_suporte;
create policy "chamados: dono le" on chamados_suporte
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "chamados: admin le" on chamados_suporte;
create policy "chamados: admin le" on chamados_suporte
  for select to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') = 'gabrielmendes96@gmail.com');

drop policy if exists "chamados: admin atualiza" on chamados_suporte;
create policy "chamados: admin atualiza" on chamados_suporte
  for update to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') = 'gabrielmendes96@gmail.com')
  with check (coalesce(auth.jwt() ->> 'email', '') = 'gabrielmendes96@gmail.com');

-- Permissões por coluna: revoga a tabela inteira e devolve só o necessário.
revoke all on chamados_suporte from anon;
revoke insert, update on chamados_suporte from authenticated;
grant insert (user_id, categoria, assunto, mensagem, nome, email) on chamados_suporte to authenticated;
grant update (status, resposta) on chamados_suporte to authenticated;

-- Ao criar: limita spam, carimba e-mail/nome vindos do login (não do
-- formulário) e define a prioridade pelo plano.
create or replace function chamado_preparar()
returns trigger
language plpgsql
as $$
declare
  v_recentes int;
  v_premium boolean;
begin
  select count(*) into v_recentes
  from chamados_suporte
  where user_id = NEW.user_id and criado_em > now() - interval '1 hour';

  if v_recentes >= 5 then
    raise exception 'Você abriu muitos chamados em pouco tempo. Aguarde um pouco e tente de novo.';
  end if;

  NEW.email := coalesce(auth.jwt() ->> 'email', NEW.email);
  NEW.nome := coalesce(auth.jwt() -> 'user_metadata' ->> 'nome', NEW.nome);

  select exists (
    select 1 from prestadores
    where user_id = NEW.user_id and plano_id = 'premium' and plano_status = 'ativo'
  ) into v_premium;

  NEW.prioridade := case when v_premium then 'alta' else 'normal' end;
  NEW.status := 'aberto';
  NEW.resposta := null;
  NEW.respondido_em := null;
  return NEW;
end;
$$;

drop trigger if exists trg_chamado_preparar on chamados_suporte;
create trigger trg_chamado_preparar
  before insert on chamados_suporte
  for each row execute function chamado_preparar();

-- Ao responder: carimba a data da resposta.
create or replace function chamado_carimbar_resposta()
returns trigger
language plpgsql
as $$
begin
  if NEW.resposta is distinct from OLD.resposta and NEW.resposta is not null then
    NEW.respondido_em := now();
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_chamado_carimbar_resposta on chamados_suporte;
create trigger trg_chamado_carimbar_resposta
  before update on chamados_suporte
  for each row execute function chamado_carimbar_resposta();

-- E avisa o usuário no app. SECURITY DEFINER porque o admin não tem
-- permissão de escrever notificação em nome de outra pessoa.
create or replace function chamado_notificar_resposta()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.resposta is distinct from OLD.resposta and NEW.resposta is not null then
    insert into notificacoes (user_id, titulo, corpo, tipo, url)
    values (NEW.user_id, 'O suporte respondeu seu chamado', left(NEW.resposta, 140), 'geral', '/suporte');
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_chamado_notificar_resposta on chamados_suporte;
create trigger trg_chamado_notificar_resposta
  after update on chamados_suporte
  for each row execute function chamado_notificar_resposta();
