-- ============================================================
-- PRESTADOR — Esquema do banco de dados (Supabase / PostgreSQL)
-- ============================================================
-- Como usar: copie todo este arquivo e cole no SQL Editor do
-- Supabase (menu lateral "SQL Editor" > "New query"), depois
-- clique em "Run".
-- ============================================================

-- Extensão para gerar UUIDs automaticamente
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- TABELA: categorias
-- Lista fixa de profissões (pedreiro, eletricista, etc.)
-- ------------------------------------------------------------
create table categorias (
  id text primary key,        -- ex: 'pedreiro'
  nome text not null,         -- ex: 'Pedreiro'
  emoji text,                 -- ex: '🧱'
  ordem int default 0         -- prioridade de exibição
);

-- ------------------------------------------------------------
-- TABELA: topicos
-- Agrupamentos amplos (Construção, Residencial, Automotivo...)
-- ------------------------------------------------------------
create table topicos (
  id text primary key,
  nome text not null,
  icone text                  -- classe do ícone (ex: 'ti-bricks')
);

-- Relação N:N entre tópicos e categorias
create table topico_categorias (
  topico_id text references topicos(id) on delete cascade,
  categoria_id text references categorias(id) on delete cascade,
  primary key (topico_id, categoria_id)
);

-- ------------------------------------------------------------
-- TABELA: planos
-- Planos de assinatura para prestadores
-- ------------------------------------------------------------
create table planos (
  id text primary key,        -- 'basico' | 'profissional' | 'premium'
  nome text not null,
  preco numeric(10,2) not null,
  descricao text,
  destaque boolean default false,
  recursos jsonb               -- lista de recursos do plano
);

-- ------------------------------------------------------------
-- TABELA: prestadores
-- Perfil de cada profissional cadastrado na plataforma
-- ------------------------------------------------------------
create table prestadores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade, -- vínculo com login
  nome text not null,
  email text,
  whatsapp text,
  categoria_id text references categorias(id),
  cidade text,
  estado text,
  raio_atendimento int default 30,     -- km
  idade int,
  descricao text,
  servicos jsonb default '[]',          -- lista de tags de serviço
  disponivel boolean default true,
  plano_id text references planos(id) default 'basico',
  plano_status text default 'ativo',    -- ativo | inadimplente | cancelado
  total_servicos int default 0,
  tempo_resposta text,                  -- ex: '2h'
  criado_em timestamptz default now()
);

-- ------------------------------------------------------------
-- TABELA: fotos_prestador
-- Fotos do portfólio/trabalho de cada prestador
-- ------------------------------------------------------------
create table fotos_prestador (
  id uuid primary key default uuid_generate_v4(),
  prestador_id uuid references prestadores(id) on delete cascade,
  url text not null,
  ordem int default 0,
  criado_em timestamptz default now()
);

-- ------------------------------------------------------------
-- TABELA: avaliacoes
-- Avaliações que clientes deixam para prestadores
-- ------------------------------------------------------------
create table avaliacoes (
  id uuid primary key default uuid_generate_v4(),
  prestador_id uuid references prestadores(id) on delete cascade,
  autor_user_id uuid references auth.users(id),
  autor_nome text not null,
  nota int not null check (nota between 1 and 5),
  pontualidade int check (pontualidade between 1 and 5),
  qualidade int check (qualidade between 1 and 5),
  preco int check (preco between 1 and 5),
  limpeza int check (limpeza between 1 and 5),
  comentario text,
  criado_em timestamptz default now()
);

-- ------------------------------------------------------------
-- TABELA: assinaturas
-- Histórico/status de pagamento da mensalidade dos prestadores
-- ------------------------------------------------------------
create table assinaturas (
  id uuid primary key default uuid_generate_v4(),
  prestador_id uuid references prestadores(id) on delete cascade,
  plano_id text references planos(id),
  status text default 'pendente',  -- pendente | pago | atrasado | cancelado
  metodo_pagamento text,           -- pix | boleto | cartao
  valor numeric(10,2),
  vencimento date,
  pago_em timestamptz,
  criado_em timestamptz default now()
);

