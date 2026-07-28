import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F0F2F0' }}>
      <div className="text-center max-w-sm">
        <div className="flex justify-center mb-6">
          <Logo size={48} />
        </div>
        <div className="text-7xl font-bold mb-4" style={{ color: '#1FA855' }}>404</div>
        <h1 className="text-xl font-semibold mb-2" style={{ color: '#1F2D24' }}>Página não encontrada</h1>
        <p className="text-sm mb-8" style={{ color: '#7C9485' }}>
          A página que você está procurando não existe ou foi removida.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-sm font-medium rounded-xl"
            style={{ border: '0.5px solid #DDE3DD', color: '#7C9485', background: '#fff' }}>
            Voltar
          </button>
          <button onClick={() => navigate('/')}
            className="px-5 py-2.5 text-sm font-medium text-white rounded-xl hover:opacity-90"
            style={{ background: '#1FA855' }}>
            Ir para o início
          </button>
        </div>
      </div>
    </div>
  )
}
