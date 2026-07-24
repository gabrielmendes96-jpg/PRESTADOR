import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useCategorias } from '../lib/hooks'
import Portfolio from '../components/Portfolio'
import HashtagsInput from '../components/HashtagsInput'
import FotoPerfilUpload from '../components/FotoPerfilUpload'
import RedesSociaisForm from '../components/RedesSociaisForm'

const menuItens = [
  { id: 'perfil', label: 'Meu Perfil', icon: 'ti-user' },
  { id: 'portfolio', label: 'Portfólio', icon: 'ti-photo' },
  { id: 'hashtags', label: 'Meus Serviços', icon: 'ti-tag' },
  { id: 'assistente', label: 'Assistente IA', icon: 'ti-robot' },
  { id: 'boost', label: 'Impulsionar', icon: 'ti-rocket' },
  { id: 'disponibilidade', label: 'Disponibilidade', icon: 'ti-calendar' },
  { id: 'ganhos', label: 'Desempenho', icon: 'ti-chart-bar' },
  { id: 'niveis', label: 'Meu Nível', icon: 'ti-trophy' },
  { id: 'pedidos', label: 'Pedidos', icon: 'ti-clipboard-list' },
  { id: 'avaliacoes', label: 'Avaliações', icon: 'ti-star' },
  { id: 'mensagens', label: 'Mensagens', icon: 'ti-message' },
  { id: 'indicacao', label: 'Indique e Ganhe', icon: 'ti-gift' },
  { id: 'assinatura', label: 'Assinatura', icon: 'ti-credit-card' },
]

