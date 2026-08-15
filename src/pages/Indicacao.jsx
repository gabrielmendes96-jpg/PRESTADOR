import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Phone, Check, PartyPopper, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { colors } from '../lib/design'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const niveis = [
  { meta: 5, meses: 1, label: 'Nível 1', cor: '#6B7280' },
  { meta: 10, meses: 2, label: 'Nível 2', cor: '#16A34A' },
  { meta: 20, meses: 4, label: 'Nível 3', cor: '#14853D' },
  { meta: 50, meses: 12, label: 'Nível 4', cor: '#F6C64D' },
  { meta: 100, meses: 999, label: 'Embaixador', cor: '#FF6B00' },
]

function BarraNivel({ atual, meta, label, meses, cor, ativo }) {
  const pct = Math.min((atual / meta) * 100, 100)
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: ativo ? cor : '#9CA3AF' }}>{label}</span>
          {ativo && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#DCFCE7', color: '#14853D' }}>
              <Check size={10} strokeWidth={3} /> Conquistado
            </span>
          )}
        </div>
        <span className="text-xs" style={{ color: '#6B7280' }}>
          {meses === 999 ? 'Sempre grátis' : `${meses} ${meses === 1 ? 'mês' : 'meses'} grátis`} · {atual}/{meta} indicados
        </span>
      </div>
      <div className="h-2 rounded-full" style={{ background: '#E4E7E4' }}>
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
  const [mesesGratis, setMesesGratis] = useState(0)
  const [usando, setUsando] = useState(false)
  const [erroUsar, setErroUsar] = useState('')

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

    const { data: prestador } = await supabase
      .from('prestadores')
      .select('meses_gratis_disponiveis')
      .eq('user_id', usuario.id)
      .single()

    setMesesGratis(prestador?.meses_gratis_disponiveis || 0)
    setCarregando(false)
  }

  const usarMesGratis = async () => {
    setUsando(true)
    setErroUsar('')
    const { error } = await supabase.rpc('usar_mes_gratis')
    if (error) {
      setErroUsar('Não foi possível usar seu mês grátis agora. Tente novamente.')
      setUsando(false)
      return
    }
    await carregarDados()
    setUsando(false)
  }

  const processarConvite = async (ref) => {
    // A validação (código existe, não é o próprio usuário, ainda não foi
    // indicado antes) e a concessão dos 3 créditos acontecem dentro da
    // função de banco resgatar_indicacao — assim ninguém consegue se dar
    // créditos direto pela API, só através dessa regra de negócio.
    const { error } = await supabase.rpc('resgatar_indicacao', { p_codigo: ref })
    if (error) console.error('Erro ao resgatar indicação:', error.message)
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
      <p className="text-sm" style={{ color: '#9CA3AF' }}>Carregando...</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-1" style={{ color: '#1F2937' }}>Indique e ganhe</h1>
      <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
        Indique prestadores para a plataforma e ganhe meses grátis na sua assinatura!
      </p>

      {/* Seu código */}
      <div className="bg-white rounded-2xl p-6 mb-4" style={{ border: '0.5px solid #E4E7E4' }}>
        <p className="text-sm font-medium mb-3" style={{ color: '#1F2937' }}>Seu link de indicação</p>
        <div className="flex gap-2 mb-3">
          <div className="flex-1 px-3 py-2.5 rounded-lg text-sm font-mono overflow-hidden" style={{ background: '#F3F6F2', border: '0.5px solid #E4E7E4', color: '#1F2937' }}>
            {window.location.origin}/convite?ref={codigo?.codigo}
          </div>
          <button
            onClick={copiarLink}
            className="px-4 py-2.5 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity flex-shrink-0"
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: copiado ? '#DCFCE7' : '#16A34A', color: copiado ? '#14853D' : '#fff' }}
          >
            {copiado && <Check size={14} strokeWidth={3} />} {copiado ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
        <Button variant="secondary" fullWidth icon={<Phone size={16} />} onClick={compartilharWhatsApp} style={{ background: '#25D366', color: '#fff', border: '1px solid transparent' }}>
          Compartilhar no WhatsApp
        </Button>
      </div>

      {/* Como funciona */}
      <div className="bg-white rounded-2xl p-6 mb-4" style={{ border: '0.5px solid #E4E7E4' }}>
        <p className="text-sm font-medium mb-4" style={{ color: '#1F2937' }}>Como funciona</p>
        <div className="space-y-3">
          {[
            { n: '1', txt: 'Compartilhe seu link com outros prestadores' },
            { n: '2', txt: 'Eles se cadastram e pagam a primeira mensalidade' },
            { n: '3', txt: 'Você acumula indicados e desbloqueia meses grátis por meta' },
          ].map(item => (
            <div key={item.n} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0" style={{ background: '#DCFCE7', color: '#14853D' }}>
                {item.n}
              </div>
              <p className="text-sm" style={{ color: '#6B7280' }}>{item.txt}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Saldo de meses grátis — o benefício de verdade, resgatável */}
      {mesesGratis > 0 && (
        <div className="rounded-2xl p-6 mb-4" style={{ background: '#DCFCE7', border: `0.5px solid ${colors.primary}` }}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium" style={{ color: '#14853D' }}>
                Você tem {mesesGratis} {mesesGratis === 1 ? 'mês grátis disponível' : 'meses grátis disponíveis'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#14853D' }}>
                Use quando quiser pra ativar sua assinatura sem pagar.
              </p>
              {erroUsar && <p className="text-xs mt-1" style={{ color: '#B91C1C' }}>{erroUsar}</p>}
            </div>
            <Button onClick={usarMesGratis} disabled={usando} style={{ flexShrink: 0 }}>
              {usando ? 'Usando...' : 'Usar 1 mês grátis'}
            </Button>
          </div>
        </div>
      )}

      {/* Progresso por nível */}
      <div className="bg-white rounded-2xl p-6 mb-4" style={{ border: '0.5px solid #E4E7E4' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium" style={{ color: '#1F2937' }}>Seu progresso</p>
          <div className="text-right">
            <p className="text-2xl font-semibold" style={{ color: '#16A34A' }}>{indicadosAtivos}</p>
            <p className="text-xs" style={{ color: '#6B7280' }}>indicados ativos</p>
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
          <div className="mt-4 p-3 rounded-xl text-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#DCFCE7' }}>
            <PartyPopper size={16} color={colors.primaryHover} style={{ flexShrink: 0 }} />
            <p className="text-sm font-medium" style={{ color: '#14853D', margin: 0 }}>
              Você atingiu o {nivelAtual.label}!
              {nivelAtual.meses === 999 ? ' Você é um Embaixador — assinatura sempre grátis!' : ` +${nivelAtual.meses} ${nivelAtual.meses === 1 ? 'mês' : 'meses'} grátis na sua assinatura.`}
            </p>
          </div>
        )}
      </div>

      {/* Histórico de indicações */}
      <div className="bg-white rounded-2xl p-6" style={{ border: '0.5px solid #E4E7E4' }}>
        <p className="text-sm font-medium mb-4" style={{ color: '#1F2937' }}>
          Suas indicações ({indicacoes.length})
        </p>
        {indicacoes.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: '#9CA3AF' }}>
            Nenhuma indicação ainda. Compartilhe seu link!
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {indicacoes.map(ind => (
              <div key={ind.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#F3F6F2' }}>
                <div>
                  <p className="text-sm" style={{ color: '#1F2937' }}>Indicação #{ind.id.slice(0,8)}</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>{new Date(ind.criado_em).toLocaleDateString('pt-BR')}</p>
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
                  ...(ind.status === 'ativo'
                    ? { background: '#DCFCE7', color: '#14853D' }
                    : { background: '#F3F6F2', color: '#9CA3AF', border: '1px solid #E4E7E4' })
                }}>
                  {ind.status === 'ativo' ? <Check size={11} strokeWidth={3} /> : <Clock size={11} />}
                  {ind.status === 'ativo' ? 'Ativo' : 'Pendente (aguardando 30 dias)'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
