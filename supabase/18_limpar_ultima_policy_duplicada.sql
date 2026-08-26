-- ============================================================
-- PRESTADOR — Última policy duplicada (ficou de fora do script 15)
-- ============================================================
-- creditos_cliente tinha 2 policies de SELECT idênticas, achada só
-- agora ao reconciliar o schema completo. Mantém "Cliente vê seus
-- créditos", remove a duplicata.
-- ============================================================

drop policy if exists "Cliente ve creditos" on creditos_cliente;
