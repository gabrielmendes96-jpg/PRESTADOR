import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

const niveis = [
  { meta: 5, meses: 1, label: 'Nível 1', cor: '#7C9485' },
  { meta: 10, meses: 2, label: 'Nível 2', cor: '#1FA855' },
  { meta: 20, meses: 4, label: 'Nível 3', cor: '#0F6E3D' },
  { meta: 50, meses: 12, label: 'Nível 4', cor: '#FFC857' },
  { meta: 100, meses: 999, label: 'Embaixador', cor: '#FF6B00' },
]

function BarraNivel({ atual, meta, label, meses, cor, ativo }) {
  const pct = Math.min((atual / meta) * 100, 100)
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: ativo ? cor : '#C9BFA8' }}>{label}</span>
          {ativo && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#E3F6E9', color: '#0F6E3D' }}>✓ Conquistado</span>}
        </div>
        <span className="text-xs" style={{ color: '#7C9485' }}>
          {meses === 999 ? 'Sempre grátis' : `${meses} ${meses === 1 ? 'mês' : 'meses'} grátis`} · {atual}/{meta} indicados
        </span>
      </div>
      <div className="h-2 rounded-full" style={{ background: '#EDE3CE' }}>
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: cor }} />
      </div>
    </div>
  )
}

export default function Indicacao() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [codigo, setCodigo] = useState(null)
  const [indicacoes, setIndicacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (!usuario) { navigate('/login'); return }
    carregarDados()
  }, [usuario])

  // Processar código de convite na URL (?ref=CODIGO)
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref && usuario) processarConvite(ref)
  }, [searchParams, usuario])

  const carregarDados = async () => {
    setCarregando(true)

    let { data: cod } = await supabase
      .from('codigos_indicacao')
      .select('*')
      .eq('user_id', usuario.id)
      .single()

    if (!cod) {
      // Criar código único para o usuário
      const novoCodigo = (usuario.user_metadata?.nome || usuario.email?.split('@')[0] || 'user')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 8) + Math.random().toString(36).slice(2, 5).toUpperCase()

      const { data } = await supabase
        .from('codigos_indicacao')
        .insert({
          user_id: usuario.id,
          codigo: novoCodigo,
          tipo: 'prestador',
        })
        .select()
        .single()
      cod = data
    }

    setCodigo(cod)

    const { data: inds } = await supabase
      .from('indicacoes')
      .select('*')
      .eq('indicador_user_id', usuario.id)
      .order('criado_em', { ascending: false })

    setIndicacoes(inds || [])
    setCarregando(false)
  }

  const processarConvite = async (ref) => {
    // Verificar se o código existe e não é do próprio usuário
    const { data: cod } = await supabase
      .from('codigos_indicacao')
      .select('*')
      .eq('codigo', ref)
      .single()

    if (!cod || cod.user_id === usuario.id) return

    // Verificar se já foi indicado antes
    const { data: jaIndicado } = await supabase
      .from('indicacoes')
      .select('id')
      .eq('indicado_user_id', usuario.id)
      .single()

    if (jaIndicado) return

    // Registrar indicação
    await supabase.from('indicacoes').insert({
      codigo_id: cod.id,
      indicador_user_id: cod.user_id,
      indicado_user_id: usuario.id,
      tipo: cod.tipo,
      status: 'pendente',
    })

    // Dar 3 créditos grátis para o novo usuário (cliente)
    const { data: credExistente } = await supabase
      .from('creditos_cliente')
      .select('id, creditos_disponiveis')
      .eq('user_id', usuario.id)
      .single()

    if (credExistente) {
      await supabase.from('creditos_cliente')
        .update({ creditos_disponiveis: credExistente.creditos_disponiveis + 3 })
        .eq('user_id', usuario.id)
    } else {
      await supabase.from('creditos_cliente')
        .insert({ user_id: usuario.id, creditos_disponiveis: 3 })
    }
  }

  const copiarLink = () => {
    const link = `${window.location.origin}/convite?ref=${codigo?.codigo}`
    navigator.clipboard.writeText(link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const compartilharWhatsApp = () => {
    const link = `${window.location.origin}/convite?ref=${codigo?.codigo}`
    const msg = `Ei! Estou usando o Prestador para conseguir mais clientes. Cadastre-se pelo meu link e ganhe 3 pedidos grátis: ${link}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`)
  }

  const indicadosAtivos = indicacoes.filter(i => i.status === 'ativo').length
  const nivelAtual = niveis.filter(n => indicadosAtivos >= n.meta).pop()

  if (carregando) return (
    <div className="flex items-center justify-center min-h-64">
      <p className="text-sm" style={{ color: '#C9BFA8' }}>Carregando...</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-1" style={{ color: '#1F2D24' }}>Indique e ganhe</h1>
      <p className="text-sm mb-6" style={{ color: '#7C9485' }}>
        Indique prestadores para a plataforma e ganhe meses grátis na sua assinatura!
      </p>

      {/* Seu código */}
      <div className="bg-white rounded-2xl p-6 mb-4" style={{ border: '0.5px solid #EDE3CE' }}>
        <p className="text-sm font-medium mb-3" style={{ color: '#1F2D24' }}>Seu link de indicação</p>
        <div className="flex gap-2 mb-3">
          <div className="flex-1 px-3 py-2.5 rounded-lg text-sm font-mono overflow-hidden" style={{ background: '#FAF6EE', border: '0.5px solid #EDE3CE', color: '#1F2D24' }}>
            {window.location.origin}/convite?ref={codigo?.codigo}
          </div>
          <button
            onClick={copiarLink}
            className="px-4 py-2.5 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity flex-shrink-0"
            style={{ background: copiado ? '#E3F6E9' : '#1FA855', color: copiado ? '#0F6E3D' : '#fff' }}
          >
            {copiado ? '✓ Copiado!' : 'Copiar'}
          </button>
        </div>
        <button
          onClick={compartilharWhatsApp}
          className="w-full py-2.5 text-sm font-medium rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
          style={{ background: '#25D366', color: '#fff' }}
        >
          <i className="ti ti-brand-whatsapp" style={{ fontSize: '18px' }} aria-hidden="true"></i>
          Compartilhar no WhatsApp
        </button>
      </div>

      {/* Como funciona */}
      <div className="bg-white rounded-2xl p-6 mb-4" style={{ border: '0.5px solid #EDE3CE' }}>
        <p className="text-sm font-medium mb-4" style={{ color: '#1F2D24' }}>Como funciona</p>
        <div className="space-y-3">
          {[
            { n: '1', txt: 'Compartilhe seu link com outros prestadores' },
            { n: '2', txt: 'Eles se cadastram e ficam ativos por 30 dias pagando' },
            { n: '3', txt: 'Você acumula indicados e desbloqueia meses grátis por meta' },
          ].map(item => (
            <div key={item.n} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0" style={{ background: '#E3F6E9', color: '#0F6E3D' }}>
                {item.n}
              </div>
              <p className="text-sm" style={{ color: '#5F6F65' }}>{item.txt}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Progresso por nível */}
      <div className="bg-white rounded-2xl p-6 mb-4" style={{ border: '0.5px solid #EDE3CE' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>Seu progresso</p>
          <div className="text-right">
            <p className="text-2xl font-semibold" style={{ color: '#1FA855' }}>{indicadosAtivos}</p>
            <p className="text-xs" style={{ color: '#7C9485' }}>indicados ativos</p>
          </div>
        </div>

        {niveis.map(n => (
          <BarraNivel
            key={n.meta}
            atual={indicadosAtivos}
            meta={n.meta}
            label={n.label}
            meses={n.meses}
            cor={n.cor}
            ativo={indicadosAtivos >= n.meta}
          />
        ))}

        {nivelAtual && (
          <div className="mt-4 p-3 rounded-xl text-center" style={{ background: '#E3F6E9' }}>
            <p className="text-sm font-medium" style={{ color: '#0F6E3D' }}>
              🎉 Você atingiu o {nivelAtual.label}!
              {nivelAtual.meses === 999 ? ' Você é um Embaixador — assinatura sempre grátis!' : ` +${nivelAtual.meses} ${nivelAtual.meses === 1 ? 'mês' : 'meses'} grátis na sua assinatura.`}
            </p>
          </div>
        )}
      </div>

      {/* Histórico de indicações */}
      <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #EDE3CE' }}>
        <p className="text-sm font-medium mb-4" style={{ color: '#1F2D24' }}>
          Suas indicações ({indicacoes.length})
        </p>
        {indicacoes.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: '#C9BFA8' }}>
            Nenhuma indicação ainda. Compartilhe seu link!
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {indicacoes.map(ind => (
              <div key={ind.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#FAF6EE' }}>
                <div>
                  <p className="text-sm" style={{ color: '#1F2D24' }}>Indicação #{ind.id.slice(0,8)}</p>
                  <p className="text-xs" style={{ color: '#C9BFA8' }}>{new Date(ind.criado_em).toLocaleDateString('pt-BR')}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={ind.status === 'ativo'
                    ? { background: '#E3F6E9', color: '#0F6E3D' }
                    : { background: '#FAF6EE', color: '#C9BFA8', border: '0.5px solid #EDE3CE' }
                  }>
                  {ind.status === 'ativo' ? '✓ Ativo' : '⏳ Pendente (aguardando 30 dias)'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
