-- ============================================================
-- SERVIÇOS ESPECÍFICOS (catálogo) + GESTÃO DE CONVERSAS DO PRESTADOR
-- ============================================================
-- Hoje o cliente só escolhe uma categoria ("Eletricista") e digita um
-- título livre; o prestador só tem categoria + hashtags soltas. Este
-- script cria o elo que faltava:
--   servicos_catalogo   serviços concretos por categoria ("Troca de
--                       chuveiro elétrico", "Pintura de parede residencial")
--   prestador_servicos  os serviços que cada prestador marca que faz
--   pedidos_servico.servico_id  o serviço que o cliente escolheu ao pedir
--   conversas.servico_id/assunto/etapa  sobre o que é a conversa e em que
--                       ponto está (novo, em orçamento, agendado...)
--   respostas_rapidas   modelos de mensagem do prestador
--
-- Segurança (mesmas regras do resto do projeto):
--  - Catálogo é público pra leitura; só o admin escreve.
--  - O prestador só marca/desmarca serviços no PRÓPRIO perfil.
--  - Só o prestador dono da conversa muda a etapa dela (gatilho).
--  - pedidos_servico usa permissão por coluna (script 26): sem o grant
--    abaixo, o insert com servico_id seria recusado.
--
-- Pode rodar de novo sem problema (idempotente).
-- Copie este arquivo inteiro no SQL Editor do Supabase, aperte Ctrl+A
-- dentro do editor e clique em Run.
-- ============================================================

-- 1) Catálogo de serviços por categoria ------------------------------
create table if not exists servicos_catalogo (
  id uuid primary key default uuid_generate_v4(),
  categoria_id text not null references categorias(id) on delete cascade,
  nome text not null check (char_length(nome) between 3 and 80),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  unique (categoria_id, nome)
);
create index if not exists idx_servicos_catalogo_categoria on servicos_catalogo(categoria_id) where ativo;

alter table servicos_catalogo enable row level security;

drop policy if exists "catalogo: leitura publica" on servicos_catalogo;
create policy "catalogo: leitura publica" on servicos_catalogo
  for select to anon, authenticated using (ativo);

drop policy if exists "catalogo: admin gerencia" on servicos_catalogo;
create policy "catalogo: admin gerencia" on servicos_catalogo
  for all to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') = 'gabrielmendes96@gmail.com')
  with check (coalesce(auth.jwt() ->> 'email', '') = 'gabrielmendes96@gmail.com');

-- 2) Serviços que cada prestador faz ----------------------------------
create table if not exists prestador_servicos (
  prestador_id uuid not null references prestadores(id) on delete cascade,
  servico_id uuid not null references servicos_catalogo(id) on delete cascade,
  criado_em timestamptz not null default now(),
  primary key (prestador_id, servico_id)
);
create index if not exists idx_prestador_servicos_servico on prestador_servicos(servico_id);

alter table prestador_servicos enable row level security;

-- Pública pra leitura: aparece no perfil e alimenta a busca.
drop policy if exists "prestador_servicos: leitura publica" on prestador_servicos;
create policy "prestador_servicos: leitura publica" on prestador_servicos
  for select to anon, authenticated using (true);

drop policy if exists "prestador_servicos: dono marca" on prestador_servicos;
create policy "prestador_servicos: dono marca" on prestador_servicos
  for insert to authenticated
  with check (exists (select 1 from prestadores p where p.id = prestador_id and p.user_id = auth.uid()));

drop policy if exists "prestador_servicos: dono desmarca" on prestador_servicos;
create policy "prestador_servicos: dono desmarca" on prestador_servicos
  for delete to authenticated
  using (exists (select 1 from prestadores p where p.id = prestador_id and p.user_id = auth.uid()));

revoke update on prestador_servicos from authenticated, anon;
revoke insert, delete on prestador_servicos from anon;

-- 3) O serviço escolhido no pedido ------------------------------------
alter table pedidos_servico
  add column if not exists servico_id uuid references servicos_catalogo(id) on delete set null;

-- Permissão por coluna (ver script 26): o cliente precisa poder gravar
-- o serviço ao criar o pedido.
grant insert (servico_id) on pedidos_servico to authenticated;

-- 4) A conversa passa a ter assunto e etapa ---------------------------
alter table conversas
  add column if not exists servico_id uuid references servicos_catalogo(id) on delete set null,
  add column if not exists assunto text check (assunto is null or char_length(assunto) <= 200),
  add column if not exists etapa text not null default 'novo';

