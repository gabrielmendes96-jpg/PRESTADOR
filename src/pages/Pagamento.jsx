import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Smartphone, CreditCard, CheckCircle2, Check } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { colors } from '../lib/design'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const ITENS = {
  mensalidade: {
    basico: { nome: 'Básico', valor: 49 },
    profissional: { nome: 'Profissional', valor: 99 },
    premium: { nome: 'Premium', valor: 199 },
  },
  creditos: {
    avulso: { nome: 'Avulso', valor: 9, creditos: 1 },
    basico: { nome: 'Básico', valor: 35, creditos: 5 },
    popular: { nome: 'Popular', valor: 59, creditos: 10 },
    pro: { nome: 'Pro', valor: 99, creditos: 20 },
  },
  boost: {
    '7dias': { nome: 'Boost 7 dias', valor: 20 },
    '15dias': { nome: 'Boost 15 dias', valor: 39 },
    '30dias': { nome: 'Boost 30 dias', valor: 59 },
  },
}

export default function Pagamento() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const tipo = params.get('tipo') // 'mensalidade' | 'creditos' | 'boost'
  const itemId = params.get('item')

  const item = ITENS[tipo]?.[itemId]

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
    if (cpf.replace(/\D/g, '').length !== 11) {
      setErro('Informe um CPF válido para emitir a cobrança.')
      return
    }
    setCarregando(true)
    setErro('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/criar-cobranca', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          tipo,
          descricao: tipo === 'creditos'
            ? `Prestador App — ${item.creditos} créditos`
            : `Prestador App — ${item.nome}`,
          extra: tipo === 'creditos' ? String(item.creditos) : itemId,
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
      <p className="text-sm" style={{ color: '#9CA3AF' }}>Item não encontrado.</p>
      <button onClick={() => navigate(-1)} className="mt-3 text-sm underline" style={{ color: '#16A34A' }}>Voltar</button>
    </div>
  )

  if (pago) return (
    <div className="max-w-sm mx-auto text-center py-16">
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <CheckCircle2 size={32} color={colors.primary} strokeWidth={1.8} />
      </div>
      <h2 className="text-xl font-semibold mb-2" style={{ color: '#1F2937' }}>Pagamento confirmado!</h2>
      <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
        {tipo === 'mensalidade' && `Seu plano ${item.nome} foi ativado com sucesso!`}
        {tipo === 'creditos' && `${item.creditos} créditos foram adicionados à sua conta!`}
        {tipo === 'boost' && `Seu ${item.nome.toLowerCase()} foi ativado com sucesso!`}
      </p>
      <Button fullWidth onClick={() => navigate(tipo === 'mensalidade' ? '/painel' : tipo === 'boost' ? '/boost' : '/pedidos')}>
        {tipo === 'mensalidade' ? 'Ir para o painel' : tipo === 'boost' ? 'Ver meu boost' : 'Usar créditos'}
      </Button>
    </div>
  )

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-1" style={{ color: '#1F2937' }}>Pagamento</h1>
      <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
        {tipo === 'mensalidade' && `Plano ${item.nome}`}
        {tipo === 'creditos' && `${item.creditos} crédito${item.creditos !== 1 ? 's' : ''}`}
        {tipo === 'boost' && item.nome}
        {' · '}
        <strong style={{ color: '#16A34A' }}>R${item.valor}</strong>
      </p>

      {/* Resumo */}
      <div className="bg-white rounded-2xl p-4 mb-5" style={{ border: '0.5px solid #E4E7E4' }}>
        <div className="flex justify-between items-center">
          <p className="text-sm" style={{ color: '#6B7280' }}>
            {tipo === 'mensalidade' && `Plano ${item.nome} (mensal)`}
            {tipo === 'creditos' && `Pacote ${item.nome}`}
            {tipo === 'boost' && item.nome}
          </p>
          <p className="text-sm font-semibold" style={{ color: '#1F2937' }}>R${item.valor},00</p>
        </div>
        {tipo === 'creditos' && (
          <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
            {item.creditos} crédito{item.creditos !== 1 ? 's' : ''} · R${(item.valor / item.creditos).toFixed(2)} por pedido
          </p>
        )}
      </div>

      {/* Método de pagamento */}
      {!pixData && (
        <>
          {/* CPF */}
          <div className="mb-4">
            <label className="block text-sm mb-1" style={{ color: '#6B7280' }}>CPF</label>
            <input
              type="text"
              value={cpf}
              onChange={e => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="00000000000"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none"
            />
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Necessário para emissão da cobrança</p>
          </div>

          <p className="text-sm font-medium mb-3" style={{ color: '#1F2937' }}>Forma de pagamento</p>
          <div className="flex gap-3 mb-5">
            <button
              onClick={() => setMetodoPagamento('pix')}
              className="flex-1 py-3 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              style={metodoPagamento === 'pix'
                ? { border: '2px solid #16A34A', background: '#F0FDF4', color: '#16A34A' }
                : { border: '0.5px solid #E4E7E4', color: '#6B7280' }
              }
            >
              <Smartphone size={16} /> Pix
            </button>
            <button
              onClick={() => setMetodoPagamento('cartao')}
              className="flex-1 py-3 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              style={metodoPagamento === 'cartao'
                ? { border: '2px solid #16A34A', background: '#F0FDF4', color: '#16A34A' }
                : { border: '0.5px solid #E4E7E4', color: '#6B7280' }
              }
            >
              <CreditCard size={16} /> Cartão
            </button>
          </div>

          {/* Dados do cartão */}
          {metodoPagamento === 'cartao' && (
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-sm mb-1" style={{ color: '#6B7280' }}>Nome no cartão</label>
                <input type="text" value={cartao.nomeCartao}
                  onChange={e => setCartao({ ...cartao, nomeCartao: e.target.value })}
                  placeholder="Como aparece no cartão"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: '#6B7280' }}>Número do cartão</label>
                <input type="text" value={cartao.numero}
                  onChange={e => setCartao({ ...cartao, numero: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                  placeholder="0000 0000 0000 0000"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm mb-1" style={{ color: '#6B7280' }}>Mês</label>
                  <input type="text" value={cartao.mesExpiracao}
                    onChange={e => setCartao({ ...cartao, mesExpiracao: e.target.value.slice(0, 2) })}
                    placeholder="MM"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm mb-1" style={{ color: '#6B7280' }}>Ano</label>
                  <input type="text" value={cartao.anoExpiracao}
                    onChange={e => setCartao({ ...cartao, anoExpiracao: e.target.value.slice(0, 4) })}
                    placeholder="AAAA"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm mb-1" style={{ color: '#6B7280' }}>CVV</label>
                  <input type="text" value={cartao.cvv}
                    onChange={e => setCartao({ ...cartao, cvv: e.target.value.slice(0, 4) })}
                    placeholder="000"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: '#6B7280' }}>CEP</label>
                <input type="text" value={cartao.cep}
                  onChange={e => setCartao({ ...cartao, cep: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                  placeholder="00000000"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" />
              </div>
            </div>
          )}

          {erro && <p className="text-xs mb-3 p-2 rounded-lg" style={{ color: '#B91C1C', background: '#FEF2F2' }}>{erro}</p>}

          <button
            onClick={pagar}
            disabled={carregando}
            className="w-full py-3 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-60"
            style={{ background: '#16A34A' }}
          >
            {carregando ? 'Processando...' : `Pagar R$${item.valor},00`}
          </button>
        </>
      )}

      {/* QR Code Pix */}
      {pixData && (
        <div className="bg-white rounded-2xl p-6 text-center" style={{ border: '0.5px solid #E4E7E4' }}>
          <p className="text-sm font-medium mb-4" style={{ color: '#1F2937' }}>Escaneie o QR Code ou copie o código Pix</p>

          {pixData.encodedImage && (
            <img
              src={`data:image/png;base64,${pixData.encodedImage}`}
              alt="QR Code Pix"
              className="w-48 h-48 mx-auto mb-4 rounded-xl"
              onError={(e) => e.target.style.display = 'none'}
            />
          )}

          {!pixData.encodedImage && (
            <div className="w-48 h-48 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{ background: '#F3F6F2', border: '2px dashed #E4E7E4' }}>
              <div className="text-center">
                <Smartphone size={28} color="#9CA3AF" style={{ margin: '0 auto 8px' }} />
                <p className="text-xs" style={{ color: '#6B7280' }}>Copie o código abaixo</p>
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl mb-4 text-left" style={{ background: '#F3F6F2', border: '0.5px solid #E4E7E4' }}>
            <p className="text-xs break-all" style={{ color: '#6B7280' }}>{pixData.payload}</p>
          </div>

          <button
            onClick={copiarPix}
            className="w-full py-2.5 text-sm font-medium rounded-xl hover:opacity-90 mb-3 flex items-center justify-center gap-2"
            style={{ background: copiado ? '#DCFCE7' : '#16A34A', color: copiado ? '#14853D' : '#fff' }}
          >
            {copiado && <Check size={15} strokeWidth={3} />} {copiado ? 'Código copiado!' : 'Copiar código Pix'}
          </button>

          <p className="text-xs" style={{ color: '#6B7280' }}>
            Após o pagamento, {tipo === 'mensalidade' ? 'seu plano será ativado' : tipo === 'boost' ? 'seu boost será ativado' : 'seus créditos serão adicionados'} automaticamente.
          </p>

          <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>
            Expira em: {pixData.expirationDate ? new Date(pixData.expirationDate).toLocaleString('pt-BR') : '24 horas'}
          </p>
        </div>
      )}
    </div>
  )
}
