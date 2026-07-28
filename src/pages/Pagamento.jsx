import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

const planos = {
  basico: { nome: 'Básico', valor: 49, creditos: null },
  profissional: { nome: 'Profissional', valor: 99, creditos: null },
  premium: { nome: 'Premium', valor: 199, creditos: null },
}

const pacotesCreditos = {
  avulso: { nome: 'Avulso', valor: 9, creditos: 1 },
  basico: { nome: 'Básico', valor: 35, creditos: 5 },
  popular: { nome: 'Popular', valor: 59, creditos: 10 },
  pro: { nome: 'Pro', valor: 99, creditos: 20 },
}

export default function Pagamento() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const tipo = params.get('tipo') // 'mensalidade' ou 'creditos'
  const itemId = params.get('item') // plano ou pacote

  const item = tipo === 'mensalidade' ? planos[itemId] : pacotesCreditos[itemId]

  const [metodoPagamento, setMetodoPagamento] = useState('pix')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [pixData, setPixData] = useState(null)
  const [pago, setPago] = useState(false)
  const [cpf, setCpf] = useState('')
  const [copiado, setCopiado] = useState(false)

  // Dados do cartão
  const [cartao, setCartao] = useState({
    nomeCartao: '', numero: '', mesExpiracao: '', anoExpiracao: '', cvv: '', cep: ''
  })

  const pagar = async () => {
    if (!usuario) { navigate('/login'); return }
    setCarregando(true)
    setErro('')

    try {
      const res = await fetch('/api/criar-cobranca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          userId: usuario.id,
          valor: item.valor,
          descricao: tipo === 'mensalidade'
            ? `Prestador App — Plano ${item.nome}`
            : `Prestador App — ${item.creditos} créditos`,
          extra: tipo === 'mensalidade' ? itemId : String(item.creditos),
          nomeCliente: usuario.user_metadata?.nome || 'Cliente',
          emailCliente: usuario.email,
          cpfCliente: cpf.replace(/\D/g, ''),
          cartao: metodoPagamento === 'cartao' ? cartao : null,
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.error || 'Erro ao processar pagamento.')
        setCarregando(false)
        return
      }

      if (metodoPagamento === 'pix' && data.pixQrCode) {
        setPixData(data.pixQrCode)
      } else if (metodoPagamento === 'cartao') {
        setPago(true)
      }

    } catch (e) {
      setErro('Erro de conexão. Tente novamente.')
    }

    setCarregando(false)
  }

  const copiarPix = () => {
    navigator.clipboard.writeText(pixData.payload)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  if (!item) return (
    <div className="text-center py-16">
      <p className="text-sm" style={{ color: '#C9BFA8' }}>Item não encontrado.</p>
      <button onClick={() => navigate(-1)} className="mt-3 text-sm underline" style={{ color: '#1FA855' }}>Voltar</button>
    </div>
  )

  if (pago) return (
    <div className="max-w-sm mx-auto text-center py-16">
      <div className="text-5xl mb-4">✅</div>
      <h2 className="text-xl font-semibold mb-2" style={{ color: '#1F2D24' }}>Pagamento confirmado!</h2>
      <p className="text-sm mb-6" style={{ color: '#7C9485' }}>
        {tipo === 'mensalidade'
          ? `Seu plano ${item.nome} foi ativado com sucesso!`
          : `${item.creditos} créditos foram adicionados à sua conta!`
        }
      </p>
      <button onClick={() => navigate(tipo === 'mensalidade' ? '/painel' : '/pedidos')}
        className="w-full py-3 text-white text-sm font-medium rounded-xl hover:opacity-90"
        style={{ background: '#1FA855' }}>
        {tipo === 'mensalidade' ? 'Ir para o painel' : 'Usar créditos'}
      </button>
    </div>
  )

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-1" style={{ color: '#1F2D24' }}>Pagamento</h1>
      <p className="text-sm mb-6" style={{ color: '#7C9485' }}>
        {tipo === 'mensalidade' ? `Plano ${item.nome}` : `${item.creditos} crédito${item.creditos !== 1 ? 's' : ''}`}
        {' · '}
        <strong style={{ color: '#1FA855' }}>R${item.valor}</strong>
      </p>

      {/* Resumo */}
      <div className="bg-white rounded-2xl p-4 mb-5" style={{ border: '0.5px solid #EDE3CE' }}>
        <div className="flex justify-between items-center">
          <p className="text-sm" style={{ color: '#5F6F65' }}>
            {tipo === 'mensalidade' ? `Plano ${item.nome} (mensal)` : `Pacote ${item.nome}`}
          </p>
          <p className="text-sm font-semibold" style={{ color: '#1F2D24' }}>R${item.valor},00</p>
        </div>
        {tipo === 'creditos' && (
          <p className="text-xs mt-1" style={{ color: '#7C9485' }}>
            {item.creditos} crédito{item.creditos !== 1 ? 's' : ''} · R${(item.valor / item.creditos).toFixed(2)} por pedido
          </p>
        )}
      </div>

      {/* Método de pagamento */}
      {!pixData && (
        <>
          {/* CPF */}
          <div className="mb-4">
            <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>CPF</label>
            <input
              type="text"
              value={cpf}
              onChange={e => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="00000000000"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none"
            />
            <p className="text-xs mt-1" style={{ color: '#C9BFA8' }}>Necessário para emissão da cobrança</p>
          </div>

          <p className="text-sm font-medium mb-3" style={{ color: '#1F2D24' }}>Forma de pagamento</p>
          <div className="flex gap-3 mb-5">
            <button
              onClick={() => setMetodoPagamento('pix')}
              className="flex-1 py-3 text-sm font-medium rounded-xl transition-colors"
              style={metodoPagamento === 'pix'
                ? { border: '2px solid #1FA855', background: '#F4FAF6', color: '#1FA855' }
                : { border: '0.5px solid #EDE3CE', color: '#7C9485' }
              }
            >
              📱 Pix
            </button>
            <button
              onClick={() => setMetodoPagamento('cartao')}
              className="flex-1 py-3 text-sm font-medium rounded-xl transition-colors"
              style={metodoPagamento === 'cartao'
                ? { border: '2px solid #1FA855', background: '#F4FAF6', color: '#1FA855' }
                : { border: '0.5px solid #EDE3CE', color: '#7C9485' }
              }
            >
              💳 Cartão
            </button>
          </div>

          {/* Dados do cartão */}
          {metodoPagamento === 'cartao' && (
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Nome no cartão</label>
                <input type="text" value={cartao.nomeCartao}
                  onChange={e => setCartao({ ...cartao, nomeCartao: e.target.value })}
                  placeholder="Como aparece no cartão"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Número do cartão</label>
                <input type="text" value={cartao.numero}
                  onChange={e => setCartao({ ...cartao, numero: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                  placeholder="0000 0000 0000 0000"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Mês</label>
                  <input type="text" value={cartao.mesExpiracao}
                    onChange={e => setCartao({ ...cartao, mesExpiracao: e.target.value.slice(0, 2) })}
                    placeholder="MM"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Ano</label>
                  <input type="text" value={cartao.anoExpiracao}
                    onChange={e => setCartao({ ...cartao, anoExpiracao: e.target.value.slice(0, 4) })}
                    placeholder="AAAA"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>CVV</label>
                  <input type="text" value={cartao.cvv}
                    onChange={e => setCartao({ ...cartao, cvv: e.target.value.slice(0, 4) })}
                    placeholder="000"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>CEP</label>
                <input type="text" value={cartao.cep}
                  onChange={e => setCartao({ ...cartao, cep: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                  placeholder="00000000"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" />
              </div>
            </div>
          )}

          {erro && <p className="text-xs mb-3 p-2 rounded-lg" style={{ color: '#A32D2D', background: '#FCEBEB' }}>{erro}</p>}

          <button
            onClick={pagar}
            disabled={carregando}
            className="w-full py-3 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-60"
            style={{ background: '#1FA855' }}
          >
            {carregando ? 'Processando...' : `Pagar R$${item.valor},00`}
          </button>
        </>
      )}

      {/* QR Code Pix */}
      {pixData && (
        <div className="bg-white rounded-2xl p-6 text-center" style={{ border: '0.5px solid #EDE3CE' }}>
          <p className="text-sm font-medium mb-4" style={{ color: '#1F2D24' }}>Escaneie o QR Code ou copie o código Pix</p>

          {pixData.encodedImage && (
            <img
              src={`data:image/png;base64,${pixData.encodedImage}`}
              alt="QR Code Pix"
              className="w-48 h-48 mx-auto mb-4 rounded-xl"
              onError={(e) => e.target.style.display = 'none'}
            />
          )}

          {!pixData.encodedImage && (
            <div className="w-48 h-48 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{ background: '#FAF6EE', border: '2px dashed #EDE3CE' }}>
              <div className="text-center">
                <div className="text-3xl mb-2">📱</div>
                <p className="text-xs" style={{ color: '#7C9485' }}>Copie o código abaixo</p>
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl mb-4 text-left" style={{ background: '#FAF6EE', border: '0.5px solid #EDE3CE' }}>
            <p className="text-xs break-all" style={{ color: '#5F6F65' }}>{pixData.payload}</p>
          </div>

          <button
            onClick={copiarPix}
            className="w-full py-2.5 text-sm font-medium rounded-xl hover:opacity-90 mb-3"
            style={{ background: copiado ? '#E3F6E9' : '#1FA855', color: copiado ? '#0F6E3D' : '#fff' }}
          >
            {copiado ? '✓ Código copiado!' : 'Copiar código Pix'}
          </button>

          <p className="text-xs" style={{ color: '#7C9485' }}>
            Após o pagamento, seus {tipo === 'mensalidade' ? 'plano será ativado' : 'créditos serão adicionados'} automaticamente.
          </p>

          <p className="text-xs mt-2" style={{ color: '#C9BFA8' }}>
            Expira em: {pixData.expirationDate ? new Date(pixData.expirationDate).toLocaleString('pt-BR') : '24 horas'}
          </p>
        </div>
      )}
    </div>
  )
}
