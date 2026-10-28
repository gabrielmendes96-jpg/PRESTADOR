// Catálogo de serviços por categoria (fonte única).
// - scripts/seed-catalogo.mjs grava isto no banco (idempotente);
// - o mesmo script gera supabase/35_catalogo_completo.sql para ambientes novos.
// Nomes: 3 a 80 caracteres, sem repetir dentro da categoria.

const cameras = [
  'Instalação de câmeras de segurança', 'Instalação de DVR/NVR e gravador', 'Configuração de acesso remoto pelo celular',
  'Manutenção e reparo de câmeras', 'Troca de HD de gravação', 'Câmeras com alarme integrado', 'Ampliação de sistema existente',
  'Projeto de monitoramento residencial', 'Projeto de monitoramento comercial', 'Instalação de câmera Wi-Fi',
]

const adestramento = [
  'Adestramento básico (senta, deita, fica)', 'Adestramento de filhote', 'Correção de latido excessivo',
  'Correção de agressividade e medo', 'Adestramento para passeio com guia', 'Treino de ficar sozinho em casa',
  'Adestramento em domicílio', 'Pacote de aulas mensais', 'Socialização de cães', 'Orientação para tutores',
]

const fotografoGeral = [
  'Ensaio fotográfico individual', 'Ensaio de casal', 'Ensaio de família', 'Ensaio gestante', 'Book profissional',
  'Fotos para redes sociais e perfil', 'Fotografia de produtos', 'Fotografia de formatura', 'Fotografia de aniversário',
  'Fotografia de casamento', 'Tratamento e edição de fotos', 'Fotos newborn (recém-nascido)',
]

const guincho = [
  'Guincho para carro de passeio', 'Guincho para moto', 'Guincho para pane na estrada', 'Guincho para carro batido',
  'Remoção de veículo de garagem', 'Reboque para oficina', 'Guincho 24 horas', 'Transporte de veículo entre cidades',
  'Guincho para utilitário e van', 'Socorro com pneu e bateria',
]

const confeitaria = [
  'Bolo de aniversário', 'Bolo de casamento', 'Bolo personalizado (tema)', 'Doces finos para festa', 'Brigadeiros gourmet',
  'Cupcakes e mini bolos', 'Torta doce', 'Bolo no pote', 'Naked cake', 'Cento de docinhos',
  'Pão de mel recheado', 'Sobremesas para eventos', 'Bolo sem glúten ou sem lactose', 'Ovos de Páscoa artesanais',
]

const cftv = [
  'Instalação de câmeras de segurança', 'Central de monitoramento 24h', 'Monitoramento remoto de imóvel', 'Projeto de CFTV',
  'Manutenção preventiva de CFTV', 'Instalação de DVR/NVR', 'Câmeras com leitura de placa', 'Acesso remoto pelo celular',
  'Cerca virtual e análise de vídeo', 'Ampliação de sistema existente',
]

const informatica = [
  'Aula de informática básica', 'Aula de Word e Excel', 'Aula de internet e e-mail', 'Aula de celular para idosos',
  'Aula de Excel avançado', 'Aula de PowerPoint e apresentações', 'Aula de edição de fotos e vídeos', 'Aula particular em domicílio',
  'Aula online', 'Informática para concursos',
]

