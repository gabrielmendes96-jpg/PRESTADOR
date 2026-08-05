-- ============================================================
-- PRESTADOR — Visibilidade do WhatsApp (perk Premium + opt-out)
-- ============================================================
-- O botão "Chamar no WhatsApp" no perfil público (Perfil.jsx) passa a
-- só aparecer pra prestador do plano Premium (mesmo corte já usado
-- pra liberar candidatura a pedidos, ver DetalhePedido.jsx). Isso tira
-- o número de telefone da exposição pública automática pra quem não é
-- Premium, sem precisar de nenhuma configuração da parte deles.
--
-- Quem é Premium ainda pode preferir não expor o número (ex: quer
-- centralizar tudo no chat do app) — daí esta coluna, que por padrão
-- mantém o comportamento de hoje (visível) e só é usada quando o
-- prestador desativa manualmente no painel.
-- ============================================================

alter table prestadores add column if not exists mostrar_whatsapp boolean not null default true;
