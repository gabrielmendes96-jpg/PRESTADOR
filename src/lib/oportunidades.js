// Motor de oportunidades: decide quem é o melhor profissional para um cliente e quais pedidos valem mais para um prestador.
// Regras simples e explicáveis (cada pontuação vem com os motivos em português), sem custo e sem depender de serviço externo.

const clamp = (n, min, max) => Math.min(max, Math.max(min, n))
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0)
const fmtNota = (n) => n.toFixed(1).replace('.', ',')
const fmtKm = (km) => (km < 10 ? km.toFixed(1).replace('.', ',') : String(Math.round(km)))

// ---------- Cliente: melhores profissionais ----------

// p: prestador (como vem de buscarPrestadores: avaliacao, totalAvaliacoes, disponivel, pontosResposta, plano, boost_ativo, distanciaReal, raioAtendimento, cidade, estado)
// ctx: { cidade, estado, servicoDeclarado (true se o profissional marcou o serviço pedido) }
export function pontuarPrestador(p, ctx = {}) {
  const motivos = []
  let pontos = 0

  // Qualidade: nota ajustada pela quantidade de avaliações (poucas avaliações puxam para uma nota neutra, evita "10 com 1 voto").
  const n = num(p.totalAvaliacoes ?? p.total_avaliacoes)
  const nota = num(p.avaliacao ?? p.avaliacao_media)
  if (n > 0) {
    const ajustada = (nota * n + 7 * 3) / (n + 3)
    pontos += clamp(ajustada, 0, 10) * 3.5
    pontos += (Math.min(n, 20) / 20) * 10
    if (nota >= 8) motivos.push({ peso: nota * Math.min(n, 10), texto: `Nota ${fmtNota(nota)} (${n} ${n === 1 ? 'avaliação' : 'avaliações'})` })
  } else {
    pontos += 7 * 3.5 * 0.6 // sem histórico: não penaliza, mas fica atrás de quem tem boas avaliações
  }

  if (p.disponivel) {
    pontos += 10
    motivos.push({ peso: 40, texto: 'Disponível para novos clientes' })
  }

  // Resposta rápida (pontos de agilidade acumulados respondendo clientes).
  const agil = num(p.pontosResposta ?? p.pontos_resposta)
  if (agil > 0) {
    pontos += clamp(agil / 10, 0, 1) * 10
    if (agil >= 6) motivos.push({ peso: 35, texto: 'Costuma responder rápido' })
  }

  // Proximidade: distância real quando há localização; senão, mesma cidade.
  const dist = p.distanciaReal
  if (dist != null && Number.isFinite(dist)) {
    pontos += dist <= 5 ? 20 : dist <= 15 ? 14 : dist <= 30 ? 8 : 2
    if (dist <= 30) motivos.push({ peso: 60 - dist, texto: `A ${fmtKm(dist)} km de você` })
    const raio = num(p.raioAtendimento ?? p.raio_atendimento)
    if (raio && dist <= raio) {
      pontos += 5
      motivos.push({ peso: 45, texto: 'Atende o seu endereço' })
    }
  } else if (ctx.cidade && p.cidade && semAcentoSimples(ctx.cidade) === semAcentoSimples(p.cidade)) {
    pontos += 12
    motivos.push({ peso: 50, texto: `Atende em ${p.cidade}` })
  }

  if (ctx.servicoDeclarado) {
    pontos += 10
    motivos.push({ peso: 55, texto: 'Faz exatamente esse serviço' })
  }

  // Quantas palavras do pedido apareceram neste profissional (o assistente busca palavra por palavra).
  const acertos = num(p.acertos)
  if (acertos > 0) pontos += Math.min(acertos, 3) * 4
  if (acertos >= 2) motivos.push({ peso: 52, texto: 'Combina com o que você descreveu' })

  // Impulsionamento e plano pesam pouco: ajudam a desempatar, não a esconder bons profissionais sem plano alto.
  if (p.boost_ativo) pontos += 4
  const plano = p.plano ?? p.plano_id
  if (plano === 'premium') pontos += 3
  else if (plano === 'profissional') pontos += 2

  motivos.sort((a, b) => b.peso - a.peso)
  return { pontos: Math.round(clamp(pontos, 0, 100)), motivos: motivos.slice(0, 3).map(m => m.texto) }
}

