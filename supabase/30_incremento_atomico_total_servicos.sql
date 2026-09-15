-- ============================================================
-- CONDIÇÃO DE CORRIDA no contador de serviços realizados
-- ============================================================
-- api/_registrarServicoConcluido.js incrementa prestadores.total_servicos
-- lendo o valor atual e escrevendo de volta +1 em duas chamadas
-- separadas (select, depois update). Se dois pedidos do MESMO prestador
-- forem concluídos quase ao mesmo tempo (plausível pra um prestador
-- popular, com vários serviços em andamento), as duas execuções podem
-- ler o mesmo valor antes de qualquer uma escrever — o incremento de uma
-- delas se perde, e o contador público fica sub-contado.
--
-- Corrige com uma função que faz o incremento na mesma instrução SQL
-- (`total_servicos = total_servicos + 1`), que o Postgres já garante
-- atômica por linha, mesmo sob concorrência.
--
-- Copie este arquivo inteiro no SQL Editor do Supabase e rode.
-- ============================================================

create or replace function incrementar_total_servicos(p_prestador_id uuid)
returns void
language sql
as $$
  update prestadores set total_servicos = total_servicos + 1 where id = p_prestador_id;
$$;

grant execute on function incrementar_total_servicos(uuid) to service_role;
