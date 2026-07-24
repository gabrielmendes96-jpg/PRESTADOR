import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'

const criterios = [
  { key: 'nota', label: 'Geral', emoji: '⭐' },
  { key: 'qualidade', label: 'Qualidade', emoji: '🏆' },
  { key: 'preco_avaliacao', label: 'Preço', emoji: '💰' },
  { key: 'tempo_servico', label: 'Prazo', emoji: '⏱️' },
  { key: 'higiene', label: 'Higiene', emoji: '🧹' },
  { key: 'comunicacao', label: 'Comunicação', emoji: '💬' },
  { key: 'pontualidade', label: 'Pontualidade', emoji: '📅' },
]

function EstrelasInterativas({ valor, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(v => (
        <button
          key={v}
          type="button"
          onMouseEnter={() => setHover(v)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(v)}
          className="text-2xl transition-colors"
          style={{ color: v <= (hover || valor) ? '#FFC857' : '#D3D1C7' }}
        >★</button>
      ))}
    </div>
  )
}

function FormAvaliacao({ prestador, conversaId, candidaturaId, onPublicar }) {
  const { usuario } = useAuth()
  const [notas, setNotas] = useState({ nota: 0, qualidade: 0, preco_avaliacao: 0, tempo_servico: 0, higiene: 0, comunicacao: 0, pontualidade: 0 })
  const [comentario, setComentario] = useState('')
  const [midias, setMidias] = useState([])
  const [previews, setPreviews] = useState([])
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  const handleArquivos = (e) => {
    const arquivos = Array.from(e.target.files)
    const novoPreviews = arquivos.map(f => ({
      url: URL.createObjectURL(f),
      tipo: f.type.startsWith('video') ? 'video' : 'foto',
      file: f,
    }))
    setMidias([...midias, ...arquivos])
    setPreviews([...previews, ...novoPreviews])
  }

  const removerMidia = (idx) => {
    setMidias(midias.filter((_, i) => i !== idx))
    setPreviews(previews.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (notas.nota === 0) { setErro('Selecione a avaliação geral em estrelas.'); return }
    setEnviando(true)
    setErro('')

    try {
      const { data: avaliacao, error } = await supabase
        .from('avaliacoes')
        .insert({
          prestador_id: prestador.id,
          autor_user_id: usuario?.id || null,
          autor_nome: usuario?.user_metadata?.nome || usuario?.email?.split('@')[0] || 'Anônimo',
          ...notas,
          comentario,
          conversa_id: conversaId || null,
          candidatura_id: candidaturaId || null,
        })
        .select()
        .single()

      if (error) throw error

      // Upload de mídias
      for (const arquivo of midias) {
        const ext = arquivo.name.split('.').pop()
        const caminho = `avaliacoes/${avaliacao.id}/${Date.now()}.${ext}`
        const { data: upload } = await supabase.storage
          .from('midias')
          .upload(caminho, arquivo)

        if (upload) {
          const { data: urlData } = supabase.storage.from('midias').getPublicUrl(caminho)
          await supabase.from('midias_avaliacao').insert({
            avaliacao_id: avaliacao.id,
            url: urlData.publicUrl,
            tipo: arquivo.type.startsWith('video') ? 'video' : 'foto',
          })
        }
      }

      onPublicar({
        autor: usuario?.user_metadata?.nome || 'Você',
        iniciais: (usuario?.user_metadata?.nome || 'V')[0].toUpperCase(),
        nota: notas.nota,
        texto: comentario || 'Ótimo serviço!',
        data: 'agora mesmo',
        midias: previews,
        notas,
      })
      setEnviado(true)
    } catch (e) {
      if (e.code === '23505') {
        setErro('Você já avaliou este serviço. Conclua outro serviço com este profissional para avaliar novamente.')
      } else {
        setErro('Não foi possível publicar. Tente novamente.')
      }
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) return (
    <div className="mt-4 p-4 rounded-xl text-center" style={{ background: '#E3F6E9' }}>
      <p className="font-medium" style={{ color: '#0F6E3D' }}>✓ Avaliação publicada! Obrigado.</p>
    </div>
  )

  return (
    <div className="mt-4 border-t pt-5" style={{ borderColor: '#EDE3CE' }}>
      <p className="text-sm font-medium mb-4" style={{ color: '#1F2D24' }}>Deixe sua avaliação</p>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-5">
          {criterios.map(c => (
            <div key={c.key}>
              <p className="text-xs mb-1.5" style={{ color: '#7C9485' }}>{c.emoji} {c.label}</p>
              <EstrelasInterativas
                valor={notas[c.key]}
                onChange={v => setNotas({ ...notas, [c.key]: v })}
              />
            </div>
          ))}
        </div>

        <textarea
          value={comentario}
          onChange={e => setComentario(e.target.value)}
          placeholder="Conte como foi a experiência com o profissional..."
          rows={3}
          className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none resize-none mb-4"
          style={{ border: '0.5px solid #EDE3CE', background: '#FAF6EE' }}
        />

        <div className="mb-4">
          <p className="text-xs mb-2" style={{ color: '#7C9485' }}>📷 Adicione fotos ou vídeos do serviço</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {previews.map((p, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden" style={{ border: '0.5px solid #EDE3CE' }}>
                {p.tipo === 'video' ? (
                  <video src={p.url} className="w-full h-full object-cover" />
                ) : (
                  <img src={p.url} alt="preview" className="w-full h-full object-cover" />
                )}
                <button type="button" onClick={() => removerMidia(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ background: 'rgba(0,0,0,0.6)' }}>✕</button>
              </div>
            ))}
            <label className="w-20 h-20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:opacity-80"
              style={{ border: '2px dashed #EDE3CE', color: '#C9BFA8' }}>
              <span className="text-xl">+</span>
              <span className="text-xs mt-0.5">Foto/Vídeo</span>
              <input type="file" accept="image/*,video/*" multiple onChange={handleArquivos} className="hidden" />
            </label>
          </div>
        </div>

        {erro && <p className="text-xs mb-3 p-2 rounded-lg" style={{ color: '#A32D2D', background: '#FCEBEB' }}>{erro}</p>}

        <button type="submit" disabled={enviando}
          className="w-full py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-60"
          style={{ background: '#1FA855' }}>
          {enviando ? 'Publicando...' : 'Publicar avaliação'}
        </button>
      </form>
    </div>
  )
}

export default function Avaliacoes({ prestador }) {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [reviews, setReviews] = useState(prestador.avaliacoes || [])
  const [showForm, setShowForm] = useState(false)
  const [permissao, setPermissao] = useState(null)
  const [conversaId, setConversaId] = useState(null)
  const [candidaturaId, setCandidaturaId] = useState(null)
  const [verificando, setVerificando] = useState(false)

  const verificarPermissao = async () => {
    if (!usuario) { navigate('/login'); return }
    setVerificando(true)

    const { data } = await supabase.rpc('pode_avaliar', {
      p_user_id: usuario.id,
      p_prestador_id: prestador.id,
    })

    setPermissao(data)

    if (data?.pode) {
      // Pegar a primeira conversa ou candidatura disponível
      if (data.conversas?.length > 0) setConversaId(data.conversas[0].id)
      else if (data.candidaturas?.length > 0) setCandidaturaId(data.candidaturas[0].id)
      setShowForm(true)
    }

    setVerificando(false)
  }

  return (
    <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #EDE3CE' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium uppercase tracking-wider" style={{ color: '#7C9485' }}>
          Avaliações ({reviews.length})
        </h2>
        {!showForm && (
          <button
            onClick={verificarPermissao}
            disabled={verificando}
            className="text-sm px-3 py-1 rounded-lg hover:opacity-80 disabled:opacity-50"
            style={{ color: '#1FA855', border: '0.5px solid #EDE3CE' }}
          >
            {verificando ? 'Verificando...' : '+ Avaliar'}
          </button>
        )}
      </div>

      {/* Mensagem quando não pode avaliar */}
      {permissao !== null && !permissao?.pode && !showForm && (
        <div className="mb-4 p-3 rounded-xl" style={{ background: '#FFF4D6', border: '0.5px solid #EDE3CE' }}>
          <p className="text-xs font-medium mb-1" style={{ color: '#8A5A00' }}>ℹ️ Para avaliar este profissional</p>
          <p className="text-xs" style={{ color: '#7C9485' }}>
            Você precisa ter conversado ou contratado este profissional através da plataforma.
            Isso garante que todas as avaliações são de clientes reais.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {reviews.map((r, i) => (
          <div key={i} className="border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: '#FAF6EE' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: '#FFF4D6', color: '#8A5A00' }}>
                  {r.iniciais}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>{r.autor}</p>
                  <p className="text-xs" style={{ color: '#C9BFA8' }}>✓ Cliente verificado</p>
                </div>
              </div>
              <span style={{ color: '#FFC857', fontSize: '13px' }}>{'★'.repeat(r.nota)}{'☆'.repeat(5 - r.nota)}</span>
            </div>

            {r.notas && (
              <div className="flex flex-wrap gap-2 mb-2">
                {criterios.filter(c => c.key !== 'nota' && r.notas[c.key] > 0).map(c => (
                  <span key={c.key} className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#FAF6EE', color: '#7C9485' }}>
                    {c.emoji} {c.label}: {'★'.repeat(r.notas[c.key])}
                  </span>
                ))}
              </div>
            )}

            <p className="text-sm mb-2" style={{ color: '#5F6F65' }}>{r.texto}</p>

            {r.midias && r.midias.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {r.midias.map((m, mi) => (
                  <div key={mi} className="w-16 h-16 rounded-lg overflow-hidden" style={{ border: '0.5px solid #EDE3CE' }}>
                    {m.tipo === 'video' ? (
                      <video src={m.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={m.url} alt="foto do serviço" className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs mt-2" style={{ color: '#C9BFA8' }}>{r.data}</p>
          </div>
        ))}
      </div>

      {showForm && permissao?.pode && (
        <FormAvaliacao
          prestador={prestador}
          conversaId={conversaId}
          candidaturaId={candidaturaId}
          onPublicar={(nova) => {
            setReviews([nova, ...reviews])
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}
