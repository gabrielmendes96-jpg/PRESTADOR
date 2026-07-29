-- ============================================================
-- PRESTADOR — Contagem real de visualizações de perfil
-- ============================================================
-- Substitui os números fabricados (Math.random()) que hoje
-- aparecem no painel de Desempenho (Ganhos.jsx) por uma métrica
-- real. Copie este arquivo inteiro no SQL Editor do Supabase e
-- clique em "Run".
-- ============================================================

create table visualizacoes_perfil (
  id uuid primary key default uuid_generate_v4(),
  prestador_id uuid references prestadores(id) on delete cascade,
  criado_em timestamptz default now()
);

create index idx_visualizacoes_prestador_data on visualizacoes_perfil(prestador_id, criado_em);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Qualquer visitante (mesmo deslogado) pode registrar uma
-- visualização; só o próprio prestador pode ler suas visualizações.
-- ------------------------------------------------------------
alter table visualizacoes_perfil enable row level security;

create policy "Qualquer um registra uma visualização" on visualizacoes_perfil
  for insert with check (true);

create policy "Prestador vê suas próprias visualizações" on visualizacoes_perfil
  for select using (
    auth.uid() = (select user_id from prestadores where id = prestador_id)
  );
