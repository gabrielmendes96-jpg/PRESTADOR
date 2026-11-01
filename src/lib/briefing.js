// Ficha de orçamento: perguntas rápidas que o cliente responde antes de abrir a conversa, para o profissional
// já receber o pedido organizado (veículo, tamanho da parede, data do evento...).
//
// Cada pergunta: { id, rotulo, tipo: 'texto' | 'numero' | 'opcoes' | 'data', obrigatoria?, dica?, opcoes? }
// O resultado guardado na conversa é uma lista [{ rotulo, valor }] — independe das perguntas de hoje, então
// mudar o questionário depois não quebra pedidos antigos.

const ANO_ATUAL = new Date().getFullYear()

export const LIMITE_RESPOSTA = 200
export const LIMITE_OBSERVACOES = 1000

const QUANDO = {
  id: 'quando', rotulo: 'Quando você precisa?', tipo: 'opcoes',
  opcoes: ['Urgente (hoje ou amanhã)', 'Esta semana', 'Neste mês', 'Sem pressa, estou orçando'],
}

const TIPO_IMOVEL = { id: 'tipo_imovel', rotulo: 'Tipo de imóvel', tipo: 'opcoes', opcoes: ['Casa', 'Apartamento', 'Comércio ou escritório', 'Outro'] }

