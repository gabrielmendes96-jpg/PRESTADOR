import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export default function Conversas() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [conversas, setConversas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [prestadorId, setPrestadorId] = useState(null)

  useEffect(() => {
    if (!usuario) { navigate('/login'); return }
    carregarConversas()
  }, [usuario])

  // Realtime — atualiza lista quando chega nova mensagem
  useEffect(() => {
    if (!usuario) return
    const channel = supabase
      .channel('conversas_lista')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversas',
      }, () => {
        carregarConversas()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [usuario])

  const carregarConversas = async () => {
    // Verificar se é prestador
    const { data: prest } = await supabase
      .from('prestadores')
      .select('id')
      .eq('user_id', usuario.id)
      .single()

    setPrestadorId(prest?.id || null)

    let query
    if (prest) {
      query = supabase
        .from('conversas')
        .select('*')
        .eq('prestador_id', prest.id)
        .order('ultima_mensagem_em', { ascending: false })
    } else {
      query = supabase
        .from('conversas')
        .select('*, prestadores(id, nome, categoria_id, cidade, estado)')
        .eq('cliente_user_id', usuario.id)
        .order('ultima_mensagem_em', { ascending: false })
    }

    const { data } = await query
    setConversas(data || [])
    setCarregando(false)
  }

  if (carregando) return (
    <div className="flex items-center justify-center min-h-64">
      <p className="text-sm" style={{ color: '#7C9485' }}>Carregando conversas...</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-5" style={{ color: '#1F2D24' }}>Mensagens</h1>

      {conversas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl" style={{ border: '0.5px solid #EDE3CE' }}>
          <div className="text-5xl mb-3">💬</div>
          <p className="text-sm" style={{ color: '#7C9485' }}>Nenhuma conversa ainda.</p>
          {!prestadorId && (
            <p className="text-xs mt-1" style={{ color: '#C9BFA8' }}>
              Acesse o perfil de um profissional e clique em "Conversar" para iniciar.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {conversas.map(conv => {
            const naoLidas = prestadorId ? conv.nao_lidas_prestador : conv.nao_lidas_cliente
            const nome = prestadorId
              ? conv.cliente_nome || 'Cliente'
              : conv.prestadores?.nome || 'Prestador'
            const sub = prestadorId
              ? ''
              : `${conv.prestadores?.categoria_id} · ${conv.prestadores?.cidade}`

            return (
              <button
                key={conv.id}
                onClick={() => navigate(`/chat/${conv.id}`)}
                className="bg-white rounded-2xl p-4 flex items-center gap-3 hover:opacity-90 transition-opacity text-left w-full"
                style={{ border: '0.5px solid #EDE3CE' }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-medium flex-shrink-0" style={{ background: '#E3F6E9', color: '#0F6E3D' }}>
                  {nome[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>{nome}</p>
                    <p className="text-xs" style={{ color: '#C9BFA8' }}>
                      {conv.ultima_mensagem_em && new Date(conv.ultima_mensagem_em).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  {sub && <p className="text-xs capitalize mb-1" style={{ color: '#7C9485' }}>{sub}</p>}
                  <div className="flex items-center justify-between">
                    <p className="text-xs truncate" style={{ color: '#7C9485' }}>
                      {conv.ultima_mensagem || 'Nenhuma mensagem ainda'}
                    </p>
                    {naoLidas > 0 && (
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0 ml-2" style={{ background: '#1FA855' }}>
                        {naoLidas}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
