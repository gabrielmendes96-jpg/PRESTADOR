-- ============================================================
-- PRESTADOR — Remove policies de RLS duplicadas
-- ============================================================
-- A auditoria geral (04_auditoria_rls.sql) mostrou várias tabelas com
-- 2 ou 3 policies fazendo exatamente a mesma verificação, só com nome
-- diferente — sobra de scripts rodados em momentos diferentes ao
-- longo do projeto (cada um recriando sem checar se já existia algo
-- parecido). Isso não é um risco de segurança (o Postgres combina
-- policies do mesmo tipo com "OR", então duplicar não abre brecha),
-- mas deixa o banco confuso pra próxima vez que alguém for entender
-- ou alterar uma regra.
--
-- Este script mantém, pra cada tabela+operação, só UMA policy — a
-- que tem o nome mais descritivo ou a condição mais completa — e
-- remove as repetidas. Script SEGURO: nunca remove a última policy
-- de nenhuma combinação tabela+operação, só as sobras.
-- ============================================================

-- assinaturas (SELECT) — mantém "Prestador vê suas assinaturas"
drop policy if exists "Prestador ve assinatura" on assinaturas;

-- conversas (SELECT) — mantém "Participantes veem suas conversas"
drop policy if exists "Participantes veem conversas" on conversas;

-- candidaturas (SELECT) — mantém "Candidaturas visíveis"
drop policy if exists "Candidaturas visiveis" on candidaturas;

-- notificacoes (UPDATE) — mantém "Usuario marca suas notificacoes como lidas"
drop policy if exists "Usuario atualiza suas notificacoes" on notificacoes;

-- push_tokens (ALL) — mantém "Usuario gerencia seus tokens push" (tem with_check completo)
drop policy if exists "Usuario gerencia seus tokens" on push_tokens;

-- prestadores (INSERT) — mantém "Usuário cria seu próprio prestador"
drop policy if exists "Prestador insere proprio perfil" on prestadores;
drop policy if exists "Prestador insere seu perfil" on prestadores;

-- prestadores (SELECT) — mantém "Prestadores visíveis a todos"
drop policy if exists "Prestadores visiveis" on prestadores;

-- prestadores (UPDATE) — mantém "Prestador edita o próprio perfil"
drop policy if exists "Prestador edita proprio perfil" on prestadores;
drop policy if exists "Prestador edita seu perfil" on prestadores;