// Conjuntos de perguntas por tipo de serviço.
const CONJUNTOS = {
  automotivo: [
    { id: 'veiculo', rotulo: 'Marca e modelo do veículo', tipo: 'texto', obrigatoria: true, dica: 'Ex.: Fiat Uno, Honda CG 160' },
    { id: 'ano', rotulo: 'Ano', tipo: 'numero', obrigatoria: true, min: 1950, max: ANO_ATUAL + 1, dica: String(ANO_ATUAL - 5) },
    { id: 'combustivel', rotulo: 'Combustível', tipo: 'opcoes', opcoes: ['Flex', 'Gasolina', 'Diesel', 'Elétrico ou híbrido', 'Não sei'] },
    { id: 'problema', rotulo: 'O que está acontecendo ou o que você quer fazer?', tipo: 'texto', obrigatoria: true, dica: 'Ex.: barulho ao frear, instalar rádio' },
    QUANDO,
  ],
  imovel: [
    TIPO_IMOVEL,
    { id: 'local', rotulo: 'Em qual local ou cômodo?', tipo: 'texto', obrigatoria: true, dica: 'Ex.: sala, banheiro, fachada, quintal' },
    { id: 'medidas', rotulo: 'Tamanho aproximado', tipo: 'texto', obrigatoria: true, dica: 'Ex.: parede de 3 x 2,5 m, ou 20 m²' },
    { id: 'situacao', rotulo: 'Como está hoje?', tipo: 'texto', dica: 'Ex.: parede com mofo, piso antigo para trocar' },
    QUANDO,
  ],
  instalacao: [
    TIPO_IMOVEL,
    { id: 'local', rotulo: 'Em qual local ou cômodo?', tipo: 'texto', obrigatoria: true, dica: 'Ex.: cozinha, banheiro, área de serviço' },
    { id: 'quantidade', rotulo: 'Quantidade ou tamanho', tipo: 'texto', obrigatoria: true, dica: 'Ex.: 1 chuveiro, 3 tomadas, 12 m de fiação' },
    { id: 'situacao', rotulo: 'O que está acontecendo?', tipo: 'texto', dica: 'Ex.: chuveiro não esquenta, cano vazando' },
    QUANDO,
  ],
  limpeza: [
    TIPO_IMOVEL,
    { id: 'tamanho', rotulo: 'Tamanho do imóvel', tipo: 'texto', obrigatoria: true, dica: 'Ex.: 70 m², 2 quartos e 2 banheiros' },
    { id: 'frequencia', rotulo: 'Frequência', tipo: 'opcoes', opcoes: ['Uma vez só', 'Toda semana', 'A cada 15 dias', 'Todo mês'] },
    { id: 'pets', rotulo: 'Tem animais em casa?', tipo: 'opcoes', opcoes: ['Não', 'Sim'] },
    QUANDO,
  ],
  jardim: [
    { id: 'area', rotulo: 'Tamanho da área', tipo: 'texto', obrigatoria: true, dica: 'Ex.: quintal de 40 m²' },
    { id: 'servico', rotulo: 'O que precisa fazer?', tipo: 'texto', obrigatoria: true, dica: 'Ex.: cortar grama, podar árvore' },
    { id: 'frequencia', rotulo: 'Frequência', tipo: 'opcoes', opcoes: ['Uma vez só', 'Toda semana', 'A cada 15 dias', 'Todo mês'] },
    QUANDO,
  ],
  equipamento: [
    { id: 'equipamento', rotulo: 'Qual aparelho ou equipamento?', tipo: 'texto', obrigatoria: true, dica: 'Ex.: geladeira, TV, celular, notebook' },
    { id: 'marca_modelo', rotulo: 'Marca e modelo', tipo: 'texto', obrigatoria: true, dica: 'Ex.: Brastemp BRM44, iPhone 11' },
    { id: 'problema', rotulo: 'Qual é o problema?', tipo: 'texto', obrigatoria: true, dica: 'Ex.: não liga, não gela, tela quebrada' },
    { id: 'idade', rotulo: 'Tempo de uso', tipo: 'opcoes', opcoes: ['Menos de 1 ano', '1 a 3 anos', 'Mais de 3 anos', 'Não sei'] },
    QUANDO,
  ],
  saude: [
    { id: 'para_quem', rotulo: 'Para quem é o atendimento?', tipo: 'opcoes', obrigatoria: true, opcoes: ['Para mim', 'Para uma criança', 'Para um idoso', 'Outra pessoa'] },
    { id: 'motivo', rotulo: 'Qual o motivo principal?', tipo: 'texto', obrigatoria: true, dica: 'Em poucas palavras' },
    { id: 'local_atendimento', rotulo: 'Onde prefere ser atendido?', tipo: 'opcoes', opcoes: ['No local do profissional', 'Na minha casa', 'Online', 'Tanto faz'] },
    { id: 'horario', rotulo: 'Melhor dia e horário', tipo: 'texto', dica: 'Ex.: terças e quintas à tarde' },
  ],
  beleza: [
    { id: 'servico', rotulo: 'Qual serviço você quer?', tipo: 'texto', obrigatoria: true, dica: 'Ex.: corte e escova, unhas em gel' },
    { id: 'local_atendimento', rotulo: 'Onde prefere ser atendido?', tipo: 'opcoes', opcoes: ['No local do profissional', 'Na minha casa', 'Tanto faz'] },
    { id: 'horario', rotulo: 'Melhor dia e horário', tipo: 'texto', dica: 'Ex.: sábado de manhã' },
  ],
  educacao: [
    { id: 'materia', rotulo: 'Matéria ou assunto', tipo: 'texto', obrigatoria: true, dica: 'Ex.: matemática, inglês, violão' },
    { id: 'nivel', rotulo: 'Nível ou série do aluno', tipo: 'texto', obrigatoria: true, dica: 'Ex.: 8º ano, iniciante, ENEM' },
    { id: 'modalidade', rotulo: 'Modalidade', tipo: 'opcoes', opcoes: ['Presencial', 'Online', 'Tanto faz'] },
    { id: 'frequencia', rotulo: 'Aulas por semana', tipo: 'opcoes', opcoes: ['1 vez', '2 vezes', '3 ou mais', 'Ainda não sei'] },
  ],
  eventos: [
    { id: 'evento', rotulo: 'Tipo de evento', tipo: 'texto', obrigatoria: true, dica: 'Ex.: aniversário, casamento, formatura' },
    { id: 'data_evento', rotulo: 'Data do evento', tipo: 'data', obrigatoria: true },
    { id: 'convidados', rotulo: 'Número de convidados', tipo: 'numero', obrigatoria: true, min: 1, max: 100000 },
    { id: 'local_evento', rotulo: 'Local (bairro ou cidade)', tipo: 'texto', obrigatoria: true },
    { id: 'duracao', rotulo: 'Horário e duração', tipo: 'texto', dica: 'Ex.: das 19h às 23h' },
  ],
  alimentacao: [
    { id: 'pessoas', rotulo: 'Para quantas pessoas?', tipo: 'numero', obrigatoria: true, min: 1, max: 100000 },
    { id: 'data_evento', rotulo: 'Data de entrega ou do evento', tipo: 'data', obrigatoria: true },
    { id: 'ocasiao', rotulo: 'Ocasião', tipo: 'texto', dica: 'Ex.: aniversário, almoço de família' },
    { id: 'restricoes', rotulo: 'Restrição alimentar', tipo: 'texto', dica: 'Ex.: sem glúten, vegetariano, alergia' },
  ],
  transporte: [
    { id: 'origem', rotulo: 'Origem (bairro e cidade)', tipo: 'texto', obrigatoria: true },
    { id: 'destino', rotulo: 'Destino (bairro e cidade)', tipo: 'texto', obrigatoria: true },
    { id: 'volume', rotulo: 'O que será transportado?', tipo: 'texto', obrigatoria: true, dica: 'Ex.: quitinete completa, 1 sofá e 1 geladeira' },
    { id: 'data_servico', rotulo: 'Data desejada', tipo: 'data' },
    { id: 'acesso', rotulo: 'Acesso nos dois locais', tipo: 'opcoes', opcoes: ['Térreo', 'Escada', 'Elevador', 'Não sei'] },
  ],
  seguranca: [
    { id: 'local', rotulo: 'Onde será instalado ou feito?', tipo: 'opcoes', obrigatoria: true, opcoes: ['Casa', 'Apartamento', 'Empresa ou loja', 'Outro'] },
    { id: 'tamanho', rotulo: 'Tamanho e quantidade', tipo: 'texto', obrigatoria: true, dica: 'Ex.: 4 câmeras, portão e muro de 20 m' },
    { id: 'situacao', rotulo: 'Já existe algum sistema?', tipo: 'opcoes', opcoes: ['Não', 'Sim, quero trocar ou ampliar'] },
    QUANDO,
  ],
  animais: [
    { id: 'especie', rotulo: 'Espécie', tipo: 'opcoes', obrigatoria: true, opcoes: ['Cachorro', 'Gato', 'Outro'] },
    { id: 'porte', rotulo: 'Porte e raça', tipo: 'texto', obrigatoria: true, dica: 'Ex.: pequeno, poodle' },
    { id: 'idade_pet', rotulo: 'Idade do animal', tipo: 'texto', dica: 'Ex.: 3 anos' },
    { id: 'servico', rotulo: 'O que você precisa?', tipo: 'texto', obrigatoria: true, dica: 'Ex.: banho e tosa, passeio diário' },
    { id: 'data_servico', rotulo: 'Data ou período', tipo: 'texto', dica: 'Ex.: de 10 a 15 de dezembro' },
  ],
  juridico: [
    { id: 'assunto', rotulo: 'Qual o assunto?', tipo: 'texto', obrigatoria: true, dica: 'Ex.: abrir MEI, divórcio, imposto de renda' },
    { id: 'situacao', rotulo: 'Resuma a situação', tipo: 'texto', obrigatoria: true, dica: 'Uma ou duas frases' },
    { id: 'prazo', rotulo: 'Existe algum prazo?', tipo: 'texto', dica: 'Ex.: audiência dia 20, vence em 15 dias' },
  ],
  generico: [
    { id: 'necessidade', rotulo: 'O que você precisa?', tipo: 'texto', obrigatoria: true, dica: 'Em poucas palavras' },
    { id: 'local', rotulo: 'Local do serviço (bairro ou cidade)', tipo: 'texto' },
    QUANDO,
  ],
}

