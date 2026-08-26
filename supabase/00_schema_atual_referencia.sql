-- ============================================================
-- PRESTADOR — Referência do schema real (gerado a partir de auditoria)
-- ============================================================
-- Este arquivo é uma FOTOGRAFIA do banco de produção, montada a
-- partir de consultas reais em information_schema e pg_policies
-- (24/08/2026) — não é mais um "script numerado" de migração como os
-- outros (01 a 17). Aqueles continuam sendo o histórico real de como
-- o banco foi mudando; este arquivo é só para CONSULTA, pra saber o
-- que existe hoje sem precisar ler 17 arquivos em sequência.
--
-- supabase/01_schema.sql ficou desatualizado assim que o projeto
-- passou a crescer fora dele (tabelas e colunas criadas direto pelo
-- painel do Supabase, ou por scripts que não foram todos versionados
-- aqui). Esse é o motivo dos vários bugs que corrigimos nesta sessão
-- — o código confiava em colunas/relações que os scripts numerados
-- não documentavam.
--
-- NÃO rode este arquivo contra o banco de produção — ele é só
-- referência de leitura. Se um dia for usado pra criar um banco novo
-- (ex: ambiente de teste separado), revise as relações comentadas
-- (-- FK:) e adicione as constraints de fato antes de confiar nelas.
-- ============================================================


-- ============================================================
-- TABELAS
-- ============================================================

create table if not exists prestadores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,                                    -- FK: auth.users(id)
  nome text not null,
  email text,
  whatsapp text,
  categoria_id text,                                -- FK: categorias(id)
  cidade text,
  estado text,
  raio_atendimento integer default 30,
  idade integer,
  descricao text,
  servicos jsonb default '[]',
  disponivel boolean default true,
  plano_id text default 'basico',                   -- FK: planos(id)
  plano_status text default 'ativo',
  total_servicos integer default 0,
  tempo_resposta text,
  criado_em timestamptz default now(),
  dias_disponiveis jsonb default '{}',
  horarios_disponiveis jsonb default '{"inicio": "08:00", "fim": "18:00"}',
  foto_perfil text,
  latitude numeric,
  longitude numeric,
  lgpd_aceito boolean default false,
  lgpd_aceito_em timestamptz,
  geocodificado boolean default false,
  redes_sociais jsonb default '{}',
  mostrar_whatsapp boolean not null default true,   -- script 13
  meses_gratis_disponiveis integer not null default 0  -- script 17
);

-- VIEW: prestadores_completo — prestadores + médias de avaliação.
-- "select p.*" fica travado nas colunas que existiam quando a view
-- foi (re)criada — por isso o script 09 recria do zero sempre que
-- prestadores ganha coluna nova, e este script deve ser rodado de
-- novo se mais colunas forem adicionadas em prestadores no futuro.
drop view if exists prestadores_completo;
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
grant select on prestadores_completo to anon, authenticated;

create table if not exists categorias (
  id text primary key,
  nome text not null,
  emoji text,
  ordem integer default 0,
  personalizada boolean default false,
  topico_id text                                    -- FK: topicos(id)
);

create table if not exists topicos (
  id text primary key,
  nome text not null,
  icone text,
  emoji text,
  ordem integer
);

create table if not exists topico_categorias (
  topico_id text not null,                          -- FK: topicos(id)
  categoria_id text not null                         -- FK: categorias(id)
);

create table if not exists planos (
  id text primary key,
  nome text not null,
  preco numeric not null,
  descricao text,
  destaque boolean default false,
  recursos jsonb
);

create table if not exists pacotes_creditos (
  id text primary key,
  nome text not null,
  preco numeric not null,
  creditos integer not null,
  destaque boolean default false,
  ativo boolean default true
);

create table if not exists fotos_prestador (
  id uuid primary key default uuid_generate_v4(),
  prestador_id uuid,                                -- FK: prestadores(id)
  url text not null,
  tipo text default 'foto',
  criado_em timestamptz default now()
);

create table if not exists portfolio_prestador (
  id uuid primary key default uuid_generate_v4(),
  prestador_id uuid,                                -- FK: prestadores(id)
  url text not null,
  tipo text default 'foto',
  descricao text,
  ordem integer default 0,
  criado_em timestamptz default now()
);

create table if not exists servicos_prestador (
  id uuid primary key default uuid_generate_v4(),
  prestador_id uuid,                                -- FK: prestadores(id)
  tag text not null,
  criado_em timestamptz default now()
);

