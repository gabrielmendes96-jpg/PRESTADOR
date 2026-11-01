-- 44: categorias novas, termos alternativos e serviços
-- Gerado por scripts/seed-categorias.mjs a partir de supabase/seed/categorias-novas.mjs. Exige o 43. Idempotente.
begin;

insert into categorias (id, nome, emoji, ordem, personalizada, topico_id, termos) values
  ('assistencia_eletrodomesticos', 'Assistência Técnica de Eletrodomésticos', '🔧', 282, false, 'eletrica', 'conserto de geladeira, conserto de maquina de lavar, tecnico de eletrodomesticos, assistencia tecnica, conserto de fogao, conserto de microondas, micro-ondas, lava e seca, lava louca, refrigeracao domestica, eletrodomestico'),
  ('faz_tudo', 'Faz-tudo (Marido de Aluguel)', '🛠️', 283, false, 'residencial', 'marido de aluguel, faz tudo, fazedor de tudo, pequenos reparos, reparos domesticos, servicos gerais, manutencao residencial, manutencao de casa, bico, prestador de servicos gerais'),
  ('montador_moveis', 'Montador de Móveis', '🪑', 284, false, 'marcenaria', 'montagem de moveis, montar guarda roupa, montar movel, montador, montagem de guarda-roupa, montagem de cozinha, moveis comprados online, desmontar movel'),
  ('conserto_celular', 'Conserto de Celular e Tablet', '📱', 285, false, 'tecnologia', 'assistencia tecnica de celular, troca de tela de celular, celular quebrado, tela trincada, bateria de celular, conserto de iphone, conserto de smartphone, conserto de tablet'),
  ('conserto_tv_eletronicos', 'Conserto de TV e Eletrônicos', '📺', 286, false, 'tecnologia', 'conserto de tv, tv sem imagem, tv nao liga, conserto de televisao, conserto de som, conserto de video game, conserto de caixa de som, eletronicos'),
  ('instalador_tv', 'Instalador de TV e Antena', '📡', 287, false, 'tecnologia', 'suporte de tv, instalar tv, antena digital, antena parabolica, instalacao de antena, configurar smart tv, instalar suporte de parede, antena de tv'),
  ('baba', 'Babá e Cuidador Infantil', '👶', 288, false, 'saude', 'baba, cuidar de crianca, cuidadora de crianca, folguista, baba noturna, buscar na escola, baba diaria, crianca, bebe'),
  ('passadeira_lavanderia', 'Passadeira e Lavanderia', '👔', 289, false, 'limpeza', 'passar roupa, passadeira, lavanderia, lavar roupa, lavar edredom, lavar cobertor, lavanderia em domicilio, roupa passada'),
  ('retirada_entulho', 'Retirada de Entulho e Caçamba', '🗑️', 290, false, 'construcao', 'cacamba, aluguel de cacamba, entulho, retirar entulho, descarte de moveis, lixo de reforma, bota fora, retirada de lixo, cacamba de entulho'),
  ('estofador', 'Estofador', '🛋️', 291, false, 'marcenaria', 'reforma de sofa, estofaria, trocar espuma, tapeceiro, reforma de cadeira, reforma de poltrona, estofado, sofa rasgado'),
  ('calhas_rufos', 'Calhas e Rufos', '☔', 292, false, 'construcao', 'calheiro, calha, instalacao de calha, calha entupida, calha vazando, rufo, pingadeira, conserto de calha, calha de chuva'),
  ('vidros_automotivos', 'Vidros e Para-brisas Automotivos', '🚗', 293, false, 'automotivo', 'para-brisa, parabrisa, trocar parabrisa, vidro de carro, vidro trincado, reparo de para-brisa, vidro do carro quebrado, vidraceiro automotivo'),
  ('capotaria', 'Capotaria e Estofados Automotivos', '🚘', 294, false, 'automotivo', 'capotaria, banco de carro, forro de teto do carro, estofado de carro, forracao, capa de banco, reforma de banco, tapete de carro, volante'),
  ('instrutor_direcao', 'Instrutor de Direção', '🚦', 295, false, 'educacao', 'aula de direcao, instrutor de autoescola, aprender a dirigir, aula de carro, aula de moto, habilitacao, cnh, baliza, perder o medo de dirigir'),
  ('laudo_cautelar', 'Laudo Cautelar e Vistoria Veicular', '🔍', 296, false, 'automotivo', 'laudo cautelar, vistoria de carro, vistoria veicular, inspecao veicular, avaliacao de carro usado, perito automotivo, antes de comprar carro, laudo de veiculo, pericia veicular'),
  ('podologo', 'Podólogo', '🦶', 297, false, 'saude', 'podologia, unha encravada, calo, pe diabetico, pedicure clinica, tratamento de unhas dos pes, frieira, micose de unha, cravo de unha'),
  ('fonoaudiologo', 'Fonoaudiólogo', '🗣️', 298, false, 'saude', 'fono, fonoaudiologia, atraso na fala, gagueira, terapia de fala, fala da crianca, dificuldade de fala, degluticao, voz, audicao'),
  ('aula_natacao_esportes', 'Aula de Natação e Esportes', '🏊', 299, false, 'educacao', 'aula de natacao, natacao, aula de futebol, aula de tenis, aula de volei, aula de basquete, personal de natacao, hidroginastica, esporte, aula de surf, aula de skate'),
  ('aula_idiomas', 'Aula de Outros Idiomas', '🌍', 300, false, 'educacao', 'aula de frances, aula de alemao, aula de italiano, libras, aula de japones, aula de mandarim, aula de russo, linguas, idioma, aula de portugues para estrangeiros'),
  ('aula_desenho_artes', 'Aula de Desenho e Artes', '🎨', 301, false, 'educacao', 'aula de desenho, aula de pintura, aula de arte, aula de aquarela, aula de artes plasticas, aula de manga, curso de desenho, desenho para crianca, aula de ceramica, aula de croche'),
  ('locacao_festas', 'Locação de Mesas, Cadeiras e Utensílios', '🪑', 302, false, 'eventos', 'aluguel de mesas e cadeiras, aluguel de cadeiras, aluguel de mesas, locacao para festas, aluguel de louca, aluguel de talheres, aluguel de tenda, aluguel de toalhas, equipamentos para festa, aluguel de som'),
  ('hotel_pets', 'Hotel e Creche para Pets', '🏨', 303, false, 'animais', 'hotel para cachorro, hospedagem de pet, creche de cachorro, daycare pet, hospedagem de cachorro, hospedagem de gato, deixar o cachorro, pensao para cachorro, hotelzinho'),
  ('avaliador_imoveis', 'Avaliador de Imóveis', '🏘️', 304, false, 'juridico', 'avaliacao de imovel, laudo de avaliacao, perito avaliador, quanto vale meu imovel, avaliacao para financiamento, avaliacao para inventario, pericia imobiliaria, ptam, avaliador'),
  ('corretor_seguros', 'Corretor de Seguros', '🛡️', 305, false, 'juridico', 'seguro de carro, seguro residencial, seguro de vida, seguro auto, seguro de moto, plano de saude, seguro viagem, seguro empresarial, cotacao de seguro, seguro fianca'),
  ('assistente_virtual', 'Assistente Virtual e Digitador', '💼', 306, false, 'design', 'secretaria virtual, digitador, digitacao, assistente administrativo, transcricao, trabalho remoto, planilhas, organizar agenda, atendimento ao cliente online, suporte administrativo'),
  ('topografo', 'Topógrafo', '📐', 307, false, 'construcao', 'topografia, levantamento topografico, medicao de terreno, demarcacao de terreno, georreferenciamento, planta de terreno, usucapiao, desmembramento, nivelamento, agrimensor'),
  ('pocos_cisternas', 'Poço Artesiano e Cisterna', '💧', 308, false, 'hidraulica', 'poco artesiano, perfuracao de poco, poco semi-artesiano, cisterna, captacao de agua, bomba de poco, limpeza de poco, poco caipira, agua do poco, aproveitamento de agua da chuva')
