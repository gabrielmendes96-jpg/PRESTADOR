import { useState, useEffect } from 'react'
import { supabase } from './supabase'

// ------------------------------------------------------------
// useCategorias — lista de categorias ordenadas por prioridade
// ------------------------------------------------------------
export function useCategorias() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('categorias')
      .select('*')
      .order('ordem', { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error('Erro ao buscar categorias:', error)
        setCategorias(data || [])
        setLoading(false)
      })
  }, [])

  return { categorias, loading }
}

// ------------------------------------------------------------
// useServicosCatalogo — serviços concretos de uma categoria
// ("Troca de chuveiro elétrico", "Pintura de parede residencial"...).
// Categoria sem catálogo devolve lista vazia — o pedido aceita texto livre.
// ------------------------------------------------------------
export function useServicosCatalogo(categoriaId) {
  const [servicos, setServicos] = useState([])
  const [loading, setLoading] = useState(!!categoriaId)

  useEffect(() => {
    if (!categoriaId) { setServicos([]); setLoading(false); return }
    let cancelado = false
    setLoading(true)
    supabase
      .from('servicos_catalogo')
      .select('id, nome')
      .eq('categoria_id', categoriaId)
      .eq('ativo', true)
      .order('nome', { ascending: true })
      .then(({ data, error }) => {
        if (cancelado) return
        if (error) console.error('Erro ao buscar serviços:', error)
        setServicos(data || [])
        setLoading(false)
      })
    return () => { cancelado = true }
  }, [categoriaId])

  return { servicos, loading }
}

// ------------------------------------------------------------
// usePrestadorServicos — serviços que um prestador marcou que faz
// ------------------------------------------------------------
export function usePrestadorServicos(prestadorId) {
  const [servicos, setServicos] = useState([])
  const [loading, setLoading] = useState(!!prestadorId)

  useEffect(() => {
    if (!prestadorId) { setServicos([]); setLoading(false); return }
    let cancelado = false
    supabase
      .from('prestador_servicos')
      .select('servico_id, servicos_catalogo(id, nome, categoria_id)')
      .eq('prestador_id', prestadorId)
      .then(({ data }) => {
        if (cancelado) return
        setServicos((data || []).map(r => r.servicos_catalogo).filter(Boolean).sort((a, b) => a.nome.localeCompare(b.nome)))
        setLoading(false)
      })
    return () => { cancelado = true }
  }, [prestadorId])

  return { servicos, loading }
}

// ------------------------------------------------------------
// useTopicos — tópicos amplos + suas categorias relacionadas
// ------------------------------------------------------------
export function useTopicos() {
  const [topicos, setTopicos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      const { data: topicosData, error: e1 } = await supabase.from('topicos').select('*')
      const { data: relacoes, error: e2 } = await supabase.from('topico_categorias').select('*')

      if (e1 || e2) {
        console.error('Erro ao buscar tópicos:', e1 || e2)
        setLoading(false)
        return
      }

      const comCategorias = (topicosData || []).map(t => ({
        ...t,
        categorias: relacoes.filter(r => r.topico_id === t.id).map(r => r.categoria_id),
      }))

      setTopicos(comCategorias)
      setLoading(false)
    }
    carregar()
  }, [])

  return { topicos, loading }
}

// ------------------------------------------------------------
// useDebounce — só repassa o valor depois que ele parou de mudar por
// `atrasoMs`. Evita disparar uma busca (3-4 consultas) a cada tecla.
// ------------------------------------------------------------
export function useDebounce(valor, atrasoMs = 350) {
  const [valorEstavel, setValorEstavel] = useState(valor)

  useEffect(() => {
    const t = setTimeout(() => setValorEstavel(valor), atrasoMs)
    return () => clearTimeout(t)
  }, [valor, atrasoMs])

  return valorEstavel
}

// Ordem aplicada no servidor (antes a lista inteira vinha do banco sem
// critério e era ordenada no navegador). Cada item é [coluna, crescente].
// "relevancia" entrega o que os planos prometem: boost ativo > plano >
// nota > agilidade (colunas da view, ver supabase/32_busca_ranking_boost_plano.sql).
const ORDENACOES = {
  relevancia: [['boost_ativo', false], ['plano_rank', false], ['avaliacao_media', false], ['pontos_resposta', false]],
  nota: [['avaliacao_media', false], ['total_avaliacoes', false]],
  recente: [['criado_em', false]],
  agilidade: [['pontos_resposta', false], ['avaliacao_media', false]],
}

