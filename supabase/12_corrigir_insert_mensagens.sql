-- ============================================================
-- PRESTADOR — Corrige policy de INSERT em mensagens
-- ============================================================
-- A policy "Participantes enviam mensagens" (INSERT) em produção
-- compara auth.uid() = prestador_id, mas prestador_id na tabela
-- mensagens é o ID da LINHA do prestador (chave de prestadores.id),
-- não o user_id de autenticação dele — são UUIDs diferentes, então
-- essa condição nunca é verdadeira. Só cliente_user_id batia direto,
-- então só o cliente conseguia enviar mensagem; o prestador sempre
-- falhava silenciosamente (o insert é rejeitado pelo RLS, e o
-- código não verifica esse erro, então a mensagem some sem aviso).
--
-- A policy de SELECT já está correta (resolve o prestador via join
-- com conversas/prestadores) — este script só corrige o INSERT pra
-- seguir o mesmo padrão.
-- ============================================================

drop policy if exists "Participantes enviam mensagens" on mensagens;

create policy "Participantes enviam mensagens" on mensagens
  for insert with check (
    auth.uid() = cliente_user_id
    or auth.uid() = (
      select p.user_id
      from prestadores p
      join conversas c on c.prestador_id = p.id
      where c.id = mensagens.conversa_id
      limit 1
    )
  );
