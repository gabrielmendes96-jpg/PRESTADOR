import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { ChevronDown, User, Wrench, MessageCircle, ClipboardList, Gift, LogOut, GitCompare } from 'lucide-react'

// Cada página vira um chunk próprio em vez de tudo ir num JS só — o
// visitante que só quer buscar um prestador não baixa o código do
// Admin, do painel do prestador, do fluxo de pagamento, etc.
const Home = lazy(() => import('./pages/Home'))
const Busca = lazy(() => import('./pages/Busca'))
const Perfil = lazy(() => import('./pages/Perfil'))
const Planos = lazy(() => import('./pages/Planos'))
const CadastroPro = lazy(() => import('./pages/CadastroPro'))
const Admin = lazy(() => import('./pages/Admin'))
const Login = lazy(() => import('./pages/Login'))
const Cadastro = lazy(() => import('./pages/Cadastro'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const PainelPrestador = lazy(() => import('./pages/PainelPrestador'))
const Chat = lazy(() => import('./pages/Chat'))
const Conversas = lazy(() => import('./pages/Conversas'))
const Pedidos = lazy(() => import('./pages/Pedidos'))
const NovoPedido = lazy(() => import('./pages/NovoPedido'))
const DetalhePedido = lazy(() => import('./pages/DetalhePedido'))
const Indicacao = lazy(() => import('./pages/Indicacao'))
const Convite = lazy(() => import('./pages/Convite'))
const EsqueciSenha = lazy(() => import('./pages/EsqueciSenha'))
const NovaSenha = lazy(() => import('./pages/NovaSenha'))
const Pagamento = lazy(() => import('./pages/Pagamento'))
const PagamentoRetorno = lazy(() => import('./pages/PagamentoRetorno'))
const ZonasQuentes = lazy(() => import('./pages/ZonasQuentes'))
const AssistentePerfil = lazy(() => import('./pages/AssistentePerfil'))
const Boost = lazy(() => import('./pages/Boost'))
const Disponibilidade = lazy(() => import('./pages/Disponibilidade'))
const Ganhos = lazy(() => import('./pages/Ganhos'))
const Niveis = lazy(() => import('./pages/Niveis'))
const SEOCategoria = lazy(() => import('./pages/SEOCategoria'))
const SEOCidadeCategoria = lazy(() => import('./pages/SEOCidadeCategoria'))
const Termos = lazy(() => import('./pages/Termos'))
const NotFound = lazy(() => import('./pages/NotFound'))
const PerfilCliente = lazy(() => import('./pages/PerfilCliente'))
const ComoFunciona = lazy(() => import('./pages/ComoFunciona'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Comparar = lazy(() => import('./pages/Comparar'))

import BottomNav from './components/BottomNav'
import CentralNotificacoes from './components/CentralNotificacoes'
import Logo from './components/Logo'
import InstallPWA from './components/InstallPWA'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { ComparacaoProvider, useComparacao } from './lib/ComparacaoContext'
import { useMensagensNaoLidas } from './lib/hooks'
import { supabase } from './lib/supabase'

function BotaoComparacaoNav() {
  const { selecionados } = useComparacao()
  const navigate = useNavigate()

  if (selecionados.length === 0) return null

  return (
    <button
      onClick={() => navigate('/comparar')}
      className="btn-press flex items-center gap-1.5"
      aria-label="Comparar profissionais selecionados"
      style={{
        background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 999,
        padding: '8px 14px', cursor: 'pointer', color: '#15803D', fontSize: 13, fontWeight: 700,
        flexShrink: 0,
      }}
    >
      <GitCompare size={15} />
      Comparar ({selecionados.length})
    </button>
  )
}

function Navbar() {
  const { usuario, sair } = useAuth()
  const [menuAberto, setMenuAberto] = useState(false)
  const naoLidas = useMensagensNaoLidas(usuario)

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
            <CentralNotificacoes />
            {usuario ? (
              <div className="relative">
                <button onClick={() => setMenuAberto(!menuAberto)}
                  className="btn-press flex items-center gap-2"
                  style={{
                    background: '#F3F6F2', borderRadius: 14, padding: '8px 14px',
                    border: '1px solid #E4E7E4', cursor: 'pointer',
                  }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', background: '#16A34A',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, color: '#fff',
                    }}>
                      {(usuario.user_metadata?.nome || usuario.email || 'U')[0].toUpperCase()}
                    </div>
                    {naoLidas > 0 && (
                      <span style={{
                        position: 'absolute', top: -2, right: -2, width: 10, height: 10,
                        borderRadius: '50%', background: '#EF4444', border: '2px solid #fff',
                      }} />
                    )}
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
                          <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{item.label}</span>
                          {item.path === '/mensagens' && naoLidas > 0 && (
                            <span style={{
                              minWidth: 18, height: 18, padding: '0 5px', borderRadius: '50%',
                              background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {naoLidas > 9 ? '9+' : naoLidas}
                            </span>
                          )}
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
            <Suspense fallback={
              <p style={{ textAlign: 'center', padding: '64px 0', fontSize: 14, color: '#6B7280' }}>Carregando...</p>
            }>
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
              <Route path="/pagamento/retorno" element={<PagamentoRetorno />} />
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
            </Suspense>
          </main>
          <InstallPWA />
          <BottomNav />
        </div>
      </ComparacaoProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
