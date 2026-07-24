import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export default function Chat() {
  const { conversaId } = useParams()
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [mensagens, setMensagens] = useState([])
  const [conversa, setConversa] = useState(null)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!usuario) { navigate('/login'); return }
    carregarConversa()
  }, [conversaId, usuario])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  // Realtime — escuta novas mensagens
  useEffect(() => {
    if (!conversaId) return
    const channel = supabase
      .channel(`chat:${conversaId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensagens',
        filter: `conversa_id=eq.${conversaId}`,
      }, (payload) => {
        setMensagens(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [conversaId])

  const carregarConversa = async () => {
    setCarregando(true)

    const { data: conv } = await supabase
      .from('conversas')
      .select('*, prestadores(id, nome, categoria_id, cidade, estado)')
      .eq('id', conversaId)
      .single()

    setConversa(conv)

    const { data: msgs } = await supabase
      .from('mensagens')
      .select('*')
      .eq('conversa_id', conversaId)
      .order('criado_em', { ascending: true })

    setMensagens(msgs || [])
    setCarregando(false)

    // Marcar mensagens como lidas
    const ehPrestador = usuario?.id === conv?.prestadores?.user_id
    if (ehPrestador) {
      await supabase.from('conversas').update({ nao_lidas_prestador: 0 }).eq('id', conversaId)
    } else {
      await supabase.from('conversas').update({ nao_lidas_cliente: 0 }).eq('id', conversaId)
    }
  }

  const enviar = async () => {
    if (!texto.trim() || enviando) return
    setEnviando(true)

    const ehPrestador = conversa?.prestadores?.user_id === usuario?.id
    const remetente = ehPrestador ? 'prestador' : 'cliente'

    const { data: msg } = await supabase
      .from('mensagens')
      .insert({
        conversa_id: conversaId,
        prestador_id: conversa?.prestador_id,
        cliente_user_id: conversa?.cliente_user_id,
        remetente,
        texto: texto.trim(),
      })
      .select()
      .single()

    // Atualizar última mensagem e contador de não lidas
    await supabase.from('conversas').update({
      ultima_mensagem: texto.trim(),
      ultima_mensagem_em: new Date().toISOString(),
      nao_lidas_prestador: ehPrestador ? 0 : (conversa?.nao_lidas_prestador || 0) + 1,
      nao_lidas_cliente: ehPrestador ? (conversa?.nao_lidas_cliente || 0) + 1 : 0,
    }).eq('id', conversaId)

    // Enviar push para o destinatário
    const destinatarioId = ehPrestador
      ? conversa?.cliente_user_id
      : conversa?.prestadores?.user_id

    if (destinatarioId) {
      fetch('/api/enviar-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: destinatarioId,
          titulo: 'Nova mensagem no Prestador',
          corpo: texto.trim().slice(0, 80),
          url: `/chat/${conversaId}`,
          tipo: 'mensagem'
        })
      }).catch(() => {})
    }

    setTexto('')
    setEnviando(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  const ehMinha = (msg) => {
    const ehPrestador = conversa?.prestadores?.user_id === usuario?.id
    return (ehPrestador && msg.remetente === 'prestador') || (!ehPrestador && msg.remetente === 'cliente')
  }

  if (carregando) return (
    <div className="flex items-center justify-center min-h-64">
      <p className="text-sm" style={{ color: '#7C9485' }}>Carregando conversa...</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 mb-3 flex items-center gap-3" style={{ border: '0.5px solid #EDE3CE' }}>
        <button onClick={() => navigate(-1)} className="p-1 rounded-lg hover:opacity-70" style={{ color: '#7C9485' }}>
          <i className="ti ti-arrow-left" style={{ fontSize: '20px' }} aria-hidden="true"></i>
        </button>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium" style={{ background: '#E3F6E9', color: '#0F6E3D' }}>
          {(conversa?.prestadores?.nome || conversa?.cliente_nome || 'U')[0].toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>
            {conversa?.prestadores?.user_id === usuario?.id
              ? conversa?.cliente_nome || 'Cliente'
              : conversa?.prestadores?.nome || 'Prestador'
            }
          </p>
          <p className="text-xs capitalize" style={{ color: '#7C9485' }}>
            {conversa?.prestadores?.categoria_id} · {conversa?.prestadores?.cidade}, {conversa?.prestadores?.estado}
          </p>
        </div>
      </div>

      {/* Mensagens */}
      <div className="bg-white rounded-2xl p-4 mb-3" style={{ border: '0.5px solid #EDE3CE', minHeight: '400px', maxHeight: '500px', overflowY: 'auto' }}>
        {mensagens.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-sm" style={{ color: '#7C9485' }}>Nenhuma mensagem ainda. Diga olá!</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {mensagens.map((msg, i) => (
              <div key={msg.id || i} className={`flex ${ehMinha(msg) ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-xs px-4 py-2.5 rounded-2xl text-sm"
                  style={ehMinha(msg)
                    ? { background: '#1FA855', color: '#fff', borderBottomRightRadius: '4px' }
                    : { background: '#FAF6EE', color: '#1F2D24', borderBottomLeftRadius: '4px', border: '0.5px solid #EDE3CE' }
                  }
                >
                  <p>{msg.texto}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(msg.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white rounded-2xl p-3 flex gap-2 items-end" style={{ border: '0.5px solid #EDE3CE' }}>
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem... (Enter para enviar)"
          rows={1}
          className="flex-1 px-3 py-2 text-sm rounded-xl focus:outline-none resize-none"
          style={{ border: '0.5px solid #EDE3CE', background: '#FAF6EE', maxHeight: '120px' }}
        />
        <button
          onClick={enviar}
          disabled={!texto.trim() || enviando}
          className="w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-opacity flex-shrink-0"
          style={{ background: '#1FA855', color: '#fff' }}
        >
          <i className="ti ti-send" style={{ fontSize: '18px' }} aria-hidden="true"></i>
        </button>
      </div>
    </div>
  )
}
