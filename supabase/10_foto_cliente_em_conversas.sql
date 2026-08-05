-- ============================================================
-- PRESTADOR — Foto do cliente nas conversas (chat)
-- ============================================================
-- A foto do cliente vive só em auth.user_metadata (não é uma tabela
-- consultável por outros usuários). O mesmo problema já existia pro
-- nome, e a solução em uso é gravar um snapshot na própria linha de
-- conversas no momento em que ela é criada (coluna cliente_nome,
-- preenchida em src/pages/Perfil.jsx). Este script adiciona a coluna
-- equivalente para a foto, seguindo o mesmo padrão — sem precisar de
-- nenhuma policy nova, porque o prestador já pode ler as linhas de
-- conversas das quais participa.
--
-- Limitação aceita (igual à do nome): é a foto de quando a conversa
-- começou. Se o cliente trocar de foto depois, conversas antigas não
-- atualizam.
-- ============================================================

alter table conversas add column if not exists cliente_foto_url text;