// O texto da busca entra num filtro .or() do PostgREST, onde vírgula e
// parênteses são sintaxe — "Silva, João" quebrava a consulta inteira (e
// a tela mostrava "nenhum resultado"). % e _ também são curingas do ilike.
const limparBusca = (texto) => String(texto || '').replace(/[,()*\\"%_]/g, ' ').replace(/\s+/g, ' ').trim()

// ------------------------------------------------------------
// buscarPrestadores — consulta da busca (usada pelo hook usePrestadores
// logo abaixo, e testável sozinha)
// filtros: { busca, categoria, categorias (array), nota, disponivel,
//            plano, ordenar, limite }
// `limite` ativa a paginação: traz só esse tanto e informa em `temMais`
// se há mais (sem ele, traz todos — usado pela Home).
// ------------------------------------------------------------
export async function buscarPrestadores(filtros = {}, foiCancelado = () => false) {
  let query = supabase.from('prestadores_completo').select('*')

  // CRÍTICO: apenas prestadores com plano ativo aparecem
  query = query.eq('plano_status', 'ativo')

  if (filtros.categoria) {
    query = query.eq('categoria_id', filtros.categoria)
  }
  if (filtros.categorias && filtros.categorias.length > 0) {
    query = query.in('categoria_id', filtros.categorias)
  }
  if (filtros.disponivel) {
    query = query.eq('disponivel', true)
  }
  if (filtros.nota) {
    query = query.gte('avaliacao_media', filtros.nota)
  }
  if (filtros.plano) {
    query = query.eq('plano_id', filtros.plano)
  }

  const busca = limparBusca(filtros.busca)
  if (busca) {
    // Busca por nome, cidade, hashtag OU nome da profissão/categoria —
    // assim "instalador de acessórios" encontra quem está nessa
    // categoria, mesmo sem ter cadastrado essa hashtag.
    const [{ data: porTag }, { data: porCategoria }, { data: porServico }] = await Promise.all([
      supabase.from('servicos_prestador').select('prestador_id').ilike('tag', `%${busca.toLowerCase()}%`),
      supabase.from('categorias').select('id').ilike('nome', `%${busca}%`),
      // Serviços do catálogo que o prestador marcou ("troca de chuveiro").
      supabase.from('prestador_servicos').select('prestador_id, servicos_catalogo!inner(nome)').ilike('servicos_catalogo.nome', `%${busca}%`),
    ])

    const idsPorTag = [...new Set([...(porTag || []), ...(porServico || [])].map(t => t.prestador_id))]
    const idsPorCategoria = (porCategoria || []).map(c => c.id)

    const condicoes = [`nome.ilike.%${busca}%`, `cidade.ilike.%${busca}%`]
    if (idsPorTag.length > 0) condicoes.push(`id.in.(${idsPorTag.join(',')})`)
    if (idsPorCategoria.length > 0) condicoes.push(`categoria_id.in.(${idsPorCategoria.join(',')})`)

    query = query.or(condicoes.join(','))
  }

  // Ordem no servidor. "distancia" depende da localização do visitante,
  // que o banco não tem — ordena por relevância aqui e a tela reordena
  // por distância dentro do conjunto trazido.
  const ordem = (ORDENACOES[filtros.ordenar] || ORDENACOES.relevancia)
    .filter(([coluna]) => !(filtros.semRanking && (coluna === 'boost_ativo' || coluna === 'plano_rank')))
  for (const [coluna, crescente] of ordem) {
    query = query.order(coluna, { ascending: crescente, nullsFirst: false })
  }
  query = query.order('id')

  // Pede um a mais que o limite só pra saber se existe próxima página.
  if (filtros.limite) query = query.limit(filtros.limite + 1)

  const { data: linhas, error } = await query
  if (foiCancelado()) return null

  if (error) {
    // A view ainda não tem as colunas de ranking (supabase/32 não foi
    // rodada neste banco): refaz sem elas em vez de mostrar "nenhum
    // resultado" — assim a ordem de deploy entre código e SQL não importa.
    if (!filtros.semRanking && /boost_ativo|plano_rank/.test(error.message || '')) {
      return buscarPrestadores({ ...filtros, semRanking: true }, foiCancelado)
    }
    console.error('Erro ao buscar prestadores:', error)
    return { prestadores: [], temMais: false }
  }

  const temMais = !!filtros.limite && (linhas || []).length > filtros.limite
  const data = temMais ? linhas.slice(0, filtros.limite) : (linhas || [])

  // Buscar fotos de cada prestador
  const ids = data.map(p => p.id)
  let fotosPorPrestador = {}
  if (ids.length > 0) {
    const { data: fotos } = await supabase
      .from('portfolio_prestador')
      .select('*')
      .in('prestador_id', ids)
      .order('ordem', { ascending: true })

    fotosPorPrestador = (fotos || []).reduce((acc, f) => {
      acc[f.prestador_id] = acc[f.prestador_id] || []
      acc[f.prestador_id].push(f.url)
      return acc
    }, {})
  }
  if (foiCancelado()) return null

  const prestadores = data.map(p => ({
    ...p,
    fotos: fotosPorPrestador[p.id] || [],
    avaliacao: p.avaliacao_media,
    totalAvaliacoes: p.total_avaliacoes,
    totalServicos: p.total_servicos,
    tempoResposta: p.tempo_resposta,
    pontosResposta: p.pontos_resposta,
    raioAtendimento: p.raio_atendimento,
    plano: p.plano_id,
    categoria: p.categoria_id,
    avaliacaoDetalhada: {
      pontualidade: p.media_pontualidade,
      qualidade: p.media_qualidade,
      preco: p.media_preco,
      limpeza: p.media_limpeza,
      comunicacao: p.media_comunicacao,
    },
  }))

  return { prestadores, temMais }
}

export function usePrestadores(filtros = {}) {
  const [prestadores, setPrestadores] = useState([])
  const [temMais, setTemMais] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Filtros mudam rápido (digitação, cliques em chips) — sem essa
    // checagem, a resposta de uma busca antiga podia chegar depois da
    // mais nova e sobrescrever o resultado certo com um desatualizado.
    let cancelado = false
    setLoading(true)

    buscarPrestadores(filtros, () => cancelado).then((resultado) => {
      if (cancelado || !resultado) return
      setPrestadores(resultado.prestadores)
      setTemMais(resultado.temMais)
      setLoading(false)
    })

    return () => { cancelado = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filtros)])

  return { prestadores, loading, temMais }
}

