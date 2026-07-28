-- ============================================================
-- PRESTADOR — Dados iniciais (seed)
-- ============================================================
-- Rode este script DEPOIS do 01_schema.sql, no SQL Editor do
-- Supabase. Ele popula categorias, tópicos, planos e alguns
-- prestadores de exemplo (os mesmos que já estavam no app).
-- ============================================================

-- ------------------------------------------------------------
-- CATEGORIAS (ordenadas por escassez de mão de obra)
-- ------------------------------------------------------------
insert into categorias (id, nome, emoji, ordem) values
  ('eletricista', 'Eletricista', '⚡', 1),
  ('pedreiro', 'Pedreiro', '🧱', 2),
  ('encanador', 'Encanador', '🚿', 3),
  ('marceneiro', 'Marceneiro', '🪚', 4),
  ('pintor', 'Pintor', '🎨', 5),
  ('mecanico', 'Mecânico', '🔧', 6),
  ('serralheiro', 'Serralheiro', '🔩', 7),
  ('arquiteto', 'Arquiteto', '📐', 8),
  ('vidraceiro', 'Vidraceiro', '🪟', 9),
  ('funileiro', 'Funileiro', '🚗', 10),
  ('jardineiro', 'Jardineiro', '🌿', 11),
  ('diarista', 'Diarista', '🧹', 12);

-- ------------------------------------------------------------
-- TÓPICOS (grupos amplos de busca)
-- ------------------------------------------------------------
insert into topicos (id, nome, icone) values
  ('construcao', 'Construção', 'ti-bricks'),
  ('residencial', 'Residencial', 'ti-home'),
  ('automotivo', 'Automotivo', 'ti-car'),
  ('reformas', 'Reformas', 'ti-hammer'),
  ('externos', 'Áreas externas', 'ti-plant-2');

-- Relações tópico -> categorias
insert into topico_categorias (topico_id, categoria_id) values
  ('construcao', 'pedreiro'), ('construcao', 'eletricista'), ('construcao', 'encanador'),
  ('construcao', 'pintor'), ('construcao', 'serralheiro'), ('construcao', 'vidraceiro'), ('construcao', 'arquiteto'),
  ('residencial', 'marceneiro'), ('residencial', 'pintor'), ('residencial', 'jardineiro'),
  ('residencial', 'diarista'), ('residencial', 'eletricista'), ('residencial', 'encanador'),
  ('automotivo', 'mecanico'), ('automotivo', 'funileiro'),
  ('reformas', 'pedreiro'), ('reformas', 'pintor'), ('reformas', 'marceneiro'),
  ('reformas', 'eletricista'), ('reformas', 'encanador'), ('reformas', 'arquiteto'), ('reformas', 'serralheiro'),
  ('externos', 'jardineiro'), ('externos', 'serralheiro'), ('externos', 'pintor');

-- ------------------------------------------------------------
-- PLANOS de assinatura
-- ------------------------------------------------------------
insert into planos (id, nome, preco, descricao, destaque, recursos) values
  ('basico', 'Básico', 49.00, 'Para quem está começando', false,
    '["Perfil na plataforma", "Até 10 fotos", "Chat com clientes", "5 categorias de serviço", "Suporte por e-mail"]'),
  ('profissional', 'Profissional', 99.00, 'O mais escolhido', true,
    '["Destaque nos resultados de busca", "Fotos ilimitadas", "Agenda integrada", "Categorias ilimitadas", "Selo de profissional verificado", "Suporte por chat"]'),
  ('premium', 'Premium', 199.00, 'Para máxima visibilidade', false,
    '["Topo das buscas na sua cidade", "Anúncio em destaque na home", "Relatórios de visitas e cliques", "Suporte prioritário 24h", "API para integração", "Badge exclusivo Premium"]');

-- ------------------------------------------------------------
-- PRESTADORES de exemplo
-- Observação: user_id fica NULL aqui porque ainda não existem
-- contas de autenticação para eles. Quando você criar logins
-- reais, vincule com "update prestadores set user_id = '...'".
-- ------------------------------------------------------------
insert into prestadores
  (nome, categoria_id, cidade, estado, raio_atendimento, idade, descricao, servicos, disponivel, plano_id, total_servicos, tempo_resposta)
