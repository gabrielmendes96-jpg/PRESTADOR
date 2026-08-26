import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, Star, MapPin, Zap, Crown, SearchX, ChevronDown } from 'lucide-react'
import { useCategorias, useTopicos, usePrestadores } from '../lib/hooks'
import CardPrestador from '../components/CardPrestador'
import CardSkeleton from '../components/CardSkeleton'
import FiltrosAvancados from '../components/FiltrosAvancados'
import BarraComparacao from '../components/BarraComparacao'
import SearchBar from '../components/ui/SearchBar'
import Chip from '../components/ui/Chip'
import Card from '../components/ui/Card'
import { colors, spacing } from '../lib/design'
import { getCategoriaIcone } from '../lib/categoriaIcones'
import { recuperarLocalizacao, calcularDistancia } from '../lib/gps'

const DISTANCIAS = [10, 25, 50, 100]
const NOTAS = [0, 3, 4, 4.5]

export default function Busca() {
  const [params] = useSearchParams()
  const topicoInicial = params.get('topico') || ''
  const [filtro, setFiltro] = useState({
    busca: params.get('q') || '',
    categoria: params.get('categoria') || '',
    topico: topicoInicial,
    nota: '',
    disponivel: false,
    distanciaMax: null, // filtro rápido de distância (chip), independente do slider do modal
  })
  const [showFiltros, setShowFiltros] = useState(false)
  const [openPopover, setOpenPopover] = useState(null) // 'distancia' | 'avaliacao' | null
  const [ordenacao, setOrdenacao] = useState('relevancia')
  const [filtrosAvancados, setFiltrosAvancados] = useState({
    notaMinima: 0, distanciaMax: 50, plano: '', disponivel: false, temFoto: false
  })

  const userLoc = recuperarLocalizacao()
  const { categorias } = useCategorias()
  const { topicos } = useTopicos()

  const categoriasDoTopico = useMemo(() => {
    if (!filtro.topico) return null
    const top = topicos.find(t => t.id === filtro.topico)
    return top ? top.categorias : null
  }, [filtro.topico, topicos])

  const categoriasExibidas = useMemo(() => {
    if (!categoriasDoTopico) return categorias
    return categorias.filter(c => categoriasDoTopico.includes(c.id))
  }, [categorias, categoriasDoTopico])

  const { prestadores: resultadosBrutos, loading } = usePrestadores({
    busca: filtro.busca,
    categoria: filtro.categoria,
    categorias: categoriasDoTopico,
    nota: filtro.nota || filtrosAvancados.notaMinima,
    disponivel: filtro.disponivel || filtrosAvancados.disponivel,
    plano: filtrosAvancados.plano,
  })

  const resultados = useMemo(() => {
    let lista = resultadosBrutos.map(p => ({
      ...p,
      distanciaReal: userLoc && p.latitude && p.longitude
        ? calcularDistancia(userLoc.lat, userLoc.lng, p.latitude, p.longitude)
        : null
    }))

    if (filtrosAvancados.temFoto) {
      lista = lista.filter(p => p.foto_perfil || (p.fotos && p.fotos.length > 0))
    }
    if (filtro.distanciaMax && userLoc) {
      lista = lista.filter(p => p.distanciaReal === null || p.distanciaReal <= filtro.distanciaMax)
    }

    switch (ordenacao) {
      case 'nota': return [...lista].sort((a, b) => (b.avaliacao || 0) - (a.avaliacao || 0))
      case 'distancia': return [...lista].sort((a, b) => {
        if (!a.distanciaReal) return 1
        if (!b.distanciaReal) return -1
        return a.distanciaReal - b.distanciaReal
      })
      case 'recente': return [...lista].sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
      default: return lista
    }
  }, [resultadosBrutos, ordenacao, filtrosAvancados.temFoto, filtro.distanciaMax, userLoc])

  const temFiltrosAtivos = filtrosAvancados.notaMinima > 0 || filtrosAvancados.plano || filtrosAvancados.disponivel || filtrosAvancados.temFoto
  const topicoAtual = topicos.find(t => t.id === filtro.topico)

  const togglePopover = (nome) => setOpenPopover(prev => (prev === nome ? null : nome))

  return (
    <div>
      {showFiltros && (
        <FiltrosAvancados
          onAplicar={setFiltrosAvancados}
          onFechar={() => setShowFiltros(false)}
        />
      )}

      <div className="lg:flex lg:gap-8 lg:items-start lg:max-w-6xl lg:mx-auto">
        {/* Sidebar de filtros (vira coluna fixa a partir de lg) */}
        <aside className="lg:w-72 lg:flex-shrink-0 lg:sticky" style={{ top: 84 }}>
          <div style={{ marginBottom: spacing.card }}>
            <SearchBar
              value={filtro.busca}
              onChange={e => setFiltro({ ...filtro, busca: e.target.value })}
              placeholder="Buscar profissional..."
              showButton={false}
            />
          </div>

          {/* Tópicos (grupos amplos) */}
          <div className="lg:flex-wrap lg:overflow-visible" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 10, scrollbarWidth: 'none' }}>
            <Chip active={!filtro.topico} onClick={() => setFiltro({ ...filtro, topico: '', categoria: '' })}>
              Todos os grupos
            </Chip>
            {topicos.map(top => (
              <Chip
                key={top.id}
                active={filtro.topico === top.id}
                onClick={() => setFiltro({ ...filtro, topico: filtro.topico === top.id ? '' : top.id, categoria: '' })}
              >
                {top.nome}
              </Chip>
            ))}
          </div>

          {/* Categorias (dentro do tópico escolhido, ou todas) */}
          <div className="lg:flex-wrap lg:overflow-visible" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 12, scrollbarWidth: 'none' }}>
            <Chip active={!filtro.categoria} onClick={() => setFiltro({ ...filtro, categoria: '' })}>
              Todos
            </Chip>
            {categoriasExibidas.map(cat => {
              const { icon: Icon } = getCategoriaIcone(cat)
              return (
                <Chip
                  key={cat.id}
                  active={filtro.categoria === cat.id}
                  onClick={() => setFiltro({ ...filtro, categoria: filtro.categoria === cat.id ? '' : cat.id })}
                  icon={<Icon size={13} />}
                >
                  {cat.nome}
                </Chip>
              )
            })}
          </div>

          {/* Filtros rápidos */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: spacing.card, position: 'relative' }}>
            <Chip
              active={filtrosAvancados.disponivel}
              onClick={() => setFiltrosAvancados({ ...filtrosAvancados, disponivel: !filtrosAvancados.disponivel })}
              icon={<Zap size={13} />}
            >
              Disponível hoje
            </Chip>

            <Chip
              active={filtrosAvancados.plano === 'premium'}
              onClick={() => setFiltrosAvancados({ ...filtrosAvancados, plano: filtrosAvancados.plano === 'premium' ? '' : 'premium' })}
              icon={<Crown size={13} />}
            >
              Premium
            </Chip>

            <div style={{ position: 'relative' }}>
              <Chip active={!!filtro.distanciaMax} onClick={() => togglePopover('distancia')} icon={<MapPin size={13} />}>
                Distância <ChevronDown size={13} />
              </Chip>
              {openPopover === 'distancia' && (
                <Card padding={12} style={{ position: 'absolute', top: 44, left: 0, zIndex: 20, width: 180 }}>
                  <button
                    onClick={() => { setFiltro({ ...filtro, distanciaMax: null }); setOpenPopover(null) }}
                    className="btn-press"
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 10,
                      background: !filtro.distanciaMax ? colors.primary : 'transparent',
                      color: !filtro.distanciaMax ? '#fff' : colors.text,
                      fontSize: 13, fontWeight: 600, border: 'none',
                    }}
                  >
                    Qualquer distância
                  </button>
                  {DISTANCIAS.map(km => (
                    <button
                      key={km}
                      onClick={() => { setFiltro({ ...filtro, distanciaMax: km }); setOpenPopover(null) }}
                      className="btn-press"
                      style={{
                        display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 10,
                        background: filtro.distanciaMax === km ? colors.primary : 'transparent',
                        color: filtro.distanciaMax === km ? '#fff' : colors.text,
                        fontSize: 13, fontWeight: 600, border: 'none',
                      }}
                    >
                      Até {km} km
                    </button>
                  ))}
                </Card>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <Chip active={filtrosAvancados.notaMinima > 0} onClick={() => togglePopover('avaliacao')} icon={<Star size={13} />}>
                Avaliação <ChevronDown size={13} />
              </Chip>
              {openPopover === 'avaliacao' && (
                <Card padding={12} style={{ position: 'absolute', top: 44, left: 0, zIndex: 20, width: 160 }}>
                  {NOTAS.map(n => (
                    <button
                      key={n}
                      onClick={() => { setFiltrosAvancados({ ...filtrosAvancados, notaMinima: n }); setOpenPopover(null) }}
                      className="btn-press"
                      style={{
                        display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 10,
                        background: filtrosAvancados.notaMinima === n ? colors.primary : 'transparent',
                        color: filtrosAvancados.notaMinima === n ? '#fff' : colors.text,
                        fontSize: 13, fontWeight: 600, border: 'none',
                      }}
                    >
                      {n === 0 ? 'Qualquer nota' : `${n}+ estrelas`}
                    </button>
                  ))}
                </Card>
              )}
            </div>

            <Chip active={showFiltros || temFiltrosAtivos} onClick={() => setShowFiltros(true)} icon={<SlidersHorizontal size={13} />}>
              Mais filtros
            </Chip>
          </div>

          <select
            value={ordenacao}
            onChange={e => setOrdenacao(e.target.value)}
            className="lg:w-full"
            style={{ padding: '8px 12px', fontSize: 13, borderRadius: 10, border: `1px solid ${colors.border}`, color: colors.textSub, background: '#fff' }}
          >
            <option value="relevancia">Relevância</option>
            <option value="nota">Melhor nota</option>
            <option value="distancia">Mais próximo</option>
            <option value="recente">Mais recente</option>
          </select>
        </aside>

        {/* Resultados */}
        <div className="lg:flex-1" style={{ minWidth: 0 }}>
          <BarraComparacao style={{ marginBottom: spacing.card }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.card }}>
            {topicoAtual ? (
              <p style={{ fontSize: 14, color: colors.textSub }}>
                Em <strong style={{ color: colors.text }}>{topicoAtual.nome}</strong>
              </p>
            ) : <span />}
            <p style={{ fontSize: 13, color: colors.textSub }}>
              {loading ? 'buscando...' : `${resultados.length} ${resultados.length !== 1 ? 'profissionais' : 'profissional'}`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {[1, 2, 3, 4].map(i => <CardSkeleton key={i} modo="lista" />)}
            </div>
          ) : resultados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <SearchX size={44} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: colors.text, marginBottom: 4 }}>Nenhum profissional encontrado</p>
              <p style={{ fontSize: 14, color: colors.textSub }}>Tente outros termos ou remova os filtros</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {resultados.map(p => (
                <CardPrestador key={p.id} prestador={p} layout="horizontal" distancia={p.distanciaReal} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
