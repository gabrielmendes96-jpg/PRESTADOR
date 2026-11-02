import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Star, Trophy, DollarSign, Clock, Sparkles, MessageCircle, Calendar, Check, X, Info, Play } from 'lucide-react'
import { colors } from '../lib/design'
import { prepararArquivo, enviarParaStorage, ErroDeMidia } from '../lib/midia'
import { useErroDeEnvio } from '../lib/useErroDeEnvio'
import SeletorDeFotos from './SeletorDeFotos'

const MAX_MIDIAS = 6

// Critérios unificados — antes o formulário gravava em
// preco_avaliacao/tempo_servico/higiene, mas a média pública só lia
// pontualidade/qualidade/preco/limpeza, então "Preço" e "Limpeza"
// ficavam sempre zerados no perfil. Agora só existe este conjunto, e
// todos os 5 entram na média (ver prestadores_completo).
const criterios = [
  { key: 'nota', label: 'Geral', icon: Star },
  { key: 'qualidade', label: 'Qualidade', icon: Trophy },
  { key: 'preco', label: 'Preço', icon: DollarSign },
  { key: 'limpeza', label: 'Limpeza', icon: Sparkles },
  { key: 'comunicacao', label: 'Comunicação', icon: MessageCircle },
  { key: 'pontualidade', label: 'Pontualidade', icon: Calendar },
]

const NOTAS_POSSIVEIS = Array.from({ length: 11 }, (_, i) => i) // 0..10

function corDaNota(n) {
  if (n >= 8) return colors.primaryHover
  if (n >= 5) return '#92610A'
  return '#B91C1C'
}