create table if not exists avaliacoes (
  id uuid primary key default uuid_generate_v4(),
  prestador_id uuid,                                -- FK: prestadores(id)
  autor_user_id uuid,                               -- FK: auth.users(id)
  autor_nome text not null,
  nota integer not null,
  pontualidade integer,
  qualidade integer,
  preco integer,
  limpeza integer,
  comentario text,
  criado_em timestamptz default now(),
  -- Segundo conjunto de dimensões de nota, lido em outro trecho do
  -- código (usePrestador em hooks.js) — não é usado no cálculo da
  -- média de prestadores_completo, que só olha pontualidade/
  -- qualidade/preco/limpeza acima. Duplicação histórica, não corrigida
  -- nesta sessão por não ser um bug (ambos os conjuntos funcionam
  -- isoladamente), só uma inconsistência de design a considerar limpar.
  preco_avaliacao integer,
  tempo_servico integer,
  higiene integer,
  comunicacao integer,
  conversa_id uuid,                                 -- FK: conversas(id)
  candidatura_id uuid                                -- FK: candidaturas(id)
);

create table if not exists midias_avaliacao (
  id uuid primary key default uuid_generate_v4(),
  avaliacao_id uuid,                                -- FK: avaliacoes(id)
  url text not null,
  tipo text default 'foto',
  criado_em timestamptz default now()
);

create table if not exists avaliacoes_cliente (
  id uuid primary key default uuid_generate_v4(),
  cliente_user_id uuid,                             -- FK: auth.users(id)
  prestador_id uuid,                                -- FK: prestadores(id)
  nota integer,
  comentario text,
  conversa_id uuid,                                 -- FK: conversas(id)
  criado_em timestamptz default now()
);

create table if not exists conversas (
  id uuid primary key default uuid_generate_v4(),
  prestador_id uuid,                                -- FK: prestadores(id)
  cliente_user_id uuid,                             -- FK: auth.users(id)
  cliente_nome text,
  cliente_foto_url text,                            -- script 10
  ultima_mensagem text,
  ultima_mensagem_em timestamptz default now(),
  nao_lidas_prestador integer default 0,
  nao_lidas_cliente integer default 0,
  criado_em timestamptz default now()
);

create table if not exists mensagens (
  id uuid primary key default uuid_generate_v4(),
  conversa_id uuid,                                 -- FK: conversas(id)
  prestador_id uuid,                                -- FK: prestadores(id)
  cliente_user_id uuid,                             -- FK: auth.users(id)
  remetente text not null,                          -- 'cliente' | 'prestador'
  texto text not null,
  lida boolean default false,
  criado_em timestamptz default now()
);

create table if not exists pedidos_servico (
  id uuid primary key default uuid_generate_v4(),
  cliente_user_id uuid,                             -- FK: auth.users(id)
  cliente_nome text not null,
  titulo text not null,
  descricao text,
  categoria_id text,                                -- FK: categorias(id)
  cidade text,
  estado text,
  orcamento_min numeric,
  orcamento_max numeric,
  prazo text,
  status text default 'aberto',                     -- aberto | em_andamento | cancelado | concluido
  valor_pago numeric default 9.00,
  pago boolean default false,
  criado_em timestamptz default now(),
  expira_em timestamptz default (now() + interval '30 days')
);

create table if not exists midias_pedido (
  id uuid primary key default uuid_generate_v4(),
  pedido_id uuid,                                   -- FK: pedidos_servico(id)
  url text not null,
  tipo text not null,
  criado_em timestamptz default now()
);

create table if not exists candidaturas (
  id uuid primary key default uuid_generate_v4(),
  pedido_id uuid,                                   -- FK: pedidos_servico(id)
  prestador_id uuid,                                -- FK: prestadores(id)
  mensagem text,
  valor_proposto numeric,
  prazo_proposto text,
  status text default 'pendente',                   -- pendente | aceito | recusado
  criado_em timestamptz default now()
);

create table if not exists historico_servicos (
  id uuid primary key default uuid_generate_v4(),
  cliente_user_id uuid,                             -- FK: auth.users(id)
  prestador_id uuid,                                -- FK: prestadores(id)
  titulo text not null,
  descricao text,
  categoria_id text,
  data_servico date,
  valor numeric,
  status text default 'concluido',
  fotos jsonb default '[]',
  criado_em timestamptz default now()
);