on conflict (id) do update set termos = excluded.termos;

insert into topico_categorias (topico_id, categoria_id)
select d.topico_id, d.categoria_id from (values
  ('eletrica', 'assistencia_eletrodomesticos'),
  ('residencial', 'faz_tudo'),
  ('marcenaria', 'montador_moveis'),
  ('tecnologia', 'conserto_celular'),
  ('tecnologia', 'conserto_tv_eletronicos'),
  ('tecnologia', 'instalador_tv'),
  ('saude', 'baba'),
  ('limpeza', 'passadeira_lavanderia'),
  ('construcao', 'retirada_entulho'),
  ('marcenaria', 'estofador'),
  ('construcao', 'calhas_rufos'),
  ('automotivo', 'vidros_automotivos'),
  ('automotivo', 'capotaria'),
  ('educacao', 'instrutor_direcao'),
  ('automotivo', 'laudo_cautelar'),
  ('saude', 'podologo'),
  ('saude', 'fonoaudiologo'),
  ('educacao', 'aula_natacao_esportes'),
  ('educacao', 'aula_idiomas'),
  ('educacao', 'aula_desenho_artes'),
  ('eventos', 'locacao_festas'),
  ('animais', 'hotel_pets'),
  ('juridico', 'avaliador_imoveis'),
  ('juridico', 'corretor_seguros'),
  ('design', 'assistente_virtual'),
  ('construcao', 'topografo'),
  ('hidraulica', 'pocos_cisternas')
) as d(topico_id, categoria_id)
where not exists (select 1 from topico_categorias t where t.topico_id = d.topico_id and t.categoria_id = d.categoria_id);