// ------------------------------------------------------------
// usePrestador — um único prestador, com fotos e avaliações
// ------------------------------------------------------------
export function usePrestador(id) {
  const [prestador, setPrestador] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    // Se o usuário navegar de um perfil pra outro rápido, a resposta do
    // perfil anterior pode chegar depois — sem essa checagem, ela
    // sobrescreveria os dados do perfil certo com os do perfil errado.
    let cancelado = false

    async function carregar() {
      setLoading(true)

      const { data: p, error } = await supabase
        .from('prestadores_completo')
        .select('*')
        .eq('id', id)
        .single()

      if (cancelado) return
      if (error) {
        console.error('Erro ao buscar prestador:', error)
        setPrestador(null)
        setLoading(false)
        return
      }

      const { data: fotos } = await supabase
        .from('portfolio_prestador')
        .select('*')
        .eq('prestador_id', id)
        .order('ordem', { ascending: true })

      const { data: avaliacoes } = await supabase
        .from('avaliacoes')
        .select('*, midias_avaliacao(*)')
        .eq('prestador_id', id)
        .order('criado_em', { ascending: false })

      if (cancelado) return
      setPrestador({
        ...p,
        fotos: (fotos || []).map(f => ({ url: f.url, tipo: f.tipo })),
        avaliacao: p.avaliacao_media,
        totalAvaliacoes: p.total_avaliacoes,
        totalServicos: p.total_servicos,
        tempoResposta: p.tempo_resposta,
        pontosResposta: p.pontos_resposta,
        raioAtendimento: p.raio_atendimento,
        plano: p.plano_id,
        categoria: p.categoria_id,
        avaliacaoDetalhada: {
          pontualidade: p.media_pontualidade,
          qualidade: p.media_qualidade,
          preco: p.media_preco,
          limpeza: p.media_limpeza,
          comunicacao: p.media_comunicacao,
        },
        avaliacoes: (avaliacoes || []).map(a => ({
          autor: a.autor_nome,
          iniciais: a.autor_nome.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(),
          nota: a.nota,
          texto: a.comentario,
          data: new Date(a.criado_em).toLocaleDateString('pt-BR'),
          midias: (a.midias_avaliacao || []),
          notas: {
            qualidade: a.qualidade,
            preco: a.preco,
            limpeza: a.limpeza,
            comunicacao: a.comunicacao,
            pontualidade: a.pontualidade,
          }
        })),
      })
      setLoading(false)
    }
    carregar()
    return () => { cancelado = true }
  }, [id])

  return { prestador, loading }
}