alter table conversas drop constraint if exists conversas_etapa_check;
alter table conversas add constraint conversas_etapa_check
  check (etapa in ('novo', 'em_orcamento', 'agendado', 'concluido', 'arquivado'));

-- Cliente e prestador conseguem atualizar a conversa (contadores, assunto),
-- mas a ETAPA é do prestador: gerir o funil dele não é assunto do cliente.
create or replace function conversa_proteger_etapa()
returns trigger
language plpgsql
as $$
begin
  if NEW.etapa is distinct from OLD.etapa and auth.role() <> 'service_role' then
    if not exists (
      select 1 from prestadores p where p.id = NEW.prestador_id and p.user_id = auth.uid()
    ) then
      raise exception 'Só o prestador pode mudar a etapa da conversa';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_conversa_proteger_etapa on conversas;
create trigger trg_conversa_proteger_etapa
  before update on conversas
  for each row execute function conversa_proteger_etapa();

-- 5) Respostas rápidas do prestador -----------------------------------
create table if not exists respostas_rapidas (
  id uuid primary key default uuid_generate_v4(),
  prestador_id uuid not null references prestadores(id) on delete cascade,
  titulo text not null check (char_length(titulo) between 2 and 40),
  texto text not null check (char_length(texto) between 2 and 1000),
  criado_em timestamptz not null default now()
);
create index if not exists idx_respostas_rapidas_prestador on respostas_rapidas(prestador_id);

alter table respostas_rapidas enable row level security;

drop policy if exists "respostas_rapidas: dono" on respostas_rapidas;
create policy "respostas_rapidas: dono" on respostas_rapidas
  for all to authenticated
  using (exists (select 1 from prestadores p where p.id = prestador_id and p.user_id = auth.uid()))
  with check (exists (select 1 from prestadores p where p.id = prestador_id and p.user_id = auth.uid()));

revoke all on respostas_rapidas from anon;

