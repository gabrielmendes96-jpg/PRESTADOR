import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ClipboardList, MapPin, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useCategorias } from '../lib/hooks'
import { colors, spacing, type as typeScale } from '../lib/design'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

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

  const inputStyle = {
    flex: 1, padding: '10px 14px', fontSize: 14, borderRadius: 12,
    border: `1px solid ${colors.border}`, outline: 'none', background: '#fff', color: colors.text,
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl, gap: 12 }}>
        <div>
          <h1 style={{ ...typeScale.subtitle, color: colors.text, margin: 0 }}>Pedidos de serviço</h1>
          <p style={{ fontSize: 14, color: colors.textSub, margin: 0 }}>Clientes buscando profissionais agora</p>
        </div>
        {usuario && (
          <Button icon={<Plus size={16} />} onClick={() => navigate('/pedidos/novo')}>
            Postar pedido
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card padding={16} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: spacing.xl }}>
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} style={inputStyle}>
          <option value="">Todas as categorias</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <input
          type="text"
          placeholder="Filtrar por cidade..."
          value={filtroCidade}
          onChange={e => setFiltroCidade(e.target.value)}
          style={inputStyle}
        />
      </Card>

      {carregando ? (
        <p style={{ fontSize: 14, textAlign: 'center', padding: '32px 0', color: colors.textSub }}>Carregando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <Card padding={48} style={{ textAlign: 'center' }}>
          <ClipboardList size={48} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>Nenhum pedido disponível</p>
          <p style={{ fontSize: 13, color: colors.textSub, marginTop: 4 }}>Seja o primeiro a postar um pedido de serviço!</p>
          {usuario && (
            <Button onClick={() => navigate('/pedidos/novo')} style={{ margin: '16px auto 0' }}>
              Postar pedido
            </Button>
          )}
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.card }}>
          {pedidos.map(p => (
            <Card key={p.id} interactive padding={20} onClick={() => navigate(`/pedidos/${p.id}`)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.text, margin: 0 }}>{p.titulo}</h2>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: '#DCFCE7', color: colors.primaryHover }}>
                      {p.categorias?.nome}
                    </span>
                  </div>
                  <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: colors.textSub, margin: 0 }}>
                    <MapPin size={13} /> {p.cidade}, {p.estado}
                    {p.prazo && <><Clock size={13} style={{ marginLeft: 4 }} /> {p.prazo}</>}
                  </p>
                </div>
                {(p.orcamento_min || p.orcamento_max) && (
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: colors.primary, margin: 0 }}>
                      {p.orcamento_min && p.orcamento_max
                        ? `R$${p.orcamento_min} – R$${p.orcamento_max}`
                        : p.orcamento_max
                        ? `até R$${p.orcamento_max}`
                        : `a partir de R$${p.orcamento_min}`
                      }
                    </p>
                    <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>orçamento</p>
                  </div>
                )}
              </div>

              {p.descricao && (
                <p style={{ fontSize: 14, color: colors.textSub, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.descricao}</p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
                  Postado por {p.cliente_nome} · {new Date(p.criado_em).toLocaleDateString('pt-BR')}
                </p>
                <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 999, background: colors.bg, color: colors.textSub }}>
                  Expira em {new Date(p.expira_em).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