// Grupo do profissional (topicos.id) -> conjunto de perguntas.
const POR_TOPICO = {
  automotivo: 'automotivo',
  construcao: 'imovel', pintura: 'imovel', marcenaria: 'imovel', residencial: 'imovel', reformas: 'imovel', externos: 'jardim',
  eletrica: 'instalacao', hidraulica: 'instalacao',
  limpeza: 'limpeza',
  jardim: 'jardim',
  tecnologia: 'equipamento',
  saude: 'saude',
  beleza: 'beleza',
  educacao: 'educacao',
  eventos: 'eventos',
  alimentacao: 'alimentacao',
  transporte: 'transporte',
  seguranca: 'seguranca',
  animais: 'animais',
  juridico: 'juridico',
}

// Categorias que fogem do padrão do grupo delas.
const POR_CATEGORIA = {
  assistencia_eletrodomesticos: 'equipamento', conserto_celular: 'equipamento', conserto_tv_eletronicos: 'equipamento', instalador_tv: 'equipamento',
  montador_moveis: 'imovel', retirada_entulho: 'imovel', calhas_rufos: 'imovel', estofador: 'imovel', pocos_cisternas: 'imovel', topografo: 'imovel',
  instrutor_direcao: 'educacao', laudo_cautelar: 'automotivo', vidros_automotivos: 'automotivo', capotaria: 'automotivo',
  passadeira_lavanderia: 'limpeza', baba: 'saude', hotel_pets: 'animais', locacao_festas: 'eventos',
  mudanca: 'transporte', frete: 'transporte', entrega: 'transporte', carregador: 'transporte', guincho: 'transporte', guincho_auto: 'transporte',
  automacao: 'instalacao', painel_solar: 'imovel', ar_condicionado: 'instalacao', aquecedor: 'instalacao', desentupidor: 'instalacao', vazamento: 'instalacao',
  fisioterapeuta: 'saude', psicologo: 'saude', nutricionista: 'saude', fonoaudiologo: 'saude', podologo: 'saude', enfermeiro: 'saude', cuidador_idoso: 'saude', home_care: 'saude',
}