-- 6) Catálogo inicial -------------------------------------------------
-- Só entra serviço de categoria que existe. As demais categorias seguem
-- aceitando texto livre no pedido; o catálogo cresce pelo painel Admin.
with dados(categoria_id, nome) as (values
  ('eletricista', 'Troca de chuveiro elétrico'),
  ('eletricista', 'Instalação de tomadas e interruptores'),
  ('eletricista', 'Instalação de ventilador de teto'),
  ('eletricista', 'Instalação de luminárias e spots'),
  ('eletricista', 'Troca de fiação'),
  ('eletricista', 'Troca de disjuntor ou quadro de energia'),
  ('eletricista', 'Conserto de curto-circuito'),
  ('encanador', 'Conserto de vazamento'),
  ('encanador', 'Troca de torneira ou registro'),
  ('encanador', 'Instalação de vaso sanitário'),
  ('encanador', 'Reparo de descarga'),
  ('encanador', 'Instalação de caixa d''água'),
  ('encanador', 'Instalação de filtro ou purificador'),
  ('encanador', 'Troca de sifão e ralo'),
  ('pintor', 'Pintura de parede residencial'),
  ('pintor', 'Pintura de teto'),
  ('pintor', 'Pintura de apartamento completo'),
  ('pintor', 'Pintura de fachada'),
  ('pintor', 'Pintura de portão e grades'),
  ('pintor', 'Massa corrida e acabamento'),
  ('pintor', 'Aplicação de textura e grafiato'),
  ('pintor', 'Pintura de móveis'),
  ('pedreiro', 'Reforma de banheiro'),
  ('pedreiro', 'Reforma de cozinha'),
  ('pedreiro', 'Construção de muro'),
  ('pedreiro', 'Assentamento de piso e azulejo'),
  ('pedreiro', 'Reboco e alvenaria'),
  ('pedreiro', 'Ampliação de cômodo'),
  ('pedreiro', 'Pequenos reparos'),
  ('diarista', 'Limpeza residencial completa'),
  ('diarista', 'Limpeza pesada'),
  ('diarista', 'Limpeza de apartamento antes da mudança'),
  ('diarista', 'Passar roupa'),
  ('diarista', 'Limpeza pós-festa'),
  ('diarista', 'Organização de armários'),
  ('faxineira', 'Faxina residencial'),
  ('faxineira', 'Faxina pesada'),
  ('faxineira', 'Limpeza de escritório'),
  ('jardineiro', 'Corte de grama'),
  ('jardineiro', 'Poda de plantas e arbustos'),
  ('jardineiro', 'Manutenção mensal de jardim'),
  ('jardineiro', 'Plantio e paisagismo'),
  ('jardineiro', 'Adubação e tratamento de plantas'),
  ('marceneiro', 'Móveis planejados sob medida'),
  ('marceneiro', 'Reparo de móveis'),
  ('marceneiro', 'Montagem de móveis'),
  ('marceneiro', 'Instalação de prateleiras e nichos'),
  ('marceneiro', 'Troca de dobradiças e puxadores'),
  ('chaveiro', 'Abertura de porta'),
  ('chaveiro', 'Cópia de chaves'),
  ('chaveiro', 'Troca de fechadura'),
  ('chaveiro', 'Chave codificada de carro'),
  ('chaveiro', 'Instalação de fechadura digital'),
  ('ar_condicionado', 'Instalação de ar-condicionado'),
  ('ar_condicionado', 'Limpeza e higienização'),
  ('ar_condicionado', 'Manutenção preventiva'),
  ('ar_condicionado', 'Recarga de gás'),
  ('ar_condicionado', 'Conserto de ar-condicionado'),
  ('mecanico', 'Revisão completa'),
  ('mecanico', 'Troca de óleo e filtros'),
  ('mecanico', 'Freios'),
  ('mecanico', 'Suspensão e amortecedores'),
  ('mecanico', 'Diagnóstico de falhas'),
  ('mecanico', 'Troca de bateria'),
  ('tecnico_informatica', 'Formatação e instalação do Windows'),
  ('tecnico_informatica', 'Remoção de vírus'),
  ('tecnico_informatica', 'Upgrade e troca de peças'),
  ('tecnico_informatica', 'Instalação de rede e Wi-Fi'),
  ('tecnico_informatica', 'Recuperação de dados'),
  ('desentupidor', 'Desentupimento de pia'),
  ('desentupidor', 'Desentupimento de vaso sanitário'),
  ('desentupidor', 'Desentupimento de ralo'),
  ('desentupidor', 'Desentupimento de esgoto'),
  ('desentupidor', 'Limpeza de caixa de gordura'),
  ('vidraceiro', 'Box de banheiro'),
  ('vidraceiro', 'Troca de vidro quebrado'),
  ('vidraceiro', 'Espelhos sob medida'),
  ('vidraceiro', 'Portas e janelas de vidro'),
  ('vidraceiro', 'Guarda-corpo de vidro'),
  ('gesseiro', 'Forro de gesso'),
  ('gesseiro', 'Sanca e moldura'),
  ('gesseiro', 'Parede de drywall'),
  ('gesseiro', 'Reparo de gesso'),
  ('serralheiro', 'Portão de ferro'),
  ('serralheiro', 'Grades de proteção'),
  ('serralheiro', 'Corrimão e escada'),
  ('serralheiro', 'Cobertura metálica'),
  ('serralheiro', 'Reparo de portão'),
  ('azulejista', 'Assentamento de azulejo'),
  ('azulejista', 'Assentamento de porcelanato'),
  ('azulejista', 'Rejunte e reparo de revestimento'),
  ('azulejista', 'Aplicação de pastilha'),
  ('dedetizador', 'Dedetização residencial'),
  ('dedetizador', 'Controle de baratas'),
  ('dedetizador', 'Controle de formigas e cupins'),
  ('dedetizador', 'Desratização'),
  ('mudanca', 'Mudança residencial'),
  ('mudanca', 'Mudança de escritório'),
  ('mudanca', 'Transporte de móveis'),
  ('frete', 'Frete pequeno'),
  ('frete', 'Transporte de móveis e eletrodomésticos'),
  ('limpeza_pos_obra', 'Limpeza pós-obra residencial'),
  ('limpeza_pos_obra', 'Limpeza pós-obra comercial'),
  ('lavagem_sofa', 'Higienização de sofá'),
  ('lavagem_sofa', 'Higienização de colchão'),
  ('lavagem_sofa', 'Higienização de tapete'),
  ('lavagem_sofa', 'Higienização de cadeiras e poltronas'),
  ('cameras', 'Instalação de câmeras de segurança'),
  ('cameras', 'Manutenção de câmeras'),
  ('cameras', 'Configuração de acesso remoto'),
  ('painel_solar', 'Projeto e instalação de painel solar'),
  ('painel_solar', 'Limpeza e manutenção de placas'),
  ('automacao', 'Automação residencial'),
  ('automacao', 'Iluminação inteligente'),
  ('automacao', 'Cortinas automatizadas'),
  ('banheiro_reforma', 'Reforma completa de banheiro'),
  ('banheiro_reforma', 'Troca de revestimentos'),
  ('banheiro_reforma', 'Troca de louças e metais'),
  ('impermeabilizador', 'Impermeabilização de laje'),
  ('impermeabilizador', 'Impermeabilização de caixa d''água'),
  ('impermeabilizador', 'Tratamento de infiltração'),
  ('telhador', 'Troca de telhas'),
  ('telhador', 'Conserto de goteiras'),
  ('telhador', 'Calhas e rufos'),
  ('telhador', 'Telhado novo'),
  ('papel_parede', 'Aplicação de papel de parede'),
  ('papel_parede', 'Remoção de papel de parede'),
  ('portao_eletrico', 'Instalação de portão eletrônico'),
  ('portao_eletrico', 'Manutenção de portão eletrônico'),
  ('portao_eletrico', 'Troca de motor ou controle'),
  ('piscina_manutencao', 'Limpeza de piscina'),
  ('piscina_manutencao', 'Tratamento da água'),
  ('piscina_manutencao', 'Troca de filtro e areia'),
  ('gas', 'Instalação de gás'),
  ('gas', 'Conserto de vazamento de gás'),
  ('mestre_obras', 'Construção de casa'),
  ('mestre_obras', 'Reforma geral'),
  ('mestre_obras', 'Acompanhamento de obra'),
  ('arquiteto', 'Projeto residencial'),
  ('arquiteto', 'Projeto de reforma'),
  ('arquiteto', 'Regularização e aprovação na prefeitura'),
  ('designer_interiores', 'Projeto de interiores'),
  ('designer_interiores', 'Consultoria de decoração'),
  ('barbeiro', 'Corte masculino'),
  ('barbeiro', 'Barba'),
  ('barbeiro', 'Corte e barba'),
  ('cabeleireiro', 'Corte feminino'),
  ('cabeleireiro', 'Escova'),
  ('cabeleireiro', 'Coloração'),
  ('cabeleireiro', 'Hidratação e tratamento'),
  ('manicure', 'Manicure'),
  ('manicure', 'Pedicure'),
  ('manicure', 'Mãos e pés'),
  ('personal_trainer', 'Treino individual'),
  ('personal_trainer', 'Treino em dupla'),
  ('personal_trainer', 'Consultoria online'),
  ('professor_particular', 'Reforço escolar'),
  ('professor_particular', 'Preparação para vestibular e ENEM'),
  ('aula_ingles', 'Conversação em inglês'),
  ('aula_ingles', 'Inglês para viagem'),
  ('aula_ingles', 'Inglês para negócios'),
  ('fotografo_eventos', 'Fotografia de casamento'),
  ('fotografo_eventos', 'Fotografia de aniversário'),
  ('fotografo_eventos', 'Fotografia de evento corporativo'),
  ('confeiteiro', 'Bolo de aniversário'),
  ('confeiteiro', 'Doces para festa'),
  ('confeiteiro', 'Bolo de casamento'),
  ('buffet', 'Festa infantil'),
  ('buffet', 'Casamento'),
  ('buffet', 'Evento corporativo'),
  ('dj', 'DJ para casamento'),
  ('dj', 'DJ para aniversário'),
  ('veterinario_domicilio', 'Consulta veterinária em casa'),
  ('veterinario_domicilio', 'Vacinação'),
  ('banho_tosa', 'Banho'),
  ('banho_tosa', 'Tosa higiênica'),
  ('banho_tosa', 'Banho e tosa completa'),
  ('passeio_caes', 'Passeio individual'),
  ('passeio_caes', 'Passeio em grupo'),
  ('pet_sitter', 'Visita diária ao pet'),
  ('pet_sitter', 'Hospedagem do pet em casa'),
  ('cuidador_idoso', 'Cuidador diurno'),
  ('cuidador_idoso', 'Cuidador noturno'),
  ('cuidador_idoso', 'Acompanhamento em consultas'),
  ('contador', 'Abertura de empresa ou MEI'),
  ('contador', 'Declaração de imposto de renda'),
  ('contador', 'Contabilidade mensal'),
  ('advogado', 'Consulta jurídica'),
  ('advogado', 'Elaboração de contratos'),
  ('advogado', 'Direito do consumidor'),
  ('lavagem_auto', 'Lavagem simples'),
  ('lavagem_auto', 'Lavagem completa'),
  ('lavagem_auto', 'Higienização interna'),
  ('limpeza_caixa', 'Limpeza de caixa d''água'),
  ('interfone', 'Instalação de interfone'),
  ('interfone', 'Conserto de interfone'),
  ('persiana', 'Instalação de persiana'),
  ('persiana', 'Limpeza e conserto de persiana')
)
insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome
from dados d
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;
