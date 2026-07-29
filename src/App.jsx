import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { ChevronDown, User, Wrench, MessageCircle, ClipboardList, Gift, LogOut, Scale } from 'lucide-react'
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
import Comparar from './pages/Comparar'
import BottomNav from './components/BottomNav'
import CentralNotificacoes from './components/CentralNotificacoes'
import Logo from './components/Logo'
import InstallPWA from './components/InstallPWA'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { ComparacaoProvider, useComparacao } from './lib/ComparacaoContext'
import { supabase } from './lib/supabase'

function BotaoComparacaoNav() {
  const { selecionados } = useComparacao()
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/comparar')}
      className="btn-press"
      aria-label="Comparar profissionais"
      style={{
        position: 'relative', width: 38, height: 38, borderRadius: 12,
        background: '#F3F6F2', border: '1px solid #E4E7E4', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}
    >
      <Scale size={17} color="#6B7280" />
      {selecionados.length > 0 && (
        <span style={{
          position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, padding: '0 3px',
          borderRadius: '50%', background: '#16A34A', color: '#fff', fontSize: 10, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff',
        }}>
          {selecionados.length}
        </span>
      )}
    </button>
  )
}

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
            <BotaoComparacaoNav />
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
                  <ChevronDown size={14} color="#6B7280" />
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
                        { label: 'Meu perfil', path: '/perfil-cliente', icon: User },
                        { label: 'Painel do prestador', path: '/painel', icon: Wrench },
                        { label: 'Mensagens', path: '/mensagens', icon: MessageCircle },
                        { label: 'Meus pedidos', path: '/pedidos', icon: ClipboardList },
                        { label: 'Indicar amigos', path: '/indicacao', icon: Gift },
                      ].map(item => (
                        <Link key={item.path} to={item.path} onClick={() => setMenuAberto(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: '#1F2937', textDecoration: 'none', transition: 'background 0.15s' }}
                          onMouseOver={e => e.currentTarget.style.background = '#F3F6F2'}
                          onMouseOut={e => e.currentTarget.style.background = 'none'}>
                          <item.icon size={16} color="#6B7280" />
                          <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                        </Link>
                      ))}
                      <div style={{ borderTop: '1px solid #F3F6F2', marginTop: 4, paddingTop: 4 }}>
                        <button onClick={() => { sair(); setMenuAberto(false) }}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                          <LogOut size={16} />
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
      <ComparacaoProvider>
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
              <Route path="/comparar" element={<Comparar />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <InstallPWA />
          <BottomNav />
        </div>
      </ComparacaoProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
