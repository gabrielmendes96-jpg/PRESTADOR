import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export default function DetalhePedido() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [pedido, setPedido] = useState(null)
  const [candidaturas, setCandidaturas] = useState([])
  const [meuPrestador, setMeuPrestador] = useState(null)
  const [jaCandidatei, setJaCandidatei] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [form, setForm] = useState({ mensagem: '', valor_proposto: '', prazo_proposto: '' })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    carregarTudo()
  }, [id, usuario])

  const carregarTudo = async () => {
    setCarregando(true)

    const { data: p } = await supabase
      .from('pedidos_servico')
      .select('*, categorias(nome, emoji)')
      .eq('id', id)
      .single()
    setPedido(p)

    const { data: cands } = await supabase
      .from('candidaturas')
      .select('*, prestadores(id, nome, categoria_id, cidade, estado, avaliacao_media)')
      .eq('pedido_id', id)
      .order('criado_em', { ascending: false })
    setCandidaturas(cands || [])

    if (usuario) {
      const { data: prest } = await supabase
        .from('prestadores')
        .select('id, plano_id')
        .eq('user_id', usuario.id)
        .single()
      setMeuPrestador(prest || null)

      if (prest) {
        const jaExiste = (cands || []).find(c => c.prestador_id === prest.id)
        setJaCandidatei(!!jaExiste)
      }
    }

    setCarregando(false)
  }

  const candidatar = async () => {
    if (!meuPrestador) return
    if (meuPrestador.plano_id !== 'premium') {
      alert('Apenas prestadores com plano Premium podem se candidatar a pedidos. Faça upgrade do seu plano!')
      return
    }
    setEnviando(true)

    await supabase.from('candidaturas').insert({
      pedido_id: id,
      prestador_id: meuPrestador.id,
      mensagem: form.mensagem,
      valor_proposto: form.valor_proposto ? parseFloat(form.valor_proposto) : null,
      prazo_proposto: form.prazo_proposto,
    })

    setEnviando(false)
    setJaCandidatei(true)
    setShowForm(false)
    carregarTudo()
  }

  const aceitarCandidatura = async (candidaturaId, prestadorId) => {
    await supabase.from('candidaturas').update({ status: 'aceito' }).eq('id', candidaturaId)
    await supabase.from('candidaturas').update({ status: 'recusado' })
      .eq('pedido_id', id).neq('id', candidaturaId)
    await supabase.from('pedidos_servico').update({ status: 'em_andamento' }).eq('id', id)

    // Iniciar conversa com o prestador escolhido
    const { data: conv } = await supabase.from('conversas').insert({
      prestador_id: prestadorId,
      cliente_user_id: usuario.id,
      cliente_nome: pedido.cliente_nome,
    }).select().single()

    if (conv) navigate(`/chat/${conv.id}`)
  }

  if (carregando) return <p className="text-center py-16 text-sm" style={{ color: '#C9BFA8' }}>Carregando...</p>
  if (!pedido) return <p className="text-center py-16 text-sm" style={{ color: '#C9BFA8' }}>Pedido não encontrado.</p>

  const ehDono = usuario?.id === pedido.cliente_user_id

  return (
    <div className="max-w-2xl mx-auto">
      {/* Detalhes do pedido */}
      <div className="bg-white rounded-2xl p-6 mb-4" style={{ border: '0.5px solid #EDE3CE' }}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h1 className="text-xl font-semibold mb-1" style={{ color: '#1F2D24' }}>{pedido.titulo}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#E3F6E9', color: '#0F6E3D' }}>
                {pedido.categorias?.emoji} {pedido.categorias?.nome}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: pedido.status === 'aberto' ? '#E3F6E9' : '#FFF4D6', color: pedido.status === 'aberto' ? '#0F6E3D' : '#8A5A00' }}>
                {pedido.status}
              </span>
            </div>
          </div>
        </div>

        {pedido.descricao && (
          <p className="text-sm mb-4" style={{ color: '#5F6F65' }}>{pedido.descricao}</p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-xl" style={{ background: '#FAF6EE' }}>
            <p className="text-xs mb-0.5" style={{ color: '#C9BFA8' }}>Localização</p>
            <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>{pedido.cidade}, {pedido.estado}</p>
          </div>
          {(pedido.orcamento_min || pedido.orcamento_max) && (
            <div className="p-3 rounded-xl" style={{ background: '#FAF6EE' }}>
              <p className="text-xs mb-0.5" style={{ color: '#C9BFA8' }}>Orçamento</p>
              <p className="text-sm font-medium" style={{ color: '#1FA855' }}>
                {pedido.orcamento_min && pedido.orcamento_max
                  ? `R$${pedido.orcamento_min} – R$${pedido.orcamento_max}`
                  : pedido.orcamento_max ? `até R$${pedido.orcamento_max}` : `a partir de R$${pedido.orcamento_min}`
                }
              </p>
            </div>
          )}
          {pedido.prazo && (
            <div className="p-3 rounded-xl" style={{ background: '#FAF6EE' }}>
              <p className="text-xs mb-0.5" style={{ color: '#C9BFA8' }}>Prazo desejado</p>
              <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>{pedido.prazo}</p>
            </div>
          )}
          <div className="p-3 rounded-xl" style={{ background: '#FAF6EE' }}>
            <p className="text-xs mb-0.5" style={{ color: '#C9BFA8' }}>Candidaturas</p>
            <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>{candidaturas.length} prestador{candidaturas.length !== 1 ? 'es' : ''}</p>
          </div>
        </div>

        <p className="text-xs" style={{ color: '#C9BFA8' }}>
          Postado por {pedido.cliente_nome} · {new Date(pedido.criado_em).toLocaleDateString('pt-BR')}
        </p>
      </div>

      {/* Botão de candidatura (para prestadores Premium) */}
      {meuPrestador && !ehDono && pedido.status === 'aberto' && (
        <div className="mb-4">
          {jaCandidatei ? (
            <div className="p-4 rounded-xl text-center" style={{ background: '#E3F6E9' }}>
              <p className="text-sm font-medium" style={{ color: '#0F6E3D' }}>✓ Você já se candidatou a este pedido!</p>
            </div>
          ) : meuPrestador.plano_id !== 'premium' ? (
            <div className="p-4 rounded-xl" style={{ background: '#FFF4D6', border: '0.5px solid #EDE3CE' }}>
              <p className="text-sm font-medium mb-1" style={{ color: '#8A5A00' }}>⭐ Recurso exclusivo Premium</p>
              <p className="text-xs mb-3" style={{ color: '#7C9485' }}>Apenas prestadores com plano Premium podem se candidatar a pedidos de serviço.</p>
              <button onClick={() => navigate('/planos')} className="px-4 py-2 text-white text-sm rounded-lg hover:opacity-90" style={{ background: '#1FA855' }}>
                Fazer upgrade para Premium
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="w-full py-3 text-white text-sm font-medium rounded-xl hover:opacity-90"
                style={{ background: '#1FA855' }}
              >
                <i className="ti ti-hand-finger" aria-hidden="true"></i> Me candidatar a este pedido
              </button>

              {showForm && (
                <div className="mt-3 p-4 bg-white rounded-xl space-y-3" style={{ border: '0.5px solid #EDE3CE' }}>
                  <div>
                    <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Sua mensagem *</label>
                    <textarea value={form.mensagem} onChange={e => setForm({ ...form, mensagem: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none resize-none"
                      rows={3} placeholder="Apresente-se e explique por que você é o profissional ideal..." />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Seu valor (R$)</label>
                      <input type="number" value={form.valor_proposto} onChange={e => setForm({ ...form, valor_proposto: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none"
                        placeholder="0" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Prazo</label>
                      <input type="text" value={form.prazo_proposto} onChange={e => setForm({ ...form, prazo_proposto: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none"
                        placeholder="Ex: 3 dias" />
                    </div>
                  </div>
                  <button onClick={candidatar} disabled={!form.mensagem || enviando}
                    className="w-full py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-50"
                    style={{ background: '#1FA855' }}>
                    {enviando ? 'Enviando...' : 'Enviar candidatura'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lista de candidaturas (visível para o dono do pedido) */}
      {ehDono && (
        <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #EDE3CE' }}>
          <h2 className="text-base font-semibold mb-4" style={{ color: '#1F2D24' }}>
            {candidaturas.length} candidatura{candidaturas.length !== 1 ? 's' : ''} recebida{candidaturas.length !== 1 ? 's' : ''}
          </h2>

          {candidaturas.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: '#C9BFA8' }}>Nenhuma candidatura ainda. Aguarde os prestadores se candidatarem!</p>
          ) : (
            <div className="flex flex-col gap-4">
              {candidaturas.map(c => (
                <div key={c.id} className="p-4 rounded-xl" style={{ background: '#FAF6EE', border: c.status === 'aceito' ? '2px solid #1FA855' : '0.5px solid #EDE3CE' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: '#E3F6E9', color: '#0F6E3D' }}>
                        {c.prestadores?.nome?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>{c.prestadores?.nome}</p>
                        <p className="text-xs capitalize" style={{ color: '#7C9485' }}>{c.prestadores?.cidade}, {c.prestadores?.estado}</p>
                      </div>
                    </div>
                    {c.status === 'aceito' && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#E3F6E9', color: '#0F6E3D' }}>✓ Aceito</span>
                    )}
                  </div>

                  {c.mensagem && <p className="text-sm mb-2" style={{ color: '#5F6F65' }}>{c.mensagem}</p>}

                  <div className="flex items-center gap-3 mb-3">
                    {c.valor_proposto && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#E3F6E9', color: '#0F6E3D' }}>
                        R${c.valor_proposto}
                      </span>
                    )}
                    {c.prazo_proposto && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#FAF6EE', color: '#7C9485', border: '0.5px solid #EDE3CE' }}>
                        ⏱️ {c.prazo_proposto}
                      </span>
                    )}
                  </div>

                  {c.status === 'pendente' && pedido.status === 'aberto' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/profissional/${c.prestadores?.id}`)}
                        className="flex-1 py-2 text-sm rounded-lg hover:opacity-80"
                        style={{ border: '0.5px solid #EDE3CE', color: '#7C9485' }}
                      >
                        Ver perfil
                      </button>
                      <button
                        onClick={() => aceitarCandidatura(c.id, c.prestador_id)}
                        className="flex-1 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90"
                        style={{ background: '#1FA855' }}
                      >
                        ✓ Aceitar e iniciar chat
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