update categorias set termos = 'bombeiro hidraulico, bombeiro, hidraulica, encanamento, cano, hidraulico' where id = 'encanador';
update categorias set termos = 'faxina, empregada domestica, domestica, limpeza de casa, faxineira, mensalista' where id = 'diarista';
update categorias set termos = 'diarista, empregada domestica, faxina, limpeza de casa' where id = 'faxineira';
update categorias set termos = 'eletrica, eletricidade, instalacao eletrica, fiacao, tomada, chuveiro' where id = 'eletricista';
update categorias set termos = 'obra, construcao, alvenaria, reforma, ajudante de pedreiro, servente' where id = 'pedreiro';
update categorias set termos = 'empreiteiro, construtor, engenheiro de obra, encarregado de obra' where id = 'mestre_obras';
update categorias set termos = 'pintura, pintar casa, pintor de parede, pintura de casa' where id = 'pintor';
update categorias set termos = 'carpinteiro de moveis, moveis sob medida, marcenaria, movel planejado' where id = 'marceneiro';
update categorias set termos = 'marceneiro, madeira, telhado de madeira, carpintaria' where id = 'carpinteiro';
update categorias set termos = 'oficina, mecanica, conserto de carro, auto center, revisao de carro, carro quebrado' where id = 'mecanico';
update categorias set termos = 'oficina de moto, mecanica de moto, motocicleta, conserto de moto' where id = 'moto_mecanico';
update categorias set termos = 'computador, notebook, pc, ti, suporte tecnico, formatacao, conserto de computador' where id = 'tecnico_informatica';
update categorias set termos = 'chave, fechadura, abertura de porta, cadeado, tetra chave' where id = 'chaveiro';
update categorias set termos = 'salao, cabelo, corte de cabelo, escova, cabeleireira, salao de beleza' where id = 'cabeleireiro';
update categorias set termos = 'unha, pedicure, esmalte, manicure e pedicure, unhas' where id = 'manicure';
update categorias set termos = 'barba, corte masculino, barbearia, cabelo masculino' where id = 'barbeiro';
update categorias set termos = 'personal, treino, academia, treinador, musculacao, emagrecer' where id = 'personal_trainer';
update categorias set termos = 'fotografia, fotos, ensaio, fotografo profissional' where id = 'fotografo';
update categorias set termos = 'fotografo, fotos, ensaio' where id = 'fotografia';
update categorias set termos = 'chofer, motorista particular, motorista de aplicativo, motorista para viagem' where id = 'motorista';
update categorias set termos = 'jardim, grama, poda, paisagismo, quintal' where id = 'jardineiro';
update categorias set termos = 'praga, baratas, ratos, cupim, controle de pragas, dedetizacao, formiga' where id = 'dedetizador';
update categorias set termos = 'dedetizador, baratas, cupim, pragas urbanas' where id = 'controle_pragas';
update categorias set termos = 'ar condicionado, split, refrigeracao, climatizacao, ar condicionado split, instalacao de ar' where id = 'ar_condicionado';
update categorias set termos = 'ar condicionado do carro, ar do carro, gas do ar, ar condicionado automotivo' where id = 'ar_auto';
update categorias set termos = 'vidro, espelho, box, vidros, janela de vidro' where id = 'vidraceiro';
update categorias set termos = 'ferro, portao, grade, solda, serralheria' where id = 'serralheiro';
update categorias set termos = 'gesso, forro de gesso, drywall, sanca, rebaixamento de teto' where id = 'gesseiro';
update categorias set termos = 'azulejo, piso, ceramica, revestimento, porcelanato, ladrilheiro' where id = 'azulejista';
update categorias set termos = 'telhado, telha, goteira, calha, cobertura' where id = 'telhador';
update categorias set termos = 'infiltracao, goteira, vazamento na laje, umidade, mofo' where id = 'impermeabilizador';
update categorias set termos = 'cano estourado, vazamento de agua, caca vazamento, vazamento escondido' where id = 'vazamento';
update categorias set termos = 'caixa d''agua, limpeza de caixa, reservatorio, limpar caixa dagua' where id = 'limpeza_caixa';
update categorias set termos = 'carreto, frete, transportadora, mudanca residencial, carregador' where id = 'mudanca';
update categorias set termos = 'carreto, mudanca, transporte de moveis, caminhao, caminhonete' where id = 'frete';
update categorias set termos = 'terapia, terapeuta, psicoterapia, saude mental, psicologa, ansiedade' where id = 'psicologo';
update categorias set termos = 'dieta, emagrecer, reeducacao alimentar, nutricao' where id = 'nutricionista';
update categorias set termos = 'fisio, reabilitacao, rpg, dor nas costas, fisioterapia' where id = 'fisioterapeuta';
update categorias set termos = 'massagem, massoterapeuta, relaxante, massoterapia' where id = 'massagista';
update categorias set termos = 'vet, veterinario, cachorro, gato, pet doente, veterinaria' where id = 'veterinario_domicilio';
update categorias set termos = 'passeador, dog walker, passear com cachorro, passeador de cachorro' where id = 'passeio_caes';
update categorias set termos = 'pet shop, banho em cachorro, tosa, petshop, banho e tosa' where id = 'banho_tosa';
update categorias set termos = 'advocacia, juridico, processo, direito, advogada' where id = 'advogado';
update categorias set termos = 'contabilidade, imposto de renda, abrir empresa, mei, contabil' where id = 'contador';
update categorias set termos = 'documentacao, transferencia de veiculo, ipva, licenciamento, documento do carro' where id = 'despachante';
update categorias set termos = 'imobiliaria, vender casa, alugar imovel, corretor, comprar casa' where id = 'corretor_imoveis';
update categorias set termos = 'aula particular, reforco, explicador, professor' where id = 'professor_particular';
update categorias set termos = 'doces, bolos, doceira, confeitaria, bolo de aniversario' where id = 'confeiteiro';
update categorias set termos = 'cozinheira, comida caseira, chef particular, cozinhar em casa' where id = 'cozinheiro';
update categorias set termos = 'festa, eventos, comida para festa, festa de aniversario' where id = 'buffet';
update categorias set termos = 'som para festa, musica para festa, discotecario, som e iluminacao' where id = 'dj';
update categorias set termos = 'recreacao, festa infantil, recreador, palhaco, mágico' where id = 'animador';
update categorias set termos = 'idoso, acompanhante, cuidadora, enfermagem domiciliar, cuidar de idoso' where id = 'cuidador_idoso';
update categorias set termos = 'tecnico de enfermagem, curativo, injecao em casa, enfermagem, home care' where id = 'enfermeiro';
update categorias set termos = 'reboque, socorro, guincho 24 horas, guincho de carro' where id = 'guincho';
update categorias set termos = 'reboque, socorro, guincho 24 horas, guincho de carro' where id = 'guincho_auto';
update categorias set termos = 'pneu, pneu furado, calibrar, troca de pneu, borracharia' where id = 'borracheiro';
update categorias set termos = 'lava jato, lavar carro, lavagem de carro, lava rapido' where id = 'lavagem_auto';
update categorias set termos = 'lanternagem, martelinho de ouro, amassado, funilaria, lataria' where id = 'funileiro';
update categorias set termos = 'pintura de carro, repintura, pintar carro' where id = 'pintura_auto';
update categorias set termos = 'radio, multimidia, som de carro, alto-falante, radio de carro' where id = 'som_auto';
update categorias set termos = 'bateria, alternador, motor de partida, carro nao liga, parte eletrica do carro' where id = 'eletrica_auto';
update categorias set termos = 'seguranca, sensor, alarme residencial, alarme de casa' where id = 'alarme';
update categorias set termos = 'cftv, monitoramento, camera de seguranca, camera de vigilancia' where id = 'cameras';
update categorias set termos = 'cerca, seguranca de muro, concertina, cerca de muro' where id = 'cerca_eletrica';
update categorias set termos = 'energia solar, placa solar, fotovoltaico, sistema solar' where id = 'painel_solar';
update categorias set termos = 'piscineiro, piscina, tratamento de agua da piscina, limpeza de piscina' where id = 'piscina_manutencao';
update categorias set termos = 'piscineiro, piscina, tratamento de agua da piscina' where id = 'limpeza_piscina';
update categorias set termos = 'cortar arvore, derrubar arvore, poda, tree' where id = 'poda_arvore';
update categorias set termos = 'rocadeira, cortar grama, jardim, gramado' where id = 'corte_grama';
update categorias set termos = 'boiler, aquecedor de agua, resistencia, agua quente, chuveiro eletrico' where id = 'aquecedor';
update categorias set termos = 'entupimento, desentupir, esgoto entupido, pia entupida, vaso entupido' where id = 'desentupidor';
update categorias set termos = 'curso de ingles, ingles, conversacao em ingles, english' where id = 'aula_ingles';
update categorias set termos = 'matematica, explicador de matematica, reforco de matematica' where id = 'aula_matematica';
update categorias set termos = 'explicador, dever de casa, aula de reforco, lição de casa' where id = 'reforco_escolar';
update categorias set termos = 'cuidar do cachorro, hospedagem em casa, cuidador de pet, viagem com pet' where id = 'pet_sitter';
update categorias set termos = 'treinar cachorro, educar cachorro, adestramento, comportamento canino' where id = 'adestrador';
update categorias set termos = 'portao automatico, motor de portao, portao basculante, portao de garagem' where id = 'portao_eletrico';
update categorias set termos = 'casa inteligente, alexa, smart home, automacao residencial' where id = 'automacao';
update categorias set termos = 'wi-fi, wifi, internet lenta, roteador, cabeamento de rede' where id = 'rede_internet';
update categorias set termos = 'editar video, edicao, youtube, reels, montagem de video' where id = 'edicao_video';
update categorias set termos = 'instagram, gerenciar redes sociais, redes sociais, marketing de conteudo' where id = 'social_media';
update categorias set termos = 'site, loja virtual, criar site, landing page, programador de sites' where id = 'desenvolvimento_web';
update categorias set termos = 'logotipo, logo, arte para redes, identidade visual, designer' where id = 'design_grafico';
update categorias set termos = 'reformar banheiro, reforma de banheiro, banheiro' where id = 'banheiro_reforma';
update categorias set termos = 'pos obra, limpeza de obra, limpeza depois da reforma, limpeza final de obra' where id = 'limpeza_pos_obra';
update categorias set termos = 'limpar sofa, higienizacao de sofa, lavar sofa, limpeza de estofado' where id = 'lavagem_sofa';
update categorias set termos = 'limpar colchao, higienizacao de colchao, lavar colchao, acaro' where id = 'lavagem_colchao';
update categorias set termos = 'lavar tapete, limpeza de tapete, tapete' where id = 'lavagem_tapete';

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('assistencia_eletrodomesticos', 'Geladeira que não gela'),
  ('assistencia_eletrodomesticos', 'Geladeira fazendo barulho ou pingando'),
  ('assistencia_eletrodomesticos', 'Máquina de lavar não centrifuga'),
  ('assistencia_eletrodomesticos', 'Máquina de lavar não enche ou não drena'),
  ('assistencia_eletrodomesticos', 'Conserto de fogão e cooktop'),
  ('assistencia_eletrodomesticos', 'Conserto de micro-ondas'),
  ('assistencia_eletrodomesticos', 'Conserto de lava-louças'),
  ('assistencia_eletrodomesticos', 'Conserto de secadora de roupas'),
  ('assistencia_eletrodomesticos', 'Troca de borracha da porta da geladeira'),
  ('assistencia_eletrodomesticos', 'Conserto de freezer'),
  ('assistencia_eletrodomesticos', 'Conserto de coifa e depurador'),
  ('assistencia_eletrodomesticos', 'Conserto de forno elétrico')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('faz_tudo', 'Pendurar quadros, espelhos e prateleiras'),
  ('faz_tudo', 'Troca de chuveiro e torneira'),
  ('faz_tudo', 'Pequenos reparos em casa'),
  ('faz_tudo', 'Instalação de cortinas e varões'),
  ('faz_tudo', 'Montagem de móveis simples'),
  ('faz_tudo', 'Instalação de suporte de TV'),
  ('faz_tudo', 'Troca de lâmpadas e tomadas'),
  ('faz_tudo', 'Conserto de porta e fechadura'),
  ('faz_tudo', 'Vedação de silicone no box e na pia'),
  ('faz_tudo', 'Pequenos reparos de pintura'),
  ('faz_tudo', 'Revisão geral da casa antes de mudar'),
  ('faz_tudo', 'Instalação de prateleiras e nichos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('montador_moveis', 'Montagem de guarda-roupa'),
  ('montador_moveis', 'Montagem de cozinha e armários'),
  ('montador_moveis', 'Montagem de cama e beliche'),
  ('montador_moveis', 'Montagem de estante e rack'),
  ('montador_moveis', 'Montagem de escrivaninha e home office'),
  ('montador_moveis', 'Desmontagem e montagem para mudança'),
  ('montador_moveis', 'Montagem de móveis comprados em loja online'),
  ('montador_moveis', 'Montagem de berço e cômoda'),
  ('montador_moveis', 'Fixação de móveis na parede'),
  ('montador_moveis', 'Montagem de sofá e poltrona')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('conserto_celular', 'Troca de tela de celular'),
  ('conserto_celular', 'Troca de bateria de celular'),
  ('conserto_celular', 'Celular não carrega (conector)'),
  ('conserto_celular', 'Celular molhado ou que caiu na água'),
  ('conserto_celular', 'Troca de vidro traseiro'),
  ('conserto_celular', 'Câmera ou alto-falante com defeito'),
  ('conserto_celular', 'Troca de tela de tablet'),
  ('conserto_celular', 'Desbloqueio e formatação de celular'),
  ('conserto_celular', 'Aplicação de película e capa'),
  ('conserto_celular', 'Recuperação de fotos e contatos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('conserto_tv_eletronicos', 'TV sem imagem ou sem som'),
  ('conserto_tv_eletronicos', 'TV não liga'),
  ('conserto_tv_eletronicos', 'Troca de tela de TV'),
  ('conserto_tv_eletronicos', 'Conserto de videogame'),
  ('conserto_tv_eletronicos', 'Conserto de caixa de som e home theater'),
  ('conserto_tv_eletronicos', 'Conserto de monitor'),
  ('conserto_tv_eletronicos', 'Conserto de rádio e aparelho de som'),
  ('conserto_tv_eletronicos', 'Conserto de projetor'),
  ('conserto_tv_eletronicos', 'Conserto de câmera fotográfica')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('instalador_tv', 'Instalação de suporte de TV na parede'),
  ('instalador_tv', 'Instalação de antena digital'),
  ('instalador_tv', 'Instalação de antena parabólica'),
  ('instalador_tv', 'Configuração de Smart TV'),
  ('instalador_tv', 'Instalação de TV com fios escondidos'),
  ('instalador_tv', 'Instalação de home theater e soundbar'),
  ('instalador_tv', 'Apontamento e ajuste de antena'),
  ('instalador_tv', 'Passagem de cabos de TV e internet'),
  ('instalador_tv', 'Instalação de TV em painel ou teto')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('baba', 'Babá diária'),
  ('baba', 'Babá noturna'),
  ('baba', 'Folguista (fim de semana)'),
  ('baba', 'Buscar e levar da escola'),
  ('baba', 'Babá para eventos e festas'),
  ('baba', 'Babá para viagem'),
  ('baba', 'Cuidado de recém-nascido'),
  ('baba', 'Auxílio com lição de casa'),
  ('baba', 'Babá por hora')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('passadeira_lavanderia', 'Passar roupa (por peça)'),
  ('passadeira_lavanderia', 'Passar roupa (por hora)'),
  ('passadeira_lavanderia', 'Lavar e passar a roupa da semana'),
  ('passadeira_lavanderia', 'Lavar edredom e cobertor'),
  ('passadeira_lavanderia', 'Lavar tapete e cortina'),
  ('passadeira_lavanderia', 'Lavanderia com busca e entrega'),
  ('passadeira_lavanderia', 'Lavar roupa delicada e de festa'),
  ('passadeira_lavanderia', 'Engomar e passar camisas sociais'),
  ('passadeira_lavanderia', 'Lavagem a seco')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('retirada_entulho', 'Aluguel de caçamba'),
  ('retirada_entulho', 'Retirada de entulho de obra'),
  ('retirada_entulho', 'Descarte de móveis e eletrodomésticos velhos'),
  ('retirada_entulho', 'Retirada de lixo e galhos'),
  ('retirada_entulho', 'Retirada de entulho de terreno'),
  ('retirada_entulho', 'Bota-fora com caminhão'),
  ('retirada_entulho', 'Retirada de entulho de demolição'),
  ('retirada_entulho', 'Remoção de móveis velhos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('estofador', 'Reforma de sofá'),
  ('estofador', 'Troca de espuma e enchimento'),
  ('estofador', 'Troca de tecido e revestimento'),
  ('estofador', 'Reforma de cadeiras e poltronas'),
  ('estofador', 'Estofado de cabeceira e cama'),
  ('estofador', 'Reparo de sofá rasgado'),
  ('estofador', 'Reforma de banco de bar e puffs'),
  ('estofador', 'Estofamento sob medida'),
  ('estofador', 'Reforma de colchão')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('calhas_rufos', 'Instalação de calhas'),
  ('calhas_rufos', 'Conserto de calha vazando'),
  ('calhas_rufos', 'Limpeza de calha entupida'),
  ('calhas_rufos', 'Instalação de rufos e pingadeiras'),
  ('calhas_rufos', 'Troca de calhas antigas'),
  ('calhas_rufos', 'Calha de alumínio e galvanizada sob medida'),
  ('calhas_rufos', 'Instalação de condutores de água da chuva'),
  ('calhas_rufos', 'Vedação de calha')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('vidros_automotivos', 'Troca de para-brisa'),
  ('vidros_automotivos', 'Reparo de trinca no para-brisa'),
  ('vidros_automotivos', 'Troca de vidro de porta'),
  ('vidros_automotivos', 'Troca de vidro traseiro'),
  ('vidros_automotivos', 'Instalação de vidro elétrico'),
  ('vidros_automotivos', 'Troca de retrovisor'),
  ('vidros_automotivos', 'Película e vidro fumê'),
  ('vidros_automotivos', 'Reposição de vidro quebrado em roubo')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('capotaria', 'Reforma de banco de carro'),
  ('capotaria', 'Troca de forro de teto'),
  ('capotaria', 'Forração de porta e painel'),
  ('capotaria', 'Capas de banco sob medida'),
  ('capotaria', 'Tapetes automotivos sob medida'),
  ('capotaria', 'Reforma de volante'),
  ('capotaria', 'Reparo de rasgos em couro'),
  ('capotaria', 'Revestimento de bancos em couro')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('instrutor_direcao', 'Aula de direção para iniciantes'),
  ('instrutor_direcao', 'Aula de baliza'),
  ('instrutor_direcao', 'Aula para perder o medo de dirigir'),
  ('instrutor_direcao', 'Aula de direção na estrada'),
  ('instrutor_direcao', 'Aula de moto'),
  ('instrutor_direcao', 'Preparação para o exame da CNH'),
  ('instrutor_direcao', 'Aula para quem tirou a CNH e não dirige'),
  ('instrutor_direcao', 'Aula em carro automático'),
  ('instrutor_direcao', 'Aula de direção no carro do aluno')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('laudo_cautelar', 'Laudo cautelar de carro usado'),
  ('laudo_cautelar', 'Vistoria antes de comprar um carro'),
  ('laudo_cautelar', 'Vistoria de transferência'),
  ('laudo_cautelar', 'Avaliação de valor de veículo'),
  ('laudo_cautelar', 'Perícia em sinistro'),
  ('laudo_cautelar', 'Vistoria de moto'),
  ('laudo_cautelar', 'Checklist de revisão para venda'),
  ('laudo_cautelar', 'Inspeção em domicílio')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('podologo', 'Tratamento de unha encravada'),
  ('podologo', 'Remoção de calos e calosidades'),
  ('podologo', 'Cuidados com pé diabético'),
  ('podologo', 'Tratamento de micose nas unhas'),
  ('podologo', 'Pedicure clínica'),
  ('podologo', 'Órtese de unha (reconstrução)'),
  ('podologo', 'Palmilhas e correção postural'),
  ('podologo', 'Atendimento a domicílio')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('fonoaudiologo', 'Atraso na fala infantil'),
  ('fonoaudiologo', 'Gagueira'),
  ('fonoaudiologo', 'Terapia de voz'),
  ('fonoaudiologo', 'Dificuldade de deglutição'),
  ('fonoaudiologo', 'Avaliação auditiva'),
  ('fonoaudiologo', 'Dislexia e dificuldades de leitura'),
  ('fonoaudiologo', 'Fonoterapia em domicílio'),
  ('fonoaudiologo', 'Fonoaudiologia para idosos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('aula_natacao_esportes', 'Natação para adultos'),
  ('aula_natacao_esportes', 'Natação infantil'),
  ('aula_natacao_esportes', 'Natação para bebês'),
  ('aula_natacao_esportes', 'Hidroginástica'),
  ('aula_natacao_esportes', 'Aula de tênis'),
  ('aula_natacao_esportes', 'Aula de futebol'),
  ('aula_natacao_esportes', 'Aula de vôlei'),
  ('aula_natacao_esportes', 'Aula de surf e stand up paddle'),
  ('aula_natacao_esportes', 'Aula particular de skate')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('aula_idiomas', 'Aula de francês'),
  ('aula_idiomas', 'Aula de alemão'),
  ('aula_idiomas', 'Aula de italiano'),
  ('aula_idiomas', 'Aula de Libras'),
  ('aula_idiomas', 'Aula de japonês'),
  ('aula_idiomas', 'Aula de mandarim'),
  ('aula_idiomas', 'Aula de coreano'),
  ('aula_idiomas', 'Preparação para certificados (DELF, Goethe, CELI)'),
  ('aula_idiomas', 'Conversação para viagem')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('aula_desenho_artes', 'Desenho para iniciantes'),
  ('aula_desenho_artes', 'Pintura em tela'),
  ('aula_desenho_artes', 'Aquarela'),
  ('aula_desenho_artes', 'Desenho de mangá e animação'),
  ('aula_desenho_artes', 'Arte para crianças'),
  ('aula_desenho_artes', 'Cerâmica e modelagem'),
  ('aula_desenho_artes', 'Desenho técnico e arquitetônico'),
  ('aula_desenho_artes', 'Caricatura e retrato'),
  ('aula_desenho_artes', 'Crochê e tricô (aula)')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('locacao_festas', 'Aluguel de mesas e cadeiras'),
  ('locacao_festas', 'Aluguel de tendas e coberturas'),
  ('locacao_festas', 'Aluguel de louças, talheres e taças'),
  ('locacao_festas', 'Aluguel de toalhas e capas de cadeira'),
  ('locacao_festas', 'Aluguel de aparelhagem de som'),
  ('locacao_festas', 'Aluguel de churrasqueira e equipamentos de cozinha'),
  ('locacao_festas', 'Aluguel de ventiladores e climatizadores para evento'),
  ('locacao_festas', 'Aluguel de palco e estrutura'),
  ('locacao_festas', 'Aluguel de geladeira e freezer para festa'),
  ('locacao_festas', 'Entrega, montagem e retirada')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('hotel_pets', 'Hospedagem de cães'),
  ('hotel_pets', 'Hospedagem de gatos'),
  ('hotel_pets', 'Creche diária para cães'),
  ('hotel_pets', 'Hospedagem para viagens longas'),
  ('hotel_pets', 'Hotel com acompanhamento veterinário'),
  ('hotel_pets', 'Hospedagem de filhotes e idosos'),
  ('hotel_pets', 'Hospedagem de pets pequenos (roedores, aves)'),
  ('hotel_pets', 'Busca e entrega do pet')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('avaliador_imoveis', 'Avaliação de imóvel para venda'),
  ('avaliador_imoveis', 'Avaliação para financiamento'),
  ('avaliador_imoveis', 'Laudo para inventário e partilha'),
  ('avaliador_imoveis', 'Avaliação para aluguel'),
  ('avaliador_imoveis', 'Perícia judicial imobiliária'),
  ('avaliador_imoveis', 'Avaliação de terrenos'),
  ('avaliador_imoveis', 'Parecer técnico de avaliação (PTAM)'),
  ('avaliador_imoveis', 'Avaliação de imóveis rurais')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('corretor_seguros', 'Seguro de carro'),
  ('corretor_seguros', 'Seguro residencial'),
  ('corretor_seguros', 'Seguro de vida'),
  ('corretor_seguros', 'Seguro de moto'),
  ('corretor_seguros', 'Seguro viagem'),
  ('corretor_seguros', 'Seguro empresarial'),
  ('corretor_seguros', 'Seguro-fiança (aluguel)'),
  ('corretor_seguros', 'Plano de saúde (cotação)'),
  ('corretor_seguros', 'Renovação e comparação de apólice')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('assistente_virtual', 'Digitação de documentos'),
  ('assistente_virtual', 'Transcrição de áudio e vídeo'),
  ('assistente_virtual', 'Organização de agenda e e-mails'),
  ('assistente_virtual', 'Atendimento via WhatsApp'),
  ('assistente_virtual', 'Criação e organização de planilhas'),
  ('assistente_virtual', 'Pesquisa de mercado e fornecedores'),
  ('assistente_virtual', 'Apoio administrativo remoto'),
  ('assistente_virtual', 'Cadastro de produtos em lojas virtuais'),
  ('assistente_virtual', 'Formatação de trabalhos acadêmicos')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('topografo', 'Levantamento topográfico'),
  ('topografo', 'Medição e demarcação de terreno'),
  ('topografo', 'Georreferenciamento'),
  ('topografo', 'Planta para regularização'),
  ('topografo', 'Desmembramento e unificação de terrenos'),
  ('topografo', 'Locação de obra'),
  ('topografo', 'Nivelamento de terreno'),
  ('topografo', 'Planta para usucapião')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

insert into servicos_catalogo (categoria_id, nome)
select d.categoria_id, d.nome from (values
  ('pocos_cisternas', 'Perfuração de poço artesiano'),
  ('pocos_cisternas', 'Poço semi-artesiano'),
  ('pocos_cisternas', 'Instalação de bomba submersa'),
  ('pocos_cisternas', 'Limpeza e desinfecção de poço'),
  ('pocos_cisternas', 'Construção de cisterna'),
  ('pocos_cisternas', 'Aproveitamento de água da chuva'),
  ('pocos_cisternas', 'Manutenção de poço'),
  ('pocos_cisternas', 'Teste de vazão e análise da água')
) as d(categoria_id, nome)
where exists (select 1 from categorias c where c.id = d.categoria_id)
on conflict (categoria_id, nome) do nothing;

commit;
