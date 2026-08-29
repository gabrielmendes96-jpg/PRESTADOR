-- ============================================================
-- CLIENTE — Perfil social: destaques + pastas de agendamento
-- ============================================================
-- Destaques: mídia curada do cliente (dá contexto pro prestador
-- antes de orçar — fotos da casa, do jardim, do pet). Visível pro
-- próprio dono e pra qualquer prestador com uma conversa ativa com
-- esse cliente.
--
-- Pastas: organização pessoal dos pedidos do cliente (ex: "Casa da
-- praia", "Urgente"). Só o dono vê/mexe — não é informação pública
-- nem visível pro prestador.
--
-- As tabelas em si já foram criadas manualmente sem RLS (rascunho
-- do plano rodado direto no SQL Editor) — este script é seguro de
-- rodar de novo: cria só se não existir e liga a segurança que
-- faltava. Copie este arquivo inteiro no SQL Editor do Supabase e
-- rode.
-- ============================================================

create table if not exists destaques_cliente (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  capa_url text,
  tipo text not null default 'foto', -- 'foto' | 'video'
  url text not null,
  ordem int not null default 0,
  criado_em timestamptz default now()
);

create index if not exists idx_destaques_cliente_user on destaques_cliente(user_id);

alter table destaques_cliente enable row level security;

create policy "Dono gerencia seus destaques" on destaques_cliente
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Prestador em conversa ativa ve os destaques do cliente" on destaques_cliente
  for select using (
    exists (
      select 1 from conversas c
      join prestadores p on p.id = c.prestador_id
      where c.cliente_user_id = destaques_cliente.user_id
      and p.user_id = auth.uid()
    )
  );

create table if not exists pastas_pedidos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  cor text default '#F6C64D',
  ordem int not null default 0,
  criado_em timestamptz default now()
);

create index if not exists idx_pastas_pedidos_user on pastas_pedidos(user_id);

alter table pastas_pedidos enable row level security;

create policy "Dono gerencia suas pastas" on pastas_pedidos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- pedidos_servico: campos novos pra pasta e data combinada com o
-- prestador (colunas já criadas manualmente junto com as tabelas
-- acima — "if not exists" aqui é só segurança caso ainda não
-- existam num ambiente novo).
alter table pedidos_servico
  add column if not exists pasta_id uuid references pastas_pedidos(id) on delete set null,
  add column if not exists data_agendada timestamptz;
