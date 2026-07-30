-- ============================================================
-- PRESTADOR — Endurecer políticas de RLS excessivamente abertas
-- ============================================================
-- A auditoria (04_auditoria_rls.sql) encontrou políticas com
-- "true" sem nenhuma condição — ou seja, qualquer pessoa com a
-- chave pública (anon key, já embutida no app) pode inserir ou
-- atualizar linhas dessas tabelas diretamente pela API do
-- Supabase, pulando completamente o app e as funções serverless.
--
-- Isso é sério porque permite, por exemplo, um usuário dar a si
-- mesmo créditos ilimitados ou marcar uma assinatura como paga
-- sem nunca ter pago nada — sem precisar de nenhuma falha no
-- código do app, só chamando a API do Supabase direto.
--
-- Verifiquei no código que nenhuma dessas políticas "abertas" é
-- necessária: toda escrita legítima que precisa valer para outro
-- usuário (confirmação de pagamento, envio de notificação de
-- chat, etc.) já passa pelas funções em /api, que usam a chave
-- de serviço (service role) — essa chave ignora RLS por padrão,
-- então remover essas políticas abertas não quebra nada que já
-- foi corrigido nesta rodada.
--
-- Copie este arquivo inteiro no SQL Editor do Supabase e rode.
-- ============================================================

-- assinaturas: só o backend (service role) deveria criar/atualizar
-- assinaturas. Hoje qualquer um podia inserir ou alterar o status
-- de qualquer assinatura direto pela API.
drop policy if exists "Sistema insere assinatura" on assinaturas;
drop policy if exists "Sistema atualiza assinatura" on assinaturas;

-- creditos_cliente: existiam políticas duplicadas — uma correta
-- (só o dono mexe nos próprios créditos) e uma "true" que abria
-- pra qualquer um dar créditos a si mesmo (ou a qualquer user_id).
-- Mantemos só a versão restrita ao dono.
drop policy if exists "Sistema insere creditos" on creditos_cliente;
drop policy if exists "Sistema atualiza creditos" on creditos_cliente;

-- indicacoes: quem registra a indicação é sempre o usuário indicado
-- (a pessoa que chegou pelo link/código), não o indicador — então
-- a regra certa é auth.uid() = indicado_user_id, não "true".
drop policy if exists "Sistema insere indicacao" on indicacoes;
create policy "Indicado registra sua indicacao" on indicacoes
  for insert with check (auth.uid() = indicado_user_id);

-- Nenhuma tela do app hoje atualiza indicações pelo lado do cliente
-- (isso ficaria a cargo de uma função de servidor no futuro), então
-- a política aberta de update pode ser removida com segurança.
drop policy if exists "Sistema atualiza indicacao" on indicacoes;

-- notificacoes: nenhuma tela do app insere notificação para outro
-- usuário diretamente (isso já passa pelas funções serverless,
-- que usam service role) — então cada um só deveria poder inserir
-- notificação para si mesmo.
drop policy if exists "Sistema insere notificacoes" on notificacoes;
create policy "Usuario insere sua propria notificacao" on notificacoes
  for insert with check (auth.uid() = user_id);

-- midias_avaliacao: em vez de liberar geral, só quem escreveu a
-- avaliação pode anexar mídia a ela.
drop policy if exists "Usuario adiciona midia" on midias_avaliacao;
create policy "Autor da avaliacao adiciona midia" on midias_avaliacao
  for insert with check (
    auth.uid() = (select autor_user_id from avaliacoes where id = avaliacao_id)
  );
