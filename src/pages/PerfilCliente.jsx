import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, SlidersHorizontal, Star, PenLine, History, ClipboardList, Settings,
  Camera, Loader2, Save, Wrench, Gift, Info, FileText, Shield, Crown, ChevronRight, LogOut,
  Zap, Droplet, Paintbrush, Building2, Trees, Bug, Home as HomeIcon, Monitor,
  MessageCircle, Ticket, Check,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { colors } from '../lib/design'
import ReputacaoBadge from '../components/ReputacaoBadge'
import RedesSociaisForm from '../components/RedesSociaisForm'
import RedesSociais from '../components/RedesSociais'

const servicosDisponiveis = [
  { id: 'eletrica', icon: Zap, nome: 'Elétrica' },
  { id: 'hidraulica', icon: Droplet, nome: 'Hidráulica' },
  { id: 'pintura', icon: Paintbrush, nome: 'Pintura' },
  { id: 'alvenaria', icon: Building2, nome: 'Alvenaria' },
  { id: 'marcenaria', icon: Wrench, nome: 'Marcenaria' },
  { id: 'limpeza', icon: SlidersHorizontal, nome: 'Limpeza' },
  { id: 'jardinagem', icon: Trees, nome: 'Jardinagem' },
  { id: 'mecanica', icon: Wrench, nome: 'Mecânica' },
  { id: 'informatica', icon: Monitor, nome: 'Informática' },
  { id: 'reformas', icon: HomeIcon, nome: 'Reformas' },
  { id: 'dedetizacao', icon: Bug, nome: 'Dedetização' },
  { id: 'serralheria', icon: Wrench, nome: 'Serralheria' },
]

