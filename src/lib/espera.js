// "há 25 min", "há 3 h", "há 2 dias" — usado na fila de conversas do
// prestador pra mostrar há quanto tempo um cliente espera resposta.
export function formatarEspera(desdeISO, agora = new Date()) {
  const minutos = Math.max(0, Math.floor((new Date(agora) - new Date(desdeISO)) / 60000))
  if (minutos < 1) return 'agora'
  if (minutos < 60) return `há ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `há ${horas} h`
  const dias = Math.floor(horas / 24)
  return `há ${dias} ${dias === 1 ? 'dia' : 'dias'}`
}

// Etapas que o prestador usa pra organizar suas conversas (o funil dele).
export const ETAPAS = [
  { id: 'novo', label: 'Novo', cor: '#3730A3', bg: '#E0E7FF' },
  { id: 'em_orcamento', label: 'Em orçamento', cor: '#92610A', bg: '#FEF3C7' },
  { id: 'agendado', label: 'Agendado', cor: '#0E7490', bg: '#CFFAFE' },
  { id: 'concluido', label: 'Concluído', cor: '#14853D', bg: '#DCFCE7' },
  { id: 'arquivado', label: 'Arquivado', cor: '#6B7280', bg: '#F3F4F6' },
]

export const etapaPorId = (id) => ETAPAS.find(e => e.id === id) || ETAPAS[0]

// Modelos prontos de mensagem. {nome} vira o primeiro nome do cliente e
// {servico} o serviço da conversa; os "___" ficam pro prestador completar.
export const RESPOSTAS_PADRAO = [
  { id: 'detalhes', titulo: 'Pedir detalhes', texto: 'Olá, {nome}! Obrigado pelo contato. Pra te passar um orçamento certinho de {servico}, pode me contar mais detalhes (e mandar uma foto, se der)?' },
  { id: 'visita', titulo: 'Combinar visita', texto: 'Posso passar aí pra avaliar sem compromisso. Qual dia e horário ficam bons pra você? E qual o endereço?' },
  { id: 'orcamento', titulo: 'Enviar orçamento', texto: 'Pelo que você me contou, o valor de {servico} fica em R$ ___ (material ___ incluso). Prazo: ___. Se estiver ok, já posso agendar!' },
  { id: 'agendamento', titulo: 'Confirmar agendamento', texto: 'Combinado! Fica agendado pra ___ às ___. Qualquer imprevisto me avise por aqui.' },
  { id: 'agradecer', titulo: 'Agradecer e pedir avaliação', texto: 'Serviço concluído! Obrigado pela confiança, {nome}. Se puder, deixe uma avaliação no meu perfil — ajuda muito.' },
]

export function aplicarModelo(texto, { nome, servico }) {
  return texto
    .replaceAll('{nome}', (nome || 'cliente').split(' ')[0])
    .replaceAll('{servico}', servico || 'o serviço')
}
