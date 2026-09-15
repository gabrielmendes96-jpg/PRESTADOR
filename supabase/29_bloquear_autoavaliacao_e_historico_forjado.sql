-- ============================================================
-- BLOQUEAR AUTOAVALIAÇÃO e HISTÓRICO DE SERVIÇO FORJADO
-- ============================================================
-- Dois achados da revisão geral desta rodada, testados diretamente
-- contra o banco:
--
-- 1) Um prestador conseguia inserir uma avaliação sobre si mesmo
--    (autor_user_id = o próprio user_id do prestador), com nota máxima
--    em todos os critérios — fraude direta na reputação pública. A
--    policy de insert em `avaliacoes` só confere se quem está logado é
--    de fato o autor (`auth.uid() = autor_user_id`), mas nunca impede
--    que o autor seja o próprio prestador avaliado.
--
-- 2) Qualquer usuário autenticado conseguia inserir uma linha em
--    `historico_servicos` — inclusive vinculando um `cliente_user_id`
--    de outra pessoa, sem esse cliente nunca ter contratado nada. Essa
--    tabela só deveria ser escrita pelo backend (service role), via
--    api/_registrarServicoConcluido.js — nenhum lugar do código insere
--    nela pelo cliente direto.
--
-- Copie este arquivo inteiro no SQL Editor do Supabase e rode.
-- ============================================================

-- 1) Autoavaliação — bloqueia via trigger (mesmo padrão já usado nas
-- outras correções desta rodada): o autor não pode ser o dono do
-- prestador sendo avaliado.
create or replace function bloquear_autoavaliacao()
returns trigger
language plpgsql
as $$
declare
  v_user_id_prestador uuid;
begin
  if auth.role() <> 'service_role' then
    select user_id into v_user_id_prestador from prestadores where id = NEW.prestador_id;
    if v_user_id_prestador = NEW.autor_user_id then
      raise exception 'Você não pode avaliar seu próprio perfil';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_bloquear_autoavaliacao on avaliacoes;
create trigger trg_bloquear_autoavaliacao
  before insert or update on avaliacoes
  for each row execute function bloquear_autoavaliacao();

-- 2) Histórico de serviço — ninguém autenticado deveria inserir aqui
-- direto, só o backend. Revoga da tabela inteira (não de uma coluna —
-- ver o motivo documentado no script 26, revogar coluna isolada não
-- funciona quando já existe um grant de tabela inteira).
revoke insert on historico_servicos from authenticated;
revoke update on historico_servicos from authenticated;

-- 3) Boost — mesmo achado: testei e um prestador conseguia ativar o
-- próprio boost (30 dias, aparecendo em destaque na busca e na home) só
-- inserindo a linha direto, sem pagar nada. A ativação de verdade só
-- acontece via api/webhook-asaas.js (service role), depois da Asaas
-- confirmar o pagamento.
revoke insert on boosts from authenticated;
revoke update on boosts from authenticated;