export default function PerfilCliente() {
  const { usuario, sair } = useAuth()
  const navigate = useNavigate()
  const [aba, setAba] = useState('perfil')
  const [authCarregando, setAuthCarregando] = useState(true)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [fotoUrl, setFotoUrl] = useState('')
  const [salvoMsg, setSalvoMsg] = useState('')

  // Dados do perfil
  const [nome, setNome] = useState('')
  const [bio, setBio] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [telefone, setTelefone] = useState('')
  const [preferencias, setPreferencias] = useState([])
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifPush, setNotifPush] = useState(true)
  const [perfilPublico, setPerfilPublico] = useState(true)
  const [redesSociais, setRedesSociais] = useState({})

  // Dados carregados
  const [stats, setStats] = useState({ pedidos: 0, conversas: 0, creditos: 0, avaliacoes: 0, avaliacoesFeitasCount: 0 })
  const [avaliacoesRecebidas, setAvaliacoesRecebidas] = useState([])
  const [avaliacoesFeitasData, setAvaliacoesFeitasData] = useState([])
  const [historico, setHistorico] = useState([])
  const [pedidos, setPedidos] = useState([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthCarregando(false)
      if (!usuario) { navigate('/login'); return }
      setNome(usuario.user_metadata?.nome || '')
      setFotoUrl(usuario.user_metadata?.foto_url || '')
      carregarDados()
    }, 500)
    return () => clearTimeout(timer)
  }, [usuario])

  const carregarDados = async () => {
    const [
      { count: pedidosCount },
      { count: conversasCount },
      { data: cred },
      { data: avals },
      { data: avalsFeitasData },
      { data: hist },
      { data: peds },
      { data: perfilData },
    ] = await Promise.all([
      supabase.from('pedidos_servico').select('*', { count: 'exact', head: true }).eq('cliente_user_id', usuario.id),
      supabase.from('conversas').select('*', { count: 'exact', head: true }).eq('cliente_user_id', usuario.id),
      supabase.from('creditos_cliente').select('creditos_disponiveis').eq('user_id', usuario.id).single(),
      supabase.from('avaliacoes_cliente').select('*, prestadores(nome, categoria_id)').eq('cliente_user_id', usuario.id).order('criado_em', { ascending: false }),
      supabase.from('avaliacoes').select('*, prestadores(nome, categoria_id, foto_perfil)').eq('autor_user_id', usuario.id).order('criado_em', { ascending: false }),
      supabase.from('historico_servicos').select('*, prestadores(nome, categoria_id)').eq('cliente_user_id', usuario.id).order('data_servico', { ascending: false }),
      supabase.from('pedidos_servico').select('*, categorias(nome, emoji)').eq('cliente_user_id', usuario.id).order('criado_em', { ascending: false }),
      supabase.from('perfis_cliente').select('*').eq('user_id', usuario.id).single(),
    ])

    setStats({
      pedidos: pedidosCount || 0,
      conversas: conversasCount || 0,
      creditos: cred?.creditos_disponiveis || 0,
      avaliacoes: avals?.length || 0,
      avaliacoesFeitasCount: avalsFeitasData?.length || 0,
    })
    setAvaliacoesRecebidas(avals || [])
    setAvaliacoesFeitasData(avalsFeitasData || [])
    setHistorico(hist || [])
    setPedidos(peds || [])

    if (perfilData) {
      setBio(perfilData.bio || '')
      setCidade(perfilData.cidade || '')
      setEstado(perfilData.estado || '')
      setTelefone(perfilData.telefone || '')
      setPreferencias(perfilData.preferencias_servico || [])
      setNotifEmail(perfilData.notificacoes_email ?? true)
      setNotifPush(perfilData.notificacoes_push ?? true)
      setPerfilPublico(perfilData.perfil_publico ?? true)
      setRedesSociais(perfilData.redes_sociais || {})
    }

    setCarregando(false)
  }

  const salvarPerfil = async () => {
    setSalvando(true)
    await supabase.auth.updateUser({ data: { ...usuario.user_metadata, nome } })
    await supabase.from('perfis_cliente').upsert({
      user_id: usuario.id,
      bio, cidade, estado, telefone,
      preferencias_servico: preferencias,
      notificacoes_email: notifEmail,
      notificacoes_push: notifPush,
      perfil_publico: perfilPublico,
      redes_sociais: redesSociais,
      atualizado_em: new Date().toISOString(),
    })
    setSalvando(false)
    setSalvoMsg('Perfil salvo com sucesso!')
    setTimeout(() => setSalvoMsg(''), 3000)
  }

  const uploadFoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingFoto(true)
    const ext = file.name.split('.').pop()
    const caminho = `clientes/${usuario.id}/foto.${ext}`
    const { error } = await supabase.storage.from('midias').upload(caminho, file, { upsert: true })
    if (!error) {
      const { data: urlData } = supabase.storage.from('midias').getPublicUrl(caminho)
      await supabase.auth.updateUser({ data: { ...usuario.user_metadata, foto_url: urlData.publicUrl } })
      setFotoUrl(urlData.publicUrl)
    }
    setUploadingFoto(false)
  }

  const togglePreferencia = (id) => {
    setPreferencias(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  const notaMedia = avaliacoesRecebidas.length > 0
    ? (avaliacoesRecebidas.reduce((acc, a) => acc + a.nota, 0) / avaliacoesRecebidas.length).toFixed(1)
    : null

  if (authCarregando || carregando) return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent mx-auto mb-3 animate-spin"
          style={{ borderColor: '#16A34A', borderTopColor: 'transparent' }}></div>
        <p className="text-sm" style={{ color: '#9CA3AF' }}>Carregando perfil...</p>
      </div>
    </div>
  )

  const iniciais = (usuario.user_metadata?.nome || usuario.email || 'U').slice(0, 2).toUpperCase()
  const membro = new Date(usuario.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const abas = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'preferencias', label: 'Preferências', icon: SlidersHorizontal },
    { id: 'avaliacoes', label: 'Avaliações', icon: Star },
    { id: 'feitas', label: 'Minhas avaliações', icon: PenLine },
    { id: 'historico', label: 'Histórico', icon: History },
    { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
    { id: 'config', label: 'Configurações', icon: Settings },
  ]

  return (
    <div className="max-w-lg mx-auto">

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 mb-4" style={{ border: '0.5px solid #E4E7E4' }}>
        <div className="flex items-center gap-4 mb-4">
          <label className="cursor-pointer flex-shrink-0">
            <div className="relative w-16 h-16">
              {fotoUrl ? (
                <img src={fotoUrl} alt="Foto" className="w-16 h-16 rounded-full object-cover" style={{ border: '2px solid #16A34A' }} />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold text-white" style={{ background: '#16A34A' }}>
                  {iniciais}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: '#16A34A', border: '2px solid #fff' }}>
                {uploadingFoto ? <Loader2 size={11} color="#fff" className="animate-spin" /> : <Camera size={11} color="#fff" />}
              </div>
            </div>
            <input type="file" accept="image/*" onChange={uploadFoto} className="hidden" disabled={uploadingFoto} />
          </label>

          <div className="flex-1">
            <p className="text-base font-semibold mb-0.5" style={{ color: '#1F2937' }}>
              {usuario.user_metadata?.nome || 'Usuário'}
            </p>
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>{usuario.email}</p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>Membro desde {membro}</p>
            {notaMedia && (
              <div className="mt-2">
                <ReputacaoBadge nota={parseFloat(notaMedia)} totalAvaliacoes={avaliacoesRecebidas.length} size="small" />
              </div>
            )}
          </div>
        </div>

        {bio && (
          <p className="text-sm mb-4 p-3 rounded-xl" style={{ background: '#F3F6F2', color: '#6B7280' }}>{bio}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Pedidos', valor: stats.pedidos, icon: ClipboardList },
            { label: 'Conversas', valor: stats.conversas, icon: MessageCircle },
            { label: 'Créditos', valor: stats.creditos, icon: Ticket },
            { label: 'Avaliações', valor: stats.avaliacoes, icon: Star },
            { label: 'Avaliou', valor: stats.avaliacoesFeitasCount, icon: PenLine },
            { label: 'Serviços', valor: historico.length, icon: Wrench },
          ].map(s => (
            <div key={s.label} className="text-center p-2.5 rounded-xl" style={{ background: '#F3F6F2' }}>
              <s.icon size={17} color={colors.primary} style={{ margin: '0 auto 2px' }} />
              <p className="text-base font-semibold" style={{ color: '#16A34A' }}>{s.valor}</p>
              <p className="text-xs" style={{ color: '#6B7280' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-1 p-1 bg-white rounded-2xl mb-4 overflow-x-auto" style={{ border: '0.5px solid #E4E7E4' }}>
        {abas.map(a => (
          <button key={a.id} onClick={() => setAba(a.id)}
            className="py-2 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 whitespace-nowrap transition-colors flex-shrink-0"
            style={aba === a.id ? { background: '#16A34A', color: '#fff' } : { color: '#6B7280' }}>
            <a.icon size={13} />
            {a.label}
          </button>
        ))}
      </div>

      {salvoMsg && (
        <div className="mb-4 p-3 rounded-xl text-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#DCFCE7' }}>
          <Check size={15} strokeWidth={3} color="#14853D" />
          <p className="text-sm font-medium" style={{ color: '#14853D', margin: 0 }}>{salvoMsg}</p>
        </div>
      )}

      {/* ABA: PERFIL */}
      {aba === 'perfil' && (
        <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid #E4E7E4' }}>
          <p className="text-sm font-medium mb-4" style={{ color: '#1F2937' }}>Editar perfil</p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs mb-1" style={{ color: '#6B7280' }}>Nome completo</label>
              <input value={nome} onChange={e => setNome(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border focus:outline-none"
                style={{ borderColor: '#E4E7E4' }} placeholder="Seu nome" />
            </div>

            <div>
              <label className="block text-xs mb-1" style={{ color: '#6B7280' }}>Bio (apresentação)</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border focus:outline-none resize-none"
                style={{ borderColor: '#E4E7E4' }} rows={3}
                placeholder="Conte um pouco sobre você — prestadores podem ver isso antes de aceitar um pedido" />
              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{bio.length}/200 caracteres</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: '#6B7280' }}>Cidade</label>
                <input value={cidade} onChange={e => setCidade(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border focus:outline-none"
                  style={{ borderColor: '#E4E7E4' }} placeholder="Sua cidade" />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#6B7280' }}>Estado</label>
                <input value={estado} onChange={e => setEstado(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border focus:outline-none"
                  style={{ borderColor: '#E4E7E4' }} placeholder="SP" maxLength={2} />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1" style={{ color: '#6B7280' }}>Telefone / WhatsApp</label>
              <input value={telefone} onChange={e => setTelefone(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border focus:outline-none"
                style={{ borderColor: '#E4E7E4' }} placeholder="(16) 99999-9999" />
            </div>

            <div className="pt-2">
              <p className="text-sm font-medium mb-1" style={{ color: '#1F2937' }}>Redes sociais e site</p>
              <p className="text-xs mb-3" style={{ color: '#6B7280' }}>Opcional — aparece no seu perfil público.</p>
              <RedesSociaisForm links={redesSociais} onChange={setRedesSociais} />
            </div>
          </div>

          <button onClick={salvarPerfil} disabled={salvando}
            className="w-full mt-5 py-3 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: '#16A34A' }}>
            <Save size={15} /> {salvando ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </div>
      )}

      {/* ABA: PREFERÊNCIAS */}
      {aba === 'preferencias' && (
        <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid #E4E7E4' }}>
          <p className="text-sm font-medium mb-2" style={{ color: '#1F2937' }}>Serviços de interesse</p>
          <p className="text-xs mb-4" style={{ color: '#6B7280' }}>Selecione os tipos de serviço que você mais contrata. Usamos isso para personalizar sua experiência.</p>

          <div className="grid grid-cols-3 gap-2 mb-5">
            {servicosDisponiveis.map(s => (
              <button key={s.id} onClick={() => togglePreferencia(s.id)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl transition-colors"
                style={preferencias.includes(s.id)
                  ? { background: '#DCFCE7', border: '1.5px solid #16A34A' }
                  : { background: '#F3F6F2', border: '1px solid #E4E7E4' }}>
                <s.icon size={20} color={preferencias.includes(s.id) ? '#14853D' : '#6B7280'} />
                <span className="text-xs font-medium" style={{ color: preferencias.includes(s.id) ? '#14853D' : '#6B7280' }}>
                  {s.nome}
                </span>
              </button>
            ))}
          </div>

          <p className="text-sm font-medium mb-3" style={{ color: '#1F2937' }}>Notificações</p>
          <div className="space-y-3 mb-5">
            {[
              { label: 'Notificações por email', value: notifEmail, set: setNotifEmail },
              { label: 'Notificações push (celular)', value: notifPush, set: setNotifPush },
            ].map(n => (
              <label key={n.label} className="flex items-center justify-between p-3 rounded-xl cursor-pointer"
                style={{ background: '#F3F6F2' }}>
                <span className="text-sm" style={{ color: '#1F2937' }}>{n.label}</span>
                <div onClick={() => n.set(!n.value)}
                  className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0"
                  style={{ background: n.value ? '#16A34A' : '#E4E7E4' }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: n.value ? '22px' : '2px' }} />
                </div>
              </label>
            ))}
            <label className="flex items-center justify-between p-3 rounded-xl cursor-pointer"
              style={{ background: '#F3F6F2' }}>
              <div>
                <p className="text-sm" style={{ color: '#1F2937' }}>Perfil público</p>
                <p className="text-xs" style={{ color: '#6B7280' }}>Prestadores podem ver seu perfil e avaliações</p>
              </div>
              <div onClick={() => setPerfilPublico(!perfilPublico)}
                className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0"
                style={{ background: perfilPublico ? '#16A34A' : '#E4E7E4' }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                  style={{ left: perfilPublico ? '22px' : '2px' }} />
              </div>
            </label>
          </div>

          <button onClick={salvarPerfil} disabled={salvando}
            className="w-full py-3 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: '#16A34A' }}>
            <Save size={15} /> {salvando ? 'Salvando...' : 'Salvar preferências'}
          </button>
        </div>
      )}

      {/* ABA: AVALIAÇÕES RECEBIDAS */}
      {aba === 'avaliacoes' && (
        <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid #E4E7E4' }}>
          <p className="text-sm font-medium mb-4" style={{ color: '#1F2937' }}>
            Avaliações que recebi ({avaliacoesRecebidas.length})
          </p>
          {notaMedia && (
            <div className="flex items-center gap-3 mb-4 p-4 rounded-xl" style={{ background: '#F0FDF4' }}>
              <div className="text-3xl font-bold" style={{ color: '#16A34A' }}>{notaMedia}</div>
              <div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={16} fill={parseFloat(notaMedia) >= i ? '#F6C64D' : 'none'} color="#F6C64D" strokeWidth={1.5} />
                  ))}
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{avaliacoesRecebidas.length} avaliações de prestadores</p>
              </div>
            </div>
          )}
          {avaliacoesRecebidas.length === 0 ? (
            <div className="text-center py-10">
              <Star size={36} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
              <p className="text-sm" style={{ color: '#6B7280' }}>Nenhuma avaliação ainda.</p>
              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Prestadores avaliam clientes após a conclusão do serviço.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {avaliacoesRecebidas.map(a => (
                <div key={a.id} className="p-4 rounded-xl" style={{ background: '#F3F6F2' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#1F2937' }}>{a.prestadores?.nome}</p>
                      <p className="text-xs capitalize" style={{ color: '#6B7280' }}>{a.prestadores?.categoria_id}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={13} fill={a.nota >= i ? '#F6C64D' : 'none'} color="#F6C64D" strokeWidth={1.5} />
                      ))}
                    </div>
                  </div>
                  {a.comentario && <p className="text-sm" style={{ color: '#6B7280' }}>{a.comentario}</p>}
                  <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>{new Date(a.criado_em).toLocaleDateString('pt-BR')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA: AVALIAÇÕES FEITAS */}
      {aba === 'feitas' && (
        <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid #E4E7E4' }}>
          <p className="text-sm font-medium mb-4" style={{ color: '#1F2937' }}>
            Avaliações que fiz ({avaliacoesFeitasData.length})
          </p>
          {avaliacoesFeitasData.length === 0 ? (
            <div className="text-center py-10">
              <PenLine size={36} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
              <p className="text-sm" style={{ color: '#6B7280' }}>Você ainda não avaliou nenhum prestador.</p>
              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Após contratar um serviço, avalie o prestador para ajudar outros clientes.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {avaliacoesFeitasData.map(a => (
                <div key={a.id} onClick={() => navigate(`/profissional/${a.prestador_id}`)}
                  className="p-4 rounded-xl cursor-pointer hover:opacity-80" style={{ background: '#F3F6F2' }}>
                  <div className="flex items-center gap-3 mb-2">
                    {a.prestadores?.foto_perfil ? (
                      <img src={a.prestadores.foto_perfil} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-white flex-shrink-0"
                        style={{ background: '#16A34A' }}>
                        {a.prestadores?.nome?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: '#1F2937' }}>{a.prestadores?.nome}</p>
                      <p className="text-xs capitalize" style={{ color: '#6B7280' }}>{a.prestadores?.categoria_id}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={13} fill={a.nota >= i ? '#F6C64D' : 'none'} color="#F6C64D" strokeWidth={1.5} />
                      ))}
                    </div>
                  </div>
                  {a.comentario && <p className="text-sm" style={{ color: '#6B7280' }}>{a.comentario}</p>}
                  <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>{new Date(a.criado_em).toLocaleDateString('pt-BR')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA: HISTÓRICO */}
      {aba === 'historico' && (
        <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid #E4E7E4' }}>
          <p className="text-sm font-medium mb-4" style={{ color: '#1F2937' }}>Serviços realizados ({historico.length})</p>
          {historico.length === 0 ? (
            <div className="text-center py-10">
              <Wrench size={36} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
              <p className="text-sm" style={{ color: '#6B7280' }}>Nenhum serviço registrado ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historico.map(h => (
                <div key={h.id} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:opacity-80"
                  style={{ background: '#F3F6F2' }}
                  onClick={() => navigate(`/profissional/${h.prestador_id}`)}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#DCFCE7' }}>
                    <Wrench size={17} color="#14853D" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#1F2937' }}>{h.titulo}</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>{h.prestadores?.nome} · {h.prestadores?.categoria_id}</p>
                    {h.valor && <p className="text-xs font-medium" style={{ color: '#16A34A' }}>R${h.valor}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#DCFCE7', color: '#14853D' }}>{h.status}</span>
                    <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                      {h.data_servico ? new Date(h.data_servico).toLocaleDateString('pt-BR') : '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA: PEDIDOS */}
      {aba === 'pedidos' && (
        <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid #E4E7E4' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium" style={{ color: '#1F2937' }}>Meus pedidos ({pedidos.length})</p>
            <button onClick={() => navigate('/pedidos/novo')}
              className="text-xs px-3 py-1.5 rounded-lg text-white font-medium" style={{ background: '#16A34A' }}>
              + Novo
            </button>
          </div>
          {pedidos.length === 0 ? (
            <div className="text-center py-10">
              <ClipboardList size={36} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
              <p className="text-sm" style={{ color: '#6B7280' }}>Nenhum pedido ainda.</p>
              <button onClick={() => navigate('/pedidos/novo')}
                className="mt-3 px-5 py-2.5 text-white text-sm font-medium rounded-xl" style={{ background: '#16A34A' }}>
                Postar meu primeiro pedido
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {pedidos.map(p => (
                <div key={p.id} onClick={() => navigate(`/pedidos/${p.id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:opacity-80" style={{ background: '#F3F6F2' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#DCFCE7' }}>
                    <Wrench size={16} color="#14853D" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#1F2937' }}>{p.titulo}</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>{p.cidade}, {p.estado} · {new Date(p.criado_em).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 capitalize"
                    style={p.status === 'aberto' ? { background: '#DCFCE7', color: '#14853D' } : { background: '#F3F6F2', color: '#6B7280' }}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA: CONFIGURAÇÕES */}
      {aba === 'config' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4" style={{ border: '0.5px solid #E4E7E4' }}>
            <p className="text-sm font-medium mb-3" style={{ color: '#1F2937' }}>Conta</p>
            {[
              { icon: Gift, label: 'Programa de indicação', path: '/indicacao' },
              { icon: Info, label: 'Como funciona o Prestador', path: '/como-funciona' },
              { icon: FileText, label: 'Termos de uso e privacidade', path: '/termos' },
              { icon: Shield, label: 'Alterar senha', path: '/esqueci-senha' },
              { icon: Crown, label: 'Quero ser prestador', path: '/planos' },
            ].map(item => (
              <button key={item.path} onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:opacity-80 text-left mb-1"
                style={{ background: '#F3F6F2' }}>
                <item.icon size={17} color="#6B7280" />
                <span className="text-sm flex-1" style={{ color: '#1F2937' }}>{item.label}</span>
                <ChevronRight size={15} color="#9CA3AF" />
              </button>
            ))}
          </div>

          <button onClick={sair}
            className="w-full py-3 text-sm font-medium rounded-xl hover:opacity-80 flex items-center justify-center gap-2"
            style={{ border: '0.5px solid #FEF2F2', color: '#B91C1C', background: '#fff' }}>
            <LogOut size={15} />
            Sair da conta
          </button>

          <button onClick={async () => {
            if (window.confirm('Tem certeza? Todos os seus dados serão removidos permanentemente.')) {
              const { data: { session } } = await supabase.auth.getSession()
              await fetch('/api/excluir-conta', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${session?.access_token}`,
                },
              })
              await sair()
            }
          }}
            className="w-full py-2.5 text-xs rounded-xl hover:opacity-80"
            style={{ color: '#9CA3AF' }}>
            Excluir minha conta e dados (LGPD)
          </button>
        </div>
      )}
    </div>
  )
}