values
  ('Carlos Mendes', 'pedreiro', 'Araraquara', 'SP', 50, 38,
    'Especialista em alvenaria, reboco e reformas residenciais. Trabalho com materiais de qualidade e prazo garantido.',
    '["Alvenaria", "Reboco", "Contrapiso", "Reforma"]', true, 'profissional', 143, '2h'),

  ('Ana Ferreira', 'arquiteto', 'Belo Horizonte', 'MG', 80, 35,
    'Arquiteta com 10 anos de experiência em projetos residenciais e comerciais. CREA ativo, seguro garantido.',
    '["Projeto residencial", "Reforma", "Interiores", "Laudos"]', true, 'premium', 78, '1h'),

  ('Roberto Silva', 'marceneiro', 'Rio de Janeiro', 'RJ', 40, 45,
    'Marceneiro há 15 anos. Móveis planejados, reparos e restaurações. Qualidade artesanal com preço justo.',
    '["Móveis planejados", "Restauração", "Portas e janelas", "Deck"]', true, 'basico', 56, '4h'),

  ('Lucas Prado', 'eletricista', 'São Paulo', 'SP', 30, 29,
    'Eletricista certificado NR10. Instalações residenciais e comerciais, laudos e quadro de distribuição.',
    '["Elétrica residencial", "AR Split", "Quadro elétrico", "Laudo SPDA"]', true, 'premium', 102, '1h');

-- ------------------------------------------------------------
-- FOTOS dos prestadores de exemplo
-- ------------------------------------------------------------
insert into fotos_prestador (prestador_id, url, ordem)
select id, url, ordem from (
  select
    (select id from prestadores where nome = 'Carlos Mendes') as id,
    unnest(array[
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=600&fit=crop'
    ]) as url,
    unnest(array[0,1,2,3]) as ordem
) t
union all
select id, url, ordem from (
  select
    (select id from prestadores where nome = 'Ana Ferreira') as id,
    unnest(array[
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1503387837-b154d5074bd2?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=600&fit=crop'
    ]) as url,
    unnest(array[0,1,2]) as ordem
) t
union all
select id, url, ordem from (
  select
    (select id from prestadores where nome = 'Roberto Silva') as id,
    unnest(array[
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1565372781818-39444b380083?w=600&h=600&fit=crop'
    ]) as url,
    unnest(array[0,1,2]) as ordem
) t
union all
select id, url, ordem from (
  select
    (select id from prestadores where nome = 'Lucas Prado') as id,
    unnest(array[
      'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1565608438257-fac3c27beb36?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&h=600&fit=crop'
    ]) as url,
    unnest(array[0,1,2]) as ordem
) t;

-- ------------------------------------------------------------
-- AVALIAÇÕES de exemplo
-- ------------------------------------------------------------
insert into avaliacoes (prestador_id, autor_nome, nota, pontualidade, qualidade, preco, limpeza, comentario)
values
  ((select id from prestadores where nome = 'Carlos Mendes'), 'Maria Oliveira', 5, 5, 5, 5, 5,
    'Excelente profissional! Reformou meu banheiro em 3 dias, limpou tudo e o resultado ficou incrível.'),
  ((select id from prestadores where nome = 'Carlos Mendes'), 'João Pedro', 5, 5, 5, 4, 5,
    'Fez o contrapiso da minha garagem. Pontual, honesto no orçamento. Recomendo muito!'),
  ((select id from prestadores where nome = 'Ana Ferreira'), 'Rafael Costa', 5, 5, 5, 4, 5,
    'Projeto do meu apartamento ficou sensacional. Detalhou tudo, acompanhou a obra do início ao fim.'),
  ((select id from prestadores where nome = 'Roberto Silva'), 'Carla Dias', 5, 4, 5, 5, 4,
    'Fez toda a marcenaria do meu apartamento. Prazo cumprido e acabamento impecável!'),
  ((select id from prestadores where nome = 'Lucas Prado'), 'Paulo Mota', 5, 5, 4, 4, 5,
    'Instalou 3 splits e refez o quadro elétrico. Trabalho limpo e seguro. Super recomendo.');