// Nota em número real (0 a 10), não estrelas — o cliente toca no
// número em vez de preencher ícones.
function NotaInterativa({ valor, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-0.5">
      {NOTAS_POSSIVEIS.map(n => {
        const ativo = valor === n
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="flex-shrink-0 flex items-center justify-center rounded-lg text-xs font-semibold"
            style={{
              width: 26, height: 26,
              background: ativo ? colors.primary : colors.bg,
              color: ativo ? '#fff' : colors.textSub,
              border: `1px solid ${ativo ? colors.primary : colors.border}`,
            }}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}

// Exibição de uma nota já dada — número grande, sem ícone repetido.
function NotaFixa({ nota, size = 13 }) {
  return (
    <span className="inline-flex items-center font-semibold" style={{ fontSize: size, color: corDaNota(nota), verticalAlign: 'middle' }}>
      {nota}<span style={{ opacity: 0.6, fontWeight: 500 }}>/10</span>
    </span>
  )
}

function FormAvaliacao({ prestador, conversaId, candidaturaId, onPublicar }) {
  const { usuario } = useAuth()
  const [notas, setNotas] = useState({ nota: null, qualidade: null, preco: null, limpeza: null, comunicacao: null, pontualidade: null })
  const [comentario, setComentario] = useState('')
  const [midias, setMidias] = useState([]) // [{ preparado, url, tipo }] — já conferidas e encolhidas
  const [preparando, setPreparando] = useState(false)
  const envioMidia = useErroDeEnvio()
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  const handleArquivos = async (arquivos) => {
    envioMidia.limpar()
    const vagas = MAX_MIDIAS - midias.length
    if (vagas <= 0) { envioMidia.falhou(new ErroDeMidia(`O máximo é ${MAX_MIDIAS} fotos por avaliação. Remova alguma para colocar outra.`)); return }
    setPreparando(true)
    const novas = []
    let ultimoErro = null
    for (const f of arquivos.slice(0, vagas)) {
      try {
        const preparado = await prepararArquivo(f)
        novas.push({ preparado, url: URL.createObjectURL(preparado.arquivo), tipo: preparado.tipo })
      } catch (e) {
        ultimoErro = e
      }
    }
    if (novas.length) setMidias(prev => [...prev, ...novas])
    if (ultimoErro) envioMidia.falhou(ultimoErro)
    else if (arquivos.length > vagas) envioMidia.falhou(new ErroDeMidia(`O máximo é ${MAX_MIDIAS} fotos por avaliação. Só as primeiras foram adicionadas.`))
    else envioMidia.deuCerto()
    setPreparando(false)
  }

  const removerMidia = (idx) => setMidias(midias.filter((_, i) => i !== idx))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (notas.nota === null) { setErro('Dê uma nota geral de 0 a 10.'); return }
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

      // Upload de mídias (a avaliação já existe; o que falhar não a derruba)
      let naoSubiram = 0
      for (const [i, m] of midias.entries()) {
        try {
          const { url, tipo } = await enviarParaStorage(supabase, 'midias', `avaliacoes/${avaliacao.id}/${Date.now()}-${i}`, m.preparado)
          const { error: erroMidia } = await supabase.from('midias_avaliacao').insert({ avaliacao_id: avaliacao.id, url, tipo })
          if (erroMidia) throw erroMidia
        } catch {
          naoSubiram++
        }
      }
      if (naoSubiram) alert(`Sua avaliação foi publicada, mas ${naoSubiram === 1 ? '1 foto não foi enviada' : `${naoSubiram} fotos não foram enviadas`}.`)

      onPublicar({
        autor: usuario?.user_metadata?.nome || 'Você',
        iniciais: (usuario?.user_metadata?.nome || 'V')[0].toUpperCase(),
        nota: notas.nota,
        texto: comentario || 'Ótimo serviço!',
        data: 'agora mesmo',
        midias: midias.map(({ url, tipo }) => ({ url, tipo })),
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
    <div className="mt-4 p-4 rounded-xl text-center flex items-center justify-center gap-2" style={{ background: '#DCFCE7' }}>
      <Check size={16} strokeWidth={3} color={colors.primaryHover} />
      <p className="font-medium" style={{ color: colors.primaryHover }}>Avaliação publicada! Obrigado.</p>
    </div>
  )

  return (
    <div className="mt-4 border-t pt-5" style={{ borderColor: colors.border }}>
      <p className="text-sm font-medium mb-4" style={{ color: colors.text }}>Deixe sua avaliação</p>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-5">
          {criterios.map(c => (
            <div key={c.key}>
              <p className="flex items-center gap-1.5 text-xs mb-1.5" style={{ color: colors.textSub }}>
                <c.icon size={13} /> {c.label}
              </p>
              <NotaInterativa
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
          style={{ border: `0.5px solid ${colors.border}`, background: colors.bg }}
        />

        <div className="mb-4">
          <p className="text-sm mb-2" style={{ color: colors.textSub }}>Adicione fotos ou vídeos do serviço (opcional, até {MAX_MIDIAS})</p>
          {midias.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {midias.map((p, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden" style={{ border: `0.5px solid ${colors.border}` }}>
                  {p.tipo === 'video' ? (
                    <video src={p.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={p.url} alt="Foto anexada" className="w-full h-full object-cover" />
                  )}
                  <button type="button" onClick={() => removerMidia(i)} aria-label="Remover esta foto"
                    className="absolute top-1 right-1 w-7 h-7 rounded-full flex items-center justify-center text-white"
                    style={{ background: 'rgba(0,0,0,0.65)' }}>
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <SeletorDeFotos onArquivos={handleArquivos} enviando={preparando} verbo="Preparando" erro={envioMidia.erro} tentativas={envioMidia.tentativas} />
        </div>

        {erro && <p className="text-xs mb-3 p-2 rounded-lg" style={{ color: '#B91C1C', background: '#FEF2F2' }}>{erro}</p>}

        <button type="submit" disabled={enviando || preparando}
          className="w-full py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-60"
          style={{ background: colors.primary }}>
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
    <div className="bg-white rounded-2xl p-6" style={{ border: `0.5px solid ${colors.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium uppercase tracking-wider" style={{ color: colors.textSub }}>
          Avaliações ({reviews.length})
        </h2>
        {!showForm && usuario?.id !== prestador.user_id && (
          <button
            onClick={verificarPermissao}
            disabled={verificando}
            className="text-sm px-3 py-1 rounded-lg hover:opacity-80 disabled:opacity-50"
            style={{ color: colors.primary, border: `0.5px solid ${colors.border}` }}
          >
            {verificando ? 'Verificando...' : '+ Avaliar'}
          </button>
        )}
      </div>

      {/* Mensagem quando não pode avaliar */}
      {permissao !== null && !permissao?.pode && !showForm && (
        <div className="mb-4 p-3 rounded-xl" style={{ background: '#FEF3C7', border: `0.5px solid ${colors.border}` }}>
          <p className="flex items-center gap-1.5 text-xs font-medium mb-1" style={{ color: '#92610A' }}>
            <Info size={13} /> Para avaliar este profissional
          </p>
          <p className="text-xs" style={{ color: colors.textSub }}>
            Você precisa ter conversado ou contratado este profissional através da plataforma.
            Isso garante que todas as avaliações são de clientes reais.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {reviews.map((r, i) => (
          <div key={i} className="border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: colors.bg }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: '#FEF3C7', color: '#92610A' }}>
                  {r.iniciais}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: colors.text }}>{r.autor}</p>
                  <p className="flex items-center gap-1 text-xs" style={{ color: '#9CA3AF' }}>
                    <Check size={11} strokeWidth={3} /> Cliente verificado
                  </p>
                </div>
              </div>
              <NotaFixa nota={r.nota} size={15} />
            </div>

            {r.notas && (
              <div className="flex flex-wrap gap-2 mb-2">
                {criterios.filter(c => c.key !== 'nota' && r.notas[c.key] != null).map(c => (
                  <span key={c.key} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: colors.bg, color: colors.textSub }}>
                    <c.icon size={11} /> {c.label}: <NotaFixa nota={r.notas[c.key]} size={11} />
                  </span>
                ))}
              </div>
            )}

            <p className="text-sm mb-2" style={{ color: colors.textSub }}>{r.texto}</p>

            {r.midias && r.midias.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {r.midias.map((m, mi) => (
                  <button
                    key={mi}
                    onClick={() => window.open(m.url, '_blank')}
                    className="relative w-16 h-16 rounded-lg overflow-hidden cursor-pointer"
                    style={{ border: `0.5px solid ${colors.border}`, padding: 0 }}
                    aria-label={m.tipo === 'video' ? 'Abrir vídeo em tamanho real' : 'Abrir foto em tamanho real'}
                  >
                    {m.tipo === 'video' ? (
                      <video src={m.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={m.url} alt="foto do serviço" className="w-full h-full object-cover" />
                    )}
                    {m.tipo === 'video' && (
                      <span className="absolute top-1 left-1 flex items-center justify-center w-5 h-5 rounded text-white" style={{ background: 'rgba(0,0,0,0.6)' }}>
                        <Play size={11} fill="#fff" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>{r.data}</p>
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
