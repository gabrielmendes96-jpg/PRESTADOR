import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useCategorias } from '../lib/hooks'

export default function Pedidos() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroCidade, setFiltroCidade] = useState('')
  const { categorias } = useCategorias()

  useEffect(() => {
    carregarPedidos()
  }, [filtroCategoria, filtroCidade])

  const carregarPedidos = async () => {
    setCarregando(true)
    let query = supabase
      .from('pedidos_servico')
      .select('*, categorias(nome, emoji)')
      .eq('status', 'aberto')
      .eq('pago', true)
      .gt('expira_em', new Date().toISOString())
      .order('criado_em', { ascending: false })

    if (filtroCategoria) query = query.eq('categoria_id', filtroCategoria)
    if (filtroCidade) query = query.ilike('cidade', `%${filtroCidade}%`)

    const { data } = await query
    setPedidos(data || [])
    setCarregando(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: '#1F2D24' }}>Pedidos de serviço</h1>
          <p className="text-sm" style={{ color: '#7C9485' }}>Clientes buscando profissionais agora</p>
        </div>
        {usuario && (
          <button
            onClick={() => navigate('/pedidos/novo')}
            className="px-4 py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90"
            style={{ background: '#1FA855' }}
          >
            + Postar pedido
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 mb-5 flex gap-3 flex-wrap" style={{ border: '0.5px solid #EDE3CE' }}>
        <select
          value={filtroCategoria}
          onChange={e => setFiltroCategoria(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none flex-1"
        >
          <option value="">Todas as categorias</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.nome}</option>)}
        </select>
        <input
          type="text"
          placeholder="Filtrar por cidade..."
          value={filtroCidade}
          onChange={e => setFiltroCidade(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none flex-1"
        />
      </div>

      {carregando ? (
        <p className="text-sm text-center py-8" style={{ color: '#C9BFA8' }}>Carregando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl" style={{ border: '0.5px solid #EDE3CE' }}>
          <div className="text-5xl mb-3">📋</div>
          <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>Nenhum pedido disponível</p>
          <p className="text-xs mt-1" style={{ color: '#7C9485' }}>Seja o primeiro a postar um pedido de serviço!</p>
          {usuario && (
            <button
              onClick={() => navigate('/pedidos/novo')}
              className="mt-4 px-5 py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90"
              style={{ background: '#1FA855' }}
            >
              Postar pedido
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {pedidos.map(p => (
            <div
              key={p.id}
              onClick={() => navigate(`/pedidos/${p.id}`)}
              className="bg-white rounded-2xl p-5 cursor-pointer hover:opacity-90 transition-opacity"
              style={{ border: '0.5px solid #EDE3CE' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="text-base font-semibold" style={{ color: '#1F2D24' }}>{p.titulo}</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#E3F6E9', color: '#0F6E3D' }}>
                      {p.categorias?.emoji} {p.categorias?.nome}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: '#7C9485' }}>
                    📍 {p.cidade}, {p.estado}
                    {p.prazo && ` · ⏱️ ${p.prazo}`}
                  </p>
                </div>
                {(p.orcamento_min || p.orcamento_max) && (
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-medium" style={{ color: '#1FA855' }}>
                      {p.orcamento_min && p.orcamento_max
                        ? `R$${p.orcamento_min} – R$${p.orcamento_max}`
                        : p.orcamento_max
                        ? `até R$${p.orcamento_max}`
                        : `a partir de R$${p.orcamento_min}`
                      }
                    </p>
                    <p className="text-xs" style={{ color: '#C9BFA8' }}>orçamento</p>
                  </div>
                )}
              </div>

              {p.descricao && (
                <p className="text-sm mb-3 line-clamp-2" style={{ color: '#5F6F65' }}>{p.descricao}</p>
              )}

              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: '#C9BFA8' }}>
                  Postado por {p.cliente_nome} · {new Date(p.criado_em).toLocaleDateString('pt-BR')}
                </p>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#FAF6EE', color: '#7C9485' }}>
                  Expira em {new Date(p.expira_em).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