create table if not exists assinaturas (
  id uuid primary key default uuid_generate_v4(),
  prestador_id uuid,                                -- FK: prestadores(id)
  plano_id text,                                    -- FK: planos(id)
  status text default 'pendente',                   -- pendente | pago | atrasado | cancelado
  metodo_pagamento text,
  valor numeric,
  vencimento date,
  pago_em timestamptz,
  criado_em timestamptz default now(),
  -- Colunas de assinatura recorrente — existem no schema mas o fluxo
  -- atual (api/criar-cobranca.js) usa chargeTypes: ['DETACHED'], ou
  -- seja cobrança avulsa, não recorrente. Reservadas para se um dia a
  -- plataforma migrar pra cobrança automática mensal via Asaas.
  asaas_subscription_id text,
  proxima_cobranca date,
  recorrente boolean default false,
  data_vencimento date,
  tentativas_cobranca integer default 0,
  ultimo_pagamento date
);

create table if not exists boosts (
  id uuid primary key default uuid_generate_v4(),
  prestador_id uuid,                                -- FK: prestadores(id)
  plano text not null,                              -- '7dias' | '15dias' | '30dias'
  valor numeric not null,
  status text default 'pendente',
  inicio_em timestamptz,
  expira_em timestamptz,
  aparece_home boolean default true,
  aparece_busca boolean default true,
  criado_em timestamptz default now()
);

create table if not exists creditos_cliente (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,                                     -- FK: auth.users(id)
  creditos_disponiveis integer default 0,
  criado_em timestamptz default now()
);

create table if not exists compras_creditos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,                                     -- FK: auth.users(id)
  pacote_id text,                                   -- FK: pacotes_creditos(id)
  creditos integer not null,
  valor_pago numeric not null,
  status text default 'pendente'
  -- Nota: desde a migração pro Asaas Checkout, api/criar-cobranca.js
  -- não insere mais linha aqui antes de cobrar (ver commit da
  -- migração). O saldo real de créditos funciona (creditos_cliente é
  -- atualizado direto pelo webhook), só esta tabela de histórico de
  -- compra fica sem registrar as compras feitas via Checkout.
  , criado_em timestamptz default now()
);

create table if not exists perfis_cliente (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,                                     -- FK: auth.users(id)
  bio text,
  cidade text,
  estado text,
  telefone text,
  preferencias_servico text[] default '{}',
  notificacoes_email boolean default true,
  notificacoes_push boolean default true,
  perfil_publico boolean default true,
  redes_sociais jsonb default '{}',
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

create table if not exists notificacoes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,                                     -- FK: auth.users(id)
  titulo text not null,
  corpo text not null,
  tipo text not null,
  lida boolean default false,
  url text,
  criado_em timestamptz default now()
);

create table if not exists push_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,                                     -- FK: auth.users(id)
  token text not null,
  plataforma text default 'web',
  ativo boolean default true,
  criado_em timestamptz default now()
);

create table if not exists codigos_indicacao (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,                                     -- FK: auth.users(id)
  codigo text not null unique,
  tipo text not null,
  criado_em timestamptz default now(),
  -- Contadores denormalizados (total_indicados, indicados_ativos,
  -- meses_ganhos, embaixador) existem na tabela mas NENHUM código
  -- atual os mantém atualizados — Indicacao.jsx calcula tudo na hora,
  -- direto da tabela indicacoes. Ou ficam sem uso, ou é preciso
  -- decidir manter esses contadores em sincronia no futuro.
  total_indicados integer default 0,
  indicados_ativos integer default 0,
  meses_ganhos integer default 0,
  embaixador boolean default false
);

create table if not exists indicacoes (
  id uuid primary key default uuid_generate_v4(),
  codigo_id uuid,                                   -- FK: codigos_indicacao(id)
  indicador_user_id uuid,                           -- FK: auth.users(id)
  indicado_user_id uuid,                            -- FK: auth.users(id)
  tipo text not null,
  status text default 'pendente',                   -- pendente | ativo
  criado_em timestamptz default now(),
  ativado_em timestamptz,                           -- preenchido desde script 17 (api/webhook-asaas.js)
  recompensa_aplicada boolean default false          -- idem
);

create table if not exists termos_aceitos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,                                     -- FK: auth.users(id)
  versao text default '1.0',
  aceito_em timestamptz default now(),
  ip text
);

create table if not exists emails_log (
  id uuid primary key default uuid_generate_v4(),
  destinatario text not null,
  assunto text not null,
  tipo text not null,
  enviado boolean default false,
  criado_em timestamptz default now()
);

create table if not exists visualizacoes_perfil (
  id uuid primary key default uuid_generate_v4(),
  prestador_id uuid,                                -- FK: prestadores(id)
  criado_em timestamptz default now()
);

