import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Busca from './pages/Busca'
import Perfil from './pages/Perfil'
import Planos from './pages/Planos'
import CadastroPro from './pages/CadastroPro'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import AuthCallback from './pages/AuthCallback'
import PainelPrestador from './pages/PainelPrestador'
import Chat from './pages/Chat'
import Conversas from './pages/Conversas'
import Pedidos from './pages/Pedidos'
import NovoPedido from './pages/NovoPedido'
import DetalhePedido from './pages/DetalhePedido'
import Indicacao from './pages/Indicacao'
import Convite from './pages/Convite'
import EsqueciSenha from './pages/EsqueciSenha'
import NovaSenha from './pages/NovaSenha'
import Pagamento from './pages/Pagamento'
import ZonasQuentes from './pages/ZonasQuentes'
import AssistentePerfil from './pages/AssistentePerfil'
import Boost from './pages/Boost'
import Disponibilidade from './pages/Disponibilidade'
import Ganhos from './pages/Ganhos'
import Niveis from './pages/Niveis'
import SEOCategoria from './pages/SEOCategoria'
import SEOCidadeCategoria from './pages/SEOCidadeCategoria'
import Termos from './pages/Termos'
import NotFound from './pages/NotFound'
import PerfilCliente from './pages/PerfilCliente'
import ComoFunciona from './pages/ComoFunciona'
import Onboarding from './pages/Onboarding'
import BottomNav from './components/BottomNav'
import CentralNotificacoes from './components/CentralNotificacoes'
import Logo from './components/Logo'
import InstallPWA from './components/InstallPWA'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { supabase } from './lib/supabase'

