-- 35: catálogo completo de serviços (todas as categorias)
-- Gerado por scripts/seed-catalogo.mjs a partir de supabase/seed/catalogo-servicos.mjs.
-- Pode ser rodado mais de uma vez: o que já existe é ignorado.

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('eletricista', 'Troca de lâmpadas e luminárias'),
  ('eletricista', 'Instalação de ventilador de teto'),
  ('eletricista', 'Instalação de tomadas e interruptores'),
  ('eletricista', 'Instalação de chuveiro ou torneira elétrica'),
  ('eletricista', 'Troca de chuveiro elétrico'),
  ('eletricista', 'Instalação de quadro de disjuntores'),
  ('eletricista', 'Instalação de ponto de tomada novo'),
  ('eletricista', 'Reparo de curto-circuito'),
  ('eletricista', 'Instalação de luminárias e spots'),
  ('eletricista', 'Instalação de campainha e interfone'),
  ('eletricista', 'Instalação elétrica completa'),
  ('eletricista', 'Instalação de carregador de carro elétrico'),
  ('eletricista', 'Aterramento elétrico'),
  ('eletricista', 'Revisão elétrica da casa')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('encanador', 'Conserto de vazamento'),
  ('encanador', 'Troca de torneira'),
  ('encanador', 'Troca de registro'),
  ('encanador', 'Instalação de vaso sanitário'),
  ('encanador', 'Instalação de pia e cuba'),
  ('encanador', 'Troca de sifão e flexível'),
  ('encanador', 'Reparo de caixa de descarga'),
  ('encanador', 'Instalação de máquina de lavar'),
  ('encanador', 'Instalação de chuveiro e ducha'),
  ('encanador', 'Instalação de filtro e purificador'),
  ('encanador', 'Desentupimento'),
  ('encanador', 'Instalação de caixa d''água'),
  ('encanador', 'Troca de tubulação'),
  ('encanador', 'Instalação de aquecedor')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('papel_parede', 'Aplicação de papel de parede'),
  ('papel_parede', 'Remoção de papel de parede'),
  ('papel_parede', 'Papel de parede em sala'),
  ('papel_parede', 'Papel de parede em quarto'),
  ('papel_parede', 'Papel de parede lavável'),
  ('papel_parede', 'Papel de parede vinílico'),
  ('papel_parede', 'Papel de parede 3D'),
  ('papel_parede', 'Aplicação de painel fotográfico'),
  ('papel_parede', 'Papel de parede em quarto infantil'),
  ('papel_parede', 'Aplicação em teto e nichos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('acupuntura', 'Sessão de acupuntura sistêmica'),
  ('acupuntura', 'Acupuntura para dor nas costas'),
  ('acupuntura', 'Acupuntura para ansiedade e estresse'),
  ('acupuntura', 'Acupuntura para enxaqueca'),
  ('acupuntura', 'Acupuntura estética'),
  ('acupuntura', 'Auriculoterapia'),
  ('acupuntura', 'Moxabustão'),
  ('acupuntura', 'Ventosaterapia'),
  ('acupuntura', 'Acupuntura para insônia'),
  ('acupuntura', 'Atendimento a domicílio')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('adesivo_decorativo', 'Adesivo de parede decorativo'),
  ('adesivo_decorativo', 'Adesivo para vidro e box'),
  ('adesivo_decorativo', 'Adesivo para geladeira e eletrodomésticos'),
  ('adesivo_decorativo', 'Adesivo de porta e móveis'),
  ('adesivo_decorativo', 'Plotagem de vitrine'),
  ('adesivo_decorativo', 'Adesivo de parede infantil'),
  ('adesivo_decorativo', 'Adesivo personalizado com frase'),
  ('adesivo_decorativo', 'Remoção de adesivos'),
  ('adesivo_decorativo', 'Aplicação de película decorativa'),
  ('adesivo_decorativo', 'Adesivo para azulejo')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('petisco', 'Adestramento básico (senta, deita, fica)'),
  ('petisco', 'Adestramento de filhote'),
  ('petisco', 'Correção de latido excessivo'),
  ('petisco', 'Correção de agressividade e medo'),
  ('petisco', 'Adestramento para passeio com guia'),
  ('petisco', 'Treino de ficar sozinho em casa'),
  ('petisco', 'Adestramento em domicílio'),
  ('petisco', 'Pacote de aulas mensais'),
  ('petisco', 'Socialização de cães'),
  ('petisco', 'Orientação para tutores')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('adestrador', 'Adestramento básico (senta, deita, fica)'),
  ('adestrador', 'Adestramento de filhote'),
  ('adestrador', 'Correção de latido excessivo'),
  ('adestrador', 'Correção de agressividade e medo'),
  ('adestrador', 'Adestramento para passeio com guia'),
  ('adestrador', 'Treino de ficar sozinho em casa'),
  ('adestrador', 'Adestramento em domicílio'),
  ('adestrador', 'Pacote de aulas mensais'),
  ('adestrador', 'Socialização de cães'),
  ('adestrador', 'Orientação para tutores')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('ajuste_roupa', 'Barra de calça'),
  ('ajuste_roupa', 'Barra de saia e vestido'),
  ('ajuste_roupa', 'Ajuste de cintura'),
  ('ajuste_roupa', 'Ajuste de manga'),
  ('ajuste_roupa', 'Troca de zíper'),
  ('ajuste_roupa', 'Conserto de rasgos e furos'),
  ('ajuste_roupa', 'Ajuste de camisa e blazer'),
  ('ajuste_roupa', 'Reforma de roupa'),
  ('ajuste_roupa', 'Apertar ou alargar roupa'),
  ('ajuste_roupa', 'Troca de forro'),
  ('ajuste_roupa', 'Colocação de botões e ilhós')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('alarme', 'Instalação de alarme residencial'),
  ('alarme', 'Instalação de alarme comercial'),
  ('alarme', 'Alarme com sensor de presença'),
  ('alarme', 'Alarme sem fio'),
  ('alarme', 'Manutenção de alarme'),
  ('alarme', 'Troca de bateria e sensores'),
  ('alarme', 'Integração com monitoramento 24h'),
  ('alarme', 'Alarme com sirene e aviso no celular'),
  ('alarme', 'Cerca de perímetro'),
  ('alarme', 'Programação de senhas e controles')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('alfaiate', 'Terno sob medida'),
  ('alfaiate', 'Camisa sob medida'),
  ('alfaiate', 'Ajuste de terno e paletó'),
  ('alfaiate', 'Barra de calça social'),
  ('alfaiate', 'Ajuste de colete e blazer'),
  ('alfaiate', 'Reforma de terno'),
  ('alfaiate', 'Conserto de forro e bolsos'),
  ('alfaiate', 'Traje de noivo e padrinhos'),
  ('alfaiate', 'Troca de botões e zíper'),
  ('alfaiate', 'Aviamento e reparos finos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('alinhamento', 'Alinhamento de direção'),
  ('alinhamento', 'Balanceamento de rodas'),
  ('alinhamento', 'Alinhamento e balanceamento'),
  ('alinhamento', 'Cambagem e cáster'),
  ('alinhamento', 'Revisão de suspensão'),
  ('alinhamento', 'Troca de amortecedores'),
  ('alinhamento', 'Diagnóstico de vibração no volante'),
  ('alinhamento', 'Rodízio de pneus'),
  ('alinhamento', 'Alinhamento 3D'),
  ('alinhamento', 'Geometria para veículos pesados')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('animador', 'Recreação infantil'),
  ('animador', 'Animação de festa de aniversário'),
  ('animador', 'Personagens vivos (fantasias)'),
  ('animador', 'Pintura facial'),
  ('animador', 'Escultura em balão'),
  ('animador', 'Brincadeiras e gincanas'),
  ('animador', 'Mágico e show de mágica'),
  ('animador', 'Teatro de fantoches'),
  ('animador', 'Palhaço'),
  ('animador', 'Recreação em eventos corporativos'),
  ('animador', 'Oficinas e atividades infantis')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('aquecedor', 'Instalação de aquecedor a gás'),
  ('aquecedor', 'Instalação de aquecedor elétrico'),
  ('aquecedor', 'Manutenção de aquecedor'),
  ('aquecedor', 'Instalação de boiler'),
  ('aquecedor', 'Troca de resistência'),
  ('aquecedor', 'Conserto de aquecedor solar'),
  ('aquecedor', 'Limpeza de aquecedor'),
  ('aquecedor', 'Troca de aquecedor antigo'),
  ('aquecedor', 'Revisão de segurança do gás'),
  ('aquecedor', 'Instalação de aquecedor de passagem')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('ar_condicionado', 'Instalação de ar-condicionado split'),
  ('ar_condicionado', 'Manutenção preventiva'),
  ('ar_condicionado', 'Limpeza e higienização'),
  ('ar_condicionado', 'Carga de gás'),
  ('ar_condicionado', 'Conserto de ar-condicionado'),
  ('ar_condicionado', 'Remoção e reinstalação'),
  ('ar_condicionado', 'Instalação de ar-condicionado de janela'),
  ('ar_condicionado', 'Troca de capacitor e placa'),
  ('ar_condicionado', 'Instalação de infraestrutura (tubulação)'),
  ('ar_condicionado', 'Reparo de vazamento de água')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('ar_auto', 'Recarga de gás do ar-condicionado automotivo'),
  ('ar_auto', 'Higienização do ar-condicionado'),
  ('ar_auto', 'Troca de filtro de cabine'),
  ('ar_auto', 'Conserto de compressor'),
  ('ar_auto', 'Troca de condensador'),
  ('ar_auto', 'Diagnóstico de ar fraco'),
  ('ar_auto', 'Limpeza do evaporador'),
  ('ar_auto', 'Reparo de vazamento no sistema'),
  ('ar_auto', 'Troca de ventoinha'),
  ('ar_auto', 'Revisão completa do ar')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('aula_artes_marciais', 'Aula de jiu-jitsu'),
  ('aula_artes_marciais', 'Aula de judô'),
  ('aula_artes_marciais', 'Aula de karatê'),
  ('aula_artes_marciais', 'Aula de muay thai'),
  ('aula_artes_marciais', 'Aula de boxe'),
  ('aula_artes_marciais', 'Aula de taekwondo'),
  ('aula_artes_marciais', 'Aula de capoeira'),
  ('aula_artes_marciais', 'Aula de krav maga e defesa pessoal'),
  ('aula_artes_marciais', 'Aula infantil'),
  ('aula_artes_marciais', 'Aula particular individual'),
  ('aula_artes_marciais', 'Aula em grupo')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('artesao', 'Peças artesanais sob encomenda'),
  ('artesao', 'Artesanato em crochê e tricô'),
  ('artesao', 'Artesanato em madeira'),
  ('artesao', 'Artesanato em cerâmica e argila'),
  ('artesao', 'Lembrancinhas personalizadas'),
  ('artesao', 'Macramê'),
  ('artesao', 'Bordado à mão'),
  ('artesao', 'Artesanato em resina'),
  ('artesao', 'Decoração artesanal'),
  ('artesao', 'Oficina de artesanato'),
  ('artesao', 'Biscuit')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('aula_culinaria', 'Aula de culinária básica'),
  ('aula_culinaria', 'Aula de confeitaria'),
  ('aula_culinaria', 'Aula de panificação'),
  ('aula_culinaria', 'Aula de culinária italiana'),
  ('aula_culinaria', 'Aula de culinária japonesa'),
  ('aula_culinaria', 'Aula de comida saudável'),
  ('aula_culinaria', 'Aula de churrasco'),
  ('aula_culinaria', 'Aula de culinária vegana'),
  ('aula_culinaria', 'Aula para casais ou grupos'),
  ('aula_culinaria', 'Aula em domicílio')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('aula_danca', 'Aula de dança de salão'),
  ('aula_danca', 'Aula de forró'),
  ('aula_danca', 'Aula de samba'),
  ('aula_danca', 'Aula de zouk'),
  ('aula_danca', 'Aula de ballet'),
  ('aula_danca', 'Aula de dança do ventre'),
  ('aula_danca', 'Aula de hip hop'),
  ('aula_danca', 'Aula de dança para casais (casamento)'),
  ('aula_danca', 'Aula de dança infantil'),
  ('aula_danca', 'Aula de ritmos'),
  ('aula_danca', 'Aula particular')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('aula_espanhol', 'Espanhol básico'),
  ('aula_espanhol', 'Espanhol intermediário e avançado'),
  ('aula_espanhol', 'Conversação em espanhol'),
  ('aula_espanhol', 'Espanhol para viagem'),
  ('aula_espanhol', 'Espanhol para negócios'),
  ('aula_espanhol', 'Preparação para DELE'),
  ('aula_espanhol', 'Espanhol para crianças'),
  ('aula_espanhol', 'Aula online'),
  ('aula_espanhol', 'Reforço escolar de espanhol'),
  ('aula_espanhol', 'Aula particular em domicílio')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('aula_informatica', 'Aula de informática básica'),
  ('aula_informatica', 'Aula de Word e Excel'),
  ('aula_informatica', 'Aula de internet e e-mail'),
  ('aula_informatica', 'Aula de celular para idosos'),
  ('aula_informatica', 'Aula de Excel avançado'),
  ('aula_informatica', 'Aula de PowerPoint e apresentações'),
  ('aula_informatica', 'Aula de edição de fotos e vídeos'),
  ('aula_informatica', 'Aula particular em domicílio'),
  ('aula_informatica', 'Aula online'),
  ('aula_informatica', 'Informática para concursos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('aula_informatica_edu', 'Aula de informática básica'),
  ('aula_informatica_edu', 'Aula de Word e Excel'),
  ('aula_informatica_edu', 'Aula de internet e e-mail'),
  ('aula_informatica_edu', 'Aula de celular para idosos'),
  ('aula_informatica_edu', 'Aula de Excel avançado'),
  ('aula_informatica_edu', 'Aula de PowerPoint e apresentações'),
  ('aula_informatica_edu', 'Aula de edição de fotos e vídeos'),
  ('aula_informatica_edu', 'Aula particular em domicílio'),
  ('aula_informatica_edu', 'Aula online'),
  ('aula_informatica_edu', 'Informática para concursos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('aula_ingles', 'Inglês básico'),
  ('aula_ingles', 'Inglês intermediário e avançado'),
  ('aula_ingles', 'Inglês para crianças'),
  ('aula_ingles', 'Preparação para TOEFL e IELTS'),
  ('aula_ingles', 'Inglês para entrevistas de emprego'),
  ('aula_ingles', 'Reforço escolar de inglês'),
  ('aula_ingles', 'Aula online'),
  ('aula_ingles', 'Aula particular em domicílio')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('aula_matematica', 'Reforço de matemática (fundamental)'),
  ('aula_matematica', 'Matemática para ensino médio'),
  ('aula_matematica', 'Preparação para ENEM e vestibular'),
  ('aula_matematica', 'Matemática para concursos'),
  ('aula_matematica', 'Cálculo 1 e 2'),
  ('aula_matematica', 'Álgebra linear'),
  ('aula_matematica', 'Estatística'),
  ('aula_matematica', 'Matemática financeira'),
  ('aula_matematica', 'Preparação para olimpíadas'),
  ('aula_matematica', 'Aula online')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('aula_musica', 'Aula de teclado e piano'),
  ('aula_musica', 'Aula de canto'),
  ('aula_musica', 'Aula de bateria'),
  ('aula_musica', 'Aula de baixo'),
  ('aula_musica', 'Aula de guitarra'),
  ('aula_musica', 'Aula de violino'),
  ('aula_musica', 'Aula de flauta e sopro'),
  ('aula_musica', 'Teoria musical'),
  ('aula_musica', 'Musicalização infantil'),
  ('aula_musica', 'Aula de cavaquinho e ukulele'),
  ('aula_musica', 'Aula em domicílio')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('aula_portugues', 'Reforço de português'),
  ('aula_portugues', 'Redação para ENEM'),
  ('aula_portugues', 'Gramática e interpretação de texto'),
  ('aula_portugues', 'Português para concursos'),
  ('aula_portugues', 'Revisão de TCC e trabalhos'),
  ('aula_portugues', 'Português para estrangeiros'),
  ('aula_portugues', 'Alfabetização de adultos'),
  ('aula_portugues', 'Alfabetização infantil'),
  ('aula_portugues', 'Literatura para vestibular'),
  ('aula_portugues', 'Aula online')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('aula_violao', 'Violão para iniciantes'),
  ('aula_violao', 'Violão popular'),
  ('aula_violao', 'Violão clássico'),
  ('aula_violao', 'Aula de cifras e acordes'),
  ('aula_violao', 'Aula de violão infantil'),
  ('aula_violao', 'Aula de fingerstyle'),
  ('aula_violao', 'Aula de violão para adultos'),
  ('aula_violao', 'Aula online'),
  ('aula_violao', 'Aula em domicílio'),
  ('aula_violao', 'Teoria musical aplicada')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('automacao', 'Automação de iluminação'),
  ('automacao', 'Automação de cortinas e persianas'),
  ('automacao', 'Instalação de assistente de voz'),
  ('automacao', 'Controle de ar-condicionado por app'),
  ('automacao', 'Fechadura digital'),
  ('automacao', 'Automação de portão e garagem'),
  ('automacao', 'Sistema de som ambiente'),
  ('automacao', 'Cenas e rotinas inteligentes'),
  ('automacao', 'Projeto de automação completo')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('azulejista', 'Assentamento de piso cerâmico'),
  ('azulejista', 'Revestimento de parede'),
  ('azulejista', 'Revestimento de cozinha'),
  ('azulejista', 'Revestimento de fachada'),
  ('azulejista', 'Reparo de rejunte'),
  ('azulejista', 'Troca de peças quebradas'),
  ('azulejista', 'Assentamento de cerâmica em área externa'),
  ('azulejista', 'Aplicação de revestimento 3D')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('bartender', 'Open bar para festa'),
  ('bartender', 'Drinks clássicos e autorais'),
  ('bartender', 'Coquetel para casamento'),
  ('bartender', 'Barman para evento corporativo'),
  ('bartender', 'Caipirinhas e batidas'),
  ('bartender', 'Carta de drinks personalizada'),
  ('bartender', 'Bar completo com equipamentos'),
  ('bartender', 'Workshop de drinks'),
  ('bartender', 'Drinks sem álcool'),
  ('bartender', 'Barman para aniversário')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('bolo_decorado', 'Bolo decorado infantil'),
  ('bolo_decorado', 'Bolo de aniversário temático'),
  ('bolo_decorado', 'Bolo de casamento'),
  ('bolo_decorado', 'Bolo com topo personalizado'),
  ('bolo_decorado', 'Bolo de chá de bebê'),
  ('bolo_decorado', 'Bolo de revelação (chá revelação)'),
  ('bolo_decorado', 'Bolo de formatura'),
  ('bolo_decorado', 'Bolo de 15 anos'),
  ('bolo_decorado', 'Mesa de doces completa'),
  ('bolo_decorado', 'Naked cake')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('bomba_agua', 'Instalação de bomba d''água'),
  ('bomba_agua', 'Conserto de bomba d''água'),
  ('bomba_agua', 'Troca de pressurizador'),
  ('bomba_agua', 'Manutenção de bomba de poço'),
  ('bomba_agua', 'Instalação de bomba de piscina'),
  ('bomba_agua', 'Troca de bomba de recalque'),
  ('bomba_agua', 'Instalação de bomba para cisterna'),
  ('bomba_agua', 'Troca de flutuador'),
  ('bomba_agua', 'Revisão do sistema hidráulico'),
  ('bomba_agua', 'Bomba para aproveitamento de água da chuva')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('borracheiro', 'Troca de pneus'),
  ('borracheiro', 'Conserto de furo'),
  ('borracheiro', 'Calibragem de pneus'),
  ('borracheiro', 'Vulcanização'),
  ('borracheiro', 'Troca de pneu na rua (socorro)'),
  ('borracheiro', 'Rodízio de pneus'),
  ('borracheiro', 'Balanceamento de rodas'),
  ('borracheiro', 'Remendo em pneu'),
  ('borracheiro', 'Troca de válvula'),
  ('borracheiro', 'Borracharia móvel 24h')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('box_banheiro', 'Instalação de box de vidro'),
  ('box_banheiro', 'Troca de box de banheiro'),
  ('box_banheiro', 'Box de vidro temperado sob medida'),
  ('box_banheiro', 'Box de acrílico'),
  ('box_banheiro', 'Reparo de roldanas e vedação'),
  ('box_banheiro', 'Box articulado'),
  ('box_banheiro', 'Box de correr'),
  ('box_banheiro', 'Box com ferragem especial'),
  ('box_banheiro', 'Troca de vedação'),
  ('box_banheiro', 'Instalação de cortina de box')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('brinquedos', 'Aluguel de pula-pula'),
  ('brinquedos', 'Aluguel de piscina de bolinhas'),
  ('brinquedos', 'Aluguel de tobogã inflável'),
  ('brinquedos', 'Aluguel de cama elástica'),
  ('brinquedos', 'Aluguel de castelo inflável'),
  ('brinquedos', 'Aluguel de brinquedos para festa'),
  ('brinquedos', 'Aluguel de mesas e cadeiras infantis'),
  ('brinquedos', 'Cinema ao ar livre'),
  ('brinquedos', 'Brinquedos para eventos corporativos'),
  ('brinquedos', 'Pacote de brinquedos para festa')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('buffet', 'Festa infantil'),
  ('buffet', 'Casamento'),
  ('buffet', 'Evento corporativo'),
  ('buffet', 'Aniversário adulto'),
  ('buffet', 'Formatura'),
  ('buffet', 'Churrasco para eventos'),
  ('buffet', 'Coquetel'),
  ('buffet', 'Festa de 15 anos'),
  ('buffet', 'Jantar de confraternização'),
  ('buffet', 'Coffee break')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('cabeleireiro', 'Corte feminino'),
  ('cabeleireiro', 'Corte masculino'),
  ('cabeleireiro', 'Coloração'),
  ('cabeleireiro', 'Escova'),
  ('cabeleireiro', 'Hidratação e tratamento'),
  ('cabeleireiro', 'Progressiva e selagem'),
  ('cabeleireiro', 'Mechas e luzes'),
  ('cabeleireiro', 'Corte infantil'),
  ('cabeleireiro', 'Penteado simples'),
  ('cabeleireiro', 'Cauterização'),
  ('cabeleireiro', 'Tratamento capilar'),
  ('cabeleireiro', 'Corte na casa do cliente')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('caixa_agua', 'Instalação de caixa d''água'),
  ('caixa_agua', 'Troca de caixa d''água'),
  ('caixa_agua', 'Limpeza e higienização'),
  ('caixa_agua', 'Impermeabilização da caixa'),
  ('caixa_agua', 'Instalação de boia'),
  ('caixa_agua', 'Reparo de caixa d''água'),
  ('caixa_agua', 'Instalação de caixa d''água elevada'),
  ('caixa_agua', 'Conserto de vazamento na caixa'),
  ('caixa_agua', 'Instalação de cisterna'),
  ('caixa_agua', 'Aumento de capacidade')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('calcada', 'Calçada em concreto'),
  ('calcada', 'Calçada em pedra portuguesa'),
  ('calcada', 'Calçada em piso intertravado'),
  ('calcada', 'Reforma de calçada'),
  ('calcada', 'Rebaixamento de guia para garagem'),
  ('calcada', 'Piso externo antiderrapante'),
  ('calcada', 'Calçada em pedra'),
  ('calcada', 'Reparo de rachaduras'),
  ('calcada', 'Drenagem de calçada'),
  ('calcada', 'Piso de garagem')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('carpinteiro', 'Telhado de madeira (estrutura)'),
  ('carpinteiro', 'Portas e janelas de madeira'),
  ('carpinteiro', 'Pergolado de madeira'),
  ('carpinteiro', 'Troca de madeiramento do telhado'),
  ('carpinteiro', 'Deck de madeira'),
  ('carpinteiro', 'Assoalho e piso de madeira'),
  ('carpinteiro', 'Forro de madeira'),
  ('carpinteiro', 'Escada de madeira'),
  ('carpinteiro', 'Reparo em vigas e caibros'),
  ('carpinteiro', 'Cercas e portões de madeira'),
  ('carpinteiro', 'Formas de madeira para concreto')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('carregador', 'Carregamento de caminhão'),
  ('carregador', 'Descarregamento de mercadorias'),
  ('carregador', 'Ajudante de mudança'),
  ('carregador', 'Carregador para obras'),
  ('carregador', 'Montagem e desmontagem de móveis'),
  ('carregador', 'Transporte de móveis pesados'),
  ('carregador', 'Mão de obra por hora'),
  ('carregador', 'Carregador para eventos'),
  ('carregador', 'Ajudante para entrega'),
  ('carregador', 'Carregador de materiais de construção')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('cerca_eletrica', 'Instalação de cerca elétrica'),
  ('cerca_eletrica', 'Manutenção de cerca elétrica'),
  ('cerca_eletrica', 'Troca de central e bateria'),
  ('cerca_eletrica', 'Cerca elétrica para muro'),
  ('cerca_eletrica', 'Cerca concertina'),
  ('cerca_eletrica', 'Cerca elétrica rural'),
  ('cerca_eletrica', 'Reparo de fios e isoladores'),
  ('cerca_eletrica', 'Revisão de aterramento'),
  ('cerca_eletrica', 'Ampliação de cerca existente'),
  ('cerca_eletrica', 'Integração com alarme')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('cerimonialista', 'Cerimonial de casamento'),
  ('cerimonialista', 'Assessoria de casamento (dia do evento)'),
  ('cerimonialista', 'Cerimonial de formatura'),
  ('cerimonialista', 'Cerimonial de 15 anos'),
  ('cerimonialista', 'Assessoria completa de evento'),
  ('cerimonialista', 'Cerimonial corporativo'),
  ('cerimonialista', 'Cerimonial de aniversário'),
  ('cerimonialista', 'Cerimonial de batizado'),
  ('cerimonialista', 'Planejamento de cerimônia'),
  ('cerimonialista', 'Cerimonial de bodas')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('cftv_seguranca', 'Instalação de câmeras de segurança'),
  ('cftv_seguranca', 'Central de monitoramento 24h'),
  ('cftv_seguranca', 'Monitoramento remoto de imóvel'),
  ('cftv_seguranca', 'Projeto de CFTV'),
  ('cftv_seguranca', 'Manutenção preventiva de CFTV'),
  ('cftv_seguranca', 'Instalação de DVR/NVR'),
  ('cftv_seguranca', 'Câmeras com leitura de placa'),
  ('cftv_seguranca', 'Acesso remoto pelo celular'),
  ('cftv_seguranca', 'Cerca virtual e análise de vídeo'),
  ('cftv_seguranca', 'Ampliação de sistema existente')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('cftv', 'Instalação de câmeras de segurança'),
  ('cftv', 'Central de monitoramento 24h'),
  ('cftv', 'Monitoramento remoto de imóvel'),
  ('cftv', 'Projeto de CFTV'),
  ('cftv', 'Manutenção preventiva de CFTV'),
  ('cftv', 'Instalação de DVR/NVR'),
  ('cftv', 'Câmeras com leitura de placa'),
  ('cftv', 'Acesso remoto pelo celular'),
  ('cftv', 'Cerca virtual e análise de vídeo'),
  ('cftv', 'Ampliação de sistema existente')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('chaveiro', 'Abertura de portas'),
  ('chaveiro', 'Abertura de carro'),
  ('chaveiro', 'Cópia de chaves'),
  ('chaveiro', 'Troca de fechadura'),
  ('chaveiro', 'Troca de segredo'),
  ('chaveiro', 'Chaveiro 24 horas'),
  ('chaveiro', 'Chave codificada de carro'),
  ('chaveiro', 'Instalação de fechadura digital'),
  ('chaveiro', 'Conserto de fechadura'),
  ('chaveiro', 'Chave tetra'),
  ('chaveiro', 'Abertura de cofre')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('chef_domicilio', 'Jantar completo em casa'),
  ('chef_domicilio', 'Almoço para eventos'),
  ('chef_domicilio', 'Jantar romântico'),
  ('chef_domicilio', 'Churrasco com chef'),
  ('chef_domicilio', 'Menu degustação'),
  ('chef_domicilio', 'Chef para aniversário'),
  ('chef_domicilio', 'Chef para confraternização'),
  ('chef_domicilio', 'Aulas e jantar interativo'),
  ('chef_domicilio', 'Cardápio italiano'),
  ('chef_domicilio', 'Cardápio japonês'),
  ('chef_domicilio', 'Cardápio fitness')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('churrasqueira', 'Construção de churrasqueira'),
  ('churrasqueira', 'Reforma de churrasqueira'),
  ('churrasqueira', 'Churrasqueira de alvenaria'),
  ('churrasqueira', 'Churrasqueira em área gourmet'),
  ('churrasqueira', 'Instalação de coifa e duto'),
  ('churrasqueira', 'Churrasqueira a gás'),
  ('churrasqueira', 'Churrasqueira de tijolinho'),
  ('churrasqueira', 'Forno de pizza e churrasqueira'),
  ('churrasqueira', 'Bancada gourmet'),
  ('churrasqueira', 'Revestimento de churrasqueira')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('churrasqueiro', 'Churrasco para festas'),
  ('churrasqueiro', 'Churrasco em casa'),
  ('churrasqueiro', 'Churrasco corporativo'),
  ('churrasqueiro', 'Churrasco com buffet completo'),
  ('churrasqueiro', 'Assador por hora'),
  ('churrasqueiro', 'Churrasco para casamento'),
  ('churrasqueiro', 'Costela fogo de chão'),
  ('churrasqueiro', 'Churrasco com serviço de garçom'),
  ('churrasqueiro', 'Espeto corrido'),
  ('churrasqueiro', 'Churrasco para pequenos grupos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('closet', 'Closet sob medida'),
  ('closet', 'Closet planejado completo'),
  ('closet', 'Armário de quarto planejado'),
  ('closet', 'Closet aberto'),
  ('closet', 'Closet com iluminação'),
  ('closet', 'Reforma de closet'),
  ('closet', 'Closet em L e U'),
  ('closet', 'Sapateira e gaveteiros'),
  ('closet', 'Closet para quarto pequeno'),
  ('closet', 'Projeto 3D de closet')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('personal_coach', 'Coaching de carreira'),
  ('personal_coach', 'Coaching de vida'),
  ('personal_coach', 'Mentoria para empreendedores'),
  ('personal_coach', 'Coaching de emagrecimento'),
  ('personal_coach', 'Coaching financeiro'),
  ('personal_coach', 'Orientação profissional'),
  ('personal_coach', 'Mentoria para liderança'),
  ('personal_coach', 'Coaching de relacionamentos'),
  ('personal_coach', 'Preparação para entrevista de emprego'),
  ('personal_coach', 'Sessões de desenvolvimento pessoal')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('cobertura', 'Pergolado'),
  ('cobertura', 'Cobertura de garagem'),
  ('cobertura', 'Cobertura de policarbonato'),
  ('cobertura', 'Cobertura de área gourmet'),
  ('cobertura', 'Cobertura de madeira'),
  ('cobertura', 'Toldo retrátil'),
  ('cobertura', 'Cobertura de varanda'),
  ('cobertura', 'Telhado de vidro'),
  ('cobertura', 'Cobertura em estrutura metálica'),
  ('cobertura', 'Cobertura para piscina')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('colorista', 'Coloração completa'),
  ('colorista', 'Mechas e luzes'),
  ('colorista', 'Balayage'),
  ('colorista', 'Descoloração'),
  ('colorista', 'Retoque de raiz'),
  ('colorista', 'Cabelo platinado'),
  ('colorista', 'Cabelos fantasia (coloridos)'),
  ('colorista', 'Tonalização'),
  ('colorista', 'Correção de cor'),
  ('colorista', 'Mechas californianas'),
  ('colorista', 'Camuflagem de fios brancos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('concreto', 'Laje de concreto'),
  ('concreto', 'Contrapiso'),
  ('concreto', 'Piso de concreto'),
  ('concreto', 'Concretagem de sapata e viga'),
  ('concreto', 'Concreto usinado (fornecimento)'),
  ('concreto', 'Concretagem de calçada'),
  ('concreto', 'Concreto polido'),
  ('concreto', 'Concretagem de pilares'),
  ('concreto', 'Bombeamento de concreto'),
  ('concreto', 'Reparo estrutural em concreto')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('confeiteiro_ali', 'Bolo de aniversário'),
  ('confeiteiro_ali', 'Bolo de casamento'),
  ('confeiteiro_ali', 'Bolo personalizado (tema)'),
  ('confeiteiro_ali', 'Doces finos para festa'),
  ('confeiteiro_ali', 'Brigadeiros gourmet'),
  ('confeiteiro_ali', 'Cupcakes e mini bolos'),
  ('confeiteiro_ali', 'Torta doce'),
  ('confeiteiro_ali', 'Bolo no pote'),
  ('confeiteiro_ali', 'Naked cake'),
  ('confeiteiro_ali', 'Cento de docinhos'),
  ('confeiteiro_ali', 'Pão de mel recheado'),
  ('confeiteiro_ali', 'Sobremesas para eventos'),
  ('confeiteiro_ali', 'Bolo sem glúten ou sem lactose'),
  ('confeiteiro_ali', 'Ovos de Páscoa artesanais')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('confeiteiro', 'Bolo de aniversário'),
  ('confeiteiro', 'Bolo de casamento'),
  ('confeiteiro', 'Bolo personalizado (tema)'),
  ('confeiteiro', 'Doces finos para festa'),
  ('confeiteiro', 'Brigadeiros gourmet'),
  ('confeiteiro', 'Cupcakes e mini bolos'),
  ('confeiteiro', 'Torta doce'),
  ('confeiteiro', 'Bolo no pote'),
  ('confeiteiro', 'Naked cake'),
  ('confeiteiro', 'Cento de docinhos'),
  ('confeiteiro', 'Pão de mel recheado'),
  ('confeiteiro', 'Sobremesas para eventos'),
  ('confeiteiro', 'Bolo sem glúten ou sem lactose'),
  ('confeiteiro', 'Ovos de Páscoa artesanais')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('vazamento', 'Caça-vazamento'),
  ('vazamento', 'Conserto de vazamento em parede'),
  ('vazamento', 'Conserto de vazamento em laje'),
  ('vazamento', 'Reparo de cano estourado'),
  ('vazamento', 'Vazamento em torneira e registro'),
  ('vazamento', 'Vazamento em caixa de descarga'),
  ('vazamento', 'Vazamento em tubulação de gás'),
  ('vazamento', 'Detecção de vazamento com termografia'),
  ('vazamento', 'Vazamento em chuveiro'),
  ('vazamento', 'Vazamento em piscina')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('consultor_financeiro', 'Organização do orçamento pessoal'),
  ('consultor_financeiro', 'Planejamento de aposentadoria'),
  ('consultor_financeiro', 'Consultoria de investimentos'),
  ('consultor_financeiro', 'Saída das dívidas (renegociação)'),
  ('consultor_financeiro', 'Planejamento financeiro familiar'),
  ('consultor_financeiro', 'Consultoria financeira para MEI'),
  ('consultor_financeiro', 'Educação financeira'),
  ('consultor_financeiro', 'Planejamento para compra de imóvel'),
  ('consultor_financeiro', 'Planejamento tributário'),
  ('consultor_financeiro', 'Fluxo de caixa para pequenos negócios')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('contador', 'Abertura de empresa ou MEI'),
  ('contador', 'Contabilidade mensal'),
  ('contador', 'Declaração de imposto de renda'),
  ('contador', 'Regularização de CNPJ'),
  ('contador', 'Imposto de renda atrasado'),
  ('contador', 'Declaração anual do MEI'),
  ('contador', 'Folha de pagamento'),
  ('contador', 'Planejamento tributário'),
  ('contador', 'Emissão de notas fiscais'),
  ('contador', 'Encerramento de empresa')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('controle_pragas', 'Controle de baratas'),
  ('controle_pragas', 'Controle de formigas'),
  ('controle_pragas', 'Controle de cupins'),
  ('controle_pragas', 'Controle de ratos e camundongos'),
  ('controle_pragas', 'Controle de pulgas e carrapatos'),
  ('controle_pragas', 'Controle de escorpiões'),
  ('controle_pragas', 'Controle de mosquitos e dengue'),
  ('controle_pragas', 'Controle de pombos'),
  ('controle_pragas', 'Controle de aranhas'),
  ('controle_pragas', 'Imunização de ambientes'),
  ('controle_pragas', 'Contrato de controle periódico')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('corretor_imoveis', 'Venda de imóvel'),
  ('corretor_imoveis', 'Aluguel de imóvel'),
  ('corretor_imoveis', 'Avaliação de imóvel'),
  ('corretor_imoveis', 'Compra de imóvel'),
  ('corretor_imoveis', 'Regularização e documentação'),
  ('corretor_imoveis', 'Consultoria de financiamento'),
  ('corretor_imoveis', 'Imóveis na planta'),
  ('corretor_imoveis', 'Aluguel por temporada'),
  ('corretor_imoveis', 'Locação comercial'),
  ('corretor_imoveis', 'Administração de imóveis')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('corte_grama', 'Corte de grama residencial'),
  ('corte_grama', 'Corte de grama em terreno'),
  ('corte_grama', 'Manutenção mensal de jardim'),
  ('corte_grama', 'Acabamento de bordas'),
  ('corte_grama', 'Corte de grama alta (roçada)'),
  ('corte_grama', 'Adubação de gramado'),
  ('corte_grama', 'Remoção de ervas daninhas'),
  ('corte_grama', 'Aparagem de cerca viva'),
  ('corte_grama', 'Corte de grama em condomínio'),
  ('corte_grama', 'Plantio de grama em placas')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('costureira', 'Barra de calça'),
  ('costureira', 'Ajuste de roupa'),
  ('costureira', 'Conserto de roupas'),
  ('costureira', 'Roupas sob medida'),
  ('costureira', 'Costura de cortinas'),
  ('costureira', 'Confecção de uniformes'),
  ('costureira', 'Troca de zíper'),
  ('costureira', 'Reforma de roupas'),
  ('costureira', 'Costura de lençóis e capas'),
  ('costureira', 'Fantasias'),
  ('costureira', 'Bordado')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('costureira_noiva', 'Vestido de noiva sob medida'),
  ('costureira_noiva', 'Ajuste de vestido de noiva'),
  ('costureira_noiva', 'Reforma de vestido de noiva'),
  ('costureira_noiva', 'Vestido de madrinha'),
  ('costureira_noiva', 'Vestido de debutante'),
  ('costureira_noiva', 'Vestido de formatura'),
  ('costureira_noiva', 'Aplicação de bordados e pedrarias'),
  ('costureira_noiva', 'Vestido de daminha'),
  ('costureira_noiva', 'Customização de vestido'),
  ('costureira_noiva', 'Conserto de véu e arranjos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('cozinha_planejada', 'Cozinha planejada completa'),
  ('cozinha_planejada', 'Armários de cozinha sob medida'),
  ('cozinha_planejada', 'Reforma de cozinha'),
  ('cozinha_planejada', 'Cozinha americana integrada'),
  ('cozinha_planejada', 'Bancadas e ilhas de cozinha'),
  ('cozinha_planejada', 'Troca de portas e frentes dos armários'),
  ('cozinha_planejada', 'Cozinha pequena otimizada'),
  ('cozinha_planejada', 'Cozinha gourmet'),
  ('cozinha_planejada', 'Projeto 3D de cozinha'),
  ('cozinha_planejada', 'Instalação de coifa e cooktop')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('cozinheiro', 'Cozinheiro por dia'),
  ('cozinheiro', 'Cozinheiro para festas'),
  ('cozinheiro', 'Marmitas da semana'),
  ('cozinheiro', 'Cozinheiro para casa de campo'),
  ('cozinheiro', 'Almoço de família'),
  ('cozinheiro', 'Cozinheiro para eventos'),
  ('cozinheiro', 'Cardápio fitness'),
  ('cozinheiro', 'Cozinhar para o mês (meal prep)'),
  ('cozinheiro', 'Cozinheiro para confraternização'),
  ('cozinheiro', 'Jantar especial')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('cuidador_idoso', 'Cuidador diurno'),
  ('cuidador_idoso', 'Cuidador noturno'),
  ('cuidador_idoso', 'Acompanhamento em consultas'),
  ('cuidador_idoso', 'Cuidador 24 horas'),
  ('cuidador_idoso', 'Auxílio na higiene e alimentação'),
  ('cuidador_idoso', 'Administração de medicamentos'),
  ('cuidador_idoso', 'Companhia e atividades'),
  ('cuidador_idoso', 'Cuidador pós-cirúrgico'),
  ('cuidador_idoso', 'Cuidador para idoso acamado'),
  ('cuidador_idoso', 'Cuidador para fim de semana')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('customizacao', 'Customização de roupas'),
  ('customizacao', 'Customização de tênis'),
  ('customizacao', 'Pintura em jeans e camisetas'),
  ('customizacao', 'Customização de móveis'),
  ('customizacao', 'Customização de bolsas e mochilas'),
  ('customizacao', 'Customização de capacetes'),
  ('customizacao', 'Customização de acessórios'),
  ('customizacao', 'Customização de objetos de decoração'),
  ('customizacao', 'Aplicação de patches e bordados'),
  ('customizacao', 'Customização de violão e instrumentos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('madeira_deck', 'Deck de madeira para área externa'),
  ('madeira_deck', 'Deck para piscina'),
  ('madeira_deck', 'Deck de madeira plástica'),
  ('madeira_deck', 'Reforma e verniz de deck'),
  ('madeira_deck', 'Deck suspenso'),
  ('madeira_deck', 'Pergolado com deck'),
  ('madeira_deck', 'Deck para varanda'),
  ('madeira_deck', 'Troca de tábuas'),
  ('madeira_deck', 'Impermeabilização de deck'),
  ('madeira_deck', 'Deck sobre laje')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('decorador', 'Decoração de festa infantil'),
  ('decorador', 'Decoração de casamento'),
  ('decorador', 'Decoração de aniversário'),
  ('decorador', 'Decoração de 15 anos'),
  ('decorador', 'Decoração de chá de bebê'),
  ('decorador', 'Decoração com balões'),
  ('decorador', 'Decoração de formatura'),
  ('decorador', 'Decoração de eventos corporativos'),
  ('decorador', 'Decoração de mesa posta'),
  ('decorador', 'Aluguel de itens decorativos'),
  ('decorador', 'Decoração de batizado')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('dedetizador', 'Dedetização residencial'),
  ('dedetizador', 'Dedetização comercial'),
  ('dedetizador', 'Controle de baratas'),
  ('dedetizador', 'Controle de formigas e cupins'),
  ('dedetizador', 'Desratização'),
  ('dedetizador', 'Controle de pulgas e carrapatos'),
  ('dedetizador', 'Controle de escorpiões'),
  ('dedetizador', 'Dedetização de condomínio'),
  ('dedetizador', 'Tratamento de cupim em madeira'),
  ('dedetizador', 'Nebulização contra mosquitos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('depilacao', 'Depilação com cera'),
  ('depilacao', 'Depilação de axilas'),
  ('depilacao', 'Depilação de pernas'),
  ('depilacao', 'Depilação de buço'),
  ('depilacao', 'Depilação íntima'),
  ('depilacao', 'Depilação masculina'),
  ('depilacao', 'Depilação com linha'),
  ('depilacao', 'Depilação a laser'),
  ('depilacao', 'Depilação de sobrancelha'),
  ('depilacao', 'Depilação em domicílio')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('desentupidor', 'Desentupimento de pia'),
  ('desentupidor', 'Desentupimento de vaso sanitário'),
  ('desentupidor', 'Desentupimento de ralos'),
  ('desentupidor', 'Desentupimento de esgoto'),
  ('desentupidor', 'Limpeza de caixa de gordura'),
  ('desentupidor', 'Desentupimento com máquina'),
  ('desentupidor', 'Desentupimento de ralo de box'),
  ('desentupidor', 'Videoinspeção de tubulação'),
  ('desentupidor', 'Desentupimento de caixa de inspeção'),
  ('desentupidor', 'Desentupimento de rede pluvial')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('desenvolvimento_web', 'Criação de site institucional'),
  ('desenvolvimento_web', 'Criação de loja virtual'),
  ('desenvolvimento_web', 'Landing page'),
  ('desenvolvimento_web', 'Manutenção de site'),
  ('desenvolvimento_web', 'Site para profissionais autônomos'),
  ('desenvolvimento_web', 'Criação de blog'),
  ('desenvolvimento_web', 'Integração de pagamentos'),
  ('desenvolvimento_web', 'Otimização para o Google (SEO)'),
  ('desenvolvimento_web', 'Sistema web sob medida'),
  ('desenvolvimento_web', 'Migração de hospedagem'),
  ('desenvolvimento_web', 'Correção de erros em site')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('design_grafico', 'Criação de logotipo'),
  ('design_grafico', 'Identidade visual completa'),
  ('design_grafico', 'Cartão de visita'),
  ('design_grafico', 'Panfleto e folder'),
  ('design_grafico', 'Banner e material de redes sociais'),
  ('design_grafico', 'Embalagem e rótulo'),
  ('design_grafico', 'Cardápio digital ou impresso'),
  ('design_grafico', 'Convite digital'),
  ('design_grafico', 'Apresentação em PowerPoint'),
  ('design_grafico', 'Manual de marca'),
  ('design_grafico', 'Arte para camisetas')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('designer_interiores', 'Consultoria de decoração'),
  ('designer_interiores', 'Projeto de interiores'),
  ('designer_interiores', 'Projeto 3D'),
  ('designer_interiores', 'Decoração de sala'),
  ('designer_interiores', 'Decoração de quarto'),
  ('designer_interiores', 'Home staging para venda'),
  ('designer_interiores', 'Escolha de móveis e cores'),
  ('designer_interiores', 'Projeto de iluminação'),
  ('designer_interiores', 'Decoração de cozinha'),
  ('designer_interiores', 'Projeto comercial'),
  ('designer_interiores', 'Acompanhamento de obra')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('designer_sobrancelha', 'Design de sobrancelha'),
  ('designer_sobrancelha', 'Design com henna'),
  ('designer_sobrancelha', 'Design com linha'),
  ('designer_sobrancelha', 'Design com pinça'),
  ('designer_sobrancelha', 'Coloração de sobrancelha'),
  ('designer_sobrancelha', 'Brow lamination'),
  ('designer_sobrancelha', 'Micropigmentação de sobrancelha'),
  ('designer_sobrancelha', 'Design masculino'),
  ('designer_sobrancelha', 'Sobrancelha para noivas'),
  ('designer_sobrancelha', 'Correção de falhas')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('despachante', 'Transferência de veículo'),
  ('despachante', 'Licenciamento e IPVA'),
  ('despachante', 'Segunda via de documentos'),
  ('despachante', 'Emplacamento'),
  ('despachante', 'Regularização de veículo'),
  ('despachante', 'Multas e recursos'),
  ('despachante', 'Documentação de imóvel'),
  ('despachante', 'CNH e renovação'),
  ('despachante', 'Regularização de motos'),
  ('despachante', 'Baixa de veículo'),
  ('despachante', 'Vistoria veicular')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('desratizacao', 'Desratização residencial'),
  ('desratizacao', 'Desratização comercial'),
  ('desratizacao', 'Controle de ratos em esgoto'),
  ('desratizacao', 'Eliminação de ratos em forro'),
  ('desratizacao', 'Desratização de condomínio'),
  ('desratizacao', 'Desratização rural e galpões'),
  ('desratizacao', 'Armadilhas e iscas seguras'),
  ('desratizacao', 'Vedação de acessos'),
  ('desratizacao', 'Monitoramento periódico'),
  ('desratizacao', 'Descontaminação pós-infestação')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('diarista', 'Limpeza de casa completa'),
  ('diarista', 'Limpeza de apartamento'),
  ('diarista', 'Passar roupa'),
  ('diarista', 'Lavar roupa'),
  ('diarista', 'Limpeza de cozinha'),
  ('diarista', 'Limpeza de banheiros'),
  ('diarista', 'Limpeza pesada'),
  ('diarista', 'Diarista semanal'),
  ('diarista', 'Diarista quinzenal'),
  ('diarista', 'Organização de armários'),
  ('diarista', 'Limpeza de vidros')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('dj', 'DJ para aniversário'),
  ('dj', 'DJ para casamento'),
  ('dj', 'DJ para formatura'),
  ('dj', 'DJ para eventos corporativos'),
  ('dj', 'DJ para festa de 15 anos'),
  ('dj', 'DJ para balada e bar'),
  ('dj', 'DJ para churrasco'),
  ('dj', 'DJ com sonorização e iluminação'),
  ('dj', 'DJ para festa infantil'),
  ('dj', 'DJ para confraternização')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('drone', 'Filmagem aérea de eventos'),
  ('drone', 'Fotografia aérea de imóveis'),
  ('drone', 'Mapeamento de terreno'),
  ('drone', 'Inspeção de telhados'),
  ('drone', 'Filmagem de casamento com drone'),
  ('drone', 'Imagens aéreas para propaganda'),
  ('drone', 'Inspeção de obras'),
  ('drone', 'Fotografia aérea rural'),
  ('drone', 'Vídeo aéreo de empreendimentos'),
  ('drone', 'Cobertura de eventos esportivos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('drywall', 'Parede de drywall'),
  ('drywall', 'Divisória de drywall'),
  ('drywall', 'Forro de drywall'),
  ('drywall', 'Sanca de drywall'),
  ('drywall', 'Nicho e prateleira em drywall'),
  ('drywall', 'Reparo em drywall'),
  ('drywall', 'Isolamento acústico'),
  ('drywall', 'Divisórias de escritório'),
  ('drywall', 'Parede para TV com drywall'),
  ('drywall', 'Teto rebaixado')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('edicao_video', 'Edição de vídeo para redes sociais'),
  ('edicao_video', 'Edição de casamento'),
  ('edicao_video', 'Edição de vídeo institucional'),
  ('edicao_video', 'Edição de vlog e YouTube'),
  ('edicao_video', 'Legendagem'),
  ('edicao_video', 'Motion graphics e animações'),
  ('edicao_video', 'Correção de cor'),
  ('edicao_video', 'Edição de vídeo de evento'),
  ('edicao_video', 'Cortes para Reels e TikTok'),
  ('edicao_video', 'Edição de vídeos de curso'),
  ('edicao_video', 'Vinhetas e aberturas')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('eletrica_auto', 'Diagnóstico elétrico com scanner'),
  ('eletrica_auto', 'Troca de bateria'),
  ('eletrica_auto', 'Troca de alternador'),
  ('eletrica_auto', 'Conserto de motor de arranque'),
  ('eletrica_auto', 'Instalação de som e acessórios'),
  ('eletrica_auto', 'Reparo de farol e lanterna'),
  ('eletrica_auto', 'Troca de lâmpadas e faróis de LED'),
  ('eletrica_auto', 'Conserto de vidro elétrico'),
  ('eletrica_auto', 'Instalação de alarme'),
  ('eletrica_auto', 'Reparo em chicote elétrico'),
  ('eletrica_auto', 'Instalação de módulo de vidros')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('eletrica_predial', 'Revisão elétrica predial'),
  ('eletrica_predial', 'Instalação de quadro de medidores'),
  ('eletrica_predial', 'Manutenção de iluminação de áreas comuns'),
  ('eletrica_predial', 'Instalação de luz de emergência'),
  ('eletrica_predial', 'Adequação de carga'),
  ('eletrica_predial', 'Passagem de cabos e eletrodutos'),
  ('eletrica_predial', 'Laudos elétricos'),
  ('eletrica_predial', 'Instalação de SPDA (para-raios)'),
  ('eletrica_predial', 'Troca de disjuntores'),
  ('eletrica_predial', 'Instalação de gerador'),
  ('eletrica_predial', 'Ligação nova na concessionária')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('enfermeiro', 'Curativos em domicílio'),
  ('enfermeiro', 'Administração de medicamentos'),
  ('enfermeiro', 'Aplicação de injeções'),
  ('enfermeiro', 'Sondas e cuidados especiais'),
  ('enfermeiro', 'Cuidados pós-cirúrgicos'),
  ('enfermeiro', 'Aferição de sinais vitais'),
  ('enfermeiro', 'Vacinas em domicílio'),
  ('enfermeiro', 'Cuidados com idosos acamados'),
  ('enfermeiro', 'Acompanhamento de gestantes e recém-nascidos'),
  ('enfermeiro', 'Coleta de exames em casa'),
  ('enfermeiro', 'Soroterapia')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('engenheiro_civil', 'Projeto estrutural'),
  ('engenheiro_civil', 'Laudo técnico de imóvel'),
  ('engenheiro_civil', 'Acompanhamento de obra'),
  ('engenheiro_civil', 'Regularização de imóvel'),
  ('engenheiro_civil', 'Orçamento e cronograma de obra'),
  ('engenheiro_civil', 'Projeto hidrossanitário'),
  ('engenheiro_civil', 'Projeto elétrico'),
  ('engenheiro_civil', 'Perícia de engenharia'),
  ('engenheiro_civil', 'Vistoria de imóvel'),
  ('engenheiro_civil', 'Aprovação de projetos na prefeitura'),
  ('engenheiro_civil', 'Laudo de patologias e rachaduras')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('entrega', 'Entrega de documentos'),
  ('entrega', 'Entrega de encomendas'),
  ('entrega', 'Motoboy por hora'),
  ('entrega', 'Entregas para lojas'),
  ('entrega', 'Entrega de comida'),
  ('entrega', 'Retirada de pacotes'),
  ('entrega', 'Entrega urgente (expressa)'),
  ('entrega', 'Serviços de banco e cartório'),
  ('entrega', 'Entrega para e-commerce'),
  ('entrega', 'Pagamento de contas'),
  ('entrega', 'Serviços de rua')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('esquadrias', 'Janela de alumínio'),
  ('esquadrias', 'Porta de alumínio'),
  ('esquadrias', 'Esquadria sob medida'),
  ('esquadrias', 'Porta de correr'),
  ('esquadrias', 'Janela de correr'),
  ('esquadrias', 'Porta de vidro com alumínio'),
  ('esquadrias', 'Janela maxim-ar'),
  ('esquadrias', 'Fachada de vidro e alumínio'),
  ('esquadrias', 'Reparo de roldanas'),
  ('esquadrias', 'Troca de vidros'),
  ('esquadrias', 'Vedação e acabamento'),
  ('esquadrias', 'Janela antirruído')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('esteticista', 'Limpeza de pele'),
  ('esteticista', 'Drenagem linfática'),
  ('esteticista', 'Massagem modeladora'),
  ('esteticista', 'Peeling'),
  ('esteticista', 'Tratamento de acne'),
  ('esteticista', 'Hidratação facial'),
  ('esteticista', 'Tratamento para celulite'),
  ('esteticista', 'Radiofrequência'),
  ('esteticista', 'Tratamento de manchas'),
  ('esteticista', 'Micro agulhamento'),
  ('esteticista', 'Atendimento em domicílio')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('extensao_cilios', 'Extensão fio a fio'),
  ('extensao_cilios', 'Volume russo'),
  ('extensao_cilios', 'Volume brasileiro'),
  ('extensao_cilios', 'Extensão híbrida'),
  ('extensao_cilios', 'Manutenção de cílios'),
  ('extensao_cilios', 'Remoção de cílios'),
  ('extensao_cilios', 'Lash lifting'),
  ('extensao_cilios', 'Extensão para noivas'),
  ('extensao_cilios', 'Cílios clássicos'),
  ('extensao_cilios', 'Cílios mega volume')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('extintor', 'Venda de extintores'),
  ('extintor', 'Recarga de extintores'),
  ('extintor', 'Manutenção e teste hidrostático'),
  ('extintor', 'Projeto de prevenção contra incêndio'),
  ('extintor', 'Laudo do AVCB'),
  ('extintor', 'Instalação de hidrantes'),
  ('extintor', 'Sinalização de emergência'),
  ('extintor', 'Instalação de alarme de incêndio'),
  ('extintor', 'Treinamento de brigada'),
  ('extintor', 'Luzes de emergência'),
  ('extintor', 'Inspeção de segurança')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('fachada', 'Revestimento de fachada'),
  ('fachada', 'Pintura de fachada'),
  ('fachada', 'Reparo e recuperação de fachada'),
  ('fachada', 'Fachada com cerâmica ou porcelanato'),
  ('fachada', 'Fachada com ACM'),
  ('fachada', 'Fachada de pedra'),
  ('fachada', 'Textura em fachada'),
  ('fachada', 'Impermeabilização de fachada'),
  ('fachada', 'Fachada ventilada'),
  ('fachada', 'Limpeza de fachada'),
  ('fachada', 'Fachada comercial')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('faxineira', 'Faxina residencial'),
  ('faxineira', 'Faxina pesada'),
  ('faxineira', 'Limpeza de escritório'),
  ('faxineira', 'Faxina pós-mudança'),
  ('faxineira', 'Faxina de apartamento'),
  ('faxineira', 'Limpeza de vidros'),
  ('faxineira', 'Limpeza de comércio'),
  ('faxineira', 'Faxina pré-festa'),
  ('faxineira', 'Limpeza de cozinha e banheiros'),
  ('faxineira', 'Faxina semanal')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('filmagem', 'Filmagem de casamento'),
  ('filmagem', 'Filmagem de aniversário'),
  ('filmagem', 'Filmagem de formatura'),
  ('filmagem', 'Vídeo institucional'),
  ('filmagem', 'Filmagem de eventos corporativos'),
  ('filmagem', 'Vídeo promocional'),
  ('filmagem', 'Filmagem de 15 anos'),
  ('filmagem', 'Vídeo para redes sociais'),
  ('filmagem', 'Filmagem com drone'),
  ('filmagem', 'Videoclipe'),
  ('filmagem', 'Cobertura de show e evento')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('filtro_agua', 'Instalação de purificador de água'),
  ('filtro_agua', 'Troca de refil e filtro'),
  ('filtro_agua', 'Manutenção de purificador'),
  ('filtro_agua', 'Instalação de filtro de poço'),
  ('filtro_agua', 'Filtro para caixa d''água'),
  ('filtro_agua', 'Instalação de filtro de torneira'),
  ('filtro_agua', 'Instalação de bebedouro'),
  ('filtro_agua', 'Osmose reversa'),
  ('filtro_agua', 'Limpeza de filtro'),
  ('filtro_agua', 'Contrato de manutenção periódica')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('fisioterapeuta', 'Fisioterapia ortopédica'),
  ('fisioterapeuta', 'Fisioterapia respiratória'),
  ('fisioterapeuta', 'Fisioterapia neurológica'),
  ('fisioterapeuta', 'Fisioterapia pós-cirúrgica'),
  ('fisioterapeuta', 'RPG (reeducação postural)'),
  ('fisioterapeuta', 'Fisioterapia para idosos'),
  ('fisioterapeuta', 'Fisioterapia esportiva'),
  ('fisioterapeuta', 'Fisioterapia pélvica'),
  ('fisioterapeuta', 'Pilates clínico'),
  ('fisioterapeuta', 'Atendimento em domicílio'),
  ('fisioterapeuta', 'Ventosaterapia e liberação miofascial')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('formatacao', 'Formatação de computador'),
  ('formatacao', 'Formatação de notebook'),
  ('formatacao', 'Instalação de Windows'),
  ('formatacao', 'Instalação de programas'),
  ('formatacao', 'Backup e recuperação de dados'),
  ('formatacao', 'Remoção de vírus'),
  ('formatacao', 'Upgrade de memória e SSD'),
  ('formatacao', 'Limpeza e troca de pasta térmica'),
  ('formatacao', 'Manutenção de notebook'),
  ('formatacao', 'Reparo de lentidão'),
  ('formatacao', 'Instalação de impressora')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('fossa', 'Limpeza de fossa'),
  ('fossa', 'Desentupimento de fossa'),
  ('fossa', 'Construção de fossa séptica'),
  ('fossa', 'Instalação de sumidouro'),
  ('fossa', 'Limpeza de caixa de gordura'),
  ('fossa', 'Manutenção de esgoto'),
  ('fossa', 'Caminhão limpa-fossa'),
  ('fossa', 'Instalação de biodigestor'),
  ('fossa', 'Reparo de tubulação de esgoto'),
  ('fossa', 'Limpeza de caixas de inspeção')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('fotografo', 'Ensaio fotográfico individual'),
  ('fotografo', 'Ensaio de casal'),
  ('fotografo', 'Ensaio de família'),
  ('fotografo', 'Ensaio gestante'),
  ('fotografo', 'Book profissional'),
  ('fotografo', 'Fotos para redes sociais e perfil'),
  ('fotografo', 'Fotografia de produtos'),
  ('fotografo', 'Fotografia de formatura'),
  ('fotografo', 'Fotografia de aniversário'),
  ('fotografo', 'Fotografia de casamento'),
  ('fotografo', 'Tratamento e edição de fotos'),
  ('fotografo', 'Fotos newborn (recém-nascido)')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('fotografia', 'Ensaio fotográfico individual'),
  ('fotografia', 'Ensaio de casal'),
  ('fotografia', 'Ensaio de família'),
  ('fotografia', 'Ensaio gestante'),
  ('fotografia', 'Book profissional'),
  ('fotografia', 'Fotos para redes sociais e perfil'),
  ('fotografia', 'Fotografia de produtos'),
  ('fotografia', 'Fotografia de formatura'),
  ('fotografia', 'Fotografia de aniversário'),
  ('fotografia', 'Fotografia de casamento'),
  ('fotografia', 'Tratamento e edição de fotos'),
  ('fotografia', 'Fotos newborn (recém-nascido)')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('fotografo_eventos', 'Fotografia de aniversário'),
  ('fotografo_eventos', 'Fotografia de casamento'),
  ('fotografo_eventos', 'Fotografia de evento corporativo'),
  ('fotografo_eventos', 'Fotografia de formatura'),
  ('fotografo_eventos', 'Fotografia de festa infantil'),
  ('fotografo_eventos', 'Fotografia de 15 anos'),
  ('fotografo_eventos', 'Fotografia de chá de bebê'),
  ('fotografo_eventos', 'Fotografia de batizado'),
  ('fotografo_eventos', 'Fotografia de show'),
  ('fotografo_eventos', 'Fotografia de confraternização'),
  ('fotografo_eventos', 'Cobertura de congresso')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('fotografo_pets', 'Ensaio fotográfico com cães'),
  ('fotografo_pets', 'Ensaio fotográfico com gatos'),
  ('fotografo_pets', 'Ensaio com pet e tutor'),
  ('fotografo_pets', 'Fotos de aniversário do pet'),
  ('fotografo_pets', 'Ensaio externo com pets'),
  ('fotografo_pets', 'Fotos em estúdio para pets'),
  ('fotografo_pets', 'Pacote de fotos para redes sociais do pet'),
  ('fotografo_pets', 'Ensaio de filhotes'),
  ('fotografo_pets', 'Ensaio de ninhada'),
  ('fotografo_pets', 'Álbum de fotos dos pets')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('frete', 'Frete pequeno'),
  ('frete', 'Transporte de móveis e eletrodomésticos'),
  ('frete', 'Carreto de mudança'),
  ('frete', 'Frete de materiais de construção'),
  ('frete', 'Frete para outras cidades'),
  ('frete', 'Frete com ajudante'),
  ('frete', 'Entrega de compras de loja'),
  ('frete', 'Frete de entulho'),
  ('frete', 'Frete de motocicletas'),
  ('frete', 'Frete com caminhão baú')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('fundacao', 'Sapata e radier'),
  ('fundacao', 'Estacas e brocas'),
  ('fundacao', 'Reforço de fundação'),
  ('fundacao', 'Baldrame'),
  ('fundacao', 'Sondagem de solo'),
  ('fundacao', 'Muro de arrimo'),
  ('fundacao', 'Contenção de encostas'),
  ('fundacao', 'Fundação para casas e sobrados'),
  ('fundacao', 'Escavação'),
  ('fundacao', 'Projeto de fundação'),
  ('fundacao', 'Reparo de rachaduras estruturais')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('funileiro', 'Reparo de amassados'),
  ('funileiro', 'Martelinho de ouro'),
  ('funileiro', 'Reparo de pequenos amassados sem pintura'),
  ('funileiro', 'Funilaria e pintura'),
  ('funileiro', 'Reparo de para-choque'),
  ('funileiro', 'Troca de peças da lataria'),
  ('funileiro', 'Reparo de batidas'),
  ('funileiro', 'Recuperação de lataria'),
  ('funileiro', 'Reparo de arranhões'),
  ('funileiro', 'Desamassar porta e paralamas')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('garcom', 'Garçom para festas'),
  ('garcom', 'Garçom para casamento'),
  ('garcom', 'Barman para festas'),
  ('garcom', 'Garçom para eventos corporativos'),
  ('garcom', 'Garçom para churrasco'),
  ('garcom', 'Serviço de coquetel'),
  ('garcom', 'Garçom para jantar em casa'),
  ('garcom', 'Garçom para aniversário'),
  ('garcom', 'Equipe de garçons e copeiras'),
  ('garcom', 'Serviço de bar')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('gas', 'Instalação de gás'),
  ('gas', 'Conserto de vazamento de gás'),
  ('gas', 'Instalação de gás encanado'),
  ('gas', 'Instalação de fogão e cooktop'),
  ('gas', 'Teste de estanqueidade'),
  ('gas', 'Troca de mangueira e regulador'),
  ('gas', 'Instalação de aquecedor a gás'),
  ('gas', 'Adequação de ponto de gás'),
  ('gas', 'Laudo de gás'),
  ('gas', 'Troca de botijão (instalação)')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('gerador', 'Instalação de gerador'),
  ('gerador', 'Manutenção de gerador'),
  ('gerador', 'Instalação de nobreak'),
  ('gerador', 'Troca de baterias de nobreak'),
  ('gerador', 'Aluguel de gerador'),
  ('gerador', 'Quadro de transferência (ATS)'),
  ('gerador', 'Revisão de gerador a diesel'),
  ('gerador', 'Gerador para eventos'),
  ('gerador', 'Projeto de energia de emergência'),
  ('gerador', 'Teste de carga')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('gesseiro', 'Forro de gesso'),
  ('gesseiro', 'Parede de drywall'),
  ('gesseiro', 'Reparo de gesso'),
  ('gesseiro', 'Sanca e moldura'),
  ('gesseiro', 'Rebaixamento de teto'),
  ('gesseiro', 'Gesso para iluminação embutida'),
  ('gesseiro', 'Nichos e prateleiras de gesso'),
  ('gesseiro', 'Cortineiro de gesso'),
  ('gesseiro', 'Aplicação de gesso em parede'),
  ('gesseiro', 'Moldura e rodateto')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('gesso_decorativo', 'Sanca de gesso'),
  ('gesso_decorativo', 'Moldura de gesso'),
  ('gesso_decorativo', 'Rosácea e medalhão'),
  ('gesso_decorativo', 'Painel decorativo de gesso'),
  ('gesso_decorativo', 'Cortineiro de gesso'),
  ('gesso_decorativo', 'Nichos decorativos'),
  ('gesso_decorativo', 'Gesso 3D'),
  ('gesso_decorativo', 'Rodateto e rodapé de gesso'),
  ('gesso_decorativo', 'Forro com detalhes'),
  ('gesso_decorativo', 'Revestimento 3D de parede'),
  ('gesso_decorativo', 'Recuperação de peças de gesso')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('grades_ferro', 'Grade de proteção para janelas'),
  ('grades_ferro', 'Portão de ferro'),
  ('grades_ferro', 'Portão basculante'),
  ('grades_ferro', 'Grade de proteção para varanda'),
  ('grades_ferro', 'Portão de garagem'),
  ('grades_ferro', 'Reforma de portão'),
  ('grades_ferro', 'Grade de proteção para berço e crianças'),
  ('grades_ferro', 'Gradil e cercas metálicas'),
  ('grades_ferro', 'Portão social'),
  ('grades_ferro', 'Pintura de portões e grades'),
  ('grades_ferro', 'Portão de alumínio')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('grama_sintetica', 'Instalação de grama sintética'),
  ('grama_sintetica', 'Grama sintética para jardim'),
  ('grama_sintetica', 'Grama sintética para varanda'),
  ('grama_sintetica', 'Grama sintética para pets'),
  ('grama_sintetica', 'Grama sintética para quadras'),
  ('grama_sintetica', 'Remoção de grama antiga'),
  ('grama_sintetica', 'Reparo de grama sintética'),
  ('grama_sintetica', 'Preparo do solo (base)'),
  ('grama_sintetica', 'Grama sintética para piscina'),
  ('grama_sintetica', 'Grama sintética para playground')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('guincho_auto', 'Guincho para carro de passeio'),
  ('guincho_auto', 'Guincho para moto'),
  ('guincho_auto', 'Guincho para pane na estrada'),
  ('guincho_auto', 'Guincho para carro batido'),
  ('guincho_auto', 'Remoção de veículo de garagem'),
  ('guincho_auto', 'Reboque para oficina'),
  ('guincho_auto', 'Guincho 24 horas'),
  ('guincho_auto', 'Transporte de veículo entre cidades'),
  ('guincho_auto', 'Guincho para utilitário e van'),
  ('guincho_auto', 'Socorro com pneu e bateria')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('guincho', 'Guincho para carro de passeio'),
  ('guincho', 'Guincho para moto'),
  ('guincho', 'Guincho para pane na estrada'),
  ('guincho', 'Guincho para carro batido'),
  ('guincho', 'Remoção de veículo de garagem'),
  ('guincho', 'Reboque para oficina'),
  ('guincho', 'Guincho 24 horas'),
  ('guincho', 'Transporte de veículo entre cidades'),
  ('guincho', 'Guincho para utilitário e van'),
  ('guincho', 'Socorro com pneu e bateria')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('higienizacao_auto', 'Higienização interna completa'),
  ('higienizacao_auto', 'Higienização de bancos'),
  ('higienizacao_auto', 'Higienização do ar-condicionado'),
  ('higienizacao_auto', 'Limpeza de teto'),
  ('higienizacao_auto', 'Limpeza de carpete'),
  ('higienizacao_auto', 'Remoção de odores'),
  ('higienizacao_auto', 'Limpeza de cinto de segurança'),
  ('higienizacao_auto', 'Higienização com ozônio'),
  ('higienizacao_auto', 'Hidratação de couro'),
  ('higienizacao_auto', 'Limpeza de motor'),
  ('higienizacao_auto', 'Higienização de carro de aplicativo')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('higienizacao_ar', 'Higienização de ar-condicionado split'),
  ('higienizacao_ar', 'Higienização de dutos'),
  ('higienizacao_ar', 'Higienização de ar-condicionado central'),
  ('higienizacao_ar', 'Higienização de climatizadores'),
  ('higienizacao_ar', 'Higienização de ar-condicionado de janela'),
  ('higienizacao_ar', 'Troca de filtros'),
  ('higienizacao_ar', 'Laudo de PMOC'),
  ('higienizacao_ar', 'Limpeza de bandeja e dreno'),
  ('higienizacao_ar', 'Higienização para escritórios'),
  ('higienizacao_ar', 'Higienização com bactericida'),
  ('higienizacao_ar', 'Contrato periódico')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('home_care', 'Cuidador em domicílio'),
  ('home_care', 'Enfermagem em domicílio'),
  ('home_care', 'Fisioterapia em casa'),
  ('home_care', 'Fonoaudiologia em domicílio'),
  ('home_care', 'Cuidado pós-cirúrgico'),
  ('home_care', 'Cuidado paliativo'),
  ('home_care', 'Cuidado de idosos'),
  ('home_care', 'Acompanhante hospitalar'),
  ('home_care', 'Coleta de exames em casa'),
  ('home_care', 'Assistência com medicamentos'),
  ('home_care', 'Cuidado de pacientes acamados')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('iluminacao', 'Instalação de fitas de LED'),
  ('iluminacao', 'Troca por lâmpadas LED'),
  ('iluminacao', 'Spots embutidos'),
  ('iluminacao', 'Iluminação de jardim'),
  ('iluminacao', 'Iluminação de fachada'),
  ('iluminacao', 'Instalação de pendentes e lustres'),
  ('iluminacao', 'Iluminação para quadros'),
  ('iluminacao', 'Iluminação para vitrines'),
  ('iluminacao', 'Projeto de iluminação'),
  ('iluminacao', 'Iluminação cênica'),
  ('iluminacao', 'Iluminação de piscina')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('iluminacao_eventos', 'Iluminação para casamento'),
  ('iluminacao_eventos', 'Iluminação para festa'),
  ('iluminacao_eventos', 'Iluminação para formatura'),
  ('iluminacao_eventos', 'Iluminação cênica'),
  ('iluminacao_eventos', 'Efeitos de luz e laser'),
  ('iluminacao_eventos', 'Iluminação de palco'),
  ('iluminacao_eventos', 'Iluminação para eventos corporativos'),
  ('iluminacao_eventos', 'Iluminação para shows'),
  ('iluminacao_eventos', 'Telões e painéis de LED'),
  ('iluminacao_eventos', 'Iluminação decorativa de ambientes'),
  ('iluminacao_eventos', 'Aluguel de equipamentos de luz')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('ilustrador', 'Ilustração digital'),
  ('ilustrador', 'Caricatura'),
  ('ilustrador', 'Retrato personalizado'),
  ('ilustrador', 'Ilustração infantil'),
  ('ilustrador', 'Personagem para marca (mascote)'),
  ('ilustrador', 'Ilustração de livros'),
  ('ilustrador', 'Quadrinhos e HQ'),
  ('ilustrador', 'Ilustração para convites'),
  ('ilustrador', 'Ilustração para camisetas'),
  ('ilustrador', 'Ilustração de capa de livro'),
  ('ilustrador', 'Ilustração editorial')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('impermeabilizador', 'Impermeabilização de laje'),
  ('impermeabilizador', 'Impermeabilização de caixa d''água'),
  ('impermeabilizador', 'Tratamento de infiltração'),
  ('impermeabilizador', 'Impermeabilização de piscina'),
  ('impermeabilizador', 'Impermeabilização de banheiro'),
  ('impermeabilizador', 'Impermeabilização de calhas'),
  ('impermeabilizador', 'Impermeabilização de terraço'),
  ('impermeabilizador', 'Impermeabilização de cobertura'),
  ('impermeabilizador', 'Impermeabilização de paredes úmidas'),
  ('impermeabilizador', 'Impermeabilização de subsolo')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('impressao_3d', 'Impressão de peças sob medida'),
  ('impressao_3d', 'Protótipos'),
  ('impressao_3d', 'Miniaturas e action figures'),
  ('impressao_3d', 'Peças de reposição'),
  ('impressao_3d', 'Modelagem 3D'),
  ('impressao_3d', 'Impressão em resina'),
  ('impressao_3d', 'Impressão para arquitetura (maquetes)'),
  ('impressao_3d', 'Brindes personalizados'),
  ('impressao_3d', 'Peças para cosplay'),
  ('impressao_3d', 'Escaneamento 3D'),
  ('impressao_3d', 'Impressão de peças técnicas')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('instalador_acessorios_auto', 'Instalação de som automotivo'),
  ('instalador_acessorios_auto', 'Instalação de película'),
  ('instalador_acessorios_auto', 'Instalação de alarme'),
  ('instalador_acessorios_auto', 'Instalação de rastreador'),
  ('instalador_acessorios_auto', 'Instalação de sensor de estacionamento'),
  ('instalador_acessorios_auto', 'Instalação de câmera de ré'),
  ('instalador_acessorios_auto', 'Instalação de multimídia'),
  ('instalador_acessorios_auto', 'Instalação de engate'),
  ('instalador_acessorios_auto', 'Instalação de farol de milha'),
  ('instalador_acessorios_auto', 'Instalação de trava elétrica'),
  ('instalador_acessorios_auto', 'Instalação de vidros elétricos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('interfone', 'Instalação de interfone'),
  ('interfone', 'Conserto de interfone'),
  ('interfone', 'Instalação de videoporteiro'),
  ('interfone', 'Troca de central de interfone'),
  ('interfone', 'Instalação de portaria virtual'),
  ('interfone', 'Instalação de porteiro eletrônico'),
  ('interfone', 'Interfone para condomínio'),
  ('interfone', 'Instalação de fechadura elétrica'),
  ('interfone', 'Troca de monofone'),
  ('interfone', 'Revisão e manutenção')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('irrigacao', 'Instalação de irrigação automática'),
  ('irrigacao', 'Irrigação por gotejamento'),
  ('irrigacao', 'Irrigação por aspersão'),
  ('irrigacao', 'Manutenção de irrigação'),
  ('irrigacao', 'Programação de temporizador'),
  ('irrigacao', 'Irrigação para jardim'),
  ('irrigacao', 'Irrigação para horta'),
  ('irrigacao', 'Irrigação para gramado'),
  ('irrigacao', 'Reparo de tubulação de irrigação'),
  ('irrigacao', 'Projeto de irrigação'),
  ('irrigacao', 'Irrigação de jardim vertical')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('jardim_vertical', 'Instalação de jardim vertical'),
  ('jardim_vertical', 'Jardim vertical com plantas naturais'),
  ('jardim_vertical', 'Jardim vertical artificial'),
  ('jardim_vertical', 'Jardim vertical para varanda'),
  ('jardim_vertical', 'Manutenção de jardim vertical'),
  ('jardim_vertical', 'Irrigação de jardim vertical'),
  ('jardim_vertical', 'Muro verde'),
  ('jardim_vertical', 'Painel verde interno'),
  ('jardim_vertical', 'Jardim vertical para empresas'),
  ('jardim_vertical', 'Projeto de jardim vertical')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('jardineiro', 'Manutenção de jardim'),
  ('jardineiro', 'Poda de plantas'),
  ('jardineiro', 'Plantio de flores e árvores'),
  ('jardineiro', 'Corte de grama'),
  ('jardineiro', 'Adubação'),
  ('jardineiro', 'Paisagismo'),
  ('jardineiro', 'Controle de pragas em plantas'),
  ('jardineiro', 'Limpeza de jardim'),
  ('jardineiro', 'Montagem de horta'),
  ('jardineiro', 'Poda de cerca viva')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('lavagem_auto', 'Lavagem completa'),
  ('lavagem_auto', 'Lavagem simples'),
  ('lavagem_auto', 'Higienização interna'),
  ('lavagem_auto', 'Lavagem a seco'),
  ('lavagem_auto', 'Lavagem de motor'),
  ('lavagem_auto', 'Lavagem com cera'),
  ('lavagem_auto', 'Lavagem de chassi'),
  ('lavagem_auto', 'Lavagem de moto'),
  ('lavagem_auto', 'Lavagem de carro em domicílio'),
  ('lavagem_auto', 'Polimento rápido'),
  ('lavagem_auto', 'Cristalização de pintura')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('lavagem_colchao', 'Higienização de colchão de casal'),
  ('lavagem_colchao', 'Higienização de colchão de solteiro'),
  ('lavagem_colchao', 'Higienização de colchão de bebê'),
  ('lavagem_colchao', 'Higienização de cama box'),
  ('lavagem_colchao', 'Higienização de colchão king'),
  ('lavagem_colchao', 'Remoção de manchas'),
  ('lavagem_colchao', 'Eliminação de ácaros'),
  ('lavagem_colchao', 'Remoção de odores'),
  ('lavagem_colchao', 'Higienização de cabeceiras'),
  ('lavagem_colchao', 'Higienização de travesseiros')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('lavagem_sofa', 'Higienização de sofá'),
  ('lavagem_sofa', 'Higienização de colchão'),
  ('lavagem_sofa', 'Higienização de tapete'),
  ('lavagem_sofa', 'Higienização de cadeiras e poltronas'),
  ('lavagem_sofa', 'Higienização de sofá de couro'),
  ('lavagem_sofa', 'Higienização de sofá retrátil'),
  ('lavagem_sofa', 'Higienização de cortinas'),
  ('lavagem_sofa', 'Impermeabilização de sofá'),
  ('lavagem_sofa', 'Remoção de manchas'),
  ('lavagem_sofa', 'Higienização de estofados')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('lavagem_tapete', 'Lavagem de tapete'),
  ('lavagem_tapete', 'Lavagem de tapete persa'),
  ('lavagem_tapete', 'Lavagem de carpete'),
  ('lavagem_tapete', 'Lavagem de passadeira'),
  ('lavagem_tapete', 'Lavagem de tapete felpudo'),
  ('lavagem_tapete', 'Lavagem de tapete de sisal'),
  ('lavagem_tapete', 'Retirada de manchas'),
  ('lavagem_tapete', 'Eliminação de odores'),
  ('lavagem_tapete', 'Lavagem a seco'),
  ('lavagem_tapete', 'Retirada e entrega'),
  ('lavagem_tapete', 'Lavagem de capachos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('limpeza_caixa', 'Limpeza de caixa d''água'),
  ('limpeza_caixa', 'Limpeza de caixa de fibra'),
  ('limpeza_caixa', 'Limpeza de caixa de concreto'),
  ('limpeza_caixa', 'Limpeza de cisterna'),
  ('limpeza_caixa', 'Limpeza de caixa d''água de condomínio'),
  ('limpeza_caixa', 'Limpeza de caixa de amianto'),
  ('limpeza_caixa', 'Laudo de potabilidade da água'),
  ('limpeza_caixa', 'Higienização com cloro'),
  ('limpeza_caixa', 'Desinfecção de reservatórios'),
  ('limpeza_caixa', 'Limpeza semestral programada')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('limpeza_pele', 'Limpeza de pele profunda'),
  ('limpeza_pele', 'Limpeza de pele para acne'),
  ('limpeza_pele', 'Limpeza de pele masculina'),
  ('limpeza_pele', 'Limpeza de pele com extração'),
  ('limpeza_pele', 'Hidratação facial'),
  ('limpeza_pele', 'Peeling de diamante'),
  ('limpeza_pele', 'Peeling químico'),
  ('limpeza_pele', 'Limpeza de pele express'),
  ('limpeza_pele', 'Limpeza de pele para pele sensível'),
  ('limpeza_pele', 'Máscaras e tratamentos faciais')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('limpeza_piscina', 'Limpeza de piscina'),
  ('limpeza_piscina', 'Aspiração de piscina'),
  ('limpeza_piscina', 'Tratamento da água'),
  ('limpeza_piscina', 'Limpeza de piscina após festas'),
  ('limpeza_piscina', 'Limpeza de piscina abandonada'),
  ('limpeza_piscina', 'Troca de areia do filtro'),
  ('limpeza_piscina', 'Limpeza de bordas e azulejos'),
  ('limpeza_piscina', 'Aplicação de produtos químicos'),
  ('limpeza_piscina', 'Manutenção semanal'),
  ('limpeza_piscina', 'Limpeza de piscina de vinil'),
  ('limpeza_piscina', 'Limpeza de spa e hidromassagem')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('limpeza_terreno', 'Limpeza de terreno'),
  ('limpeza_terreno', 'Roçada de mato'),
  ('limpeza_terreno', 'Retirada de entulho'),
  ('limpeza_terreno', 'Capina'),
  ('limpeza_terreno', 'Remoção de árvores e raízes'),
  ('limpeza_terreno', 'Terraplenagem leve'),
  ('limpeza_terreno', 'Nivelamento de terreno'),
  ('limpeza_terreno', 'Limpeza de lote para construção'),
  ('limpeza_terreno', 'Retirada de tocos'),
  ('limpeza_terreno', 'Queima controlada (autorizada)'),
  ('limpeza_terreno', 'Limpeza de terreno abandonado')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('limpeza_pos_obra', 'Limpeza pós-obra residencial'),
  ('limpeza_pos_obra', 'Limpeza pós-obra comercial'),
  ('limpeza_pos_obra', 'Remoção de respingos de tinta'),
  ('limpeza_pos_obra', 'Remoção de cimento e argamassa'),
  ('limpeza_pos_obra', 'Limpeza de vidros e esquadrias'),
  ('limpeza_pos_obra', 'Limpeza fina de pisos'),
  ('limpeza_pos_obra', 'Limpeza de reforma'),
  ('limpeza_pos_obra', 'Limpeza de condomínio após obra'),
  ('limpeza_pos_obra', 'Retirada de entulho'),
  ('limpeza_pos_obra', 'Limpeza de fachada')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('limpeza_predial', 'Limpeza de condomínio'),
  ('limpeza_predial', 'Limpeza de escritórios'),
  ('limpeza_predial', 'Limpeza de áreas comuns'),
  ('limpeza_predial', 'Limpeza de vidros e fachadas'),
  ('limpeza_predial', 'Limpeza de garagem'),
  ('limpeza_predial', 'Limpeza de elevadores'),
  ('limpeza_predial', 'Limpeza de lojas'),
  ('limpeza_predial', 'Limpeza de hospitais e clínicas'),
  ('limpeza_predial', 'Limpeza de escolas'),
  ('limpeza_predial', 'Limpeza de academias'),
  ('limpeza_predial', 'Limpeza de pós-evento')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('manicure', 'Manicure'),
  ('manicure', 'Pedicure'),
  ('manicure', 'Mãos e pés'),
  ('manicure', 'Esmaltação em gel'),
  ('manicure', 'Alongamento de unhas'),
  ('manicure', 'Unhas de fibra'),
  ('manicure', 'Cutilagem'),
  ('manicure', 'Spa dos pés'),
  ('manicure', 'Manicure em domicílio'),
  ('manicure', 'Banho de gel'),
  ('manicure', 'Remoção de esmalte em gel')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('piscina_manutencao', 'Limpeza de piscina'),
  ('piscina_manutencao', 'Tratamento da água'),
  ('piscina_manutencao', 'Troca de filtro e areia'),
  ('piscina_manutencao', 'Conserto de bomba de piscina'),
  ('piscina_manutencao', 'Reparo de vazamentos'),
  ('piscina_manutencao', 'Manutenção de aquecimento'),
  ('piscina_manutencao', 'Troca de vinil'),
  ('piscina_manutencao', 'Reparo em azulejos'),
  ('piscina_manutencao', 'Troca de iluminação'),
  ('piscina_manutencao', 'Manutenção semanal de piscina')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('maquiadora', 'Maquiagem social'),
  ('maquiadora', 'Maquiagem para noivas'),
  ('maquiadora', 'Maquiagem para madrinhas'),
  ('maquiadora', 'Maquiagem para formatura'),
  ('maquiadora', 'Maquiagem para 15 anos'),
  ('maquiadora', 'Maquiagem artística'),
  ('maquiadora', 'Maquiagem para ensaios fotográficos'),
  ('maquiadora', 'Maquiagem para eventos corporativos'),
  ('maquiadora', 'Automaquiagem (aula)'),
  ('maquiadora', 'Maquiagem em domicílio'),
  ('maquiadora', 'Maquiagem para festas')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('marceneiro', 'Móveis sob medida'),
  ('marceneiro', 'Armários planejados'),
  ('marceneiro', 'Reparo de móveis'),
  ('marceneiro', 'Montagem de móveis'),
  ('marceneiro', 'Portas e janelas de madeira'),
  ('marceneiro', 'Prateleiras e nichos'),
  ('marceneiro', 'Cozinha e área de serviço sob medida'),
  ('marceneiro', 'Painéis para TV'),
  ('marceneiro', 'Rack e estante'),
  ('marceneiro', 'Móveis para escritório'),
  ('marceneiro', 'Restauração de móveis')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('marketing_digital', 'Gestão de redes sociais'),
  ('marketing_digital', 'Tráfego pago (anúncios)'),
  ('marketing_digital', 'Criação de campanhas'),
  ('marketing_digital', 'Otimização para o Google (SEO)'),
  ('marketing_digital', 'E-mail marketing'),
  ('marketing_digital', 'Planejamento de marketing'),
  ('marketing_digital', 'Google Meu Negócio'),
  ('marketing_digital', 'Marketing para pequenos negócios'),
  ('marketing_digital', 'Criação de conteúdo'),
  ('marketing_digital', 'Consultoria de marketing digital'),
  ('marketing_digital', 'Remarketing e pixel')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('marmita', 'Marmita do dia'),
  ('marmita', 'Marmita semanal'),
  ('marmita', 'Marmita fitness'),
  ('marmita', 'Marmita caseira'),
  ('marmita', 'Marmita vegetariana'),
  ('marmita', 'Marmita para empresas'),
  ('marmita', 'Marmita congelada'),
  ('marmita', 'Marmita para dieta'),
  ('marmita', 'Marmita low carb'),
  ('marmita', 'Marmita mensal'),
  ('marmita', 'Marmita para diabéticos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('massa_corrida', 'Aplicação de massa corrida'),
  ('massa_corrida', 'Aplicação de massa acrílica'),
  ('massa_corrida', 'Lixamento de paredes'),
  ('massa_corrida', 'Reparo de pequenas rachaduras'),
  ('massa_corrida', 'Correção de paredes antes da pintura'),
  ('massa_corrida', 'Massa corrida em tetos'),
  ('massa_corrida', 'Preparação de superfície'),
  ('massa_corrida', 'Aplicação de selador'),
  ('massa_corrida', 'Reparo de umidade em paredes'),
  ('massa_corrida', 'Nivelamento de parede')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('massagista', 'Massagem relaxante'),
  ('massagista', 'Massagem terapêutica'),
  ('massagista', 'Massagem modeladora'),
  ('massagista', 'Massagem com pedras quentes'),
  ('massagista', 'Massagem desportiva'),
  ('massagista', 'Massagem para gestantes'),
  ('massagista', 'Drenagem linfática'),
  ('massagista', 'Shiatsu'),
  ('massagista', 'Quick massage'),
  ('massagista', 'Massagem em domicílio'),
  ('massagista', 'Massagem para casais')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('mecanico', 'Revisão completa'),
  ('mecanico', 'Troca de óleo e filtros'),
  ('mecanico', 'Freios'),
  ('mecanico', 'Suspensão'),
  ('mecanico', 'Diagnóstico com scanner'),
  ('mecanico', 'Troca de correia dentada'),
  ('mecanico', 'Embreagem'),
  ('mecanico', 'Conserto de ar-condicionado'),
  ('mecanico', 'Troca de bateria'),
  ('mecanico', 'Alinhamento e balanceamento'),
  ('mecanico', 'Mecânico a domicílio')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('moto_mecanico', 'Revisão de moto'),
  ('moto_mecanico', 'Troca de óleo'),
  ('moto_mecanico', 'Troca de pneus'),
  ('moto_mecanico', 'Troca de relação (corrente e coroa)'),
  ('moto_mecanico', 'Ajuste de freios'),
  ('moto_mecanico', 'Regulagem de carburador e injeção'),
  ('moto_mecanico', 'Troca de velas'),
  ('moto_mecanico', 'Parte elétrica de moto'),
  ('moto_mecanico', 'Troca de kit de transmissão'),
  ('moto_mecanico', 'Troca de pastilhas'),
  ('moto_mecanico', 'Mecânico de moto a domicílio')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('mestre_cerimonia', 'Mestre de cerimônia para casamento'),
  ('mestre_cerimonia', 'Mestre de cerimônia para formatura'),
  ('mestre_cerimonia', 'Mestre de cerimônia para eventos corporativos'),
  ('mestre_cerimonia', 'Mestre de cerimônia para 15 anos'),
  ('mestre_cerimonia', 'Mestre de cerimônia para premiações'),
  ('mestre_cerimonia', 'Apresentador de eventos'),
  ('mestre_cerimonia', 'Mestre de cerimônia para aniversário'),
  ('mestre_cerimonia', 'Locução de eventos'),
  ('mestre_cerimonia', 'Mestre de cerimônia para congressos'),
  ('mestre_cerimonia', 'Mestre de cerimônia infantil')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('mestre_obras', 'Acompanhamento de obra'),
  ('mestre_obras', 'Construção de casa'),
  ('mestre_obras', 'Reforma geral'),
  ('mestre_obras', 'Construção de edícula'),
  ('mestre_obras', 'Ampliação de casa'),
  ('mestre_obras', 'Gestão de equipe de obra'),
  ('mestre_obras', 'Obras de pequeno porte'),
  ('mestre_obras', 'Construção de muros'),
  ('mestre_obras', 'Reforma de apartamento'),
  ('mestre_obras', 'Orçamento e compra de materiais')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('micropigmentacao', 'Micropigmentação de sobrancelhas'),
  ('micropigmentacao', 'Micropigmentação labial'),
  ('micropigmentacao', 'Micropigmentação de olhos (delineado)'),
  ('micropigmentacao', 'Fio a fio'),
  ('micropigmentacao', 'Sombreada (shadow)'),
  ('micropigmentacao', 'Micropigmentação capilar'),
  ('micropigmentacao', 'Retoque de micropigmentação'),
  ('micropigmentacao', 'Remoção de pigmentação'),
  ('micropigmentacao', 'Micropigmentação de aréola'),
  ('micropigmentacao', 'Micropigmentação masculina')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('motorista_executivo', 'Motorista executivo por hora'),
  ('motorista_executivo', 'Motorista executivo diário'),
  ('motorista_executivo', 'Transporte para aeroporto'),
  ('motorista_executivo', 'Motorista para eventos'),
  ('motorista_executivo', 'Motorista com carro de luxo'),
  ('motorista_executivo', 'Motorista para reuniões'),
  ('motorista_executivo', 'Motorista para viagens intermunicipais'),
  ('motorista_executivo', 'Motorista bilíngue'),
  ('motorista_executivo', 'Transporte corporativo'),
  ('motorista_executivo', 'Motorista para casamentos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('motorista', 'Motorista particular por hora'),
  ('motorista', 'Motorista para o dia inteiro'),
  ('motorista', 'Motorista para viagens'),
  ('motorista', 'Motorista para consultas'),
  ('motorista', 'Motorista da família'),
  ('motorista', 'Motorista para a noite (festas)'),
  ('motorista', 'Motorista para aeroporto'),
  ('motorista', 'Motorista para idosos'),
  ('motorista', 'Motorista de confiança semanal'),
  ('motorista', 'Motorista para o seu carro')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('mototaxista', 'Corrida urbana de moto'),
  ('mototaxista', 'Entrega rápida de documentos'),
  ('mototaxista', 'Mototáxi para o trabalho'),
  ('mototaxista', 'Corrida para aeroporto'),
  ('mototaxista', 'Moto para compras'),
  ('mototaxista', 'Corrida programada'),
  ('mototaxista', 'Mototáxi para o dia inteiro'),
  ('mototaxista', 'Mototáxi noturno'),
  ('mototaxista', 'Transporte de pequenos volumes'),
  ('mototaxista', 'Corrida para cidades vizinhas')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('moveis_planejados', 'Móveis planejados sob medida'),
  ('moveis_planejados', 'Dormitório planejado'),
  ('moveis_planejados', 'Sala planejada'),
  ('moveis_planejados', 'Home office planejado'),
  ('moveis_planejados', 'Armários planejados'),
  ('moveis_planejados', 'Cozinha planejada'),
  ('moveis_planejados', 'Lavanderia planejada'),
  ('moveis_planejados', 'Quarto infantil planejado'),
  ('moveis_planejados', 'Painel para TV'),
  ('moveis_planejados', 'Closet planejado'),
  ('moveis_planejados', 'Projeto 3D e orçamento')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('mudanca', 'Mudança residencial'),
  ('mudanca', 'Mudança de escritório'),
  ('mudanca', 'Transporte de móveis'),
  ('mudanca', 'Mudança pequena (kitnet)'),
  ('mudanca', 'Mudança com embalagem'),
  ('mudanca', 'Montagem e desmontagem de móveis'),
  ('mudanca', 'Mudança interestadual'),
  ('mudanca', 'Guarda-móveis'),
  ('mudanca', 'Mudança comercial'),
  ('mudanca', 'Içamento de móveis'),
  ('mudanca', 'Transporte de piano e cofre')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('musico', 'Show para casamento'),
  ('musico', 'Banda para eventos'),
  ('musico', 'Cantor(a) para festas'),
  ('musico', 'Música ao vivo para restaurante'),
  ('musico', 'Música para cerimônias'),
  ('musico', 'Show de aniversário'),
  ('musico', 'Música para eventos corporativos'),
  ('musico', 'Violão e voz'),
  ('musico', 'Banda cover'),
  ('musico', 'Trio de forró'),
  ('musico', 'Pagode e samba ao vivo'),
  ('musico', 'Apresentação de música clássica')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('nail_designer', 'Alongamento de unhas em gel'),
  ('nail_designer', 'Alongamento de unhas em fibra'),
  ('nail_designer', 'Nail art'),
  ('nail_designer', 'Decoração com pedrarias'),
  ('nail_designer', 'Unhas acrigel'),
  ('nail_designer', 'Manutenção do alongamento'),
  ('nail_designer', 'Unhas para noivas'),
  ('nail_designer', 'Esmaltação em gel'),
  ('nail_designer', 'Blindagem de unhas'),
  ('nail_designer', 'Remoção de alongamento'),
  ('nail_designer', 'Encapsulamento')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('nutricionista', 'Consulta nutricional'),
  ('nutricionista', 'Plano alimentar para emagrecer'),
  ('nutricionista', 'Reeducação alimentar'),
  ('nutricionista', 'Nutrição esportiva'),
  ('nutricionista', 'Nutrição para gestantes'),
  ('nutricionista', 'Nutrição infantil'),
  ('nutricionista', 'Plano alimentar para diabéticos'),
  ('nutricionista', 'Nutrição vegetariana e vegana'),
  ('nutricionista', 'Consulta online'),
  ('nutricionista', 'Cardápio semanal'),
  ('nutricionista', 'Acompanhamento mensal')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('painel_solar', 'Projeto e instalação de painel solar'),
  ('painel_solar', 'Limpeza e manutenção de placas'),
  ('painel_solar', 'Instalação residencial'),
  ('painel_solar', 'Instalação comercial'),
  ('painel_solar', 'Instalação rural'),
  ('painel_solar', 'Manutenção de inversor'),
  ('painel_solar', 'Aumento do sistema'),
  ('painel_solar', 'Homologação junto à concessionária'),
  ('painel_solar', 'Monitoramento da geração'),
  ('painel_solar', 'Instalação de aquecedor solar'),
  ('painel_solar', 'Diagnóstico de baixa geração')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('paisagista', 'Projeto de paisagismo'),
  ('paisagista', 'Paisagismo residencial'),
  ('paisagista', 'Paisagismo comercial'),
  ('paisagista', 'Jardim de inverno'),
  ('paisagista', 'Jardim em área pequena'),
  ('paisagista', 'Iluminação de jardim'),
  ('paisagista', 'Execução de paisagismo'),
  ('paisagista', 'Jardim em varanda'),
  ('paisagista', 'Paisagismo de condomínio'),
  ('paisagista', 'Consultoria de plantas'),
  ('paisagista', 'Revitalização de jardim')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('pao_artesanal', 'Pão de fermentação natural'),
  ('pao_artesanal', 'Pães artesanais por encomenda'),
  ('pao_artesanal', 'Pão de forma caseiro'),
  ('pao_artesanal', 'Pão italiano e ciabatta'),
  ('pao_artesanal', 'Focaccia'),
  ('pao_artesanal', 'Pão integral artesanal'),
  ('pao_artesanal', 'Pães para café da manhã de eventos'),
  ('pao_artesanal', 'Pão sem glúten'),
  ('pao_artesanal', 'Brioche'),
  ('pao_artesanal', 'Pão de queijo artesanal'),
  ('pao_artesanal', 'Assinatura semanal de pães')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('spda', 'Instalação de para-raios'),
  ('spda', 'Laudo de SPDA'),
  ('spda', 'Manutenção de para-raios'),
  ('spda', 'Medição de aterramento'),
  ('spda', 'Projeto de SPDA'),
  ('spda', 'Instalação de captores'),
  ('spda', 'Aterramento elétrico'),
  ('spda', 'Para-raios para residências'),
  ('spda', 'Para-raios para condomínios e indústrias'),
  ('spda', 'Renovação de laudo'),
  ('spda', 'Inspeção periódica')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('passeio_caes', 'Passeio individual'),
  ('passeio_caes', 'Passeio em grupo'),
  ('passeio_caes', 'Passeio de 30 minutos'),
  ('passeio_caes', 'Passeio de 1 hora'),
  ('passeio_caes', 'Passeio com corrida'),
  ('passeio_caes', 'Passeio para filhotes'),
  ('passeio_caes', 'Passeio para cães idosos'),
  ('passeio_caes', 'Passeio de fim de semana'),
  ('passeio_caes', 'Pacote mensal de passeios'),
  ('passeio_caes', 'Passeio com busca e entrega')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('pastilha', 'Aplicação de pastilha de vidro'),
  ('pastilha', 'Aplicação de pastilha cerâmica'),
  ('pastilha', 'Aplicação de pastilha em piscina'),
  ('pastilha', 'Mosaico decorativo'),
  ('pastilha', 'Pastilha em fachada'),
  ('pastilha', 'Pastilha em banheiro'),
  ('pastilha', 'Pastilha em cozinha'),
  ('pastilha', 'Reparo e troca de pastilhas'),
  ('pastilha', 'Pastilha adesiva'),
  ('pastilha', 'Rejunte de pastilhas')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('pedreiro', 'Alvenaria e levantamento de paredes'),
  ('pedreiro', 'Reboco e emboço'),
  ('pedreiro', 'Assentamento de pisos e azulejos'),
  ('pedreiro', 'Reforma de banheiro'),
  ('pedreiro', 'Reforma de cozinha'),
  ('pedreiro', 'Construção de muros'),
  ('pedreiro', 'Contrapiso'),
  ('pedreiro', 'Pequenos reparos'),
  ('pedreiro', 'Ampliação de cômodos'),
  ('pedreiro', 'Calçadas'),
  ('pedreiro', 'Laje')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('penteado', 'Penteado para noivas'),
  ('penteado', 'Penteado para madrinhas'),
  ('penteado', 'Penteado para formatura'),
  ('penteado', 'Penteado para 15 anos'),
  ('penteado', 'Penteado para festas'),
  ('penteado', 'Penteado com trança'),
  ('penteado', 'Coque'),
  ('penteado', 'Teste de penteado'),
  ('penteado', 'Penteado infantil'),
  ('penteado', 'Penteado em domicílio'),
  ('penteado', 'Escova e penteado preso')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('persiana', 'Instalação de persiana'),
  ('persiana', 'Limpeza e conserto de persiana'),
  ('persiana', 'Persiana horizontal'),
  ('persiana', 'Persiana vertical'),
  ('persiana', 'Persiana rolô'),
  ('persiana', 'Persiana romana'),
  ('persiana', 'Cortina de tecido'),
  ('persiana', 'Cortina de linho'),
  ('persiana', 'Persiana motorizada'),
  ('persiana', 'Troca de tecido'),
  ('persiana', 'Instalação de trilhos e varões')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('personal_stylist', 'Consultoria de imagem'),
  ('personal_stylist', 'Montagem de looks'),
  ('personal_stylist', 'Personal shopper'),
  ('personal_stylist', 'Organização de guarda-roupa'),
  ('personal_stylist', 'Consultoria de coloração pessoal'),
  ('personal_stylist', 'Stylist para eventos'),
  ('personal_stylist', 'Consultoria de estilo masculino'),
  ('personal_stylist', 'Consultoria de visagismo'),
  ('personal_stylist', 'Renovação de guarda-roupa'),
  ('personal_stylist', 'Stylist para ensaios e fotos'),
  ('personal_stylist', 'Consultoria de imagem profissional')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('personal_trainer', 'Treino individual'),
  ('personal_trainer', 'Treino em dupla'),
  ('personal_trainer', 'Consultoria online'),
  ('personal_trainer', 'Treino em domicílio'),
  ('personal_trainer', 'Treino em parque ou praça'),
  ('personal_trainer', 'Treino para emagrecimento'),
  ('personal_trainer', 'Treino para ganho de massa'),
  ('personal_trainer', 'Treino para idosos'),
  ('personal_trainer', 'Treino para gestantes'),
  ('personal_trainer', 'Treino funcional'),
  ('personal_trainer', 'Reabilitação e condicionamento')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('pet_sitter', 'Visita diária ao pet'),
  ('pet_sitter', 'Hospedagem do pet em casa'),
  ('pet_sitter', 'Pet sitter na casa do tutor'),
  ('pet_sitter', 'Cuidado de gatos'),
  ('pet_sitter', 'Administração de medicamentos'),
  ('pet_sitter', 'Pet sitter durante viagem'),
  ('pet_sitter', 'Pet sitter por hora'),
  ('pet_sitter', 'Cuidado de animais exóticos'),
  ('pet_sitter', 'Pet sitter de fim de semana'),
  ('pet_sitter', 'Pet sitter para filhotes e idosos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('pilates', 'Pilates de solo'),
  ('pilates', 'Pilates com aparelhos'),
  ('pilates', 'Pilates para gestantes'),
  ('pilates', 'Pilates para idosos'),
  ('pilates', 'Pilates para coluna'),
  ('pilates', 'Pilates em domicílio'),
  ('pilates', 'Pilates em dupla'),
  ('pilates', 'Pilates online'),
  ('pilates', 'Pilates para reabilitação'),
  ('pilates', 'Pilates para emagrecimento'),
  ('pilates', 'Aula experimental')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('pintor', 'Pintura de parede residencial'),
  ('pintor', 'Pintura de teto'),
  ('pintor', 'Pintura de fachada'),
  ('pintor', 'Pintura de portas e janelas'),
  ('pintor', 'Pintura de grades e portões'),
  ('pintor', 'Textura e grafiato'),
  ('pintor', 'Massa corrida'),
  ('pintor', 'Pintura de apartamento'),
  ('pintor', 'Pintura de móveis'),
  ('pintor', 'Pintura comercial'),
  ('pintor', 'Verniz em madeira')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('pintura_auto', 'Pintura completa do carro'),
  ('pintura_auto', 'Pintura de peça'),
  ('pintura_auto', 'Repintura de para-choque'),
  ('pintura_auto', 'Pintura de moto'),
  ('pintura_auto', 'Pintura em cor original'),
  ('pintura_auto', 'Pintura de capô e teto'),
  ('pintura_auto', 'Pintura de retrovisor'),
  ('pintura_auto', 'Pintura de rodas'),
  ('pintura_auto', 'Cristalização de pintura'),
  ('pintura_auto', 'Retoque de pintura'),
  ('pintura_auto', 'Reparo de arranhões profundos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('pintura_epoxi', 'Piso epóxi para garagem'),
  ('pintura_epoxi', 'Piso epóxi industrial'),
  ('pintura_epoxi', 'Piso epóxi autonivelante'),
  ('pintura_epoxi', 'Pintura epóxi em paredes'),
  ('pintura_epoxi', 'Piso epóxi para lojas'),
  ('pintura_epoxi', 'Epóxi para áreas molhadas'),
  ('pintura_epoxi', 'Reparo de piso epóxi'),
  ('pintura_epoxi', 'Piso epóxi antiderrapante'),
  ('pintura_epoxi', 'Pintura epóxi para estacionamento'),
  ('pintura_epoxi', 'Piso epóxi em cozinhas'),
  ('pintura_epoxi', 'Piso epóxi para laboratórios')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('pintura_predial', 'Pintura de fachada de prédio'),
  ('pintura_predial', 'Pintura de áreas comuns'),
  ('pintura_predial', 'Pintura de garagem'),
  ('pintura_predial', 'Pintura de escadas e corredores'),
  ('pintura_predial', 'Pintura com balancim'),
  ('pintura_predial', 'Pintura com andaime'),
  ('pintura_predial', 'Pintura de condomínio'),
  ('pintura_predial', 'Pintura de muros e grades'),
  ('pintura_predial', 'Pintura de fachada comercial'),
  ('pintura_predial', 'Pintura de prédio comercial'),
  ('pintura_predial', 'Pintura com rapel (acesso por corda)')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('piscina', 'Construção de piscina de alvenaria'),
  ('piscina', 'Piscina de vinil'),
  ('piscina', 'Piscina de fibra'),
  ('piscina', 'Reforma de piscina'),
  ('piscina', 'Piscina com prainha'),
  ('piscina', 'Piscina com spa'),
  ('piscina', 'Piscina com cascata'),
  ('piscina', 'Revestimento de piscina'),
  ('piscina', 'Projeto de piscina'),
  ('piscina', 'Piscina aquecida'),
  ('piscina', 'Cobertura de piscina')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('piso_vinilico', 'Instalação de piso vinílico'),
  ('piso_vinilico', 'Instalação de piso laminado'),
  ('piso_vinilico', 'Piso vinílico colado'),
  ('piso_vinilico', 'Piso vinílico click'),
  ('piso_vinilico', 'Remoção de piso antigo'),
  ('piso_vinilico', 'Manta e preparo de contrapiso'),
  ('piso_vinilico', 'Instalação de rodapé'),
  ('piso_vinilico', 'Piso laminado em escadas'),
  ('piso_vinilico', 'Piso vinílico em áreas comerciais'),
  ('piso_vinilico', 'Reparo de piso laminado'),
  ('piso_vinilico', 'Piso vinílico em banheiro')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('pizzaiolo', 'Pizza para festas'),
  ('pizzaiolo', 'Pizza em forno a lenha'),
  ('pizzaiolo', 'Rodízio de pizza em casa'),
  ('pizzaiolo', 'Pizza para eventos corporativos'),
  ('pizzaiolo', 'Pizza napolitana'),
  ('pizzaiolo', 'Pizzaiolo para casamento'),
  ('pizzaiolo', 'Pizzas por encomenda'),
  ('pizzaiolo', 'Pizza em forno portátil'),
  ('pizzaiolo', 'Pizza para confraternização'),
  ('pizzaiolo', 'Aula de pizza'),
  ('pizzaiolo', 'Pizzaiolo por hora')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('plantio', 'Plantio de árvores'),
  ('plantio', 'Transplante de árvores e arbustos'),
  ('plantio', 'Plantio de mudas'),
  ('plantio', 'Plantio de grama'),
  ('plantio', 'Plantio de flores'),
  ('plantio', 'Plantio em vasos'),
  ('plantio', 'Montagem de canteiros'),
  ('plantio', 'Plantio de horta'),
  ('plantio', 'Preparo de solo'),
  ('plantio', 'Plantio de cerca viva'),
  ('plantio', 'Replantio de jardins')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('poda_arvore', 'Poda de árvores'),
  ('poda_arvore', 'Poda de palmeiras'),
  ('poda_arvore', 'Corte e remoção de árvores'),
  ('poda_arvore', 'Poda de cerca viva'),
  ('poda_arvore', 'Poda em altura'),
  ('poda_arvore', 'Retirada de galhos secos'),
  ('poda_arvore', 'Limpeza e remoção de tocos'),
  ('poda_arvore', 'Poda de formação'),
  ('poda_arvore', 'Poda de manutenção'),
  ('poda_arvore', 'Poda de árvores frutíferas'),
  ('poda_arvore', 'Poda emergencial após temporais')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('polimento', 'Polimento técnico'),
  ('polimento', 'Vitrificação de pintura'),
  ('polimento', 'Cristalização'),
  ('polimento', 'Polimento de faróis'),
  ('polimento', 'Polimento de motos'),
  ('polimento', 'Polimento de rodas'),
  ('polimento', 'Revitalização de pintura'),
  ('polimento', 'Proteção cerâmica'),
  ('polimento', 'Remoção de riscos leves'),
  ('polimento', 'Aplicação de cera'),
  ('polimento', 'Polimento de vidros')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('porcelanato', 'Assentamento de porcelanato'),
  ('porcelanato', 'Porcelanato em grandes formatos'),
  ('porcelanato', 'Porcelanato líquido'),
  ('porcelanato', 'Porcelanato em fachada'),
  ('porcelanato', 'Porcelanato em banheiro'),
  ('porcelanato', 'Porcelanato em cozinha'),
  ('porcelanato', 'Porcelanato em área externa'),
  ('porcelanato', 'Reparo e troca de peças'),
  ('porcelanato', 'Rejuntamento de porcelanato'),
  ('porcelanato', 'Remoção de piso antigo'),
  ('porcelanato', 'Nivelamento de contrapiso')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('portao_eletrico', 'Instalação de portão eletrônico'),
  ('portao_eletrico', 'Manutenção de portão eletrônico'),
  ('portao_eletrico', 'Troca de motor ou controle'),
  ('portao_eletrico', 'Instalação de portão basculante'),
  ('portao_eletrico', 'Instalação de portão deslizante'),
  ('portao_eletrico', 'Automação de portão existente'),
  ('portao_eletrico', 'Troca de cremalheira'),
  ('portao_eletrico', 'Instalação de sensor de segurança'),
  ('portao_eletrico', 'Reprogramação de controle remoto'),
  ('portao_eletrico', 'Instalação de portão de garagem automático')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('professor_particular', 'Reforço escolar'),
  ('professor_particular', 'Preparação para vestibular e ENEM'),
  ('professor_particular', 'Aula de matemática'),
  ('professor_particular', 'Aula de português'),
  ('professor_particular', 'Aula de inglês'),
  ('professor_particular', 'Aulas de ciências e biologia'),
  ('professor_particular', 'Aula de física e química'),
  ('professor_particular', 'Aula de alfabetização'),
  ('professor_particular', 'Aula para concursos'),
  ('professor_particular', 'Aula de redação'),
  ('professor_particular', 'Aula online')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('programacao', 'Desenvolvimento de aplicativo'),
  ('programacao', 'Desenvolvimento de sistema web'),
  ('programacao', 'Automação de tarefas (scripts)'),
  ('programacao', 'Integração entre sistemas'),
  ('programacao', 'Correção de bugs'),
  ('programacao', 'Aulas de programação'),
  ('programacao', 'Criação de API'),
  ('programacao', 'Desenvolvimento de bot'),
  ('programacao', 'Planilhas com macros'),
  ('programacao', 'Banco de dados'),
  ('programacao', 'Desenvolvimento de jogos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('psicologo', 'Psicoterapia individual'),
  ('psicologo', 'Psicoterapia para adolescentes'),
  ('psicologo', 'Terapia de casal'),
  ('psicologo', 'Terapia para ansiedade e depressão'),
  ('psicologo', 'Orientação de pais'),
  ('psicologo', 'Terapia infantil'),
  ('psicologo', 'Atendimento online'),
  ('psicologo', 'Avaliação psicológica'),
  ('psicologo', 'Orientação vocacional'),
  ('psicologo', 'Atendimento em domicílio'),
  ('psicologo', 'Luto e perdas')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('quadro_eletrico', 'Instalação de quadro de distribuição'),
  ('quadro_eletrico', 'Troca de disjuntores'),
  ('quadro_eletrico', 'Instalação de DR e DPS'),
  ('quadro_eletrico', 'Organização de quadro elétrico'),
  ('quadro_eletrico', 'Troca de quadro antigo'),
  ('quadro_eletrico', 'Ampliação de carga'),
  ('quadro_eletrico', 'Quadro para ar-condicionado'),
  ('quadro_eletrico', 'Quadro para obra'),
  ('quadro_eletrico', 'Identificação de circuitos'),
  ('quadro_eletrico', 'Aterramento do quadro'),
  ('quadro_eletrico', 'Reparo de curto-circuito')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('rebocador', 'Reboco de parede'),
  ('rebocador', 'Reboco de fachada'),
  ('rebocador', 'Emboço'),
  ('rebocador', 'Chapisco'),
  ('rebocador', 'Reboco de muro'),
  ('rebocador', 'Reparo de reboco solto'),
  ('rebocador', 'Reboco interno'),
  ('rebocador', 'Reboco externo'),
  ('rebocador', 'Reboco fino'),
  ('rebocador', 'Acabamento liso para pintura'),
  ('rebocador', 'Reboco de teto')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('redator', 'Textos para site'),
  ('redator', 'Textos para redes sociais'),
  ('redator', 'Artigos para blog'),
  ('redator', 'Copywriting para vendas'),
  ('redator', 'Revisão de textos'),
  ('redator', 'Releases e comunicados'),
  ('redator', 'Roteiros para vídeos'),
  ('redator', 'Newsletter e e-mail marketing'),
  ('redator', 'Textos para currículo e LinkedIn'),
  ('redator', 'Descrição de produtos'),
  ('redator', 'Livros e ebooks')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('rede_internet', 'Instalação de rede Wi-Fi'),
  ('rede_internet', 'Instalação de cabeamento estruturado'),
  ('rede_internet', 'Melhora de sinal de Wi-Fi'),
  ('rede_internet', 'Instalação de roteador e repetidores'),
  ('rede_internet', 'Configuração de rede corporativa'),
  ('rede_internet', 'Instalação de ponto de rede'),
  ('rede_internet', 'Mesh e Wi-Fi 6'),
  ('rede_internet', 'Crimpagem e cabeamento'),
  ('rede_internet', 'Resolver internet lenta'),
  ('rede_internet', 'Configuração de VPN'),
  ('rede_internet', 'Rack e organização de cabos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('social_media', 'Gestão de Instagram'),
  ('social_media', 'Gestão de Facebook e TikTok'),
  ('social_media', 'Criação de posts'),
  ('social_media', 'Reels e vídeos curtos'),
  ('social_media', 'Planejamento de conteúdo'),
  ('social_media', 'Anúncios patrocinados'),
  ('social_media', 'Gestão de perfil profissional'),
  ('social_media', 'Gestão de comunidade e atendimento'),
  ('social_media', 'Calendário editorial'),
  ('social_media', 'Relatório mensal de resultados'),
  ('social_media', 'Stories e destaques')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('reforco_escolar', 'Reforço escolar fundamental'),
  ('reforco_escolar', 'Reforço escolar médio'),
  ('reforco_escolar', 'Reforço de matemática'),
  ('reforco_escolar', 'Reforço de português'),
  ('reforco_escolar', 'Apoio com lição de casa'),
  ('reforco_escolar', 'Alfabetização'),
  ('reforco_escolar', 'Preparação para provas'),
  ('reforco_escolar', 'Reforço em ciências'),
  ('reforco_escolar', 'Reforço para crianças com TDAH'),
  ('reforco_escolar', 'Aula em domicílio'),
  ('reforco_escolar', 'Aula online')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('banheiro_reforma', 'Reforma completa de banheiro'),
  ('banheiro_reforma', 'Troca de louças e metais'),
  ('banheiro_reforma', 'Troca de revestimentos'),
  ('banheiro_reforma', 'Instalação de box'),
  ('banheiro_reforma', 'Troca de pia e bancada'),
  ('banheiro_reforma', 'Impermeabilização de banheiro'),
  ('banheiro_reforma', 'Banheiro acessível'),
  ('banheiro_reforma', 'Instalação de chuveiro e ducha'),
  ('banheiro_reforma', 'Reforma de lavabo'),
  ('banheiro_reforma', 'Iluminação de banheiro')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('restauracao_moveis', 'Restauração de móveis antigos'),
  ('restauracao_moveis', 'Restauração de móveis de madeira'),
  ('restauracao_moveis', 'Restauração de cadeiras'),
  ('restauracao_moveis', 'Restauração de móveis laqueados'),
  ('restauracao_moveis', 'Troca de estofado e palhinha'),
  ('restauracao_moveis', 'Restauração de portas antigas'),
  ('restauracao_moveis', 'Pintura envelhecida (patina)'),
  ('restauracao_moveis', 'Reparo de cupim em móveis'),
  ('restauracao_moveis', 'Restauração de pianos e relógios'),
  ('restauracao_moveis', 'Reforma de estofados'),
  ('restauracao_moveis', 'Polimento e verniz')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('salgadeiro', 'Salgados para festas'),
  ('salgadeiro', 'Salgadinhos fritos'),
  ('salgadeiro', 'Salgados assados'),
  ('salgadeiro', 'Cento de salgados'),
  ('salgadeiro', 'Mini salgados'),
  ('salgadeiro', 'Salgados congelados'),
  ('salgadeiro', 'Salgados para eventos corporativos'),
  ('salgadeiro', 'Coxinha e risoles'),
  ('salgadeiro', 'Empadas e tortas salgadas'),
  ('salgadeiro', 'Salgados para festa infantil'),
  ('salgadeiro', 'Salgados veganos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('sanitizacao', 'Sanitização residencial'),
  ('sanitizacao', 'Sanitização comercial'),
  ('sanitizacao', 'Sanitização de veículos'),
  ('sanitizacao', 'Sanitização de condomínios'),
  ('sanitizacao', 'Sanitização de escolas'),
  ('sanitizacao', 'Sanitização de clínicas'),
  ('sanitizacao', 'Sanitização pós-evento'),
  ('sanitizacao', 'Sanitização com nebulização'),
  ('sanitizacao', 'Sanitização de caixa d''água'),
  ('sanitizacao', 'Contrato periódico de sanitização'),
  ('sanitizacao', 'Sanitização de ar-condicionado')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('sapateiro', 'Troca de sola'),
  ('sapateiro', 'Troca de salto'),
  ('sapateiro', 'Conserto de calçados'),
  ('sapateiro', 'Tingimento de sapatos'),
  ('sapateiro', 'Reforma de tênis'),
  ('sapateiro', 'Conserto de bolsas e mochilas'),
  ('sapateiro', 'Troca de zíper'),
  ('sapateiro', 'Limpeza e hidratação de couro'),
  ('sapateiro', 'Palmilhas sob medida'),
  ('sapateiro', 'Alargamento de sapatos'),
  ('sapateiro', 'Reforma de botas')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('seguranca_evento', 'Segurança para festa'),
  ('seguranca_evento', 'Segurança para casamento'),
  ('seguranca_evento', 'Segurança para eventos corporativos'),
  ('seguranca_evento', 'Controle de acesso e portaria'),
  ('seguranca_evento', 'Segurança para shows'),
  ('seguranca_evento', 'Segurança para formaturas'),
  ('seguranca_evento', 'Seguranças armados e desarmados'),
  ('seguranca_evento', 'Ronda e vigilância'),
  ('seguranca_evento', 'Segurança pessoal (escolta)'),
  ('seguranca_evento', 'Segurança para eventos esportivos'),
  ('seguranca_evento', 'Revista e credenciamento')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('serralheiro', 'Portões de ferro e alumínio'),
  ('serralheiro', 'Grades de proteção'),
  ('serralheiro', 'Estruturas metálicas'),
  ('serralheiro', 'Corrimãos e guarda-corpos'),
  ('serralheiro', 'Soldas e reparos'),
  ('serralheiro', 'Portão eletrônico'),
  ('serralheiro', 'Escadas metálicas'),
  ('serralheiro', 'Coberturas metálicas'),
  ('serralheiro', 'Mezanino metálico'),
  ('serralheiro', 'Pergolados de ferro'),
  ('serralheiro', 'Fechaduras e dobradiças')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('solda', 'Solda de estruturas metálicas'),
  ('solda', 'Solda de portões e grades'),
  ('solda', 'Solda de alumínio'),
  ('solda', 'Solda em aço inox'),
  ('solda', 'Solda de tubulação'),
  ('solda', 'Reparo de peças metálicas'),
  ('solda', 'Solda de caçambas e implementos'),
  ('solda', 'Solda MIG e TIG'),
  ('solda', 'Solda de reservatórios'),
  ('solda', 'Solda em campo'),
  ('solda', 'Fabricação de peças sob medida')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('som_auto', 'Instalação de som automotivo'),
  ('som_auto', 'Instalação de alto-falantes'),
  ('som_auto', 'Instalação de subwoofer e amplificador'),
  ('som_auto', 'Troca de multimídia'),
  ('som_auto', 'Instalação de rádio'),
  ('som_auto', 'Isolamento acústico'),
  ('som_auto', 'Regulagem de som'),
  ('som_auto', 'Reparo de som'),
  ('som_auto', 'Instalação de caixas de som'),
  ('som_auto', 'Instalação de TV e DVD automotivo'),
  ('som_auto', 'Projeto de som personalizado')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('stencil', 'Stencil em parede'),
  ('stencil', 'Pintura de padronagem em parede'),
  ('stencil', 'Arte de parede personalizada'),
  ('stencil', 'Grafite decorativo'),
  ('stencil', 'Painel decorativo pintado'),
  ('stencil', 'Mural artístico'),
  ('stencil', 'Pintura decorativa para quartos infantis'),
  ('stencil', 'Frases e letterings em paredes'),
  ('stencil', 'Stencil em móveis'),
  ('stencil', 'Pintura artística comercial'),
  ('stencil', 'Efeitos de parede (cimento queimado, tadelakt)')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('tecnico_informatica', 'Formatação e instalação'),
  ('tecnico_informatica', 'Remoção de vírus'),
  ('tecnico_informatica', 'Upgrade de hardware'),
  ('tecnico_informatica', 'Configuração de rede Wi-Fi'),
  ('tecnico_informatica', 'Recuperação de dados'),
  ('tecnico_informatica', 'Manutenção de notebook'),
  ('tecnico_informatica', 'Instalação de impressoras'),
  ('tecnico_informatica', 'Montagem de computador'),
  ('tecnico_informatica', 'Suporte técnico em domicílio'),
  ('tecnico_informatica', 'Troca de tela de notebook'),
  ('tecnico_informatica', 'Backup')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('telhador', 'Telhado novo'),
  ('telhador', 'Troca de telhas'),
  ('telhador', 'Conserto de goteiras'),
  ('telhador', 'Calhas e rufos'),
  ('telhador', 'Limpeza de telhado'),
  ('telhador', 'Impermeabilização de telhado'),
  ('telhador', 'Telha termoacústica'),
  ('telhador', 'Telhado de fibrocimento'),
  ('telhador', 'Manutenção preventiva'),
  ('telhador', 'Reforma completa do telhado'),
  ('telhador', 'Telha colonial')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('textura', 'Textura em parede'),
  ('textura', 'Grafiato'),
  ('textura', 'Textura em fachada'),
  ('textura', 'Textura rústica'),
  ('textura', 'Textura em sala e quarto'),
  ('textura', 'Aplicação de efeito cimento queimado'),
  ('textura', 'Efeito mármore'),
  ('textura', 'Textura em muros'),
  ('textura', 'Textura com rolo'),
  ('textura', 'Efeito travertino'),
  ('textura', 'Textura projetada')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('tradutor', 'Tradução simples'),
  ('tradutor', 'Tradução juramentada'),
  ('tradutor', 'Tradução de documentos'),
  ('tradutor', 'Tradução técnica'),
  ('tradutor', 'Interpretação simultânea'),
  ('tradutor', 'Tradução de sites'),
  ('tradutor', 'Tradução de contratos'),
  ('tradutor', 'Tradução de artigos acadêmicos'),
  ('tradutor', 'Legendagem'),
  ('tradutor', 'Interpretação consecutiva'),
  ('tradutor', 'Versão de currículo')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('translado', 'Transfer aeroporto'),
  ('translado', 'Translado para eventos'),
  ('translado', 'Translado rodoviário'),
  ('translado', 'Translado para casamentos'),
  ('translado', 'Transfer executivo'),
  ('translado', 'Translado de grupos'),
  ('translado', 'Translado entre cidades'),
  ('translado', 'Translado para hotéis'),
  ('translado', 'Transfer com carro de luxo'),
  ('translado', 'Translado para turismo'),
  ('translado', 'Van e micro-ônibus')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('transporte_pets', 'Transporte de pet para veterinário'),
  ('transporte_pets', 'Transporte de pet para pet shop'),
  ('transporte_pets', 'Transporte de pet para viagem'),
  ('transporte_pets', 'Transporte de pet para aeroporto'),
  ('transporte_pets', 'Transporte de gatos'),
  ('transporte_pets', 'Transporte de cães de grande porte'),
  ('transporte_pets', 'Transporte de animais entre cidades'),
  ('transporte_pets', 'Táxi pet'),
  ('transporte_pets', 'Transporte para hotel de pets'),
  ('transporte_pets', 'Documentação de viagem do pet')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('transporte_escolar', 'Transporte escolar diário'),
  ('transporte_escolar', 'Transporte escolar para creche'),
  ('transporte_escolar', 'Transporte escolar para ensino fundamental'),
  ('transporte_escolar', 'Transporte de alunos para atividades'),
  ('transporte_escolar', 'Transporte escolar com monitor'),
  ('transporte_escolar', 'Transporte escolar para necessidades especiais'),
  ('transporte_escolar', 'Transporte escolar mensal'),
  ('transporte_escolar', 'Transporte de ida ou volta'),
  ('transporte_escolar', 'Transporte escolar em van'),
  ('transporte_escolar', 'Transporte para excursões')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('verniz', 'Aplicação de verniz em madeira'),
  ('verniz', 'Verniz em portas'),
  ('verniz', 'Verniz em deck'),
  ('verniz', 'Tingimento de madeira'),
  ('verniz', 'Verniz marítimo'),
  ('verniz', 'Verniz em móveis'),
  ('verniz', 'Verniz em esquadrias'),
  ('verniz', 'Restauração de verniz'),
  ('verniz', 'Verniz em pisos de madeira'),
  ('verniz', 'Verniz em forros'),
  ('verniz', 'Aplicação de stain')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('veterinario_domicilio', 'Consulta veterinária em casa'),
  ('veterinario_domicilio', 'Vacinação'),
  ('veterinario_domicilio', 'Vermifugação'),
  ('veterinario_domicilio', 'Exames e coleta'),
  ('veterinario_domicilio', 'Pós-operatório em casa'),
  ('veterinario_domicilio', 'Eutanásia humanitária'),
  ('veterinario_domicilio', 'Atendimento de gatos'),
  ('veterinario_domicilio', 'Atendimento de idosos'),
  ('veterinario_domicilio', 'Curativos e medicação'),
  ('veterinario_domicilio', 'Check-up geral'),
  ('veterinario_domicilio', 'Orientação nutricional pet')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('vidraceiro', 'Troca de vidros'),
  ('vidraceiro', 'Box de banheiro'),
  ('vidraceiro', 'Espelhos'),
  ('vidraceiro', 'Portas e janelas de vidro'),
  ('vidraceiro', 'Vidro temperado'),
  ('vidraceiro', 'Fechamento de varanda'),
  ('vidraceiro', 'Guarda-corpo de vidro'),
  ('vidraceiro', 'Vitrines'),
  ('vidraceiro', 'Reparo em vidros'),
  ('vidraceiro', 'Cobertura de vidro'),
  ('vidraceiro', 'Tampo de vidro para mesas')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('vigia', 'Vigia noturno'),
  ('vigia', 'Vigia para obras'),
  ('vigia', 'Vigia para condomínio'),
  ('vigia', 'Vigilância de ruas'),
  ('vigia', 'Vigia para eventos'),
  ('vigia', 'Vigia para comércio'),
  ('vigia', 'Portaria e controle de acesso'),
  ('vigia', 'Vigia para terrenos'),
  ('vigia', 'Vigia para empresas'),
  ('vigia', 'Ronda de imóveis'),
  ('vigia', 'Vigia para residências')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('vitrinista', 'Montagem de vitrine'),
  ('vitrinista', 'Troca de vitrine por sazonalidade'),
  ('vitrinista', 'Vitrine de Natal'),
  ('vitrinista', 'Vitrine de datas comemorativas'),
  ('vitrinista', 'Visual merchandising'),
  ('vitrinista', 'Projeto de vitrine'),
  ('vitrinista', 'Organização de loja'),
  ('vitrinista', 'Montagem de displays'),
  ('vitrinista', 'Vitrine para lojas pequenas'),
  ('vitrinista', 'Decoração de ponto de venda'),
  ('vitrinista', 'Consultoria de layout de loja')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('yoga', 'Aula de hatha yoga'),
  ('yoga', 'Aula de vinyasa'),
  ('yoga', 'Aula de yoga para iniciantes'),
  ('yoga', 'Yoga para gestantes'),
  ('yoga', 'Yoga para idosos'),
  ('yoga', 'Meditação guiada'),
  ('yoga', 'Yoga em domicílio'),
  ('yoga', 'Aula de yoga online'),
  ('yoga', 'Yoga para coluna'),
  ('yoga', 'Yoga para crianças'),
  ('yoga', 'Aula em dupla ou grupo')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('cameras', 'Instalação de câmeras de segurança'),
  ('cameras', 'Instalação de DVR/NVR e gravador'),
  ('cameras', 'Configuração de acesso remoto pelo celular'),
  ('cameras', 'Manutenção e reparo de câmeras'),
  ('cameras', 'Troca de HD de gravação'),
  ('cameras', 'Câmeras com alarme integrado'),
  ('cameras', 'Ampliação de sistema existente'),
  ('cameras', 'Projeto de monitoramento residencial'),
  ('cameras', 'Projeto de monitoramento comercial'),
  ('cameras', 'Instalação de câmera Wi-Fi')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('advogado', 'Consulta jurídica'),
  ('advogado', 'Direito do consumidor'),
  ('advogado', 'Elaboração de contratos'),
  ('advogado', 'Direito de família'),
  ('advogado', 'Direito trabalhista'),
  ('advogado', 'Direito previdenciário (INSS)'),
  ('advogado', 'Direito imobiliário'),
  ('advogado', 'Inventário e herança'),
  ('advogado', 'Divórcio e pensão'),
  ('advogado', 'Direito civil'),
  ('advogado', 'Revisão de contratos'),
  ('advogado', 'Defesa em multas e processos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('arquiteto', 'Projeto de reforma'),
  ('arquiteto', 'Projeto residencial'),
  ('arquiteto', 'Regularização e aprovação na prefeitura'),
  ('arquiteto', 'Projeto comercial'),
  ('arquiteto', 'Acompanhamento de obra'),
  ('arquiteto', 'Projeto de ampliação'),
  ('arquiteto', 'Projeto 3D e renderização'),
  ('arquiteto', 'Projeto de interiores'),
  ('arquiteto', 'Levantamento arquitetônico'),
  ('arquiteto', 'Laudo técnico'),
  ('arquiteto', 'Consultoria de arquitetura')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('banho_tosa', 'Banho'),
  ('banho_tosa', 'Banho e tosa completa'),
  ('banho_tosa', 'Tosa higiênica'),
  ('banho_tosa', 'Tosa na tesoura'),
  ('banho_tosa', 'Tosa na máquina'),
  ('banho_tosa', 'Hidratação de pelos'),
  ('banho_tosa', 'Corte de unhas'),
  ('banho_tosa', 'Limpeza de ouvidos'),
  ('banho_tosa', 'Banho a seco'),
  ('banho_tosa', 'Banho e tosa em domicílio'),
  ('banho_tosa', 'Tosa de raças específicas')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('barbeiro', 'Corte masculino'),
  ('barbeiro', 'Barba'),
  ('barbeiro', 'Corte e barba'),
  ('barbeiro', 'Corte na máquina'),
  ('barbeiro', 'Degradê'),
  ('barbeiro', 'Sobrancelha masculina'),
  ('barbeiro', 'Pigmentação de barba'),
  ('barbeiro', 'Corte infantil'),
  ('barbeiro', 'Barboterapia'),
  ('barbeiro', 'Barbeiro em domicílio'),
  ('barbeiro', 'Relaxamento capilar')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

