import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

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

  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [cpf, setCpf] = useState('')

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
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.error || 'Erro ao processar pagamento.')
        setCarregando(false)
        return
      }

      // A Asaas hospeda a página de pagamento inteira (Pix ou cartão) —
      // o número do cartão nunca passa pelo nosso servidor. A ativação
      // real acontece via webhook quando o pagamento é confirmado.
      window.location.href = data.link

    } catch (e) {
      setErro('Erro de conexão. Tente novamente.')
      setCarregando(false)
    }
  }

  if (!item) return (
    <div className="text-center py-16">
      <p className="text-sm" style={{ color: '#9CA3AF' }}>Item não encontrado.</p>
      <button onClick={() => navigate(-1)} className="mt-3 text-sm underline" style={{ color: '#16A34A' }}>Voltar</button>
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

      <div className="flex items-start gap-2 mb-5 p-3 rounded-xl" style={{ background: '#F3F6F2' }}>
        <ShieldCheck size={16} color="#16A34A" style={{ flexShrink: 0, marginTop: 1 }} />
        <p className="text-xs" style={{ color: '#6B7280' }}>
          Você vai continuar numa página segura da Asaas pra escolher Pix ou cartão e finalizar o pagamento.
        </p>
      </div>

      {erro && <p className="text-xs mb-3 p-2 rounded-lg" style={{ color: '#B91C1C', background: '#FEF2F2' }}>{erro}</p>}

      <button
        onClick={pagar}
        disabled={carregando}
        className="w-full py-3 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-60"
        style={{ background: '#16A34A' }}
      >
        {carregando ? 'Preparando pagamento...' : `Continuar para pagamento — R$${item.valor},00`}
      </button>
    </div>
  )
}