export default {
  // ============== Casa e reforma ==============
  eletricista: [
    'Troca de lâmpadas e luminárias', 'Instalação de ventilador de teto', 'Instalação de tomadas e interruptores',
    'Instalação de chuveiro ou torneira elétrica', 'Troca de chuveiro elétrico', 'Instalação de quadro de disjuntores', 'Instalação de ponto de tomada novo',
    'Reparo de curto-circuito', 'Instalação de luminárias e spots', 'Instalação de campainha e interfone', 'Instalação elétrica completa', 'Instalação de carregador de carro elétrico',
    'Aterramento elétrico', 'Revisão elétrica da casa',
  ],
  encanador: [
    'Conserto de vazamento', 'Troca de torneira', 'Troca de registro', 'Instalação de vaso sanitário', 'Instalação de pia e cuba', 'Troca de sifão e flexível',
    'Reparo de caixa de descarga', 'Instalação de máquina de lavar', 'Instalação de chuveiro e ducha', 'Instalação de filtro e purificador', 'Desentupimento',
    'Instalação de caixa d\'água', 'Troca de tubulação', 'Instalação de aquecedor',
  ],
  papel_parede: [
    'Aplicação de papel de parede', 'Remoção de papel de parede', 'Papel de parede em sala', 'Papel de parede em quarto', 'Papel de parede lavável',
    'Papel de parede vinílico', 'Papel de parede 3D', 'Aplicação de painel fotográfico', 'Papel de parede em quarto infantil', 'Aplicação em teto e nichos',
  ],
  acupuntura: [
    'Sessão de acupuntura sistêmica', 'Acupuntura para dor nas costas', 'Acupuntura para ansiedade e estresse',
    'Acupuntura para enxaqueca', 'Acupuntura estética', 'Auriculoterapia', 'Moxabustão', 'Ventosaterapia',
    'Acupuntura para insônia', 'Atendimento a domicílio',
  ],
  adesivo_decorativo: [
    'Adesivo de parede decorativo', 'Adesivo para vidro e box', 'Adesivo para geladeira e eletrodomésticos', 'Adesivo de porta e móveis',
    'Plotagem de vitrine', 'Adesivo de parede infantil', 'Adesivo personalizado com frase', 'Remoção de adesivos',
    'Aplicação de película decorativa', 'Adesivo para azulejo',
  ],
  petisco: adestramento,
  adestrador: adestramento,
  ajuste_roupa: [
    'Barra de calça', 'Barra de saia e vestido', 'Ajuste de cintura', 'Ajuste de manga', 'Troca de zíper', 'Conserto de rasgos e furos',
    'Ajuste de camisa e blazer', 'Reforma de roupa', 'Apertar ou alargar roupa', 'Troca de forro', 'Colocação de botões e ilhós',
  ],
  alarme: [
    'Instalação de alarme residencial', 'Instalação de alarme comercial', 'Alarme com sensor de presença', 'Alarme sem fio',
    'Manutenção de alarme', 'Troca de bateria e sensores', 'Integração com monitoramento 24h', 'Alarme com sirene e aviso no celular',
    'Cerca de perímetro', 'Programação de senhas e controles',
  ],
  alfaiate: [
    'Terno sob medida', 'Camisa sob medida', 'Ajuste de terno e paletó', 'Barra de calça social', 'Ajuste de colete e blazer',
    'Reforma de terno', 'Conserto de forro e bolsos', 'Traje de noivo e padrinhos', 'Troca de botões e zíper',
    'Aviamento e reparos finos',
  ],
  alinhamento: [
    'Alinhamento de direção', 'Balanceamento de rodas', 'Alinhamento e balanceamento', 'Cambagem e cáster', 'Revisão de suspensão',
    'Troca de amortecedores', 'Diagnóstico de vibração no volante', 'Rodízio de pneus', 'Alinhamento 3D', 'Geometria para veículos pesados',
  ],
  animador: [
    'Recreação infantil', 'Animação de festa de aniversário', 'Personagens vivos (fantasias)', 'Pintura facial', 'Escultura em balão',
    'Brincadeiras e gincanas', 'Mágico e show de mágica', 'Teatro de fantoches', 'Palhaço', 'Recreação em eventos corporativos',
    'Oficinas e atividades infantis',
  ],
  aquecedor: [
    'Instalação de aquecedor a gás', 'Instalação de aquecedor elétrico', 'Manutenção de aquecedor', 'Instalação de boiler',
    'Troca de resistência', 'Conserto de aquecedor solar', 'Limpeza de aquecedor', 'Troca de aquecedor antigo',
    'Revisão de segurança do gás', 'Instalação de aquecedor de passagem',
  ],
  ar_condicionado: [
    'Instalação de ar-condicionado split', 'Manutenção preventiva', 'Limpeza e higienização', 'Carga de gás', 'Conserto de ar-condicionado',
    'Remoção e reinstalação', 'Instalação de ar-condicionado de janela', 'Troca de capacitor e placa', 'Instalação de infraestrutura (tubulação)',
    'Reparo de vazamento de água',
  ],
  ar_auto: [
    'Recarga de gás do ar-condicionado automotivo', 'Higienização do ar-condicionado', 'Troca de filtro de cabine',
    'Conserto de compressor', 'Troca de condensador', 'Diagnóstico de ar fraco', 'Limpeza do evaporador',
    'Reparo de vazamento no sistema', 'Troca de ventoinha', 'Revisão completa do ar',
  ],
  aula_artes_marciais: [
    'Aula de jiu-jitsu', 'Aula de judô', 'Aula de karatê', 'Aula de muay thai', 'Aula de boxe', 'Aula de taekwondo', 'Aula de capoeira',
    'Aula de krav maga e defesa pessoal', 'Aula infantil', 'Aula particular individual', 'Aula em grupo',
  ],
  artesao: [
    'Peças artesanais sob encomenda', 'Artesanato em crochê e tricô', 'Artesanato em madeira', 'Artesanato em cerâmica e argila',
    'Lembrancinhas personalizadas', 'Macramê', 'Bordado à mão', 'Artesanato em resina', 'Decoração artesanal', 'Oficina de artesanato',
    'Biscuit',
  ],
  aula_culinaria: [
    'Aula de culinária básica', 'Aula de confeitaria', 'Aula de panificação', 'Aula de culinária italiana', 'Aula de culinária japonesa',
    'Aula de comida saudável', 'Aula de churrasco', 'Aula de culinária vegana', 'Aula para casais ou grupos', 'Aula em domicílio',
  ],
  aula_danca: [
    'Aula de dança de salão', 'Aula de forró', 'Aula de samba', 'Aula de zouk', 'Aula de ballet', 'Aula de dança do ventre', 'Aula de hip hop',
    'Aula de dança para casais (casamento)', 'Aula de dança infantil', 'Aula de ritmos', 'Aula particular',
  ],
  aula_espanhol: [
    'Espanhol básico', 'Espanhol intermediário e avançado', 'Conversação em espanhol', 'Espanhol para viagem', 'Espanhol para negócios',
    'Preparação para DELE', 'Espanhol para crianças', 'Aula online', 'Reforço escolar de espanhol', 'Aula particular em domicílio',
  ],
  aula_informatica: informatica,
  aula_informatica_edu: informatica,
  aula_ingles: [
    'Inglês básico', 'Inglês intermediário e avançado', 'Inglês para crianças', 'Preparação para TOEFL e IELTS', 'Inglês para entrevistas de emprego',
    'Reforço escolar de inglês', 'Aula online', 'Aula particular em domicílio',
  ],
  aula_matematica: [
    'Reforço de matemática (fundamental)', 'Matemática para ensino médio', 'Preparação para ENEM e vestibular', 'Matemática para concursos',
    'Cálculo 1 e 2', 'Álgebra linear', 'Estatística', 'Matemática financeira', 'Preparação para olimpíadas', 'Aula online',
  ],
  aula_musica: [
    'Aula de teclado e piano', 'Aula de canto', 'Aula de bateria', 'Aula de baixo', 'Aula de guitarra', 'Aula de violino', 'Aula de flauta e sopro',
    'Teoria musical', 'Musicalização infantil', 'Aula de cavaquinho e ukulele', 'Aula em domicílio',
  ],
  aula_portugues: [
    'Reforço de português', 'Redação para ENEM', 'Gramática e interpretação de texto', 'Português para concursos', 'Revisão de TCC e trabalhos',
    'Português para estrangeiros', 'Alfabetização de adultos', 'Alfabetização infantil', 'Literatura para vestibular', 'Aula online',
  ],
  aula_violao: [
    'Violão para iniciantes', 'Violão popular', 'Violão clássico', 'Aula de cifras e acordes', 'Aula de violão infantil', 'Aula de fingerstyle',
    'Aula de violão para adultos', 'Aula online', 'Aula em domicílio', 'Teoria musical aplicada',
  ],
  automacao: [
    'Automação de iluminação', 'Automação de cortinas e persianas', 'Instalação de assistente de voz', 'Controle de ar-condicionado por app',
    'Fechadura digital', 'Automação de portão e garagem', 'Sistema de som ambiente', 'Cenas e rotinas inteligentes', 'Projeto de automação completo',
  ],
  azulejista: [
    'Assentamento de piso cerâmico', 'Revestimento de parede', 'Revestimento de cozinha', 'Revestimento de fachada', 'Reparo de rejunte',
    'Troca de peças quebradas', 'Assentamento de cerâmica em área externa', 'Aplicação de revestimento 3D',
  ],
  bartender: [
    'Open bar para festa', 'Drinks clássicos e autorais', 'Coquetel para casamento', 'Barman para evento corporativo', 'Caipirinhas e batidas',
    'Carta de drinks personalizada', 'Bar completo com equipamentos', 'Workshop de drinks', 'Drinks sem álcool', 'Barman para aniversário',
  ],
  bolo_decorado: [
    'Bolo decorado infantil', 'Bolo de aniversário temático', 'Bolo de casamento', 'Bolo com topo personalizado', 'Bolo de chá de bebê',
    'Bolo de revelação (chá revelação)', 'Bolo de formatura', 'Bolo de 15 anos', 'Mesa de doces completa', 'Naked cake',
  ],
  bomba_agua: [
    'Instalação de bomba d\'água', 'Conserto de bomba d\'água', 'Troca de pressurizador', 'Manutenção de bomba de poço', 'Instalação de bomba de piscina',
    'Troca de bomba de recalque', 'Instalação de bomba para cisterna', 'Troca de flutuador', 'Revisão do sistema hidráulico', 'Bomba para aproveitamento de água da chuva',
  ],
  borracheiro: [
    'Troca de pneus', 'Conserto de furo', 'Calibragem de pneus', 'Vulcanização', 'Troca de pneu na rua (socorro)', 'Rodízio de pneus',
    'Balanceamento de rodas', 'Remendo em pneu', 'Troca de válvula', 'Borracharia móvel 24h',
  ],
  box_banheiro: [
    'Instalação de box de vidro', 'Troca de box de banheiro', 'Box de vidro temperado sob medida', 'Box de acrílico', 'Reparo de roldanas e vedação',
    'Box articulado', 'Box de correr', 'Box com ferragem especial', 'Troca de vedação', 'Instalação de cortina de box',
  ],
  brinquedos: [
    'Aluguel de pula-pula', 'Aluguel de piscina de bolinhas', 'Aluguel de tobogã inflável', 'Aluguel de cama elástica', 'Aluguel de castelo inflável',
    'Aluguel de brinquedos para festa', 'Aluguel de mesas e cadeiras infantis', 'Cinema ao ar livre', 'Brinquedos para eventos corporativos', 'Pacote de brinquedos para festa',
  ],
  buffet: [
    'Festa infantil', 'Casamento', 'Evento corporativo', 'Aniversário adulto', 'Formatura', 'Churrasco para eventos', 'Coquetel',
    'Festa de 15 anos', 'Jantar de confraternização', 'Coffee break',
  ],
  cabeleireiro: [
    'Corte feminino', 'Corte masculino', 'Coloração', 'Escova', 'Hidratação e tratamento', 'Progressiva e selagem', 'Mechas e luzes',
    'Corte infantil', 'Penteado simples', 'Cauterização', 'Tratamento capilar', 'Corte na casa do cliente',
  ],
  caixa_agua: [
    'Instalação de caixa d\'água', 'Troca de caixa d\'água', 'Limpeza e higienização', 'Impermeabilização da caixa', 'Instalação de boia',
    'Reparo de caixa d\'água', 'Instalação de caixa d\'água elevada', 'Conserto de vazamento na caixa', 'Instalação de cisterna', 'Aumento de capacidade',
  ],
  calcada: [
    'Calçada em concreto', 'Calçada em pedra portuguesa', 'Calçada em piso intertravado', 'Reforma de calçada', 'Rebaixamento de guia para garagem',
    'Piso externo antiderrapante', 'Calçada em pedra', 'Reparo de rachaduras', 'Drenagem de calçada', 'Piso de garagem',
  ],
  carpinteiro: [
    'Telhado de madeira (estrutura)', 'Portas e janelas de madeira', 'Pergolado de madeira', 'Troca de madeiramento do telhado', 'Deck de madeira',
    'Assoalho e piso de madeira', 'Forro de madeira', 'Escada de madeira', 'Reparo em vigas e caibros', 'Cercas e portões de madeira',
    'Formas de madeira para concreto',
  ],
  carregador: [
    'Carregamento de caminhão', 'Descarregamento de mercadorias', 'Ajudante de mudança', 'Carregador para obras', 'Montagem e desmontagem de móveis',
    'Transporte de móveis pesados', 'Mão de obra por hora', 'Carregador para eventos', 'Ajudante para entrega', 'Carregador de materiais de construção',
  ],
  cerca_eletrica: [
    'Instalação de cerca elétrica', 'Manutenção de cerca elétrica', 'Troca de central e bateria', 'Cerca elétrica para muro', 'Cerca concertina',
    'Cerca elétrica rural', 'Reparo de fios e isoladores', 'Revisão de aterramento', 'Ampliação de cerca existente', 'Integração com alarme',
  ],
  cerimonialista: [
    'Cerimonial de casamento', 'Assessoria de casamento (dia do evento)', 'Cerimonial de formatura', 'Cerimonial de 15 anos', 'Assessoria completa de evento',
    'Cerimonial corporativo', 'Cerimonial de aniversário', 'Cerimonial de batizado', 'Planejamento de cerimônia', 'Cerimonial de bodas',
  ],
  cftv_seguranca: cftv,
  cftv: cftv,
  chaveiro: [
    'Abertura de portas', 'Abertura de carro', 'Cópia de chaves', 'Troca de fechadura', 'Troca de segredo', 'Chaveiro 24 horas', 'Chave codificada de carro',
    'Instalação de fechadura digital', 'Conserto de fechadura', 'Chave tetra', 'Abertura de cofre',
  ],
  chef_domicilio: [
    'Jantar completo em casa', 'Almoço para eventos', 'Jantar romântico', 'Churrasco com chef', 'Menu degustação', 'Chef para aniversário',
    'Chef para confraternização', 'Aulas e jantar interativo', 'Cardápio italiano', 'Cardápio japonês', 'Cardápio fitness',
  ],
  churrasqueira: [
    'Construção de churrasqueira', 'Reforma de churrasqueira', 'Churrasqueira de alvenaria', 'Churrasqueira em área gourmet', 'Instalação de coifa e duto',
    'Churrasqueira a gás', 'Churrasqueira de tijolinho', 'Forno de pizza e churrasqueira', 'Bancada gourmet', 'Revestimento de churrasqueira',
  ],
  churrasqueiro: [
    'Churrasco para festas', 'Churrasco em casa', 'Churrasco corporativo', 'Churrasco com buffet completo', 'Assador por hora', 'Churrasco para casamento',
    'Costela fogo de chão', 'Churrasco com serviço de garçom', 'Espeto corrido', 'Churrasco para pequenos grupos',
  ],
  closet: [
    'Closet sob medida', 'Closet planejado completo', 'Armário de quarto planejado', 'Closet aberto', 'Closet com iluminação',
    'Reforma de closet', 'Closet em L e U', 'Sapateira e gaveteiros', 'Closet para quarto pequeno', 'Projeto 3D de closet',
  ],
  personal_coach: [
    'Coaching de carreira', 'Coaching de vida', 'Mentoria para empreendedores', 'Coaching de emagrecimento', 'Coaching financeiro',
    'Orientação profissional', 'Mentoria para liderança', 'Coaching de relacionamentos', 'Preparação para entrevista de emprego', 'Sessões de desenvolvimento pessoal',
  ],
  cobertura: [
    'Pergolado', 'Cobertura de garagem', 'Cobertura de policarbonato', 'Cobertura de área gourmet', 'Cobertura de madeira', 'Toldo retrátil',
    'Cobertura de varanda', 'Telhado de vidro', 'Cobertura em estrutura metálica', 'Cobertura para piscina',
  ],
  colorista: [
    'Coloração completa', 'Mechas e luzes', 'Balayage', 'Descoloração', 'Retoque de raiz', 'Cabelo platinado', 'Cabelos fantasia (coloridos)',
    'Tonalização', 'Correção de cor', 'Mechas californianas', 'Camuflagem de fios brancos',
  ],
  concreto: [
    'Laje de concreto', 'Contrapiso', 'Piso de concreto', 'Concretagem de sapata e viga', 'Concreto usinado (fornecimento)', 'Concretagem de calçada',
    'Concreto polido', 'Concretagem de pilares', 'Bombeamento de concreto', 'Reparo estrutural em concreto',
  ],
  confeiteiro_ali: confeitaria,
  confeiteiro: confeitaria,
  vazamento: [
    'Caça-vazamento', 'Conserto de vazamento em parede', 'Conserto de vazamento em laje', 'Reparo de cano estourado', 'Vazamento em torneira e registro',
    'Vazamento em caixa de descarga', 'Vazamento em tubulação de gás', 'Detecção de vazamento com termografia', 'Vazamento em chuveiro', 'Vazamento em piscina',
  ],
  consultor_financeiro: [
    'Organização do orçamento pessoal', 'Planejamento de aposentadoria', 'Consultoria de investimentos', 'Saída das dívidas (renegociação)', 'Planejamento financeiro familiar',
    'Consultoria financeira para MEI', 'Educação financeira', 'Planejamento para compra de imóvel', 'Planejamento tributário', 'Fluxo de caixa para pequenos negócios',
  ],
  contador: [
    'Abertura de empresa ou MEI', 'Contabilidade mensal', 'Declaração de imposto de renda', 'Regularização de CNPJ', 'Imposto de renda atrasado',
    'Declaração anual do MEI', 'Folha de pagamento', 'Planejamento tributário', 'Emissão de notas fiscais', 'Encerramento de empresa',
  ],
  controle_pragas: [
    'Controle de baratas', 'Controle de formigas', 'Controle de cupins', 'Controle de ratos e camundongos', 'Controle de pulgas e carrapatos',
    'Controle de escorpiões', 'Controle de mosquitos e dengue', 'Controle de pombos', 'Controle de aranhas', 'Imunização de ambientes', 'Contrato de controle periódico',
  ],
  corretor_imoveis: [
    'Venda de imóvel', 'Aluguel de imóvel', 'Avaliação de imóvel', 'Compra de imóvel', 'Regularização e documentação', 'Consultoria de financiamento',
    'Imóveis na planta', 'Aluguel por temporada', 'Locação comercial', 'Administração de imóveis',
  ],
  corte_grama: [
    'Corte de grama residencial', 'Corte de grama em terreno', 'Manutenção mensal de jardim', 'Acabamento de bordas', 'Corte de grama alta (roçada)', 'Adubação de gramado',
    'Remoção de ervas daninhas', 'Aparagem de cerca viva', 'Corte de grama em condomínio', 'Plantio de grama em placas',
  ],
  costureira: [
    'Barra de calça', 'Ajuste de roupa', 'Conserto de roupas', 'Roupas sob medida', 'Costura de cortinas', 'Confecção de uniformes', 'Troca de zíper',
    'Reforma de roupas', 'Costura de lençóis e capas', 'Fantasias', 'Bordado',
  ],
  costureira_noiva: [
    'Vestido de noiva sob medida', 'Ajuste de vestido de noiva', 'Reforma de vestido de noiva', 'Vestido de madrinha', 'Vestido de debutante',
    'Vestido de formatura', 'Aplicação de bordados e pedrarias', 'Vestido de daminha', 'Customização de vestido', 'Conserto de véu e arranjos',
  ],
  cozinha_planejada: [
    'Cozinha planejada completa', 'Armários de cozinha sob medida', 'Reforma de cozinha', 'Cozinha americana integrada', 'Bancadas e ilhas de cozinha',
    'Troca de portas e frentes dos armários', 'Cozinha pequena otimizada', 'Cozinha gourmet', 'Projeto 3D de cozinha', 'Instalação de coifa e cooktop',
  ],
  cozinheiro: [
    'Cozinheiro por dia', 'Cozinheiro para festas', 'Marmitas da semana', 'Cozinheiro para casa de campo', 'Almoço de família',
    'Cozinheiro para eventos', 'Cardápio fitness', 'Cozinhar para o mês (meal prep)', 'Cozinheiro para confraternização', 'Jantar especial',
  ],
  cuidador_idoso: [
    'Cuidador diurno', 'Cuidador noturno', 'Acompanhamento em consultas', 'Cuidador 24 horas', 'Auxílio na higiene e alimentação',
    'Administração de medicamentos', 'Companhia e atividades', 'Cuidador pós-cirúrgico', 'Cuidador para idoso acamado', 'Cuidador para fim de semana',
  ],
  customizacao: [
    'Customização de roupas', 'Customização de tênis', 'Pintura em jeans e camisetas', 'Customização de móveis', 'Customização de bolsas e mochilas',
    'Customização de capacetes', 'Customização de acessórios', 'Customização de objetos de decoração', 'Aplicação de patches e bordados', 'Customização de violão e instrumentos',
  ],
  madeira_deck: [
    'Deck de madeira para área externa', 'Deck para piscina', 'Deck de madeira plástica', 'Reforma e verniz de deck', 'Deck suspenso', 'Pergolado com deck',
    'Deck para varanda', 'Troca de tábuas', 'Impermeabilização de deck', 'Deck sobre laje',
  ],
  decorador: [
    'Decoração de festa infantil', 'Decoração de casamento', 'Decoração de aniversário', 'Decoração de 15 anos', 'Decoração de chá de bebê',
    'Decoração com balões', 'Decoração de formatura', 'Decoração de eventos corporativos', 'Decoração de mesa posta', 'Aluguel de itens decorativos', 'Decoração de batizado',
  ],
  dedetizador: [
    'Dedetização residencial', 'Dedetização comercial', 'Controle de baratas', 'Controle de formigas e cupins', 'Desratização', 'Controle de pulgas e carrapatos',
    'Controle de escorpiões', 'Dedetização de condomínio', 'Tratamento de cupim em madeira', 'Nebulização contra mosquitos',
  ],
  depilacao: [
    'Depilação com cera', 'Depilação de axilas', 'Depilação de pernas', 'Depilação de buço', 'Depilação íntima', 'Depilação masculina',
    'Depilação com linha', 'Depilação a laser', 'Depilação de sobrancelha', 'Depilação em domicílio',
  ],
  desentupidor: [
    'Desentupimento de pia', 'Desentupimento de vaso sanitário', 'Desentupimento de ralos', 'Desentupimento de esgoto', 'Limpeza de caixa de gordura',
    'Desentupimento com máquina', 'Desentupimento de ralo de box', 'Videoinspeção de tubulação', 'Desentupimento de caixa de inspeção', 'Desentupimento de rede pluvial',
  ],
  desenvolvimento_web: [
    'Criação de site institucional', 'Criação de loja virtual', 'Landing page', 'Manutenção de site', 'Site para profissionais autônomos',
    'Criação de blog', 'Integração de pagamentos', 'Otimização para o Google (SEO)', 'Sistema web sob medida', 'Migração de hospedagem', 'Correção de erros em site',
  ],
  design_grafico: [
    'Criação de logotipo', 'Identidade visual completa', 'Cartão de visita', 'Panfleto e folder', 'Banner e material de redes sociais', 'Embalagem e rótulo',
    'Cardápio digital ou impresso', 'Convite digital', 'Apresentação em PowerPoint', 'Manual de marca', 'Arte para camisetas',
  ],
  designer_interiores: [
    'Consultoria de decoração', 'Projeto de interiores', 'Projeto 3D', 'Decoração de sala', 'Decoração de quarto', 'Home staging para venda',
    'Escolha de móveis e cores', 'Projeto de iluminação', 'Decoração de cozinha', 'Projeto comercial', 'Acompanhamento de obra',
  ],
  designer_sobrancelha: [
    'Design de sobrancelha', 'Design com henna', 'Design com linha', 'Design com pinça', 'Coloração de sobrancelha', 'Brow lamination',
    'Micropigmentação de sobrancelha', 'Design masculino', 'Sobrancelha para noivas', 'Correção de falhas',
  ],
  despachante: [
    'Transferência de veículo', 'Licenciamento e IPVA', 'Segunda via de documentos', 'Emplacamento', 'Regularização de veículo', 'Multas e recursos',
    'Documentação de imóvel', 'CNH e renovação', 'Regularização de motos', 'Baixa de veículo', 'Vistoria veicular',
  ],
  desratizacao: [
    'Desratização residencial', 'Desratização comercial', 'Controle de ratos em esgoto', 'Eliminação de ratos em forro', 'Desratização de condomínio',
    'Desratização rural e galpões', 'Armadilhas e iscas seguras', 'Vedação de acessos', 'Monitoramento periódico', 'Descontaminação pós-infestação',
  ],
  diarista: [
    'Limpeza de casa completa', 'Limpeza de apartamento', 'Passar roupa', 'Lavar roupa', 'Limpeza de cozinha', 'Limpeza de banheiros', 'Limpeza pesada',
    'Diarista semanal', 'Diarista quinzenal', 'Organização de armários', 'Limpeza de vidros',
  ],
  dj: [
    'DJ para aniversário', 'DJ para casamento', 'DJ para formatura', 'DJ para eventos corporativos', 'DJ para festa de 15 anos', 'DJ para balada e bar',
    'DJ para churrasco', 'DJ com sonorização e iluminação', 'DJ para festa infantil', 'DJ para confraternização',
  ],
  drone: [
    'Filmagem aérea de eventos', 'Fotografia aérea de imóveis', 'Mapeamento de terreno', 'Inspeção de telhados', 'Filmagem de casamento com drone',
    'Imagens aéreas para propaganda', 'Inspeção de obras', 'Fotografia aérea rural', 'Vídeo aéreo de empreendimentos', 'Cobertura de eventos esportivos',
  ],
  drywall: [
    'Parede de drywall', 'Divisória de drywall', 'Forro de drywall', 'Sanca de drywall', 'Nicho e prateleira em drywall', 'Reparo em drywall',
    'Isolamento acústico', 'Divisórias de escritório', 'Parede para TV com drywall', 'Teto rebaixado',
  ],
  edicao_video: [
    'Edição de vídeo para redes sociais', 'Edição de casamento', 'Edição de vídeo institucional', 'Edição de vlog e YouTube', 'Legendagem',
    'Motion graphics e animações', 'Correção de cor', 'Edição de vídeo de evento', 'Cortes para Reels e TikTok', 'Edição de vídeos de curso', 'Vinhetas e aberturas',
  ],
  eletrica_auto: [
    'Diagnóstico elétrico com scanner', 'Troca de bateria', 'Troca de alternador', 'Conserto de motor de arranque', 'Instalação de som e acessórios',
    'Reparo de farol e lanterna', 'Troca de lâmpadas e faróis de LED', 'Conserto de vidro elétrico', 'Instalação de alarme', 'Reparo em chicote elétrico', 'Instalação de módulo de vidros',
  ],
  eletrica_predial: [
    'Revisão elétrica predial', 'Instalação de quadro de medidores', 'Manutenção de iluminação de áreas comuns', 'Instalação de luz de emergência', 'Adequação de carga',
    'Passagem de cabos e eletrodutos', 'Laudos elétricos', 'Instalação de SPDA (para-raios)', 'Troca de disjuntores', 'Instalação de gerador', 'Ligação nova na concessionária',
  ],
  enfermeiro: [
    'Curativos em domicílio', 'Administração de medicamentos', 'Aplicação de injeções', 'Sondas e cuidados especiais', 'Cuidados pós-cirúrgicos',
    'Aferição de sinais vitais', 'Vacinas em domicílio', 'Cuidados com idosos acamados', 'Acompanhamento de gestantes e recém-nascidos', 'Coleta de exames em casa', 'Soroterapia',
  ],
  engenheiro_civil: [
    'Projeto estrutural', 'Laudo técnico de imóvel', 'Acompanhamento de obra', 'Regularização de imóvel', 'Orçamento e cronograma de obra',
    'Projeto hidrossanitário', 'Projeto elétrico', 'Perícia de engenharia', 'Vistoria de imóvel', 'Aprovação de projetos na prefeitura', 'Laudo de patologias e rachaduras',
  ],
  entrega: [
    'Entrega de documentos', 'Entrega de encomendas', 'Motoboy por hora', 'Entregas para lojas', 'Entrega de comida', 'Retirada de pacotes',
    'Entrega urgente (expressa)', 'Serviços de banco e cartório', 'Entrega para e-commerce', 'Pagamento de contas', 'Serviços de rua',
  ],
  esquadrias: [
    'Janela de alumínio', 'Porta de alumínio', 'Esquadria sob medida', 'Porta de correr', 'Janela de correr', 'Porta de vidro com alumínio', 'Janela maxim-ar',
    'Fachada de vidro e alumínio', 'Reparo de roldanas', 'Troca de vidros', 'Vedação e acabamento', 'Janela antirruído',
  ],
  esteticista: [
    'Limpeza de pele', 'Drenagem linfática', 'Massagem modeladora', 'Peeling', 'Tratamento de acne', 'Hidratação facial', 'Tratamento para celulite',
    'Radiofrequência', 'Tratamento de manchas', 'Micro agulhamento', 'Atendimento em domicílio',
  ],
  extensao_cilios: [
    'Extensão fio a fio', 'Volume russo', 'Volume brasileiro', 'Extensão híbrida', 'Manutenção de cílios', 'Remoção de cílios', 'Lash lifting',
    'Extensão para noivas', 'Cílios clássicos', 'Cílios mega volume',
  ],
  extintor: [
    'Venda de extintores', 'Recarga de extintores', 'Manutenção e teste hidrostático', 'Projeto de prevenção contra incêndio', 'Laudo do AVCB',
    'Instalação de hidrantes', 'Sinalização de emergência', 'Instalação de alarme de incêndio', 'Treinamento de brigada', 'Luzes de emergência', 'Inspeção de segurança',
  ],
  fachada: [
    'Revestimento de fachada', 'Pintura de fachada', 'Reparo e recuperação de fachada', 'Fachada com cerâmica ou porcelanato', 'Fachada com ACM',
    'Fachada de pedra', 'Textura em fachada', 'Impermeabilização de fachada', 'Fachada ventilada', 'Limpeza de fachada', 'Fachada comercial',
  ],
  faxineira: [
    'Faxina residencial', 'Faxina pesada', 'Limpeza de escritório', 'Faxina pós-mudança', 'Faxina de apartamento', 'Limpeza de vidros',
    'Limpeza de comércio', 'Faxina pré-festa', 'Limpeza de cozinha e banheiros', 'Faxina semanal',
  ],
  filmagem: [
    'Filmagem de casamento', 'Filmagem de aniversário', 'Filmagem de formatura', 'Vídeo institucional', 'Filmagem de eventos corporativos',
    'Vídeo promocional', 'Filmagem de 15 anos', 'Vídeo para redes sociais', 'Filmagem com drone', 'Videoclipe', 'Cobertura de show e evento',
  ],
  filtro_agua: [
    'Instalação de purificador de água', 'Troca de refil e filtro', 'Manutenção de purificador', 'Instalação de filtro de poço', 'Filtro para caixa d\'água',
    'Instalação de filtro de torneira', 'Instalação de bebedouro', 'Osmose reversa', 'Limpeza de filtro', 'Contrato de manutenção periódica',
  ],
  fisioterapeuta: [
    'Fisioterapia ortopédica', 'Fisioterapia respiratória', 'Fisioterapia neurológica', 'Fisioterapia pós-cirúrgica', 'RPG (reeducação postural)',
    'Fisioterapia para idosos', 'Fisioterapia esportiva', 'Fisioterapia pélvica', 'Pilates clínico', 'Atendimento em domicílio', 'Ventosaterapia e liberação miofascial',
  ],
  formatacao: [
    'Formatação de computador', 'Formatação de notebook', 'Instalação de Windows', 'Instalação de programas', 'Backup e recuperação de dados', 'Remoção de vírus',
    'Upgrade de memória e SSD', 'Limpeza e troca de pasta térmica', 'Manutenção de notebook', 'Reparo de lentidão', 'Instalação de impressora',
  ],
  fossa: [
    'Limpeza de fossa', 'Desentupimento de fossa', 'Construção de fossa séptica', 'Instalação de sumidouro', 'Limpeza de caixa de gordura', 'Manutenção de esgoto',
    'Caminhão limpa-fossa', 'Instalação de biodigestor', 'Reparo de tubulação de esgoto', 'Limpeza de caixas de inspeção',
  ],
  fotografo: fotografoGeral,
  fotografia: fotografoGeral,
  fotografo_eventos: [
    'Fotografia de aniversário', 'Fotografia de casamento', 'Fotografia de evento corporativo', 'Fotografia de formatura', 'Fotografia de festa infantil',
    'Fotografia de 15 anos', 'Fotografia de chá de bebê', 'Fotografia de batizado', 'Fotografia de show', 'Fotografia de confraternização', 'Cobertura de congresso',
  ],
  fotografo_pets: [
    'Ensaio fotográfico com cães', 'Ensaio fotográfico com gatos', 'Ensaio com pet e tutor', 'Fotos de aniversário do pet', 'Ensaio externo com pets',
    'Fotos em estúdio para pets', 'Pacote de fotos para redes sociais do pet', 'Ensaio de filhotes', 'Ensaio de ninhada', 'Álbum de fotos dos pets',
  ],
  frete: [
    'Frete pequeno', 'Transporte de móveis e eletrodomésticos', 'Carreto de mudança', 'Frete de materiais de construção', 'Frete para outras cidades',
    'Frete com ajudante', 'Entrega de compras de loja', 'Frete de entulho', 'Frete de motocicletas', 'Frete com caminhão baú',
  ],
  fundacao: [
    'Sapata e radier', 'Estacas e brocas', 'Reforço de fundação', 'Baldrame', 'Sondagem de solo', 'Muro de arrimo', 'Contenção de encostas',
    'Fundação para casas e sobrados', 'Escavação', 'Projeto de fundação', 'Reparo de rachaduras estruturais',
  ],
  funileiro: [
    'Reparo de amassados', 'Martelinho de ouro', 'Reparo de pequenos amassados sem pintura', 'Funilaria e pintura', 'Reparo de para-choque',
    'Troca de peças da lataria', 'Reparo de batidas', 'Recuperação de lataria', 'Reparo de arranhões', 'Desamassar porta e paralamas',
  ],
  garcom: [
    'Garçom para festas', 'Garçom para casamento', 'Barman para festas', 'Garçom para eventos corporativos', 'Garçom para churrasco',
    'Serviço de coquetel', 'Garçom para jantar em casa', 'Garçom para aniversário', 'Equipe de garçons e copeiras', 'Serviço de bar',
  ],
  gas: [
    'Instalação de gás', 'Conserto de vazamento de gás', 'Instalação de gás encanado', 'Instalação de fogão e cooktop', 'Teste de estanqueidade',
    'Troca de mangueira e regulador', 'Instalação de aquecedor a gás', 'Adequação de ponto de gás', 'Laudo de gás', 'Troca de botijão (instalação)',
  ],
  gerador: [
    'Instalação de gerador', 'Manutenção de gerador', 'Instalação de nobreak', 'Troca de baterias de nobreak', 'Aluguel de gerador', 'Quadro de transferência (ATS)',
    'Revisão de gerador a diesel', 'Gerador para eventos', 'Projeto de energia de emergência', 'Teste de carga',
  ],
  gesseiro: [
    'Forro de gesso', 'Parede de drywall', 'Reparo de gesso', 'Sanca e moldura', 'Rebaixamento de teto', 'Gesso para iluminação embutida',
    'Nichos e prateleiras de gesso', 'Cortineiro de gesso', 'Aplicação de gesso em parede', 'Moldura e rodateto',
  ],
  gesso_decorativo: [
    'Sanca de gesso', 'Moldura de gesso', 'Rosácea e medalhão', 'Painel decorativo de gesso', 'Cortineiro de gesso', 'Nichos decorativos',
    'Gesso 3D', 'Rodateto e rodapé de gesso', 'Forro com detalhes', 'Revestimento 3D de parede', 'Recuperação de peças de gesso',
  ],
  grades_ferro: [
    'Grade de proteção para janelas', 'Portão de ferro', 'Portão basculante', 'Grade de proteção para varanda', 'Portão de garagem', 'Reforma de portão',
    'Grade de proteção para berço e crianças', 'Gradil e cercas metálicas', 'Portão social', 'Pintura de portões e grades', 'Portão de alumínio',
  ],
  grama_sintetica: [
    'Instalação de grama sintética', 'Grama sintética para jardim', 'Grama sintética para varanda', 'Grama sintética para pets', 'Grama sintética para quadras',
    'Remoção de grama antiga', 'Reparo de grama sintética', 'Preparo do solo (base)', 'Grama sintética para piscina', 'Grama sintética para playground',
  ],
  guincho_auto: guincho,
  guincho: guincho,
  higienizacao_auto: [
    'Higienização interna completa', 'Higienização de bancos', 'Higienização do ar-condicionado', 'Limpeza de teto', 'Limpeza de carpete',
    'Remoção de odores', 'Limpeza de cinto de segurança', 'Higienização com ozônio', 'Hidratação de couro', 'Limpeza de motor', 'Higienização de carro de aplicativo',
  ],
  higienizacao_ar: [
    'Higienização de ar-condicionado split', 'Higienização de dutos', 'Higienização de ar-condicionado central', 'Higienização de climatizadores', 'Higienização de ar-condicionado de janela',
    'Troca de filtros', 'Laudo de PMOC', 'Limpeza de bandeja e dreno', 'Higienização para escritórios', 'Higienização com bactericida', 'Contrato periódico',
  ],
  home_care: [
    'Cuidador em domicílio', 'Enfermagem em domicílio', 'Fisioterapia em casa', 'Fonoaudiologia em domicílio', 'Cuidado pós-cirúrgico', 'Cuidado paliativo',
    'Cuidado de idosos', 'Acompanhante hospitalar', 'Coleta de exames em casa', 'Assistência com medicamentos', 'Cuidado de pacientes acamados',
  ],
  iluminacao: [
    'Instalação de fitas de LED', 'Troca por lâmpadas LED', 'Spots embutidos', 'Iluminação de jardim', 'Iluminação de fachada', 'Instalação de pendentes e lustres',
    'Iluminação para quadros', 'Iluminação para vitrines', 'Projeto de iluminação', 'Iluminação cênica', 'Iluminação de piscina',
  ],
  iluminacao_eventos: [
    'Iluminação para casamento', 'Iluminação para festa', 'Iluminação para formatura', 'Iluminação cênica', 'Efeitos de luz e laser', 'Iluminação de palco',
    'Iluminação para eventos corporativos', 'Iluminação para shows', 'Telões e painéis de LED', 'Iluminação decorativa de ambientes', 'Aluguel de equipamentos de luz',
  ],
  ilustrador: [
    'Ilustração digital', 'Caricatura', 'Retrato personalizado', 'Ilustração infantil', 'Personagem para marca (mascote)', 'Ilustração de livros',
    'Quadrinhos e HQ', 'Ilustração para convites', 'Ilustração para camisetas', 'Ilustração de capa de livro', 'Ilustração editorial',
  ],
  impermeabilizador: [
    'Impermeabilização de laje', 'Impermeabilização de caixa d\'água', 'Tratamento de infiltração', 'Impermeabilização de piscina', 'Impermeabilização de banheiro',
    'Impermeabilização de calhas', 'Impermeabilização de terraço', 'Impermeabilização de cobertura', 'Impermeabilização de paredes úmidas', 'Impermeabilização de subsolo',
  ],
  impressao_3d: [
    'Impressão de peças sob medida', 'Protótipos', 'Miniaturas e action figures', 'Peças de reposição', 'Modelagem 3D', 'Impressão em resina',
    'Impressão para arquitetura (maquetes)', 'Brindes personalizados', 'Peças para cosplay', 'Escaneamento 3D', 'Impressão de peças técnicas',
  ],
  instalador_acessorios_auto: [
    'Instalação de som automotivo', 'Instalação de película', 'Instalação de alarme', 'Instalação de rastreador', 'Instalação de sensor de estacionamento',
    'Instalação de câmera de ré', 'Instalação de multimídia', 'Instalação de engate', 'Instalação de farol de milha', 'Instalação de trava elétrica', 'Instalação de vidros elétricos',
  ],
  interfone: [
    'Instalação de interfone', 'Conserto de interfone', 'Instalação de videoporteiro', 'Troca de central de interfone', 'Instalação de portaria virtual',
    'Instalação de porteiro eletrônico', 'Interfone para condomínio', 'Instalação de fechadura elétrica', 'Troca de monofone', 'Revisão e manutenção',
  ],
  irrigacao: [
    'Instalação de irrigação automática', 'Irrigação por gotejamento', 'Irrigação por aspersão', 'Manutenção de irrigação', 'Programação de temporizador',
    'Irrigação para jardim', 'Irrigação para horta', 'Irrigação para gramado', 'Reparo de tubulação de irrigação', 'Projeto de irrigação', 'Irrigação de jardim vertical',
  ],
  jardim_vertical: [
    'Instalação de jardim vertical', 'Jardim vertical com plantas naturais', 'Jardim vertical artificial', 'Jardim vertical para varanda', 'Manutenção de jardim vertical',
    'Irrigação de jardim vertical', 'Muro verde', 'Painel verde interno', 'Jardim vertical para empresas', 'Projeto de jardim vertical',
  ],
  jardineiro: [
    'Manutenção de jardim', 'Poda de plantas', 'Plantio de flores e árvores', 'Corte de grama', 'Adubação', 'Paisagismo', 'Controle de pragas em plantas',
    'Limpeza de jardim', 'Montagem de horta', 'Poda de cerca viva',
  ],
  lavagem_auto: [
    'Lavagem completa', 'Lavagem simples', 'Higienização interna', 'Lavagem a seco', 'Lavagem de motor', 'Lavagem com cera', 'Lavagem de chassi',
    'Lavagem de moto', 'Lavagem de carro em domicílio', 'Polimento rápido', 'Cristalização de pintura',
  ],
  lavagem_colchao: [
    'Higienização de colchão de casal', 'Higienização de colchão de solteiro', 'Higienização de colchão de bebê', 'Higienização de cama box', 'Higienização de colchão king',
    'Remoção de manchas', 'Eliminação de ácaros', 'Remoção de odores', 'Higienização de cabeceiras', 'Higienização de travesseiros',
  ],
  lavagem_sofa: [
    'Higienização de sofá', 'Higienização de colchão', 'Higienização de tapete', 'Higienização de cadeiras e poltronas', 'Higienização de sofá de couro',
    'Higienização de sofá retrátil', 'Higienização de cortinas', 'Impermeabilização de sofá', 'Remoção de manchas', 'Higienização de estofados',
  ],
  lavagem_tapete: [
    'Lavagem de tapete', 'Lavagem de tapete persa', 'Lavagem de carpete', 'Lavagem de passadeira', 'Lavagem de tapete felpudo', 'Lavagem de tapete de sisal',
    'Retirada de manchas', 'Eliminação de odores', 'Lavagem a seco', 'Retirada e entrega', 'Lavagem de capachos',
  ],
  limpeza_caixa: [
    'Limpeza de caixa d\'água', 'Limpeza de caixa de fibra', 'Limpeza de caixa de concreto', 'Limpeza de cisterna', 'Limpeza de caixa d\'água de condomínio',
    'Limpeza de caixa de amianto', 'Laudo de potabilidade da água', 'Higienização com cloro', 'Desinfecção de reservatórios', 'Limpeza semestral programada',
  ],
  limpeza_pele: [
    'Limpeza de pele profunda', 'Limpeza de pele para acne', 'Limpeza de pele masculina', 'Limpeza de pele com extração', 'Hidratação facial', 'Peeling de diamante',
    'Peeling químico', 'Limpeza de pele express', 'Limpeza de pele para pele sensível', 'Máscaras e tratamentos faciais',
  ],
  limpeza_piscina: [
    'Limpeza de piscina', 'Aspiração de piscina', 'Tratamento da água', 'Limpeza de piscina após festas', 'Limpeza de piscina abandonada', 'Troca de areia do filtro',
    'Limpeza de bordas e azulejos', 'Aplicação de produtos químicos', 'Manutenção semanal', 'Limpeza de piscina de vinil', 'Limpeza de spa e hidromassagem',
  ],
  limpeza_terreno: [
    'Limpeza de terreno', 'Roçada de mato', 'Retirada de entulho', 'Capina', 'Remoção de árvores e raízes', 'Terraplenagem leve', 'Nivelamento de terreno',
    'Limpeza de lote para construção', 'Retirada de tocos', 'Limpeza de terreno abandonado',
  ],
  limpeza_pos_obra: [
    'Limpeza pós-obra residencial', 'Limpeza pós-obra comercial', 'Remoção de respingos de tinta', 'Remoção de cimento e argamassa', 'Limpeza de vidros e esquadrias',
    'Limpeza fina de pisos', 'Limpeza de reforma', 'Limpeza de condomínio após obra', 'Retirada de entulho', 'Limpeza de fachada',
  ],
  limpeza_predial: [
    'Limpeza de condomínio', 'Limpeza de escritórios', 'Limpeza de áreas comuns', 'Limpeza de vidros e fachadas', 'Limpeza de garagem', 'Limpeza de elevadores',
    'Limpeza de lojas', 'Limpeza de hospitais e clínicas', 'Limpeza de escolas', 'Limpeza de academias', 'Limpeza de pós-evento',
  ],
  manicure: [
    'Manicure', 'Pedicure', 'Mãos e pés', 'Esmaltação em gel', 'Alongamento de unhas', 'Unhas de fibra', 'Cutilagem', 'Spa dos pés',
    'Manicure em domicílio', 'Banho de gel', 'Remoção de esmalte em gel',
  ],
  piscina_manutencao: [
    'Limpeza de piscina', 'Tratamento da água', 'Troca de filtro e areia', 'Conserto de bomba de piscina', 'Reparo de vazamentos',
    'Manutenção de aquecimento', 'Troca de vinil', 'Reparo em azulejos', 'Troca de iluminação', 'Manutenção semanal de piscina',
  ],
  maquiadora: [
    'Maquiagem social', 'Maquiagem para noivas', 'Maquiagem para madrinhas', 'Maquiagem para formatura', 'Maquiagem para 15 anos', 'Maquiagem artística',
    'Maquiagem para ensaios fotográficos', 'Maquiagem para eventos corporativos', 'Automaquiagem (aula)', 'Maquiagem em domicílio', 'Maquiagem para festas',
  ],
  marceneiro: [
    'Móveis sob medida', 'Armários planejados', 'Reparo de móveis', 'Montagem de móveis', 'Portas e janelas de madeira', 'Prateleiras e nichos',
    'Cozinha e área de serviço sob medida', 'Painéis para TV', 'Rack e estante', 'Móveis para escritório', 'Restauração de móveis',
  ],
  marketing_digital: [
    'Gestão de redes sociais', 'Tráfego pago (anúncios)', 'Criação de campanhas', 'Otimização para o Google (SEO)', 'E-mail marketing', 'Planejamento de marketing',
    'Google Meu Negócio', 'Marketing para pequenos negócios', 'Criação de conteúdo', 'Consultoria de marketing digital', 'Remarketing e pixel',
  ],
  marmita: [
    'Marmita do dia', 'Marmita semanal', 'Marmita fitness', 'Marmita caseira', 'Marmita vegetariana', 'Marmita para empresas', 'Marmita congelada',
    'Marmita para dieta', 'Marmita low carb', 'Marmita mensal', 'Marmita para diabéticos',
  ],
  massa_corrida: [
    'Aplicação de massa corrida', 'Aplicação de massa acrílica', 'Lixamento de paredes', 'Reparo de pequenas rachaduras', 'Correção de paredes antes da pintura',
    'Massa corrida em tetos', 'Preparação de superfície', 'Aplicação de selador', 'Reparo de umidade em paredes', 'Nivelamento de parede',
  ],
  massagista: [
    'Massagem relaxante', 'Massagem terapêutica', 'Massagem modeladora', 'Massagem com pedras quentes', 'Massagem desportiva', 'Massagem para gestantes',
    'Drenagem linfática', 'Shiatsu', 'Quick massage', 'Massagem em domicílio', 'Massagem para casais',
  ],
  mecanico: [
    'Revisão completa', 'Troca de óleo e filtros', 'Freios', 'Suspensão', 'Diagnóstico com scanner', 'Troca de correia dentada', 'Embreagem',
    'Conserto de ar-condicionado', 'Troca de bateria', 'Alinhamento e balanceamento', 'Mecânico a domicílio',
  ],
  moto_mecanico: [
    'Revisão de moto', 'Troca de óleo', 'Troca de pneus', 'Troca de relação (corrente e coroa)', 'Ajuste de freios', 'Regulagem de carburador e injeção',
    'Troca de velas', 'Parte elétrica de moto', 'Troca de kit de transmissão', 'Troca de pastilhas', 'Mecânico de moto a domicílio',
  ],
  mestre_cerimonia: [
    'Mestre de cerimônia para casamento', 'Mestre de cerimônia para formatura', 'Mestre de cerimônia para eventos corporativos', 'Mestre de cerimônia para 15 anos',
    'Mestre de cerimônia para premiações', 'Apresentador de eventos', 'Mestre de cerimônia para aniversário', 'Locução de eventos', 'Mestre de cerimônia para congressos', 'Mestre de cerimônia infantil',
  ],
  mestre_obras: [
    'Acompanhamento de obra', 'Construção de casa', 'Reforma geral', 'Construção de edícula', 'Ampliação de casa', 'Gestão de equipe de obra',
    'Obras de pequeno porte', 'Construção de muros', 'Reforma de apartamento', 'Orçamento e compra de materiais',
  ],
  micropigmentacao: [
    'Micropigmentação de sobrancelhas', 'Micropigmentação labial', 'Micropigmentação de olhos (delineado)', 'Fio a fio', 'Sombreada (shadow)', 'Micropigmentação capilar',
    'Retoque de micropigmentação', 'Remoção de pigmentação', 'Micropigmentação de aréola', 'Micropigmentação masculina',
  ],
  motorista_executivo: [
    'Motorista executivo por hora', 'Motorista executivo diário', 'Transporte para aeroporto', 'Motorista para eventos', 'Motorista com carro de luxo',
    'Motorista para reuniões', 'Motorista para viagens intermunicipais', 'Motorista bilíngue', 'Transporte corporativo', 'Motorista para casamentos',
  ],
  motorista: [
    'Motorista particular por hora', 'Motorista para o dia inteiro', 'Motorista para viagens', 'Motorista para consultas', 'Motorista da família',
    'Motorista para a noite (festas)', 'Motorista para aeroporto', 'Motorista para idosos', 'Motorista de confiança semanal', 'Motorista para o seu carro',
  ],
  mototaxista: [
    'Corrida urbana de moto', 'Entrega rápida de documentos', 'Mototáxi para o trabalho', 'Corrida para aeroporto', 'Moto para compras',
    'Corrida programada', 'Mototáxi para o dia inteiro', 'Mototáxi noturno', 'Transporte de pequenos volumes', 'Corrida para cidades vizinhas',
  ],
  moveis_planejados: [
    'Móveis planejados sob medida', 'Dormitório planejado', 'Sala planejada', 'Home office planejado', 'Armários planejados', 'Cozinha planejada',
    'Lavanderia planejada', 'Quarto infantil planejado', 'Painel para TV', 'Closet planejado', 'Projeto 3D e orçamento',
  ],
  mudanca: [
    'Mudança residencial', 'Mudança de escritório', 'Transporte de móveis', 'Mudança pequena (kitnet)', 'Mudança com embalagem', 'Montagem e desmontagem de móveis',
    'Mudança interestadual', 'Guarda-móveis', 'Mudança comercial', 'Içamento de móveis', 'Transporte de piano e cofre',
  ],
  musico: [
    'Show para casamento', 'Banda para eventos', 'Cantor(a) para festas', 'Música ao vivo para restaurante', 'Música para cerimônias', 'Show de aniversário',
    'Música para eventos corporativos', 'Violão e voz', 'Banda cover', 'Trio de forró', 'Pagode e samba ao vivo', 'Apresentação de música clássica',
  ],
  nail_designer: [
    'Alongamento de unhas em gel', 'Alongamento de unhas em fibra', 'Nail art', 'Decoração com pedrarias', 'Unhas acrigel', 'Manutenção do alongamento',
    'Unhas para noivas', 'Esmaltação em gel', 'Blindagem de unhas', 'Remoção de alongamento', 'Encapsulamento',
  ],
  nutricionista: [
    'Consulta nutricional', 'Plano alimentar para emagrecer', 'Reeducação alimentar', 'Nutrição esportiva', 'Nutrição para gestantes', 'Nutrição infantil',
    'Plano alimentar para diabéticos', 'Nutrição vegetariana e vegana', 'Consulta online', 'Cardápio semanal', 'Acompanhamento mensal',
  ],
  painel_solar: [
    'Projeto e instalação de painel solar', 'Limpeza e manutenção de placas', 'Instalação residencial', 'Instalação comercial', 'Instalação rural',
    'Manutenção de inversor', 'Aumento do sistema', 'Homologação junto à concessionária', 'Monitoramento da geração', 'Instalação de aquecedor solar', 'Diagnóstico de baixa geração',
  ],
  paisagista: [
    'Projeto de paisagismo', 'Paisagismo residencial', 'Paisagismo comercial', 'Jardim de inverno', 'Jardim em área pequena', 'Iluminação de jardim',
    'Execução de paisagismo', 'Jardim em varanda', 'Paisagismo de condomínio', 'Consultoria de plantas', 'Revitalização de jardim',
  ],
  pao_artesanal: [
    'Pão de fermentação natural', 'Pães artesanais por encomenda', 'Pão de forma caseiro', 'Pão italiano e ciabatta', 'Focaccia', 'Pão integral artesanal',
    'Pães para café da manhã de eventos', 'Pão sem glúten', 'Brioche', 'Pão de queijo artesanal', 'Assinatura semanal de pães',
  ],
  spda: [
    'Instalação de para-raios', 'Laudo de SPDA', 'Manutenção de para-raios', 'Medição de aterramento', 'Projeto de SPDA', 'Instalação de captores',
    'Aterramento elétrico', 'Para-raios para residências', 'Para-raios para condomínios e indústrias', 'Renovação de laudo', 'Inspeção periódica',
  ],
  passeio_caes: [
    'Passeio individual', 'Passeio em grupo', 'Passeio de 30 minutos', 'Passeio de 1 hora', 'Passeio com corrida', 'Passeio para filhotes',
    'Passeio para cães idosos', 'Passeio de fim de semana', 'Pacote mensal de passeios', 'Passeio com busca e entrega',
  ],
  pastilha: [
    'Aplicação de pastilha de vidro', 'Aplicação de pastilha cerâmica', 'Aplicação de pastilha em piscina', 'Mosaico decorativo', 'Pastilha em fachada',
    'Pastilha em banheiro', 'Pastilha em cozinha', 'Reparo e troca de pastilhas', 'Pastilha adesiva', 'Rejunte de pastilhas',
  ],
  pedreiro: [
    'Alvenaria e levantamento de paredes', 'Reboco e emboço', 'Assentamento de pisos e azulejos', 'Reforma de banheiro', 'Reforma de cozinha', 'Construção de muros',
    'Contrapiso', 'Pequenos reparos', 'Ampliação de cômodos', 'Calçadas', 'Laje',
  ],
  penteado: [
    'Penteado para noivas', 'Penteado para madrinhas', 'Penteado para formatura', 'Penteado para 15 anos', 'Penteado para festas', 'Penteado com trança',
    'Coque', 'Teste de penteado', 'Penteado infantil', 'Penteado em domicílio', 'Escova e penteado preso',
  ],
  persiana: [
    'Instalação de persiana', 'Limpeza e conserto de persiana', 'Persiana horizontal', 'Persiana vertical', 'Persiana rolô', 'Persiana romana',
    'Cortina de tecido', 'Cortina de linho', 'Persiana motorizada', 'Troca de tecido', 'Instalação de trilhos e varões',
  ],
  personal_stylist: [
    'Consultoria de imagem', 'Montagem de looks', 'Personal shopper', 'Organização de guarda-roupa', 'Consultoria de coloração pessoal', 'Stylist para eventos',
    'Consultoria de estilo masculino', 'Consultoria de visagismo', 'Renovação de guarda-roupa', 'Stylist para ensaios e fotos', 'Consultoria de imagem profissional',
  ],
  personal_trainer: [
    'Treino individual', 'Treino em dupla', 'Consultoria online', 'Treino em domicílio', 'Treino em parque ou praça', 'Treino para emagrecimento',
    'Treino para ganho de massa', 'Treino para idosos', 'Treino para gestantes', 'Treino funcional', 'Reabilitação e condicionamento',
  ],
  pet_sitter: [
    'Visita diária ao pet', 'Hospedagem do pet em casa', 'Pet sitter na casa do tutor', 'Cuidado de gatos', 'Administração de medicamentos', 'Pet sitter durante viagem',
    'Pet sitter por hora', 'Cuidado de animais exóticos', 'Pet sitter de fim de semana', 'Pet sitter para filhotes e idosos',
  ],
  pilates: [
    'Pilates de solo', 'Pilates com aparelhos', 'Pilates para gestantes', 'Pilates para idosos', 'Pilates para coluna', 'Pilates em domicílio',
    'Pilates em dupla', 'Pilates online', 'Pilates para reabilitação', 'Pilates para emagrecimento', 'Aula experimental',
  ],
  pintor: [
    'Pintura de parede residencial', 'Pintura de teto', 'Pintura de fachada', 'Pintura de portas e janelas', 'Pintura de grades e portões', 'Textura e grafiato',
    'Massa corrida', 'Pintura de apartamento', 'Pintura de móveis', 'Pintura comercial', 'Verniz em madeira',
  ],
  pintura_auto: [
    'Pintura completa do carro', 'Pintura de peça', 'Repintura de para-choque', 'Pintura de moto', 'Pintura em cor original', 'Pintura de capô e teto',
    'Pintura de retrovisor', 'Pintura de rodas', 'Cristalização de pintura', 'Retoque de pintura', 'Reparo de arranhões profundos',
  ],
  pintura_epoxi: [
    'Piso epóxi para garagem', 'Piso epóxi industrial', 'Piso epóxi autonivelante', 'Pintura epóxi em paredes', 'Piso epóxi para lojas', 'Epóxi para áreas molhadas',
    'Reparo de piso epóxi', 'Piso epóxi antiderrapante', 'Pintura epóxi para estacionamento', 'Piso epóxi em cozinhas', 'Piso epóxi para laboratórios',
  ],
  pintura_predial: [
    'Pintura de fachada de prédio', 'Pintura de áreas comuns', 'Pintura de garagem', 'Pintura de escadas e corredores', 'Pintura com balancim', 'Pintura com andaime',
    'Pintura de condomínio', 'Pintura de muros e grades', 'Pintura de fachada comercial', 'Pintura de prédio comercial', 'Pintura com rapel (acesso por corda)',
  ],
  piscina: [
    'Construção de piscina de alvenaria', 'Piscina de vinil', 'Piscina de fibra', 'Reforma de piscina', 'Piscina com prainha', 'Piscina com spa', 'Piscina com cascata',
    'Revestimento de piscina', 'Projeto de piscina', 'Piscina aquecida', 'Cobertura de piscina',
  ],
  piso_vinilico: [
    'Instalação de piso vinílico', 'Instalação de piso laminado', 'Piso vinílico colado', 'Piso vinílico click', 'Remoção de piso antigo', 'Manta e preparo de contrapiso',
    'Instalação de rodapé', 'Piso laminado em escadas', 'Piso vinílico em áreas comerciais', 'Reparo de piso laminado', 'Piso vinílico em banheiro',
  ],
  pizzaiolo: [
    'Pizza para festas', 'Pizza em forno a lenha', 'Rodízio de pizza em casa', 'Pizza para eventos corporativos', 'Pizza napolitana', 'Pizzaiolo para casamento',
    'Pizzas por encomenda', 'Pizza em forno portátil', 'Pizza para confraternização', 'Aula de pizza', 'Pizzaiolo por hora',
  ],
  plantio: [
    'Plantio de árvores', 'Transplante de árvores e arbustos', 'Plantio de mudas', 'Plantio de grama', 'Plantio de flores', 'Plantio em vasos',
    'Montagem de canteiros', 'Plantio de horta', 'Preparo de solo', 'Plantio de cerca viva', 'Replantio de jardins',
  ],
  poda_arvore: [
    'Poda de árvores', 'Poda de palmeiras', 'Corte e remoção de árvores', 'Poda de cerca viva', 'Poda em altura', 'Retirada de galhos secos',
    'Limpeza e remoção de tocos', 'Poda de formação', 'Poda de manutenção', 'Poda de árvores frutíferas', 'Poda emergencial após temporais',
  ],
  polimento: [
    'Polimento técnico', 'Vitrificação de pintura', 'Cristalização', 'Polimento de faróis', 'Polimento de motos', 'Polimento de rodas', 'Revitalização de pintura',
    'Proteção cerâmica', 'Remoção de riscos leves', 'Aplicação de cera', 'Polimento de vidros',
  ],
  porcelanato: [
    'Assentamento de porcelanato', 'Porcelanato em grandes formatos', 'Porcelanato líquido', 'Porcelanato em fachada', 'Porcelanato em banheiro', 'Porcelanato em cozinha',
    'Porcelanato em área externa', 'Reparo e troca de peças', 'Rejuntamento de porcelanato', 'Remoção de piso antigo', 'Nivelamento de contrapiso',
  ],
  portao_eletrico: [
    'Instalação de portão eletrônico', 'Manutenção de portão eletrônico', 'Troca de motor ou controle', 'Instalação de portão basculante', 'Instalação de portão deslizante',
    'Automação de portão existente', 'Troca de cremalheira', 'Instalação de sensor de segurança', 'Reprogramação de controle remoto', 'Instalação de portão de garagem automático',
  ],
  professor_particular: [
    'Reforço escolar', 'Preparação para vestibular e ENEM', 'Aula de matemática', 'Aula de português', 'Aula de inglês', 'Aulas de ciências e biologia',
    'Aula de física e química', 'Aula de alfabetização', 'Aula para concursos', 'Aula de redação', 'Aula online',
  ],
  programacao: [
    'Desenvolvimento de aplicativo', 'Desenvolvimento de sistema web', 'Automação de tarefas (scripts)', 'Integração entre sistemas', 'Correção de bugs', 'Aulas de programação',
    'Criação de API', 'Desenvolvimento de bot', 'Planilhas com macros', 'Banco de dados', 'Desenvolvimento de jogos',
  ],
  psicologo: [
    'Psicoterapia individual', 'Psicoterapia para adolescentes', 'Terapia de casal', 'Terapia para ansiedade e depressão', 'Orientação de pais', 'Terapia infantil',
    'Atendimento online', 'Avaliação psicológica', 'Orientação vocacional', 'Atendimento em domicílio', 'Luto e perdas',
  ],
  quadro_eletrico: [
    'Instalação de quadro de distribuição', 'Troca de disjuntores', 'Instalação de DR e DPS', 'Organização de quadro elétrico', 'Troca de quadro antigo', 'Ampliação de carga',
    'Quadro para ar-condicionado', 'Quadro para obra', 'Identificação de circuitos', 'Aterramento do quadro', 'Reparo de curto-circuito',
  ],
  rebocador: [
    'Reboco de parede', 'Reboco de fachada', 'Emboço', 'Chapisco', 'Reboco de muro', 'Reparo de reboco solto', 'Reboco interno', 'Reboco externo',
    'Reboco fino', 'Acabamento liso para pintura', 'Reboco de teto',
  ],
  redator: [
    'Textos para site', 'Textos para redes sociais', 'Artigos para blog', 'Copywriting para vendas', 'Revisão de textos', 'Releases e comunicados',
    'Roteiros para vídeos', 'Newsletter e e-mail marketing', 'Textos para currículo e LinkedIn', 'Descrição de produtos', 'Livros e ebooks',
  ],
  rede_internet: [
    'Instalação de rede Wi-Fi', 'Instalação de cabeamento estruturado', 'Melhora de sinal de Wi-Fi', 'Instalação de roteador e repetidores', 'Configuração de rede corporativa',
    'Instalação de ponto de rede', 'Mesh e Wi-Fi 6', 'Crimpagem e cabeamento', 'Resolver internet lenta', 'Configuração de VPN', 'Rack e organização de cabos',
  ],
  social_media: [
    'Gestão de Instagram', 'Gestão de Facebook e TikTok', 'Criação de posts', 'Reels e vídeos curtos', 'Planejamento de conteúdo', 'Anúncios patrocinados',
    'Gestão de perfil profissional', 'Gestão de comunidade e atendimento', 'Calendário editorial', 'Relatório mensal de resultados', 'Stories e destaques',
  ],
  reforco_escolar: [
    'Reforço escolar fundamental', 'Reforço escolar médio', 'Reforço de matemática', 'Reforço de português', 'Apoio com lição de casa', 'Alfabetização',
    'Preparação para provas', 'Reforço em ciências', 'Reforço para crianças com TDAH', 'Aula em domicílio', 'Aula online',
  ],
  banheiro_reforma: [
    'Reforma completa de banheiro', 'Troca de louças e metais', 'Troca de revestimentos', 'Instalação de box', 'Troca de pia e bancada', 'Impermeabilização de banheiro',
    'Banheiro acessível', 'Instalação de chuveiro e ducha', 'Reforma de lavabo', 'Iluminação de banheiro',
  ],
  restauracao_moveis: [
    'Restauração de móveis antigos', 'Restauração de móveis de madeira', 'Restauração de cadeiras', 'Restauração de móveis laqueados', 'Troca de estofado e palhinha',
    'Restauração de portas antigas', 'Pintura envelhecida (patina)', 'Reparo de cupim em móveis', 'Restauração de pianos e relógios', 'Reforma de estofados', 'Polimento e verniz',
  ],
  salgadeiro: [
    'Salgados para festas', 'Salgadinhos fritos', 'Salgados assados', 'Cento de salgados', 'Mini salgados', 'Salgados congelados', 'Salgados para eventos corporativos',
    'Coxinha e risoles', 'Empadas e tortas salgadas', 'Salgados para festa infantil', 'Salgados veganos',
  ],
  sanitizacao: [
    'Sanitização residencial', 'Sanitização comercial', 'Sanitização de veículos', 'Sanitização de condomínios', 'Sanitização de escolas', 'Sanitização de clínicas',
    'Sanitização pós-evento', 'Sanitização com nebulização', 'Sanitização de caixa d\'água', 'Contrato periódico de sanitização', 'Sanitização de ar-condicionado',
  ],
  sapateiro: [
    'Troca de sola', 'Troca de salto', 'Conserto de calçados', 'Tingimento de sapatos', 'Reforma de tênis', 'Conserto de bolsas e mochilas', 'Troca de zíper',
    'Limpeza e hidratação de couro', 'Palmilhas sob medida', 'Alargamento de sapatos', 'Reforma de botas',
  ],
  seguranca_evento: [
    'Segurança para festa', 'Segurança para casamento', 'Segurança para eventos corporativos', 'Controle de acesso e portaria', 'Segurança para shows',
    'Segurança para formaturas', 'Equipe de segurança para eventos','Ronda e vigilância', 'Segurança pessoal (escolta)', 'Segurança para eventos esportivos', 'Revista e credenciamento',
  ],
  serralheiro: [
    'Portões de ferro e alumínio', 'Grades de proteção', 'Estruturas metálicas', 'Corrimãos e guarda-corpos', 'Soldas e reparos', 'Portão eletrônico', 'Escadas metálicas',
    'Coberturas metálicas', 'Mezanino metálico', 'Pergolados de ferro', 'Fechaduras e dobradiças',
  ],
  solda: [
    'Solda de estruturas metálicas', 'Solda de portões e grades', 'Solda de alumínio', 'Solda em aço inox', 'Solda de tubulação', 'Reparo de peças metálicas',
    'Solda de caçambas e implementos', 'Solda MIG e TIG', 'Solda de reservatórios', 'Solda em campo', 'Fabricação de peças sob medida',
  ],
  som_auto: [
    'Instalação de som automotivo', 'Instalação de alto-falantes', 'Instalação de subwoofer e amplificador', 'Troca de multimídia', 'Instalação de rádio', 'Isolamento acústico',
    'Regulagem de som', 'Reparo de som', 'Instalação de caixas de som', 'Instalação de TV e DVD automotivo', 'Projeto de som personalizado',
  ],
  stencil: [
    'Stencil em parede', 'Pintura de padronagem em parede', 'Arte de parede personalizada', 'Grafite decorativo', 'Painel decorativo pintado', 'Mural artístico',
    'Pintura decorativa para quartos infantis', 'Frases e letterings em paredes', 'Stencil em móveis', 'Pintura artística comercial', 'Efeitos de parede (cimento queimado, tadelakt)',
  ],
  tecnico_informatica: [
    'Formatação e instalação', 'Remoção de vírus', 'Upgrade de hardware', 'Configuração de rede Wi-Fi', 'Recuperação de dados', 'Manutenção de notebook', 'Instalação de impressoras',
    'Montagem de computador', 'Suporte técnico em domicílio', 'Troca de tela de notebook', 'Backup',
  ],
  telhador: [
    'Telhado novo', 'Troca de telhas', 'Conserto de goteiras', 'Calhas e rufos', 'Limpeza de telhado', 'Impermeabilização de telhado', 'Telha termoacústica',
    'Telhado de fibrocimento', 'Manutenção preventiva', 'Reforma completa do telhado', 'Telha colonial',
  ],
  textura: [
    'Textura em parede', 'Grafiato', 'Textura em fachada', 'Textura rústica', 'Textura em sala e quarto', 'Aplicação de efeito cimento queimado', 'Efeito mármore',
    'Textura em muros', 'Textura com rolo', 'Efeito travertino', 'Textura projetada',
  ],
  tradutor: [
    'Tradução simples', 'Tradução juramentada', 'Tradução de documentos', 'Tradução técnica', 'Interpretação simultânea', 'Tradução de sites',
    'Tradução de contratos', 'Tradução de artigos acadêmicos', 'Legendagem', 'Interpretação consecutiva', 'Versão de currículo',
  ],
  translado: [
    'Transfer aeroporto', 'Translado para eventos', 'Translado rodoviário', 'Translado para casamentos', 'Transfer executivo', 'Translado de grupos',
    'Translado entre cidades', 'Translado para hotéis', 'Transfer com carro de luxo', 'Translado para turismo', 'Van e micro-ônibus',
  ],
  transporte_pets: [
    'Transporte de pet para veterinário', 'Transporte de pet para pet shop', 'Transporte de pet para viagem', 'Transporte de pet para aeroporto', 'Transporte de gatos',
    'Transporte de cães de grande porte', 'Transporte de animais entre cidades', 'Táxi pet', 'Transporte para hotel de pets', 'Documentação de viagem do pet',
  ],
  transporte_escolar: [
    'Transporte escolar diário', 'Transporte escolar para creche', 'Transporte escolar para ensino fundamental', 'Transporte de alunos para atividades', 'Transporte escolar com monitor',
    'Transporte escolar para necessidades especiais', 'Transporte escolar mensal', 'Transporte de ida ou volta', 'Transporte escolar em van', 'Transporte para excursões',
  ],
  verniz: [
    'Aplicação de verniz em madeira', 'Verniz em portas', 'Verniz em deck', 'Tingimento de madeira', 'Verniz marítimo', 'Verniz em móveis',
    'Verniz em esquadrias', 'Restauração de verniz', 'Verniz em pisos de madeira', 'Verniz em forros', 'Aplicação de stain',
  ],
  veterinario_domicilio: [
    'Consulta veterinária em casa', 'Vacinação', 'Vermifugação', 'Exames e coleta', 'Pós-operatório em casa', 'Eutanásia humanitária', 'Atendimento de gatos',
    'Atendimento de idosos', 'Curativos e medicação', 'Check-up geral', 'Orientação nutricional pet',
  ],
  vidraceiro: [
    'Troca de vidros', 'Box de banheiro', 'Espelhos', 'Portas e janelas de vidro', 'Vidro temperado', 'Fechamento de varanda', 'Guarda-corpo de vidro',
    'Vitrines', 'Reparo em vidros', 'Cobertura de vidro', 'Tampo de vidro para mesas',
  ],
  vigia: [
    'Vigia noturno', 'Vigia para obras', 'Vigia para condomínio', 'Vigilância de ruas', 'Vigia para eventos', 'Vigia para comércio', 'Portaria e controle de acesso',
    'Vigia para terrenos', 'Vigia para empresas', 'Ronda de imóveis', 'Vigia para residências',
  ],
  vitrinista: [
    'Montagem de vitrine', 'Troca de vitrine por sazonalidade', 'Vitrine de Natal', 'Vitrine de datas comemorativas', 'Visual merchandising', 'Projeto de vitrine',
    'Organização de loja', 'Montagem de displays', 'Vitrine para lojas pequenas', 'Decoração de ponto de venda', 'Consultoria de layout de loja',
  ],
  yoga: [
    'Aula de hatha yoga', 'Aula de vinyasa', 'Aula de yoga para iniciantes', 'Yoga para gestantes', 'Yoga para idosos', 'Meditação guiada', 'Yoga em domicílio',
    'Aula de yoga online', 'Yoga para coluna', 'Yoga para crianças', 'Aula em dupla ou grupo',
  ],

  cameras: cameras,
  advogado: [
    'Consulta jurídica', 'Direito do consumidor', 'Elaboração de contratos', 'Direito de família', 'Direito trabalhista', 'Direito previdenciário (INSS)',
    'Direito imobiliário', 'Inventário e herança', 'Divórcio e pensão', 'Direito civil', 'Revisão de contratos', 'Defesa em multas e processos',
  ],
  arquiteto: [
    'Projeto de reforma', 'Projeto residencial', 'Regularização e aprovação na prefeitura', 'Projeto comercial', 'Acompanhamento de obra', 'Projeto de ampliação',
    'Projeto 3D e renderização', 'Projeto de interiores', 'Levantamento arquitetônico', 'Laudo técnico', 'Consultoria de arquitetura',
  ],
  banho_tosa: [
    'Banho', 'Banho e tosa completa', 'Tosa higiênica', 'Tosa na tesoura', 'Tosa na máquina', 'Hidratação de pelos', 'Corte de unhas', 'Limpeza de ouvidos',
    'Banho a seco', 'Banho e tosa em domicílio', 'Tosa de raças específicas',
  ],
  barbeiro: [
    'Corte masculino', 'Barba', 'Corte e barba', 'Corte na máquina', 'Degradê', 'Sobrancelha masculina', 'Pigmentação de barba', 'Corte infantil',
    'Barboterapia', 'Barbeiro em domicílio', 'Relaxamento capilar',
  ],
}
