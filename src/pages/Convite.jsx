import { useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import Logo from '../components/Logo'

export default function Convite() {
  const [searchParams] = useSearchParams()
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const ref = searchParams.get('ref')

  useEffect(() => {
    // Se já está logado, processa o convite e vai para o início
    if (usuario && ref) {
      navigate(`/?ref=${ref}`)
    }
  }, [usuario, ref])

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FAF6EE' }}>
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <Logo size={48} />
        </div>

        <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #EDE3CE' }}>
          <div className="text-4xl mb-3">🎁</div>
          <h1 className="text-xl font-semibold mb-2" style={{ color: '#1F2D24' }}>
            Você foi convidado!
          </h1>
          <p className="text-sm mb-5" style={{ color: '#7C9485' }}>
            Cadastre-se agora e ganhe <strong style={{ color: '#1FA855' }}>3 pedidos grátis</strong> para contratar profissionais na plataforma Prestador.
          </p>

          <div className="space-y-2 mb-5">
            {['Profissionais avaliados por clientes reais', 'Fotos e vídeos dos trabalhos realizados', 'Chat direto com o profissional', 'Avaliações com 7 critérios detalhados'].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-left" style={{ color: '#5F6F65' }}>
                <span style={{ color: '#1FA855' }}>✓</span> {item}
              </div>
            ))}
          </div>

          <Link
            to={`/cadastro?ref=${ref}`}
            className="block w-full py-3 text-white text-sm font-medium rounded-xl hover:opacity-90 text-center mb-3"
            style={{ background: '#1FA855' }}
          >
            Criar conta grátis e ganhar créditos
          </Link>

          <Link to="/login" className="text-sm hover:underline" style={{ color: '#7C9485' }}>
            Já tenho conta
          </Link>
        </div>

        <p className="text-xs mt-4" style={{ color: '#C9BFA8' }}>
          Código de convite: <strong>{ref}</strong>
        </p>
      </div>
    </div>
  )
}
