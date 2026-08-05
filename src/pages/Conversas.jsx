import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { colors, spacing, type as typeScale } from '../lib/design'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'

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
        .select('*, prestadores(id, nome, categoria_id, cidade, estado, foto_perfil)')
        .eq('cliente_user_id', usuario.id)
        .order('ultima_mensagem_em', { ascending: false })
    }

    const { data } = await query
    setConversas(data || [])
    setCarregando(false)
  }

  if (carregando) return (
    <div style={{ textAlign: 'center', padding: '64px 0', fontSize: 14, color: colors.textSub }}>Carregando conversas...</div>
  )

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ ...typeScale.subtitle, color: colors.text, marginBottom: 20 }}>Mensagens</h1>

      {conversas.length === 0 ? (
        <Card padding={48} style={{ textAlign: 'center' }}>
          <MessageCircle size={48} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, color: colors.textSub }}>Nenhuma conversa ainda.</p>
          {!prestadorId && (
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
              Acesse o perfil de um profissional e clique em "Conversar" para iniciar.
            </p>
          )}
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          {conversas.map(conv => {
            const naoLidas = prestadorId ? conv.nao_lidas_prestador : conv.nao_lidas_cliente
            const nome = prestadorId
              ? conv.cliente_nome || 'Cliente'
              : conv.prestadores?.nome || 'Prestador'
            const foto = prestadorId
              ? conv.cliente_foto_url
              : conv.prestadores?.foto_perfil
            const sub = prestadorId
              ? ''
              : `${conv.prestadores?.categoria_id} · ${conv.prestadores?.cidade}`

            return (
              <Card key={conv.id} interactive padding={16} onClick={() => navigate(`/chat/${conv.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar nome={nome} foto={foto} size={48} style={{ fontSize: 16 }} />
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nome}</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF', flexShrink: 0, margin: 0 }}>
                      {conv.ultima_mensagem_em && new Date(conv.ultima_mensagem_em).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  {sub && <p style={{ fontSize: 12, color: colors.textSub, textTransform: 'capitalize', marginBottom: 4 }}>{sub}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <p style={{ fontSize: 12, color: colors.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                      {conv.ultima_mensagem || 'Nenhuma mensagem ainda'}
                    </p>
                    {naoLidas > 0 && (
                      <span style={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', background: colors.primary, flexShrink: 0 }}>
                        {naoLidas}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
