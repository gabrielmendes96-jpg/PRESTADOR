-- ============================================================
-- PRESTADOR — Corrige UPDATE de candidaturas (aceitar proposta)
-- ============================================================
-- A única policy de UPDATE em candidaturas ("Prestador atualiza
-- candidatura") só permite o PRESTADOR alterar a linha. Mas quem
-- aceita/recusa uma candidatura é o CLIENTE, dono do pedido — o botão
-- "Aceitar" em DetalhePedido.jsx só aparece pra ele (ehDono). Sem essa
-- policy, o update é bloqueado silenciosamente pelo RLS e o clique em
-- "Aceitar" não tem efeito nenhum, sem nenhum aviso de erro.
--
-- Este script adiciona a policy que faltava, sem alterar a que já
-- existe pro prestador (as duas coexistem, cada uma libera um caso).
-- ============================================================

create policy "Dono do pedido atualiza candidatura" on candidaturas
  for update using (
    auth.uid() = (
      select cliente_user_id from pedidos_servico where id = candidaturas.pedido_id
    )
  );
