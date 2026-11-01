-- 43 — Termos alternativos (sinônimos) por categoria
--
-- Ex.: quem busca "faz tudo" também encontra "Marido de Aluguel"; "bombeiro hidráulico" encontra Encanador;
-- "oficina" encontra Mecânico. Os termos ficam em "termos" (texto livre, separado por vírgula) e a busca usa
-- a cópia sem acento e minúscula, "termos_busca", mantida sozinha pelo banco.
-- Aditivo: o app atual continua funcionando. Pode ser executado mais de uma vez.
begin;

alter table categorias add column if not exists termos text not null default '';
alter table categorias add column if not exists termos_busca text generated always as (public.sem_acento(termos)) stored;

commit;