-- ------------------------------------------------------------
-- TABELA: mensagens
-- Chat entre cliente e prestador
-- ------------------------------------------------------------
create table mensagens (
  id uuid primary key default uuid_generate_v4(),
  prestador_id uuid references prestadores(id) on delete cascade,
  cliente_user_id uuid references auth.users(id),
  remetente text not null,   -- 'cliente' | 'prestador'
  texto text not null,
  lida boolean default false,
  criado_em timestamptz default now()
);

-- ============================================================
-- ÍNDICES para acelerar buscas comuns
-- ============================================================
create index idx_prestadores_categoria on prestadores(categoria_id);
create index idx_prestadores_cidade on prestadores(cidade);
create index idx_prestadores_disponivel on prestadores(disponivel);
create index idx_avaliacoes_prestador on avaliacoes(prestador_id);
create index idx_fotos_prestador on fotos_prestador(prestador_id);
create index idx_mensagens_prestador on mensagens(prestador_id);

-- ============================================================
-- VIEW: prestadores_completo
-- Junta prestador + média de avaliações + total de avaliações
-- Facilita buscar tudo de uma vez no frontend
-- ============================================================
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

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Regras de quem pode ler/escrever em cada tabela
-- ============================================================

-- Categorias, tópicos e planos: leitura pública, sem edição pelo app
alter table categorias enable row level security;
alter table topicos enable row level security;
alter table topico_categorias enable row level security;
alter table planos enable row level security;

create policy "Categorias visíveis a todos" on categorias for select using (true);
create policy "Tópicos visíveis a todos" on topicos for select using (true);
create policy "Topico_categorias visíveis a todos" on topico_categorias for select using (true);
create policy "Planos visíveis a todos" on planos for select using (true);

-- Prestadores: leitura pública; edição apenas pelo próprio prestador
alter table prestadores enable row level security;

create policy "Prestadores visíveis a todos" on prestadores for select using (true);
create policy "Prestador edita o próprio perfil" on prestadores
  for update using (auth.uid() = user_id);
create policy "Usuário cria seu próprio prestador" on prestadores
  for insert with check (auth.uid() = user_id);

-- Fotos: leitura pública; inserção apenas pelo dono do perfil
alter table fotos_prestador enable row level security;

create policy "Fotos visíveis a todos" on fotos_prestador for select using (true);
create policy "Prestador adiciona suas fotos" on fotos_prestador
  for insert with check (
    auth.uid() = (select user_id from prestadores where id = prestador_id)
  );
create policy "Prestador remove suas fotos" on fotos_prestador
  for delete using (
    auth.uid() = (select user_id from prestadores where id = prestador_id)
  );

-- Avaliações: leitura pública; qualquer usuário logado pode criar a sua
alter table avaliacoes enable row level security;

create policy "Avaliações visíveis a todos" on avaliacoes for select using (true);
create policy "Usuário logado cria avaliação" on avaliacoes
  for insert with check (auth.uid() = autor_user_id);

-- Assinaturas: apenas o próprio prestador (e admin futuramente) vê
alter table assinaturas enable row level security;

create policy "Prestador vê suas assinaturas" on assinaturas
  for select using (
    auth.uid() = (select user_id from prestadores where id = prestador_id)
  );

-- Mensagens: apenas cliente e prestador da conversa veem
alter table mensagens enable row level security;

create policy "Participantes veem mensagens" on mensagens
  for select using (
    auth.uid() = cliente_user_id
    or auth.uid() = (select user_id from prestadores where id = prestador_id)
  );
create policy "Participantes enviam mensagens" on mensagens
  for insert with check (
    auth.uid() = cliente_user_id
    or auth.uid() = (select user_id from prestadores where id = prestador_id)
  );