function semAcentoSimples(t) {
  return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

// Ordena do melhor para o pior e devolve cada profissional com { pontos, motivos }.
export function rankearPrestadores(prestadores, ctx = {}, limite = 10) {
  const marcados = ctx.idsComServico instanceof Set ? ctx.idsComServico : new Set()
  return (prestadores || [])
    .map(p => ({ ...p, oportunidade: pontuarPrestador(p, { ...ctx, servicoDeclarado: marcados.has(p.id) }) }))
    .sort((a, b) => b.oportunidade.pontos - a.oportunidade.pontos || num(b.avaliacao) - num(a.avaliacao))
    .slice(0, limite)
}

// ---------- Prestador: melhores pedidos ----------

const URGENCIA = /\b(hoje|urgente|urgência|urgencia|agora|amanh[aã]|o quanto antes|imediat)/i

// pedido: { servico_id, categoria_id, cidade, estado, criado_em, orcamento_min, orcamento_max, prazo }
// prestador: { categoria_id, cidade, estado }; servicosIds: Set de serviços que ele marcou
export function pontuarPedido(pedido, prestador, servicosIds = new Set(), agora = new Date()) {
  const motivos = []
  let pontos = 0

  const servicoCombina = !!pedido.servico_id && servicosIds.has(pedido.servico_id)
  const categoriaCombina = !!pedido.categoria_id && pedido.categoria_id === prestador.categoria_id
  if (servicoCombina) { pontos += 50; motivos.push({ peso: 100, texto: 'É um serviço que você marcou que faz' }) }
  else if (categoriaCombina) { pontos += 30; motivos.push({ peso: 90, texto: 'Combina com a sua profissão' }) }
  else return { pontos: 0, motivos: [], combina: false }

  const mesmaCidade = semAcentoSimples(pedido.cidade) && semAcentoSimples(pedido.cidade) === semAcentoSimples(prestador.cidade)
  if (mesmaCidade) { pontos += 25; motivos.push({ peso: 80, texto: `Na sua cidade (${pedido.cidade})` }) }
  else if (pedido.estado && pedido.estado === prestador.estado) pontos += 8

  const horas = (agora - new Date(pedido.criado_em)) / 3600000
  if (Number.isFinite(horas)) {
    if (horas < 6) { pontos += 15; motivos.push({ peso: 70, texto: 'Publicado há poucas horas' }) }
    else if (horas < 24) { pontos += 10; motivos.push({ peso: 60, texto: 'Publicado hoje' }) }
    else if (horas < 72) pontos += 5
    else if (horas > 24 * 14) pontos -= 10
  }

  if (num(pedido.orcamento_min) > 0 || num(pedido.orcamento_max) > 0) {
    pontos += 5
    motivos.push({ peso: 40, texto: 'O cliente informou quanto pretende gastar' })
  }
  if (pedido.prazo && URGENCIA.test(pedido.prazo)) {
    pontos += 5
    motivos.push({ peso: 65, texto: 'O cliente quer resolver logo' })
  }
  if (num(pedido.totalCandidaturas) <= 2 && pedido.totalCandidaturas != null) {
    pontos += 8
    motivos.push({ peso: 55, texto: 'Poucos profissionais responderam' })
  }

  motivos.sort((a, b) => b.peso - a.peso)
  return { pontos: Math.round(clamp(pontos, 0, 100)), motivos: motivos.slice(0, 3).map(m => m.texto), combina: true }
}

// Só entram pedidos que combinam com o prestador e que ele ainda não respondeu; o melhor primeiro.
export function rankearPedidos(pedidos, prestador, servicosIds = new Set(), jaRespondeu = new Set(), limite = 10, agora = new Date()) {
  return (pedidos || [])
    .filter(p => !jaRespondeu.has(p.id))
    .map(p => ({ ...p, oportunidade: pontuarPedido(p, prestador, servicosIds, agora) }))
    .filter(p => p.oportunidade.combina)
    .sort((a, b) => b.oportunidade.pontos - a.oportunidade.pontos || new Date(b.criado_em) - new Date(a.criado_em))
    .slice(0, limite)
}

// ---------- Prestador: perfil completo e dicas ----------

// Cada item vale pontos; o que falta vira uma dica concreta. dados: { prestador, totalServicosMarcados, totalFotos }
export function avaliarPerfil({ prestador = {}, totalServicosMarcados = 0, totalFotos = 0 } = {}) {
  const itens = [
    { ok: !!prestador.foto_perfil, pontos: 15, dica: 'Coloque uma foto sua: o cliente confia mais em quem mostra o rosto.' },
    { ok: String(prestador.descricao || '').trim().length >= 80, pontos: 15, dica: 'Escreva uma descrição de pelo menos 80 caracteres, contando o que você faz e há quanto tempo.' },
    { ok: totalServicosMarcados >= 3, pontos: 25, dica: totalServicosMarcados === 0 ? 'Marque os serviços que você faz: é assim que você aparece nas buscas e nos pedidos certos.' : 'Marque pelo menos 3 serviços que você faz, para aparecer em mais buscas.' },
    { ok: totalFotos >= 3, pontos: 20, dica: totalFotos === 0 ? 'Adicione fotos dos seus trabalhos: perfis com fotos passam mais confiança.' : 'Adicione pelo menos 3 fotos dos seus trabalhos.' },
    { ok: !!prestador.whatsapp || !!prestador.redes_sociais, pontos: 5, dica: 'Informe um WhatsApp ou rede social para o cliente te encontrar.' },
    { ok: prestador.disponivel !== false, pontos: 10, dica: 'Você está marcado como indisponível: ligue "Disponível para novos clientes" para voltar às buscas.' },
    { ok: !!prestador.cidade && !!prestador.estado, pontos: 10, dica: 'Informe sua cidade e estado, para aparecer para quem está perto.' },
  ]
  const total = itens.reduce((s, i) => s + i.pontos, 0)
  const feitos = itens.filter(i => i.ok).reduce((s, i) => s + i.pontos, 0)
  return {
    percentual: Math.round((feitos / total) * 100),
    dicas: itens.filter(i => !i.ok).sort((a, b) => b.pontos - a.pontos).map(i => i.dica),
  }
}

// ---------- Frases do dia a dia -> palavras de busca ----------

const PALAVRAS_QUE_NAO_AJUDAM = new Set([
  'preciso', 'precisar', 'precisando', 'precisa', 'quero', 'queria', 'gostaria', 'fazer', 'faz', 'fazendo', 'para', 'pra', 'que', 'uma', 'umas', 'uns', 'por', 'favor',
  'com', 'sem', 'meu', 'minha', 'meus', 'minhas', 'esta', 'este', 'essa', 'esse', 'ainda', 'semana', 'hoje', 'amanha', 'urgente', 'alguem', 'pode', 'ajuda',
  'ajudar', 'tenho', 'estou', 'esta', 'esta', 'tem', 'tudo', 'muito', 'mais', 'como', 'onde', 'quem', 'qual', 'quando', 'depois', 'antes', 'aqui', 'seu', 'sua',
  'profissional', 'servico', 'servicos', 'alguma', 'algum', 'bom', 'boa', 'barato', 'perto', 'proximo',
])

// "instalar insulfilm no carro" -> ['insulf', 'insta', 'carro'] (até 4, as mais específicas primeiro).
// Palavras longas são cortadas no começo para casar com variações: "instalar" acha "instalador"; "vazando" acha "vazamento".
export function palavrasChave(texto, maximo = 4) {
  const palavras = semAcentoSimples(texto).split(/[^a-z0-9]+/).filter(w => w.length >= 4 && !PALAVRAS_QUE_NAO_AJUDAM.has(w))
  const unicas = [...new Set(palavras)].sort((a, b) => b.length - a.length).slice(0, maximo)
  return unicas.map(w => (w.length <= 5 ? w : w.slice(0, Math.max(4, w.length - 3))))
}
