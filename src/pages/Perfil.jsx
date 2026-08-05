import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Wrench, MapPin, X, MessageCircle, FileText, Phone, Share2 } from 'lucide-react'
import { usePrestador } from '../lib/hooks'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { colors, radius, shadow } from '../lib/design'
import { planoInfo } from '../lib/planoInfo'
import Avaliacoes from '../components/Avaliacoes'
import GaleriaFotos from '../components/GaleriaFotos'
import ReputacaoBadge from '../components/ReputacaoBadge'
import RedesSociais from '../components/RedesSociais'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import IconButton from '../components/ui/IconButton'
import Badge from '../components/ui/Badge'

function iniciaisDe(nome = '') {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'P'
}

export default function Perfil() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const [iniciandoChat, setIniciandoChat] = useState(false)
  const { prestador, loading } = usePrestador(id)

  // Registra uma visualização real (não dono, no máximo 1 por sessão/dia)
  useEffect(() => {
    if (!prestador) return
    if (usuario?.id === prestador.user_id) return

    const hoje = new Date().toISOString().slice(0, 10)
    const chave = `visto_${prestador.id}_${hoje}`
    if (sessionStorage.getItem(chave)) return
    sessionStorage.setItem(chave, '1')

    supabase.from('visualizacoes_perfil').insert({ prestador_id: prestador.id }).then(() => {})
  }, [prestador, usuario])

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
        cliente_foto_url: usuario.user_metadata?.foto_url || null,
      })
      .select()
      .single()

    setIniciandoChat(false)
    if (nova) navigate(`/chat/${nova.id}`)
  }

  const compartilhar = () => {
    const url = window.location.href
    const msg = `Encontrei ${prestador.nome} no Prestador App — ${prestador.categoria_id} em ${prestador.cidade}. Veja o perfil com avaliações reais: ${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (loading) {
    return <p style={{ textAlign: 'center', padding: '64px 0', fontSize: 14, color: colors.textSub }}>Carregando perfil...</p>
  }

  if (!prestador) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 0', color: colors.textSub }}>
        <p>Profissional não encontrado.</p>
        <button onClick={() => navigate('/busca')} style={{ marginTop: 12, fontSize: 14, textDecoration: 'underline', color: colors.primary, background: 'none', border: 'none', cursor: 'pointer' }}>
          Voltar para a busca
        </button>
      </div>
    )
  }

  const plano = planoInfo[prestador.plano]

  return (
    <div className="max-w-[640px] lg:max-w-5xl mx-auto">
      <div className="lg:flex lg:gap-6 lg:items-start">
      {/* Card principal */}
      <Card padding={16} className="lg:w-[380px] lg:flex-shrink-0" style={{ marginBottom: 16 }}>
        <GaleriaFotos fotos={prestador.fotos || []} disponivel={prestador.disponivel} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            {prestador.foto_perfil ? (
              <img
                src={prestador.foto_perfil}
                alt={prestador.nome}
                style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${colors.primary}` }}
              />
            ) : (
              <div style={{
                width: 56, height: 56, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#DCFCE7', color: colors.primaryHover, fontSize: 19, fontWeight: 800,
              }}>
                {iniciaisDe(prestador.nome)}
              </div>
            )}
            <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.text, margin: 0, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {prestador.nome}
              {prestador.idade && <span style={{ fontSize: 14, fontWeight: 400, color: colors.textSub, marginLeft: 8 }}>{prestador.idade}</span>}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <IconButton icon={<Share2 size={16} />} tone="ghost" size={34} onClick={compartilhar} aria-label="Compartilhar perfil" />
            <IconButton icon={<X size={16} />} tone="ghost" size={34} onClick={() => navigate('/busca')} aria-label="Voltar para a busca" />
          </div>
        </div>

        {plano && (
          <div style={{ marginBottom: 8 }}>
            <Badge tone="verified" icon={<plano.icon size={11} strokeWidth={3} />}>{plano.label}</Badge>
          </div>
        )}

        <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: colors.textSub, textTransform: 'capitalize', margin: '0 0 2px' }}>
          <Wrench size={14} /> {prestador.categoria} · {prestador.totalServicos} serviços realizados
        </p>
        <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: colors.textSub, margin: '0 0 12px' }}>
          <MapPin size={14} /> {prestador.cidade}, {prestador.estado} · atende até {prestador.raioAtendimento}km
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <ReputacaoBadge nota={prestador.avaliacao} totalAvaliacoes={prestador.totalAvaliacoes} />
          <span style={{ fontSize: 13, color: colors.textSub }}>· resp. em {prestador.tempoResposta}</span>
        </div>

        <p style={{ fontSize: 14, lineHeight: 1.6, color: colors.textSub, marginBottom: 16 }}>{prestador.descricao}</p>

        {/* Hashtags */}
        {prestador.hashtags && prestador.hashtags.filter(Boolean).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {prestador.hashtags.filter(Boolean).map(tag => (
              <span key={tag} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, background: '#DCFCE7', color: colors.primaryHover }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Redes sociais */}
        {prestador.redes_sociais && Object.values(prestador.redes_sociais).some(Boolean) && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: colors.textSub, letterSpacing: '0.4px', marginBottom: 8 }}>REDES SOCIAIS</p>
            <RedesSociais links={prestador.redes_sociais} />
          </div>
        )}

        {(prestador.servicos || []).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {(prestador.servicos || []).map(s => (
              <span key={s} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, background: '#FEF3C7', color: '#92610A' }}>
                {s}
              </span>
            ))}
          </div>
        )}

        {/* CTAs principais */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <Button variant="secondary" icon={<MessageCircle size={17} />} fullWidth onClick={iniciarConversa} disabled={iniciandoChat}>
            Chat
          </Button>
          <Button variant="dark" icon={<FileText size={17} />} fullWidth onClick={iniciarConversa} disabled={iniciandoChat}>
            {iniciandoChat ? 'Abrindo...' : 'Solicitar orçamento'}
          </Button>
        </div>

        {/* WhatsApp direto — perk exclusivo do plano Premium, e mesmo
            assim só se o prestador não tiver desativado no painel */}
        {prestador.whatsapp && prestador.plano === 'premium' && prestador.mostrar_whatsapp !== false && (
          <Button
            variant="secondary"
            fullWidth
            icon={<Phone size={16} />}
            onClick={() => window.open(`https://wa.me/${prestador.whatsapp.replace(/\D/g, '')}`, '_blank')}
            style={{ background: '#25D366', color: '#fff', border: '1px solid transparent' }}
          >
            Chamar no WhatsApp
          </Button>
        )}
      </Card>

      <div className="lg:flex-1" style={{ minWidth: 0 }}>
        {/* Avaliações detalhadas */}
        <Card padding={20} style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: colors.textSub, marginBottom: 16 }}>Avaliação por critério</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {Object.entries(prestador.avaliacaoDetalhada).map(([key, val]) => {
              const labels = { pontualidade: 'Pontualidade', qualidade: 'Qualidade', preco: 'Preço justo', limpeza: 'Limpeza' }
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: colors.textSub, width: 90, flexShrink: 0 }}>{labels[key]}</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#F1F5F9' }}>
                    <div style={{ height: 6, borderRadius: 999, width: `${(val / 5) * 100}%`, background: colors.secondary }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: colors.text, width: 20 }}>{val}</span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Reviews */}
        <Avaliacoes prestador={prestador} />
      </div>
      </div>
    </div>
  )
}
