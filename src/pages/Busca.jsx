import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCategorias, useTopicos, usePrestadores } from '../lib/hooks'
import CardPrestador from '../components/CardPrestador'
import FiltrosAvancados from '../components/FiltrosAvancados'
import { recuperarLocalizacao, calcularDistancia } from '../lib/gps'

export default function Busca() {
  const [params] = useSearchParams()
  const topicoInicial = params.get('topico') || ''
  const [filtro, setFiltro] = useState({
    busca: params.get('q') || '',
    categoria: params.get('categoria') || '',
    topico: topicoInicial,
    nota: '',
    disponivel: false,
  })
  const [showFiltros, setShowFiltros] = useState(false)
  const [ordenacao, setOrdenacao] = useState('relevancia')
  const [filtrosAvancados, setFiltrosAvancados] = useState({
    notaMinima: 0, distanciaMax: 50, plano: '', disponivel: false, temFoto: false
  })

  const userLoc = recuperarLocalizacao()
  const { topicos } = useTopicos()

  const categoriasDoTopico = useMemo(() => {
    if (!filtro.topico) return null
    const top = topicos.find(t => t.id === filtro.topico)
    return top ? top.categorias : null
  }, [filtro.topico, topicos])

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
  }, [resultadosBrutos, ordenacao, filtrosAvancados.temFoto, userLoc])

  const temFiltrosAtivos = filtrosAvancados.notaMinima > 0 || filtrosAvancados.plano || filtrosAvancados.disponivel || filtrosAvancados.temFoto
  const topicoAtual = topicos.find(t => t.id === filtro.topico)

  return (
    <div>
      {showFiltros && (
        <FiltrosAvancados
          onAplicar={setFiltrosAvancados}
          onFechar={() => setShowFiltros(false)}
        />
      )}

      {/* Barra de busca */}
      <div className="bg-white rounded-2xl p-4 mb-4" style={{ border: '0.5px solid #DDE3DD' }}>
        <div className="flex gap-2 mb-3">
          <input
            type="search"
            placeholder="Buscar profissional..."
            value={filtro.busca}
            onChange={e => setFiltro({ ...filtro, busca: e.target.value })}
            className="flex-1 px-3 py-2.5 text-sm rounded-xl border focus:outline-none"
            style={{ borderColor: '#DDE3DD' }}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
          {[
            { id: '', label: 'Todos' },
            { id: 'construcao', label: '🏗️ Construção' },
            { id: 'eletrica', label: '⚡ Elétrica' },
            { id: 'hidraulica', label: '🚿 Hidráulica' },
            { id: 'beleza', label: '💄 Beleza' },
            { id: 'saude', label: '❤️ Saúde' },
            { id: 'automotivo', label: '🚗 Automotivo' },
            { id: 'tecnologia', label: '💻 Tecnologia' },
            { id: 'educacao', label: '📚 Educação' },
            { id: 'alimentacao', label: '🍳 Alimentação' },
            { id: 'eventos', label: '🎉 Eventos' },
          ].map(t => (
            <button key={t.id} onClick={() => setFiltro({ ...filtro, topico: t.id })}
              className="px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex-shrink-0"
              style={filtro.topico === t.id
                ? { background: '#1FA855', color: '#fff' }
                : { background: '#F0F2F0', color: '#5F6F65' }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button onClick={() => setShowFiltros(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
              style={temFiltrosAtivos
                ? { background: '#E3F6E9', color: '#0F6E3D', border: '1px solid #1FA855' }
                : { background: '#F0F2F0', color: '#5F6F65' }}>
              <i className="ti ti-adjustments-horizontal" style={{ fontSize: 14 }} aria-hidden="true"></i>
              Filtros {temFiltrosAtivos && '●'}
            </button>

            <select value={ordenacao} onChange={e => setOrdenacao(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border focus:outline-none"
              style={{ borderColor: '#DDE3DD', color: '#5F6F65', background: '#F0F2F0' }}>
              <option value="relevancia">Relevância</option>
              <option value="nota">Melhor nota</option>
              <option value="distancia">Mais próximo</option>
              <option value="recente">Mais recente</option>
            </select>
          </div>

          <p className="text-xs" style={{ color: '#C9BFA8' }}>
            {loading ? 'buscando...' : `${resultados.length} profissional${resultados.length !== 1 ? 'is' : ''}`}
          </p>
        </div>
      </div>

      {topicoAtual && (
        <p className="text-sm mb-3" style={{ color: '#7C9485' }}>
          Em <strong style={{ color: '#1F2D24' }}>{topicoAtual.nome}</strong>
        </p>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 flex items-center gap-3 animate-pulse"
              style={{ border: '0.5px solid #DDE3DD' }}>
              <div className="w-12 h-12 rounded-full flex-shrink-0" style={{ background: '#E8EAE8' }}></div>
              <div className="flex-1">
                <div className="h-3 rounded mb-2" style={{ background: '#E8EAE8', width: '60%' }}></div>
                <div className="h-2.5 rounded" style={{ background: '#E8EAE8', width: '40%' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : resultados.length === 0 ? (
        <div className="text-center py-16">
          <div style={{ fontSize: 48 }}>🔍</div>
          <p className="text-base font-medium mt-3 mb-1" style={{ color: '#1F2D24' }}>Nenhum profissional encontrado</p>
          <p className="text-sm" style={{ color: '#7C9485' }}>Tente outros termos ou remova os filtros</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {resultados.map(p => (
            <CardPrestador key={p.id} prestador={p} horizontal distancia={p.distanciaReal} />
          ))}
        </div>
      )}
    </div>
  )
}
