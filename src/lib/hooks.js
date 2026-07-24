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
// usePrestadores — lista de prestadores com filtros opcionais
// filtros: { busca, categoria, categorias (array), nota, disponivel }
// ------------------------------------------------------------
export function usePrestadores(filtros = {}) {
  const [prestadores, setPrestadores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      setLoading(true)
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
      if (filtros.busca) {
        // busca por nome, cidade ou hashtag
        // Primeiro busca prestadores por hashtag
        const buscaLower = filtros.busca.toLowerCase()
        const { data: porTag } = await supabase
          .from('servicos_prestador')
          .select('prestador_id')
          .ilike('tag', `%${buscaLower}%`)

        const idsPorTag = (porTag || []).map(t => t.prestador_id)

        if (idsPorTag.length > 0) {
          query = query.or(`nome.ilike.%${filtros.busca}%,cidade.ilike.%${filtros.busca}%,id.in.(${idsPorTag.join(',')})`)
        } else {
          query = query.or(`nome.ilike.%${filtros.busca}%,cidade.ilike.%${filtros.busca}%`)
        }
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar prestadores:', error)
        setPrestadores([])
        setLoading(false)
        return
      }

      // Buscar fotos de cada prestador
      const ids = (data || []).map(p => p.id)
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

      const completos = (data || []).map(p => ({
        ...p,
        fotos: fotosPorPrestador[p.id] || [],
        avaliacao: p.avaliacao_media,
        totalAvaliacoes: p.total_avaliacoes,
        totalServicos: p.total_servicos,
        tempoResposta: p.tempo_resposta,
        raioAtendimento: p.raio_atendimento,
        plano: p.plano_id,
        categoria: p.categoria_id,
        avaliacaoDetalhada: {
          pontualidade: p.media_pontualidade,
          qualidade: p.media_qualidade,
          preco: p.media_preco,
          limpeza: p.media_limpeza,
        },
      }))

      setPrestadores(completos)
      setLoading(false)
    }
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filtros)])

  return { prestadores, loading }
}

// ------------------------------------------------------------
// usePrestador — um único prestador, com fotos e avaliações
// ------------------------------------------------------------
export function usePrestador(id) {
  const [prestador, setPrestador] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    async function carregar() {
      setLoading(true)

      const { data: p, error } = await supabase
        .from('prestadores_completo')
        .select('*')
        .eq('id', id)
        .single()

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

      setPrestador({
        ...p,
        fotos: (fotos || []).map(f => f.url),
        avaliacao: p.avaliacao_media,
        totalAvaliacoes: p.total_avaliacoes,
        totalServicos: p.total_servicos,
        tempoResposta: p.tempo_resposta,
        raioAtendimento: p.raio_atendimento,
        plano: p.plano_id,
        categoria: p.categoria_id,
        avaliacaoDetalhada: {
          pontualidade: p.media_pontualidade,
          qualidade: p.media_qualidade,
          preco: p.media_preco,
          limpeza: p.media_limpeza,
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
            preco_avaliacao: a.preco_avaliacao,
            tempo_servico: a.tempo_servico,
            higiene: a.higiene,
            comunicacao: a.comunicacao,
            pontualidade: a.pontualidade,
          }
        })),
      })
      setLoading(false)
    }
    carregar()
  }, [id])

  return { prestador, loading }
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
