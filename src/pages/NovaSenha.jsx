import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'

export default function NovaSenha() {
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Verifica se veio pelo link de recuperação
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login')
    })
  }, [navigate])

  const salvar = async (e) => {
    e.preventDefault()
    setErro('')

    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (senha !== confirmar) {
      setErro('As senhas não coincidem.')
      return
    }

    setCarregando(true)
    const { error } = await supabase.auth.updateUser({ password: senha })
    setCarregando(false)

    if (error) {
      setErro('Não foi possível atualizar a senha. Tente novamente.')
      return
    }

    setSucesso(true)
    setTimeout(() => navigate('/'), 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FAF6EE' }}>
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link to="/"><Logo size={40} /></Link>
        </div>

        <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #EDE3CE' }}>
          {sucesso ? (
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h1 className="text-xl font-semibold mb-2" style={{ color: '#1F2D24' }}>Senha atualizada!</h1>
              <p className="text-sm" style={{ color: '#7C9485' }}>Redirecionando para o início...</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold mb-1" style={{ color: '#1F2D24', fontFamily: 'Quicksand, sans-serif' }}>
                Criar nova senha
              </h1>
              <p className="text-sm mb-5" style={{ color: '#7C9485' }}>
                Digite sua nova senha abaixo.
              </p>

              <form onSubmit={salvar}>
                <div className="mb-3">
                  <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Nova senha</label>
                  <input
                    type="password"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none"
                    style={{ border: '0.5px solid #EDE3CE', background: '#FAF6EE' }}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Confirmar nova senha</label>
                  <input
                    type="password"
                    value={confirmar}
                    onChange={e => setConfirmar(e.target.value)}
                    placeholder="Repita a senha"
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
                  {carregando ? 'Salvando...' : 'Salvar nova senha'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
