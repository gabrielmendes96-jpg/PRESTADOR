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
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <>
      <nav style={{
        background: '#fff', borderBottom: '1px solid #E4E7E4',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
      }} className="px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between" style={{ height: 64 }}>

          <Link to="/" onClick={() => setMenuAberto(false)}>
            <Logo size={38} />
          </Link>

          <div className="hidden sm:flex items-center gap-8">
            {[
              { to: '/como-funciona', label: 'Como funciona' },
              { to: '/busca', label: 'Para quem é' },
              { to: '/busca', label: 'Categorias' },
            ].map(l => (
              <Link key={l.label} to={l.to}
                style={{ color: '#6B7280', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseOver={e => e.target.style.color = '#1F2937'}
                onMouseOut={e => e.target.style.color = '#6B7280'}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {usuario ? (
              <div className="relative">
                <button onClick={() => setMenuAberto(!menuAberto)}
                  className="btn-press flex items-center gap-2"
                  style={{
                    background: '#F3F6F2', borderRadius: 14, padding: '8px 14px',
                    border: '1px solid #E4E7E4', cursor: 'pointer',
                  }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', background: '#16A34A',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, color: '#fff',
                  }}>
                    {(usuario.user_metadata?.nome || usuario.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:block" style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
                    Meu perfil
                  </span>
                  <i className="ti ti-chevron-down" style={{ fontSize: 14, color: '#6B7280' }} aria-hidden="true"></i>
                </button>

                {menuAberto && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuAberto(false)} />
                    <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl z-50 overflow-hidden py-2"
                      style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.12)', border: '1px solid #E4E7E4' }}>
                      <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid #F3F6F2' }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#1F2937' }}>
                          {usuario.user_metadata?.nome || 'Usuário'}
                        </p>
                        <p style={{ fontSize: 12, color: '#6B7280' }}>{usuario.email}</p>
                      </div>
                      {[
                        { label: 'Meu perfil', path: '/perfil-cliente', icon: 'ti-user' },
                        { label: 'Painel do prestador', path: '/painel', icon: 'ti-tool' },
                        { label: 'Mensagens', path: '/mensagens', icon: 'ti-message' },
                        { label: 'Meus pedidos', path: '/pedidos', icon: 'ti-clipboard-list' },
                        { label: 'Indicar amigos', path: '/indicacao', icon: 'ti-gift' },
                      ].map(item => (
                        <Link key={item.path} to={item.path} onClick={() => setMenuAberto(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: '#1F2937', textDecoration: 'none', transition: 'background 0.15s' }}
                          onMouseOver={e => e.currentTarget.style.background = '#F3F6F2'}
                          onMouseOut={e => e.currentTarget.style.background = 'none'}>
                          <i className={`ti ${item.icon}`} style={{ fontSize: 16, color: '#6B7280' }} aria-hidden="true"></i>
                          <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                        </Link>
                      ))}
                      <div style={{ borderTop: '1px solid #F3F6F2', marginTop: 4, paddingTop: 4 }}>
                        <button onClick={() => { sair(); setMenuAberto(false) }}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                          <i className="ti ti-logout" style={{ fontSize: 16 }} aria-hidden="true"></i>
                          Sair
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  style={{ color: '#6B7280', fontSize: 14, fontWeight: 600, textDecoration: 'none', padding: '8px 14px' }}
                  className="btn-press">
                  Entrar
                </Link>
                <Link to="/cadastro"
                  className="btn-press"
                  style={{
                    background: '#F6C64D', color: '#263238', fontSize: 14, fontWeight: 700,
                    padding: '10px 20px', borderRadius: 14, textDecoration: 'none',
                  }}>
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
        <div style={{ background: '#F3F6F2', minHeight: '100vh' }}>
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