export default function PainelPrestador() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [aba, setAba] = useState('perfil')
  const [prestador, setPrestador] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [avaliacoes, setAvaliacoes] = useState([])
  const [mensagens, setMensagens] = useState([])
  const { categorias } = useCategorias()

  // Redireciona se não estiver logado
  useEffect(() => {
    if (!usuario) navigate('/login')
  }, [usuario, navigate])

  // Carrega dados do prestador
  useEffect(() => {
    if (!usuario) return
    async function carregar() {
      setCarregando(true)
      const { data } = await supabase
        .from('prestadores')
        .select('*')
        .eq('user_id', usuario.id)
        .single()
      setPrestador(data || null)
      setCarregando(false)

      if (data) {
        const { data: avs } = await supabase
          .from('avaliacoes')
          .select('*')
          .eq('prestador_id', data.id)
          .order('criado_em', { ascending: false })
        setAvaliacoes(avs || [])

        const { data: msgs } = await supabase
          .from('mensagens')
          .select('*')
          .eq('prestador_id', data.id)
          .order('criado_em', { ascending: false })
        setMensagens(msgs || [])
      }
    }
    carregar()
  }, [usuario])

  const salvarPerfil = async () => {
    if (!prestador) return
    setSalvando(true)
    await supabase
      .from('prestadores')
      .update({
        nome: prestador.nome,
        descricao: prestador.descricao,
        cidade: prestador.cidade,
        estado: prestador.estado,
        whatsapp: prestador.whatsapp,
        categoria_id: prestador.categoria_id,
        raio_atendimento: prestador.raio_atendimento,
        disponivel: prestador.disponivel,
        redes_sociais: prestador.redes_sociais || {},
        geocodificado: false, // força re-geocodificação
      })
      .eq('user_id', usuario.id)

    // Geocodificar em background
    fetch('/api/geocodificar', { method: 'POST' }).catch(() => {})

    setSalvando(false)
    setSucesso(true)
    setTimeout(() => setSucesso(false), 3000)
  }

  if (carregando) return (
    <div className="flex items-center justify-center min-h-64">
      <p className="text-sm" style={{ color: '#7C9485' }}>Carregando painel...</p>
    </div>
  )

  if (!prestador) return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="text-5xl mb-4">🔧</div>
      <h2 className="text-xl font-semibold mb-2" style={{ color: '#1F2D24' }}>
        Você ainda não tem um perfil de prestador
      </h2>
      <p className="text-sm mb-6" style={{ color: '#7C9485' }}>
        Crie seu perfil para começar a receber clientes.
      </p>
      <button
        onClick={() => navigate('/cadastro-pro')}
        className="px-6 py-3 text-white text-sm font-medium rounded-xl hover:opacity-90"
        style={{ background: '#1FA855' }}
      >
        Criar meu perfil
      </button>
    </div>
  )

  return (
    <div style={{ display: 'flex', gap: '24px', minHeight: '80vh', alignItems: 'flex-start' }}>

      {/* Menu lateral */}
      <aside style={{ width: '200px', flexShrink: 0 }}>
        <div className="bg-white rounded-2xl p-4" style={{ border: '0.5px solid #EDE3CE', position: 'sticky', top: '80px' }}>
          <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: '0.5px solid #EDE3CE' }}>
            {prestador.foto_perfil ? (
              <img src={prestador.foto_perfil} alt={prestador.nome}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0" style={{ border: '1px solid #1FA855' }} />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm flex-shrink-0" style={{ background: '#E3F6E9', color: '#0F6E3D' }}>
                {prestador.nome?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>{prestador.nome?.split(' ')[0]}</p>
              <p className="text-xs capitalize" style={{ color: '#7C9485' }}>{prestador.plano_id}</p>
            </div>
          </div>

          <nav>
            {menuItens.map(item => (
              <button
                key={item.id}
                onClick={() => setAba(item.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '12px', fontSize: '14px',
                  marginBottom: '4px', textAlign: 'left', border: 'none', cursor: 'pointer',
                  background: aba === item.id ? '#E3F6E9' : 'transparent',
                  color: aba === item.id ? '#0F6E3D' : '#7C9485',
                  fontWeight: aba === item.id ? 500 : 400,
                }}
              >
                <i className={`ti ${item.icon}`} style={{ fontSize: '16px' }} aria-hidden="true"></i>
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{ borderTop: '0.5px solid #EDE3CE', marginTop: '12px', paddingTop: '12px' }}>
            <button
              onClick={() => navigate(`/profissional/${prestador.id}`)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '12px', fontSize: '14px',
                textAlign: 'left', border: 'none', cursor: 'pointer',
                background: 'transparent', color: '#1FA855',
              }}
            >
              <i className="ti ti-external-link" style={{ fontSize: '16px' }} aria-hidden="true"></i>
              Ver meu perfil
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo */}
      <main style={{ flex: 1, minWidth: 0 }}>

        {/* ABA: PERFIL */}
        {aba === 'perfil' && (
          <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #EDE3CE' }}>
            <h2 className="text-lg font-semibold mb-5" style={{ color: '#1F2D24' }}>Editar perfil</h2>

            {/* Foto de perfil */}
            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl" style={{ background: '#F8F9F8' }}>
              <FotoPerfilUpload
                prestadorId={prestador.id}
                fotoAtual={prestador.foto_perfil}
                onAtualizar={(url) => setPrestador({ ...prestador, foto_perfil: url })}
              />
              <div>
                <p className="text-sm font-medium mb-0.5" style={{ color: '#1F2D24' }}>Foto de perfil</p>
                <p className="text-xs" style={{ color: '#7C9485' }}>Clique na foto para alterar. Profissionais com foto recebem 3x mais contatos.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Nome completo</label>
                <input
                  type="text"
                  value={prestador.nome || ''}
                  onChange={e => setPrestador({ ...prestador, nome: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none"
                  style={{ border: '0.5px solid #EDE3CE', background: '#FAF6EE' }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>WhatsApp</label>
                <input
                  type="text"
                  value={prestador.whatsapp || ''}
                  onChange={e => setPrestador({ ...prestador, whatsapp: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none"
                  style={{ border: '0.5px solid #EDE3CE', background: '#FAF6EE' }}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Categoria</label>
                <select
                  value={prestador.categoria_id || ''}
                  onChange={e => setPrestador({ ...prestador, categoria_id: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none"
                  style={{ border: '0.5px solid #EDE3CE', background: '#FAF6EE' }}
                >
                  <option value="">Selecione</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Raio de atendimento (km)</label>
                <input
                  type="number"
                  value={prestador.raio_atendimento || 30}
                  onChange={e => setPrestador({ ...prestador, raio_atendimento: parseInt(e.target.value) })}
                  className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none"
                  style={{ border: '0.5px solid #EDE3CE', background: '#FAF6EE' }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Cidade</label>
                <input
                  type="text"
                  value={prestador.cidade || ''}
                  onChange={e => setPrestador({ ...prestador, cidade: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none"
                  style={{ border: '0.5px solid #EDE3CE', background: '#FAF6EE' }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Estado</label>
                <input
                  type="text"
                  value={prestador.estado || ''}
                  onChange={e => setPrestador({ ...prestador, estado: e.target.value })}
                  maxLength={2}
                  className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none"
                  style={{ border: '0.5px solid #EDE3CE', background: '#FAF6EE' }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Sobre você</label>
              <textarea
                value={prestador.descricao || ''}
                onChange={e => setPrestador({ ...prestador, descricao: e.target.value })}
                rows={4}
                className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none resize-none"
                style={{ border: '0.5px solid #EDE3CE', background: '#FAF6EE' }}
                placeholder="Descreva sua experiência e serviços..."
              />
            </div>

            <div className="flex items-center gap-3 mb-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prestador.disponivel || false}
                  onChange={e => setPrestador({ ...prestador, disponivel: e.target.checked })}
                />
                <span className="text-sm" style={{ color: '#1F2D24' }}>Disponível para novos clientes</span>
              </label>
            </div>

            {/* Redes sociais */}
            <div className="mb-5 p-4 rounded-xl" style={{ background: '#F8F9F8' }}>
              <p className="text-sm font-medium mb-1" style={{ color: '#1F2D24' }}>Redes sociais e site</p>
              <p className="text-xs mb-4" style={{ color: '#7C9485' }}>Adicione seus perfis para que clientes possam te encontrar em outras plataformas.</p>
              <RedesSociaisForm
                links={prestador.redes_sociais || {}}
                onChange={redes => setPrestador({ ...prestador, redes_sociais: redes })}
              />
            </div>

            {sucesso && (
              <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: '#E3F6E9', color: '#0F6E3D' }}>
                ✓ Perfil atualizado com sucesso!
              </div>
            )}

            <button
              onClick={salvarPerfil}
              disabled={salvando}
              className="px-6 py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-60"
              style={{ background: '#1FA855' }}
            >
              {salvando ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        )}

        {/* ABA: PORTFÓLIO */}
        {aba === 'portfolio' && (
          <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #EDE3CE' }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: '#1F2D24' }}>Meu portfólio</h2>
            <p className="text-sm mb-5" style={{ color: '#7C9485' }}>
              Adicione fotos e vídeos dos serviços que você já realizou. Perfis com fotos recebem 3x mais contatos!
            </p>
            <Portfolio prestadorId={prestador.id} />
          </div>
        )}

        {/* ABA: DISPONIBILIDADE */}
        {aba === 'disponibilidade' && (
          <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #DDE3DD' }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: '#1F2D24' }}>📅 Calendário de Disponibilidade</h2>
            <p className="text-sm mb-5" style={{ color: '#7C9485' }}>Marque os dias que você está disponível para atender clientes.</p>
            <button onClick={() => navigate('/disponibilidade')}
              className="w-full py-3 text-white text-sm font-medium rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: '#1FA855' }}>
              <i className="ti ti-calendar" style={{ fontSize: 16 }} aria-hidden="true"></i>
              Abrir calendário
            </button>
          </div>
        )}

        {/* ABA: DESEMPENHO */}
        {aba === 'ganhos' && (
          <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #DDE3DD' }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: '#1F2D24' }}>📊 Desempenho</h2>
            <p className="text-sm mb-5" style={{ color: '#7C9485' }}>Veja quantas pessoas viram seu perfil e como você está evoluindo.</p>
            <button onClick={() => navigate('/ganhos')}
              className="w-full py-3 text-white text-sm font-medium rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: '#1FA855' }}>
              <i className="ti ti-chart-bar" style={{ fontSize: 16 }} aria-hidden="true"></i>
              Ver meu desempenho
            </button>
          </div>
        )}

        {/* ABA: NÍVEIS */}
        {aba === 'niveis' && (
          <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #DDE3DD' }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: '#1F2D24' }}>🏆 Programa de Níveis</h2>
            <p className="text-sm mb-4" style={{ color: '#7C9485' }}>Evolua e ganhe benefícios exclusivos na plataforma.</p>
            <div className="flex gap-2 mb-5">
              {[{ emoji: '🥉', nome: 'Bronze' }, { emoji: '🥈', nome: 'Prata' }, { emoji: '🥇', nome: 'Ouro' }, { emoji: '👑', nome: 'Embaixador' }].map(n => (
                <div key={n.nome} className="flex-1 text-center p-2 rounded-xl" style={{ background: '#F8F9F8' }}>
                  <div style={{ fontSize: 22 }}>{n.emoji}</div>
                  <p className="text-xs mt-1" style={{ color: '#7C9485' }}>{n.nome}</p>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/niveis')}
              className="w-full py-3 text-white text-sm font-medium rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: '#1FA855' }}>
              <i className="ti ti-trophy" style={{ fontSize: 16 }} aria-hidden="true"></i>
              Ver meu nível
            </button>
          </div>
        )}
        {aba === 'boost' && (
          <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #DDE3DD' }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: '#1F2D24' }}>🚀 Impulsionar perfil</h2>
            <p className="text-sm mb-5" style={{ color: '#7C9485' }}>
              Apareça no topo das buscas e na home para mais clientes te encontrarem.
            </p>
            <div className="space-y-3 mb-5">
              {[
                { emoji: '🔝', titulo: 'Topo das buscas', desc: 'Antes de todos na sua categoria' },
                { emoji: '🏠', titulo: 'Banner na home', desc: 'Visível para todos os clientes' },
                { emoji: '⭐', titulo: 'Badge de destaque', desc: 'Chama atenção no seu card' },
              ].map(i => (
                <div key={i.titulo} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F8F9F8' }}>
                  <span style={{ fontSize: 20 }}>{i.emoji}</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>{i.titulo}</p>
                    <p className="text-xs" style={{ color: '#7C9485' }}>{i.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/boost')}
              className="w-full py-3 text-white text-sm font-medium rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: '#1FA855' }}>
              <i className="ti ti-rocket" style={{ fontSize: 16 }} aria-hidden="true"></i>
              Ver planos de impulsionamento
            </button>
          </div>
        )}
        {aba === 'assistente' && (
          <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #DDE3DD' }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: '#1F2D24' }}>🤖 Assistente de Perfil</h2>
            <p className="text-sm mb-5" style={{ color: '#7C9485' }}>
              A IA analisa seu perfil e te ajuda a melhorá-lo — bio, hashtags e dicas de fotos.
            </p>
            <button
              onClick={() => navigate('/assistente')}
              className="w-full py-3 text-white text-sm font-medium rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: '#1FA855' }}>
              <i className="ti ti-robot" style={{ fontSize: 18 }} aria-hidden="true"></i>
              Abrir Assistente de Perfil
            </button>
          </div>
        )}
        {aba === 'pedidos' && (
          <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #EDE3CE' }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: '#1F2D24' }}>Pedidos disponíveis</h2>
            {prestador.plano_id !== 'premium' ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">⭐</div>
                <p className="text-sm font-medium mb-1" style={{ color: '#1F2D24' }}>Recurso exclusivo Premium</p>
                <p className="text-xs mb-4" style={{ color: '#7C9485' }}>
                  Faça upgrade para o plano Premium e acesse pedidos de clientes que precisam do seu serviço agora.
                </p>
                <button onClick={() => navigate('/planos')}
                  className="px-5 py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90"
                  style={{ background: '#1FA855' }}>
                  Ver planos
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm mb-4" style={{ color: '#7C9485' }}>
                  Como prestador Premium, você pode se candidatar a todos os pedidos abertos da sua categoria.
                </p>
                <button onClick={() => navigate('/pedidos')}
                  className="flex items-center gap-2 px-5 py-3 text-white text-sm font-medium rounded-xl hover:opacity-90"
                  style={{ background: '#1FA855' }}>
                  <i className="ti ti-clipboard-list" style={{ fontSize: '16px' }} aria-hidden="true"></i>
                  Ver pedidos disponíveis
                </button>
              </div>
            )}
          </div>
        )}
        {aba === 'hashtags' && (
          <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #EDE3CE' }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: '#1F2D24' }}>Meus serviços</h2>
            <p className="text-sm mb-5" style={{ color: '#7C9485' }}>
              Adicione hashtags dos serviços que você realiza. Os clientes podem buscar por elas e encontrar você mais facilmente.
              Ex: <span style={{ color: '#1FA855' }}>#pintura #reboco #reforma #banheiro #cozinha</span>
            </p>
            <HashtagsInput prestadorId={prestador.id} />
          </div>
        )}

        {/* ABA: INDIQUE E GANHE */}
        {aba === 'indicacao' && (
          <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #EDE3CE' }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: '#1F2D24' }}>Indique e Ganhe</h2>
            <p className="text-sm mb-5" style={{ color: '#7C9485' }}>
              Indique prestadores e ganhe meses grátis na sua assinatura!
            </p>
            <div className="space-y-3 mb-5">
              {[
                { meta: 5, recompensa: '1 mês grátis' },
                { meta: 10, recompensa: '2 meses grátis' },
                { meta: 20, recompensa: '4 meses grátis' },
                { meta: 50, recompensa: '1 ano grátis' },
                { meta: 100, recompensa: 'Sempre grátis + Embaixador' },
              ].map(n => (
                <div key={n.meta} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#FAF6EE' }}>
                  <span className="text-sm" style={{ color: '#1F2D24' }}>{n.meta} indicados ativos</span>
                  <span className="text-sm font-medium" style={{ color: '#1FA855' }}>{n.recompensa}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/indicacao')}
              className="w-full py-3 text-white text-sm font-medium rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: '#1FA855' }}
            >
              <i className="ti ti-gift" style={{ fontSize: '16px' }} aria-hidden="true"></i>
              Ver meu link de indicação
            </button>
          </div>
        )}
        {aba === 'avaliacoes' && (
          <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #EDE3CE' }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: '#1F2D24' }}>Minhas avaliações</h2>
            <p className="text-sm mb-5" style={{ color: '#7C9485' }}>{avaliacoes.length} avaliação{avaliacoes.length !== 1 ? 'ões' : ''} recebida{avaliacoes.length !== 1 ? 's' : ''}</p>

            {avaliacoes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">⭐</div>
                <p className="text-sm" style={{ color: '#7C9485' }}>Você ainda não recebeu avaliações.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {avaliacoes.map(a => (
                  <div key={a.id} className="p-4 rounded-xl" style={{ background: '#FAF6EE' }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>{a.autor_nome}</p>
                      <span style={{ color: '#FFC857' }}>{'★'.repeat(a.nota)}{'☆'.repeat(5 - a.nota)}</span>
                    </div>
                    <p className="text-sm" style={{ color: '#5F6F65' }}>{a.comentario}</p>
                    <p className="text-xs mt-2" style={{ color: '#C9BFA8' }}>
                      {new Date(a.criado_em).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA: MENSAGENS */}
        {aba === 'mensagens' && (
          <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #EDE3CE' }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: '#1F2D24' }}>Mensagens</h2>
            <p className="text-sm mb-5" style={{ color: '#7C9485' }}>Veja todas as suas conversas com clientes.</p>
            <button
              onClick={() => navigate('/mensagens')}
              className="flex items-center gap-2 px-5 py-3 text-white text-sm font-medium rounded-xl hover:opacity-90"
              style={{ background: '#1FA855' }}
            >
              <i className="ti ti-message" style={{ fontSize: '16px' }} aria-hidden="true"></i>
              Abrir mensagens
            </button>
          </div>
        )}

        {/* ABA: ASSINATURA */}
        {aba === 'assinatura' && (
          <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #EDE3CE' }}>
            <h2 className="text-lg font-semibold mb-5" style={{ color: '#1F2D24' }}>Minha assinatura</h2>

            <div className="p-5 rounded-2xl mb-5" style={{ background: '#E3F6E9', border: '0.5px solid #1FA855' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium capitalize" style={{ color: '#1F2D24' }}>
                  Plano {prestador.plano_id}
                </p>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: '#1FA855', color: '#fff' }}>
                  {prestador.plano_status === 'ativo' ? 'Ativo' : prestador.plano_status}
                </span>
              </div>
              <p className="text-sm" style={{ color: '#0F6E3D' }}>
                {prestador.plano_id === 'basico' && 'R$49/mês — Perfil básico na plataforma'}
                {prestador.plano_id === 'profissional' && 'R$99/mês — Destaque nos resultados + selo verificado'}
                {prestador.plano_id === 'premium' && 'R$199/mês — Topo das buscas + suporte prioritário'}
              </p>
            </div>

            <p className="text-sm font-medium mb-3" style={{ color: '#1F2D24' }}>Quer mudar de plano?</p>
            <div className="flex flex-col gap-3">
              {[
                { id: 'basico', nome: 'Básico', preco: 'R$49/mês' },
                { id: 'profissional', nome: 'Profissional', preco: 'R$99/mês' },
                { id: 'premium', nome: 'Premium', preco: 'R$199/mês' },
              ].map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={prestador.plano_id === p.id
                    ? { border: '2px solid #1FA855', background: '#F4FAF6' }
                    : { border: '0.5px solid #EDE3CE' }
                  }
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>{p.nome}</p>
                    <p className="text-xs" style={{ color: '#7C9485' }}>{p.preco}</p>
                  </div>
                  {prestador.plano_id === p.id ? (
                    <span className="text-xs" style={{ color: '#1FA855' }}>✓ Plano atual</span>
                  ) : (
                    <button
                      onClick={() => navigate('/planos')}
                      className="text-xs px-3 py-1.5 rounded-lg hover:opacity-90"
                      style={{ background: '#1FA855', color: '#fff' }}
                    >
                      Mudar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