// ------------------------------------------------------------
// usePrestadoresPorIds — busca vários prestadores específicos
// (usado na ferramenta de comparação)
// ------------------------------------------------------------
export function usePrestadoresPorIds(ids = []) {
  const [prestadores, setPrestadores] = useState([])
  const [loading, setLoading] = useState(true)
  const chave = JSON.stringify(ids)

  useEffect(() => {
    if (!ids || ids.length === 0) {
      setPrestadores([])
      setLoading(false)
      return
    }

    let cancelado = false

    async function carregar() {
      setLoading(true)
      const { data, error } = await supabase
        .from('prestadores_completo')
        .select('*')
        .in('id', ids)

      if (cancelado) return
      if (error) {
        console.error('Erro ao buscar prestadores para comparação:', error)
        setPrestadores([])
        setLoading(false)
        return
      }

      const completos = (data || []).map(p => ({
        ...p,
        avaliacao: p.avaliacao_media,
        totalAvaliacoes: p.total_avaliacoes,
        totalServicos: p.total_servicos,
        tempoResposta: p.tempo_resposta,
        pontosResposta: p.pontos_resposta,
        raioAtendimento: p.raio_atendimento,
        plano: p.plano_id,
        categoria: p.categoria_id,
        avaliacaoDetalhada: {
          pontualidade: p.media_pontualidade,
          qualidade: p.media_qualidade,
          preco: p.media_preco,
          limpeza: p.media_limpeza,
          comunicacao: p.media_comunicacao,
        },
      }))

      // preserva a ordem em que os ids foram selecionados
      const porId = Object.fromEntries(completos.map(p => [p.id, p]))
      setPrestadores(ids.map(id => porId[id]).filter(Boolean))
      setLoading(false)
    }
    carregar()
    return () => { cancelado = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave])

  return { prestadores, loading }
}

// ------------------------------------------------------------
// criarAvaliacao — publica uma nova avaliação para um prestador
// ------------------------------------------------------------
export async function criarAvaliacao({ prestadorId, autorNome, nota, pontualidade, qualidade, preco, limpeza, comentario }) {
  const { data: userData } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('avaliacoes')
    .insert({
      prestador_id: prestadorId,
      autor_user_id: userData?.user?.id || null,
      autor_nome: autorNome,
      nota,
      pontualidade,
      qualidade,
      preco,
      limpeza,
      comentario,
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar avaliação:', error)
    throw error
  }
  return data
}

// ------------------------------------------------------------
// usePlanos — lista de planos de assinatura
// ------------------------------------------------------------
export function usePlanos() {
  const [planos, setPlanos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('planos')
      .select('*')
      .order('preco', { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error('Erro ao buscar planos:', error)
        setPlanos((data || []).map(p => ({ ...p, recursos: p.recursos || [] })))
        setLoading(false)
      })
  }, [])

  return { planos, loading }
}

// ------------------------------------------------------------
// useMensagensNaoLidas — total de mensagens não lidas do usuário
// logado (soma nao_lidas_prestador ou nao_lidas_cliente conforme o
// papel), com atualização em tempo real quando conversas muda.
// ------------------------------------------------------------
export function useMensagensNaoLidas(usuario) {
  const [naoLidas, setNaoLidas] = useState(0)

  useEffect(() => {
    if (!usuario) { setNaoLidas(0); return }

    const buscar = async () => {
      const { data: prest } = await supabase.from('prestadores').select('id').eq('user_id', usuario.id).maybeSingle()
      if (prest) {
        const { data } = await supabase.from('conversas').select('nao_lidas_prestador').eq('prestador_id', prest.id)
        setNaoLidas((data || []).reduce((a, c) => a + (c.nao_lidas_prestador || 0), 0))
      } else {
        const { data } = await supabase.from('conversas').select('nao_lidas_cliente').eq('cliente_user_id', usuario.id)
        setNaoLidas((data || []).reduce((a, c) => a + (c.nao_lidas_cliente || 0), 0))
      }
    }
    buscar()

    // Nome único por montagem — Navbar e BottomNav usam este hook ao mesmo
    // tempo, e o Supabase quebra se dois channels tiverem o mesmo nome.
    const channel = supabase
      .channel(`nao_lidas_${usuario.id}_${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversas' }, buscar)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [usuario])

  return naoLidas
}

// ------------------------------------------------------------
// useCodigoIndicacao — código de indicação do usuário logado,
// criando um novo se ainda não existir. Compartilhado entre a página
// de indicação e o banner de divulgação no painel do prestador.
// ------------------------------------------------------------
export function useCodigoIndicacao(usuario) {
  const [codigo, setCodigo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario) { setLoading(false); return }

    async function carregar() {
      setLoading(true)
      let { data: cod } = await supabase
        .from('codigos_indicacao')
        .select('*')
        .eq('user_id', usuario.id)
        .single()

      if (!cod) {
        const novoCodigo = (usuario.user_metadata?.nome || usuario.email?.split('@')[0] || 'user')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .slice(0, 8) + Math.random().toString(36).slice(2, 5).toUpperCase()

        const { data } = await supabase
          .from('codigos_indicacao')
          .insert({ user_id: usuario.id, codigo: novoCodigo, tipo: 'prestador' })
          .select()
          .single()
        cod = data
      }

      setCodigo(cod)
      setLoading(false)
    }
    carregar()
  }, [usuario])

  return { codigo, loading }
}