create table if not exists zonas_quentes (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  descricao text,
  tipo text not null,
  status text default 'pendente',
  cidade text not null,
  estado text not null,
  endereco text,
  latitude numeric,
  longitude numeric,
  raio_km integer default 10,
  categorias_demanda jsonb default '[]',
  data_inicio date,
  data_fim date,
  sugerido_por uuid,                                -- FK: auth.users(id)
  aprovado_por uuid,                                -- FK: auth.users(id)
  criado_em timestamptz default now()
);

create table if not exists zona_interesses (
  id uuid primary key default uuid_generate_v4(),
  zona_id uuid,                                     -- FK: zonas_quentes(id)
  prestador_id uuid,                                -- FK: prestadores(id)
  criado_em timestamptz default now()
);


-- ============================================================
-- FUNÇÕES (security definer — rodam com privilégio elevado,
-- por isso toda validação de negócio mora dentro delas)
-- ============================================================

-- debitar_credito() — script 06. Desconta 1 crédito do cliente logado,
-- nunca deixa ficar negativo.

-- resgatar_indicacao(p_codigo) — script 06. Valida o código, credita
-- 3 créditos pro indicado, registra a indicação como 'pendente'.

-- usar_mes_gratis() — script 17. Consome 1 mês do saldo de
-- meses_gratis_disponiveis do prestador logado e ativa o plano sem
-- cobrar na Asaas.

-- bloquear_edicao_plano_prestador() — script 06 (trigger). Impede que
-- o próprio prestador altere plano_id/plano_status/total_servicos
-- diretamente — só service role (webhooks) ou admin podem.


-- ============================================================
-- RLS — políticas ativas hoje (pós-limpeza do script 15)
-- ============================================================
-- Todas as 32 tabelas têm RLS ativado. Resumo por tabela (condição
-- completa de cada uma está nos scripts correspondentes — este é só
-- um índice de "quem pode o quê"):
--
-- prestadores        select: todos · insert/update: dono (user_id)
-- categorias/topicos/topico_categorias/planos/pacotes_creditos:
--                    select: todos (dados de referência, sem escrita
--                    pelo cliente)
-- fotos_prestador/portfolio_prestador/servicos_prestador:
--                    select: todos · insert/delete: dono do prestador
-- avaliacoes/avaliacoes_cliente/midias_avaliacao:
--                    select: todos · insert: autor
-- conversas          select/update: cliente ou prestador da conversa
--                    insert: cliente (cria a conversa)
-- mensagens          select/insert: cliente ou prestador da conversa
--                    (corrigido no script 12 — insert comparava
--                    prestador_id errado antes)
-- pedidos_servico    select: dono ou status='aberto' (público)
--                    insert/update: dono (cliente)
-- midias_pedido      select: todos · insert: dono do pedido
-- candidaturas       select: dono do pedido ou prestador candidato
--                    insert: prestador Premium
--                    update: prestador OU dono do pedido (script 14
--                    corrigiu a falta da segunda condição)
-- historico_servicos select/insert/update: cliente · select: prestador
-- assinaturas/boosts select: dono (prestador) · insert: dono
-- creditos_cliente/compras_creditos: select: dono (escrita só via
--                    service role)
-- perfis_cliente     select: dono ou perfil_publico=true
--                    insert/update: dono
-- notificacoes       select/update: dono (script 11)
-- push_tokens        all: dono (script 11)
-- codigos_indicacao  select/insert/update: dono
-- indicacoes         select: indicador ou indicado (confirmado por
--                    teste direto — texto exato da policy não
--                    recuperado nesta auditoria)
-- termos_aceitos     select/insert: dono
-- emails_log         select: só admin (e-mail fixo)
-- visualizacoes_perfil: insert: qualquer um (rastreio de visita)
--                    select: dono do prestador
-- zonas_quentes      select: todos · insert: qualquer logado
--                    update: só admin
-- zona_interesses    select: todos · insert/delete: dono do prestador
--
-- Políticas duplicadas (mesma condição, nomes diferentes) foram
-- removidas no script 15 em: assinaturas, conversas, candidaturas,
-- notificacoes, push_tokens, prestadores. creditos_cliente também
-- tinha 2 políticas de SELECT idênticas ("Cliente vê seus créditos" /
-- "Cliente ve creditos") que passaram despercebidas do script 15 —
-- inofensivo, mas fica registrado pra limpar quando for conveniente.