const OBSERVACOES = { id: 'observacoes', rotulo: 'Observações', tipo: 'texto_longo', dica: 'Escreva com suas palavras qualquer detalhe que ajude o profissional a entender o que você precisa.' }

// Perguntas do tipo de serviço, SEMPRE terminando em "Observações".
export function perguntasPara(topicoId, categoriaId) {
  const chave = POR_CATEGORIA[categoriaId] || POR_TOPICO[topicoId] || 'generico'
  return [...CONJUNTOS[chave], OBSERVACOES]
}

// Confere o que foi preenchido. Devolve { id: mensagem } só para os campos com problema.
export function validar(perguntas, respostas) {
  const erros = {}
  for (const p of perguntas) {
    const valor = String(respostas[p.id] ?? '').trim()
    if (!valor) { if (p.obrigatoria) erros[p.id] = 'Preencha este campo'; continue }
    const limite = p.tipo === 'texto_longo' ? LIMITE_OBSERVACOES : LIMITE_RESPOSTA
    if (valor.length > limite) erros[p.id] = `Use no máximo ${limite} caracteres`
    if (p.tipo === 'numero') {
      const n = Number(valor)
      if (!Number.isFinite(n) || n < (p.min ?? 0) || n > (p.max ?? 1e9)) erros[p.id] = `Informe um número entre ${p.min ?? 0} e ${p.max ?? 1e9}`
    }
    if (p.tipo === 'opcoes' && !p.opcoes.includes(valor)) erros[p.id] = 'Escolha uma das opções'
  }
  return erros
}

// Lista [{ rotulo, valor }] só com o que foi respondido, na ordem das perguntas.
export function montarBriefing(perguntas, respostas) {
  return perguntas
    .map(p => ({ rotulo: p.rotulo, valor: String(respostas[p.id] ?? '').trim() }))
    .filter(item => item.valor)
}

const formatarValor = (valor) => (/^\d{4}-\d{2}-\d{2}$/.test(valor) ? valor.split('-').reverse().join('/') : valor)

// Texto da primeira mensagem da conversa (o profissional também recebe a notificação com isso).
export function textoDoBriefing(briefing, assunto) {
  if (!Array.isArray(briefing) || briefing.length === 0) return ''
  const linhas = briefing.filter(i => i.rotulo !== 'Observações').map(i => `• ${i.rotulo}: ${formatarValor(i.valor)}`)
  const obs = briefing.find(i => i.rotulo === 'Observações')
  return [`📋 Pedido de orçamento${assunto ? ` — ${assunto}` : ''}`, ...linhas, ...(obs ? [`Observações: ${obs.valor}`] : [])].join('\n')
}

// Resumo de uma linha para a lista de conversas ("Fiat Uno · 2018 · barulho ao frear").
export function resumoCurto(briefing, max = 3) {
  if (!Array.isArray(briefing)) return ''
  return briefing.filter(i => i.rotulo !== 'Observações').slice(0, max).map(i => formatarValor(i.valor)).join(' · ')
}

// Modelo que o profissional edita para responder com o orçamento.
export function modeloDeOrcamento(assunto) {
  return [
    `Orçamento${assunto ? ` — ${assunto}` : ''}`,
    '• Valor total: R$ ',
    '• Mão de obra: R$ ',
    '• Materiais: R$ ',
    '• Prazo para executar: ',
    '• Pode começar em: ',
    '• Forma de pagamento: ',
    '• Validade desta proposta: 7 dias',
  ].join('\n')
}

// Confere o que vem do banco antes de desenhar (nunca confia no formato).
export function briefingValido(valor) {
  return Array.isArray(valor) && valor.every(i => i && typeof i.rotulo === 'string' && typeof i.valor === 'string')
}
