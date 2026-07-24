import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'

export default function EsqueciSenha() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const enviar = async (e) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nova-senha`,
    })

    setCarregando(false)

    if (error) {
      setErro('Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.')
      return
    }

    setEnviado(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FAF6EE' }}>
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link to="/"><Logo size={40} /></Link>
        </div>

        <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #EDE3CE' }}>
          {enviado ? (
            <div className="text-center">
              <div className="text-5xl mb-4">✉️</div>
              <h1 className="text-xl font-semibold mb-2" style={{ color: '#1F2D24' }}>E-mail enviado!</h1>
              <p className="text-sm mb-5" style={{ color: '#7C9485' }}>
                Enviamos um link para <strong>{email}</strong>. Clique no link para criar uma nova senha.
              </p>
              <p className="text-xs" style={{ color: '#C9BFA8' }}>
                Não recebeu? Verifique a caixa de spam ou tente novamente.
              </p>
              <button
                onClick={() => setEnviado(false)}
                className="mt-4 text-sm hover:underline"
                style={{ color: '#1FA855' }}
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold mb-1" style={{ color: '#1F2D24', fontFamily: 'Quicksand, sans-serif' }}>
                Esqueceu a senha?
              </h1>
              <p className="text-sm mb-5" style={{ color: '#7C9485' }}>
                Digite seu e-mail e enviaremos um link para criar uma nova senha.
              </p>

              <form onSubmit={enviar}>
                <div className="mb-4">
                  <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none"
                    style={{ border: '0.5px solid #EDE3CE', background: '#FAF6EE' }}
                  />
                </div>

                {erro && (
                  <p className="text-xs mb-3 p-2 rounded-lg" style={{ color: '#A32D2D', background: '#FCEBEB' }}>
                    {erro}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-60"
                  style={{ background: '#1FA855' }}
                >
                  {carregando ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm mt-4" style={{ color: '#7C9485' }}>
          Lembrou a senha?{' '}
          <Link to="/login" className="font-medium hover:underline" style={{ color: '#1FA855' }}>
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  )
}