function Navbar() {
  const { usuario, sair } = useAuth()
  const [naoLidas, setNaoLidas] = useState(0)
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => {
    if (!usuario) return
    const buscarNaoLidas = async () => {
      const { data: prest } = await supabase
        .from('prestadores').select('id').eq('user_id', usuario.id).single()
      if (prest) {
        const { data } = await supabase
          .from('conversas').select('nao_lidas_prestador').eq('prestador_id', prest.id)
        setNaoLidas((data || []).reduce((acc, c) => acc + (c.nao_lidas_prestador || 0), 0))
      } else {
        const { data } = await supabase
          .from('conversas').select('nao_lidas_cliente').eq('cliente_user_id', usuario.id)
        setNaoLidas((data || []).reduce((acc, c) => acc + (c.nao_lidas_cliente || 0), 0))
      }
    }
    buscarNaoLidas()
    const channel = supabase.channel('navbar_nao_lidas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversas' }, buscarNaoLidas)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [usuario])

  return (
    <>
      <nav style={{ background: '#fff', borderBottom: '1px solid #F3F4F6', position: 'sticky', top: 0, zIndex: 50 }}
        className="px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between" style={{ height: 60 }}>

          {/* Logo */}
          <Link to="/" onClick={() => setMenuAberto(false)}>
            <Logo size={36} />
          </Link>

          {/* Links desktop */}
          <div className="hidden sm:flex items-center gap-8">
            {[
              { to: '/busca', label: 'Buscar' },
              { to: '/como-funciona', label: 'Como funciona' },
              { to: '/planos', label: 'Para prestadores' },
            ].map(l => (
              <Link key={l.to} to={l.to}
                style={{ color: '#374151', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
                className="hover:opacity-70 transition-opacity">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Ações do usuário */}
          <div className="flex items-center gap-3">
            {usuario ? (
              <>
                {/* Notificações */}
                <CentralNotificacoes />

                {/* Mensagens */}
                <Link to="/mensagens" className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:opacity-80"
                  style={{ color: 'rgba(255,255,255,0.9)' }}>
                  <i className="ti ti-message" style={{ fontSize: 22 }} aria-hidden="true"></i>
                  {naoLidas > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center font-medium"
                      style={{ background: '#FFC857', color: '#5C4400', fontSize: 10 }}>
                      {naoLidas > 9 ? '9+' : naoLidas}
                    </span>
                  )}
                </Link>

                {/* Avatar com menu */}
                <div className="relative">
                  <button onClick={() => setMenuAberto(!menuAberto)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:opacity-90 transition-opacity"
                    style={{ background: '#FFC857' }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: '#5C3A00', color: '#FFC857' }}>
                      {(usuario.user_metadata?.nome || usuario.email || 'U')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-bold hidden sm:block" style={{ color: '#5C3A00' }}>
                      Meu perfil
                    </span>
                    <i className="ti ti-chevron-down hidden sm:block" style={{ fontSize: 14, color: '#5C3A00' }} aria-hidden="true"></i>
                  </button>

                  {menuAberto && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuAberto(false)} />
                      <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl z-50 overflow-hidden py-1"
                        style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '0.5px solid #DDE3DD' }}>
                        <div className="px-4 py-3" style={{ borderBottom: '0.5px solid #F0F2F0' }}>
                          <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>
                            {usuario.user_metadata?.nome || 'Usuário'}
                          </p>
                          <p className="text-xs" style={{ color: '#7C9485' }}>{usuario.email}</p>
                        </div>
                        {[
                          { label: 'Meu perfil', path: '/perfil-cliente', icon: 'ti-user' },
                          { label: 'Painel do prestador', path: '/painel', icon: 'ti-tool' },
                          { label: 'Mensagens', path: '/mensagens', icon: 'ti-message' },
                          { label: 'Meus pedidos', path: '/pedidos', icon: 'ti-clipboard-list' },
                          { label: 'Indicar amigos', path: '/indicacao', icon: 'ti-gift' },
                        ].map(item => (
                          <Link key={item.path} to={item.path}
                            onClick={() => setMenuAberto(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:opacity-80 transition-opacity"
                            style={{ color: '#1F2D24' }}>
                            <i className={`ti ${item.icon}`} style={{ fontSize: 16, color: '#7C9485' }} aria-hidden="true"></i>
                            <span className="text-sm">{item.label}</span>
                          </Link>
                        ))}
                        <div style={{ borderTop: '0.5px solid #F0F2F0' }}>
                          <button onClick={() => { sair(); setMenuAberto(false) }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:opacity-80 transition-opacity text-left"
                            style={{ color: '#A32D2D' }}>
                            <i className="ti ti-logout" style={{ fontSize: 16 }} aria-hidden="true"></i>
                            <span className="text-sm">Sair</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="text-sm font-semibold hover:opacity-70 transition-opacity px-3 py-2 rounded-lg"
                  style={{ color: '#374151' }}>
                  Entrar
                </Link>
                <Link to="/cadastro"
                  className="text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity btn-press"
                  style={{ background: '#16A34A', color: '#fff' }}>
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-6 pb-20 sm:pb-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/busca" element={<Busca />} />
              <Route path="/profissional/:id" element={<Perfil />} />
              <Route path="/planos" element={<Planos />} />
              <Route path="/cadastro-pro" element={<CadastroPro />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/painel" element={<PainelPrestador />} />
              <Route path="/mensagens" element={<Conversas />} />
              <Route path="/chat/:conversaId" element={<Chat />} />
              <Route path="/pedidos" element={<Pedidos />} />
              <Route path="/pedidos/novo" element={<NovoPedido />} />
              <Route path="/pedidos/:id" element={<DetalhePedido />} />
              <Route path="/indicacao" element={<Indicacao />} />
              <Route path="/convite" element={<Convite />} />
              <Route path="/esqueci-senha" element={<EsqueciSenha />} />
              <Route path="/nova-senha" element={<NovaSenha />} />
              <Route path="/pagamento" element={<Pagamento />} />
              <Route path="/zonas" element={<ZonasQuentes />} />
              <Route path="/assistente" element={<AssistentePerfil />} />
              <Route path="/boost" element={<Boost />} />
              <Route path="/disponibilidade" element={<Disponibilidade />} />
              <Route path="/ganhos" element={<Ganhos />} />
              <Route path="/niveis" element={<Niveis />} />
              <Route path="/s/:categoria" element={<SEOCategoria />} />
              <Route path="/s/:categoria/:cidade" element={<SEOCidadeCategoria />} />
              <Route path="/termos" element={<Termos />} />
              <Route path="/perfil-cliente" element={<PerfilCliente />} />
              <Route path="/como-funciona" element={<ComoFunciona />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <InstallPWA />
          <BottomNav />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
