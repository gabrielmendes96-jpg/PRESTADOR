// Fonte única das categorias/cidades usadas nas páginas de SEO
// (SEOCategoria.jsx, SEOCidadeCategoria.jsx) e na geração do sitemap
// (scripts/gerar-sitemap.mjs). Antes esse mapa existia duplicado (e
// divergente) em cada página — mantendo aqui, os dois sempre cobrem
// exatamente o mesmo conjunto de categorias.
export const SEO_CATEGORIAS = {
  'eletricista': { nome: 'Eletricista', desc: 'Instalação elétrica, manutenção, quadro de luz, tomadas e interruptores' },
  'pedreiro': { nome: 'Pedreiro', desc: 'Alvenaria, construção civil, reformas e reparos em geral' },
  'encanador': { nome: 'Encanador', desc: 'Conserto de vazamentos, instalação hidráulica, desentupimento' },
  'pintor': { nome: 'Pintor', desc: 'Pintura residencial e comercial, textura, massa corrida' },
  'marceneiro': { nome: 'Marceneiro', desc: 'Móveis planejados, armários, marcenaria em geral' },
  'mecanico': { nome: 'Mecânico', desc: 'Manutenção preventiva e corretiva de veículos' },
  'jardineiro': { nome: 'Jardineiro', desc: 'Jardinagem, paisagismo, poda de árvores e grama' },
  'diarista': { nome: 'Diarista', desc: 'Limpeza residencial, faxina, organização doméstica' },
  'serralheiro': { nome: 'Serralheiro', desc: 'Grades, portões, serralheria, estruturas metálicas' },
  'vidraceiro': { nome: 'Vidraceiro', desc: 'Vidros temperados, espelhos, box de banheiro, janelas' },
  'arquiteto': { nome: 'Arquiteto', desc: 'Projetos arquitetônicos e interiores' },
  'azulejista': { nome: 'Azulejista', desc: 'Assentamento de pisos e azulejos' },
  'dedetizador': { nome: 'Dedetizador', desc: 'Controle de pragas e insetos' },
  'tecnico_informatica': { nome: 'Técnico em Informática', desc: 'Manutenção de computadores e redes' },

  // Categorias novas. "plural" evita montar "faz-tudo (marido de aluguel)s" nos textos das páginas.
  'assistencia_eletrodomesticos': { nome: 'Assistência Técnica de Eletrodomésticos', plural: 'assistências técnicas de eletrodomésticos', desc: 'Conserto de geladeira, máquina de lavar, fogão, micro-ondas e lava-louças' },
  'faz_tudo': { nome: 'Faz-tudo (Marido de Aluguel)', plural: 'faz-tudo e maridos de aluguel', desc: 'Pequenos reparos, pendurar quadros, trocar chuveiro, montar móveis e serviços gerais em casa' },
  'montador_moveis': { nome: 'Montador de Móveis', desc: 'Montagem de guarda-roupa, cozinha, cama, estante e móveis comprados online' },
  'conserto_celular': { nome: 'Conserto de Celular e Tablet', plural: 'assistências de celular e tablet', desc: 'Troca de tela, bateria, conector de carga e reparo de smartphones e tablets' },
  'conserto_tv_eletronicos': { nome: 'Conserto de TV e Eletrônicos', plural: 'técnicos de TV e eletrônicos', desc: 'Conserto de TV, videogame, caixa de som, monitor e outros eletrônicos' },
  'instalador_tv': { nome: 'Instalador de TV e Antena', desc: 'Suporte de TV na parede, antena digital, parabólica e configuração de Smart TV' },
  'baba': { nome: 'Babá e Cuidador Infantil', plural: 'babás e cuidadores infantis', desc: 'Babá diária, noturna, folguista, buscar na escola e cuidado de recém-nascido' },
  'passadeira_lavanderia': { nome: 'Passadeira e Lavanderia', plural: 'passadeiras e lavanderias', desc: 'Passar roupa, lavar edredom e cobertor, lavanderia com busca e entrega' },
  'retirada_entulho': { nome: 'Retirada de Entulho e Caçamba', plural: 'serviços de caçamba e retirada de entulho', desc: 'Aluguel de caçamba, entulho de obra e descarte de móveis velhos' },
  'estofador': { nome: 'Estofador', desc: 'Reforma de sofá, troca de espuma e tecido, cadeiras e poltronas' },
  'calhas_rufos': { nome: 'Calhas e Rufos', plural: 'instaladores de calhas e rufos', desc: 'Instalação e conserto de calhas, limpeza de calha entupida e rufos' },
  'vidros_automotivos': { nome: 'Vidros e Para-brisas Automotivos', plural: 'especialistas em vidros e para-brisas automotivos', desc: 'Troca e reparo de para-brisa, vidro de porta e vidro traseiro' },
  'capotaria': { nome: 'Capotaria e Estofados Automotivos', plural: 'capotarias', desc: 'Reforma de banco de carro, forro de teto, capas e tapetes sob medida' },
  'instrutor_direcao': { nome: 'Instrutor de Direção', plural: 'instrutores de direção', desc: 'Aula de direção para iniciantes, baliza, perder o medo de dirigir e aula de moto' },
  'laudo_cautelar': { nome: 'Laudo Cautelar e Vistoria Veicular', plural: 'serviços de laudo cautelar e vistoria veicular', desc: 'Vistoria antes de comprar carro usado, laudo cautelar e avaliação de veículo' },
  'podologo': { nome: 'Podólogo', desc: 'Unha encravada, calos, pé diabético, micose de unha e pedicure clínica' },
  'fonoaudiologo': { nome: 'Fonoaudiólogo', desc: 'Atraso na fala, gagueira, voz, deglutição e avaliação auditiva' },
  'aula_natacao_esportes': { nome: 'Aula de Natação e Esportes', plural: 'aulas de natação e esportes', desc: 'Natação para adultos, crianças e bebês, hidroginástica, tênis, futebol e vôlei' },
  'aula_idiomas': { nome: 'Aula de Outros Idiomas', plural: 'aulas de francês, alemão, italiano, Libras e outros idiomas', desc: 'Aulas de francês, alemão, italiano, Libras, japonês e mandarim' },
  'aula_desenho_artes': { nome: 'Aula de Desenho e Artes', plural: 'aulas de desenho e artes', desc: 'Desenho, pintura em tela, aquarela, mangá, cerâmica e artes para crianças' },
  'locacao_festas': { nome: 'Locação de Mesas, Cadeiras e Utensílios', plural: 'locações de mesas, cadeiras e utensílios para festas', desc: 'Aluguel de mesas, cadeiras, tendas, louças, toalhas e som para festas' },
  'hotel_pets': { nome: 'Hotel e Creche para Pets', plural: 'hotéis e creches para pets', desc: 'Hospedagem de cães e gatos, creche diária e hotel para viagens' },
  'avaliador_imoveis': { nome: 'Avaliador de Imóveis', plural: 'avaliadores de imóveis', desc: 'Avaliação para venda, financiamento, inventário e perícia imobiliária' },
  'corretor_seguros': { nome: 'Corretor de Seguros', plural: 'corretores de seguros', desc: 'Seguro de carro, residencial, de vida, moto, viagem e empresarial' },
  'assistente_virtual': { nome: 'Assistente Virtual e Digitador', plural: 'assistentes virtuais e digitadores', desc: 'Digitação, transcrição, organização de agenda e apoio administrativo remoto' },
  'topografo': { nome: 'Topógrafo', desc: 'Levantamento topográfico, demarcação de terreno e georreferenciamento' },
  'pocos_cisternas': { nome: 'Poço Artesiano e Cisterna', plural: 'especialistas em poço artesiano e cisterna', desc: 'Perfuração de poço, bomba submersa, limpeza de poço e construção de cisterna' },
}

export const SEO_CIDADES = ['Araraquara', 'São Carlos', 'Ribeirão Preto', 'Campinas', 'São Paulo', 'Bauru', 'Franca', 'Limeira']

export const SITE_URL = 'https://prestador-lyart.vercel.app'
