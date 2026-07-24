import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePrestador } from '../lib/hooks'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import Avaliacoes from '../components/Avaliacoes'
import GaleriaFotos from '../components/GaleriaFotos'
import ReputacaoBadge from '../components/ReputacaoBadge'
import RedesSociais from '../components/RedesSociais'

const planoLabel = { basico: 'Básico', profissional: 'Profissional ✓', premium: 'Premium ⭐' }
const planoBadge = {
  basico: { background: '#F1EFE8', color: '#5F5E5A' },
  profissional: { background: '#E3F6E9', color: '#0F6E3D' },
  premium: { background: '#FFF4D6', color: '#8A5A00' },
}

export default function Perfil() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const [iniciandoChat, setIniciandoChat] = useState(false)
  const { prestador, loading } = usePrestador(id)

  const iniciarConversa = async () => {
    if (!usuario) { navigate('/login'); return }
    setIniciandoChat(true)

    const { data: existente } = await supabase
      .from('conversas')
      .select('id')
      .eq('prestador_id', id)
      .eq('cliente_user_id', usuario.id)
      .single()

    if (existente) {
      navigate(`/chat/${existente.id}`)
      return
    }

    const { data: nova } = await supabase
      .from('conversas')
      .insert({
        prestador_id: id,
        cliente_user_id: usuario.id,
        cliente_nome: usuario.user_metadata?.nome || usuario.email?.split('@')[0] || 'Cliente',
      })
      .select()
      .single()

    setIniciandoChat(false)
    if (nova) navigate(`/chat/${nova.id}`)
  }

  if (loading) {
    return <p className="text-center py-16 text-sm" style={{ color: '#C9BFA8' }}>Carregando perfil...</p>
  }

  if (!prestador) {
    return (
      <div className="text-center py-16" style={{ color: '#C9BFA8' }}>
        <p>Profissional não encontrado.</p>
        <button onClick={() => navigate('/busca')} className="mt-3 text-sm underline" style={{ color: '#1FA855' }}>
          Voltar para a busca
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Card principal estilo apresentação */}
      <div className="bg-white rounded-2xl p-4 mb-4" style={{ border: '0.5px solid #EDE3CE' }}>
        <GaleriaFotos fotos={prestador.fotos || []} disponivel={prestador.disponivel} />

        <div className="flex items-start justify-between mb-1">
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-semibold" style={{ color: '#1F2D24' }}>{prestador.nome}</h1>
            <span className="text-sm" style={{ color: '#C9BFA8' }}>{prestador.idade}</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full" style={planoBadge[prestador.plano]}>
            {planoLabel[prestador.plano]}
          </span>
        </div>
        <p className="text-sm capitalize mb-0.5" style={{ color: '#7C9485' }}>
          <i className="ti ti-tools" style={{ fontSize: '14px', verticalAlign: '-2px' }} aria-hidden="true"></i> {prestador.categoria} · {prestador.totalServicos} serviços realizados
        </p>
        <p className="text-sm mb-3" style={{ color: '#7C9485' }}>
          <i className="ti ti-map-pin" style={{ fontSize: '14px', verticalAlign: '-2px' }} aria-hidden="true"></i> {prestador.cidade}, {prestador.estado} · atende até {prestador.raioAtendimento}km
        </p>

        <div className="flex items-center gap-3 mb-3">
          <ReputacaoBadge nota={prestador.avaliacao} totalAvaliacoes={prestador.totalAvaliacoes} />
          <span className="text-sm" style={{ color: '#C9BFA8' }}>· resp. em {prestador.tempoResposta}</span>
        </div>

        <p className="text-sm leading-relaxed mb-4" style={{ color: '#5F6F65' }}>{prestador.descricao}</p>

        {/* Serviços/hashtags */}
        {prestador.hashtags && prestador.hashtags.filter(Boolean).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {prestador.hashtags.filter(Boolean).map(tag => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full" style={{ background: '#E3F6E9', color: '#0F6E3D' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Redes sociais */}
        {prestador.redes_sociais && Object.values(prestador.redes_sociais).some(Boolean) && (
          <div className="mb-4">
            <p className="text-xs mb-2" style={{ color: '#C9BFA8' }}>REDES SOCIAIS</p>
            <RedesSociais links={prestador.redes_sociais} />
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          {(prestador.servicos || []).map(s => (
            <span key={s} className="text-xs px-2.5 py-1 rounded-full" style={{ background: '#FFF4D6', color: '#8A5A00' }}>
              {s}
            </span>
          ))}
        </div>

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => navigate('/busca')}
            className="flex-1 py-3 text-sm font-medium rounded-xl hover:opacity-80 transition-opacity"
            style={{ border: '0.5px solid #EDE3CE', color: '#7C9485', background: '#fff' }}
          >
            <i className="ti ti-x" style={{ fontSize: '14px', verticalAlign: '-2px' }} aria-hidden="true"></i> Pular
          </button>
          <button
            onClick={iniciarConversa}
            disabled={iniciandoChat}
            className="flex-1 py-3 text-sm font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ background: '#1FA855', color: '#fff' }}
          >
            <i className="ti ti-message" style={{ fontSize: '14px', verticalAlign: '-2px' }} aria-hidden="true"></i>
            {iniciandoChat ? ' Abrindo...' : ' Conversar'}
          </button>
        </div>

        {/* Compartilhar perfil */}
        <button
          onClick={() => {
            const url = window.location.href
            const msg = `Encontrei ${prestador.nome} no Prestador App — ${prestador.categoria_id} em ${prestador.cidade}. Veja o perfil com avaliações reais: ${url}`
            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
          }}
          className="w-full py-2.5 text-sm font-medium rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
          style={{ background: '#25D366', color: '#fff' }}
        >
          <i className="ti ti-brand-whatsapp" style={{ fontSize: 16 }} aria-hidden="true"></i>
          Compartilhar este perfil
        </button>
      </div>

      {/* Avaliações detalhadas */}
      <div className="bg-white rounded-2xl p-6 mb-4" style={{ border: '0.5px solid #EDE3CE' }}>
        <h2 className="text-sm font-medium uppercase tracking-wider mb-4" style={{ color: '#7C9485' }}>Avaliação por critério</h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(prestador.avaliacaoDetalhada).map(([key, val]) => {
            const labels = { pontualidade: 'Pontualidade', qualidade: 'Qualidade', preco: 'Preço justo', limpeza: 'Limpeza' }
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs w-24" style={{ color: '#7C9485' }}>{labels[key]}</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: '#F1EFE8' }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${(val / 5) * 100}%`, background: '#FFC857' }} />
                </div>
                <span className="text-xs font-medium w-6" style={{ color: '#1F2D24' }}>{val}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reviews */}
      <Avaliacoes prestador={prestador} />
    </div>
  )
}

