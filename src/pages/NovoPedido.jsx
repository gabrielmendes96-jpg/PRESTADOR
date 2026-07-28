import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useCategorias } from '../lib/hooks'
import { colors, spacing } from '../lib/design'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

const pacotes = [
  { id: 'avulso', nome: 'Avulso', preco: 9, creditos: 1, destaque: false, desc: '1 pedido' },
  { id: 'basico', nome: 'Básico', preco: 35, creditos: 5, destaque: false, desc: '5 pedidos · R$7/pedido' },
  { id: 'popular', nome: 'Popular', preco: 59, creditos: 10, destaque: true, desc: '10 pedidos · R$5,90/pedido' },
  { id: 'pro', nome: 'Pro', preco: 99, creditos: 20, destaque: false, desc: '20 pedidos · R$4,95/pedido' },
]

const inputStyle = {
  width: '100%', padding: '10px 14px', fontSize: 14, borderRadius: 12,
  border: `1px solid ${colors.border}`, outline: 'none', color: colors.text, fontFamily: 'inherit',
}

const labelStyle = { display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }

export default function NovoPedido() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const { categorias } = useCategorias()
  const [etapa, setEtapa] = useState(1) // 1: form, 2: créditos, 3: confirmação
  const [creditosDisponiveis, setCreditosDisponiveis] = useState(0)
  const [pacoteSelecionado, setPacoteSelecionado] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [dados, setDados] = useState({
    titulo: '',
    descricao: '',
    categoria_id: '',
    cidade: '',
    estado: '',
    orcamento_min: '',
    orcamento_max: '',
    prazo: '',
  })

  useEffect(() => {
    if (!usuario) { navigate('/login'); return }
    buscarCreditos()
  }, [usuario])

  const buscarCreditos = async () => {
    const { data } = await supabase
      .from('creditos_cliente')
      .select('creditos_disponiveis')
      .eq('user_id', usuario.id)
      .single()
    setCreditosDisponiveis(data?.creditos_disponiveis || 0)
  }

  const atualizar = (campo, valor) => setDados({ ...dados, [campo]: valor })

  const publicarPedido = async () => {
    if (creditosDisponiveis < 1) { setEtapa(2); return }
    setEnviando(true)

    // Debitar 1 crédito
    await supabase
      .from('creditos_cliente')
      .update({ creditos_disponiveis: creditosDisponiveis - 1 })
      .eq('user_id', usuario.id)

    // Criar pedido
    const { data } = await supabase
      .from('pedidos_servico')
      .insert({
        cliente_user_id: usuario.id,
        cliente_nome: usuario.user_metadata?.nome || usuario.email?.split('@')[0] || 'Cliente',
        ...dados,
        orcamento_min: dados.orcamento_min ? parseFloat(dados.orcamento_min) : null,
        orcamento_max: dados.orcamento_max ? parseFloat(dados.orcamento_max) : null,
        valor_pago: 9.00,
        pago: true,
        status: 'aberto',
      })
      .select()
      .single()

    setEnviando(false)
    if (data) navigate(`/pedidos/${data.id}`)
  }

  const comprarCreditos = async () => {
    if (!pacoteSelecionado) return alert('Selecione um pacote!')
    setEnviando(true)

    const pacote = pacotes.find(p => p.id === pacoteSelecionado)

    // Verificar se já tem registro de créditos
    const { data: existente } = await supabase
      .from('creditos_cliente')
      .select('id, creditos_disponiveis')
      .eq('user_id', usuario.id)
      .single()

    if (existente) {
      await supabase
        .from('creditos_cliente')
        .update({ creditos_disponiveis: existente.creditos_disponiveis + pacote.creditos })
        .eq('user_id', usuario.id)
    } else {
      await supabase
        .from('creditos_cliente')
        .insert({ user_id: usuario.id, creditos_disponiveis: pacote.creditos })
    }

    await supabase.from('compras_creditos').insert({
      user_id: usuario.id,
      pacote_id: pacoteSelecionado,
      creditos: pacote.creditos,
      valor_pago: pacote.preco,
      status: 'pago',
    })

    setCreditosDisponiveis(prev => prev + pacote.creditos)
    setEnviando(false)
    setEtapa(3)
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[1, 2, 3].map(e => (
          <div key={e} style={{ height: 6, flex: 1, borderRadius: 999, transition: 'background 0.25s ease', background: e <= etapa ? colors.primary : colors.border }} />
        ))}
      </div>

      {/* ETAPA 1 — Formulário do pedido */}
      {etapa === 1 && (
        <Card padding={24}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 4 }}>Postar pedido de serviço</h1>
          <p style={{ fontSize: 14, color: colors.textSub, marginBottom: 20 }}>
            Você tem <strong style={{ color: colors.primary }}>{creditosDisponiveis} crédito{creditosDisponiveis !== 1 ? 's' : ''}</strong> disponíve{creditosDisponiveis !== 1 ? 'is' : 'l'}.
            {creditosDisponiveis === 0 && ' Será necessário comprar créditos para publicar.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Título do pedido *</label>
              <input type="text" value={dados.titulo} onChange={e => atualizar('titulo', e.target.value)}
                style={inputStyle} placeholder="Ex: Preciso pintar sala e quartos" />
            </div>
            <div>
              <label style={labelStyle}>Descrição</label>
              <textarea value={dados.descricao} onChange={e => atualizar('descricao', e.target.value)}
                style={{ ...inputStyle, resize: 'none' }} rows={3} placeholder="Detalhes do serviço que você precisa..." />
            </div>
            <div>
              <label style={labelStyle}>Categoria *</label>
              <select value={dados.categoria_id} onChange={e => atualizar('categoria_id', e.target.value)} style={inputStyle}>
                <option value="">Selecione a categoria</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Cidade *</label>
                <input type="text" value={dados.cidade} onChange={e => atualizar('cidade', e.target.value)}
                  style={inputStyle} placeholder="Sua cidade" />
              </div>
              <div style={{ width: 80 }}>
                <label style={labelStyle}>Estado</label>
                <input type="text" value={dados.estado} onChange={e => atualizar('estado', e.target.value)}
                  style={inputStyle} placeholder="SP" maxLength={2} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Orçamento mínimo (R$)</label>
                <input type="number" value={dados.orcamento_min} onChange={e => atualizar('orcamento_min', e.target.value)}
                  style={inputStyle} placeholder="0" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Orçamento máximo (R$)</label>
                <input type="number" value={dados.orcamento_max} onChange={e => atualizar('orcamento_max', e.target.value)}
                  style={inputStyle} placeholder="0" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Prazo desejado</label>
              <input type="text" value={dados.prazo} onChange={e => atualizar('prazo', e.target.value)}
                style={inputStyle} placeholder="Ex: Esta semana, Em 15 dias, Sem pressa..." />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: spacing.xl }}>
            <Button variant="secondary" fullWidth onClick={() => navigate('/pedidos')}>Cancelar</Button>
            <Button
              fullWidth
              disabled={!dados.titulo || !dados.categoria_id || !dados.cidade || enviando}
              onClick={publicarPedido}
            >
              {enviando ? 'Publicando...' : creditosDisponiveis > 0 ? 'Publicar (1 crédito)' : 'Continuar'}
            </Button>
          </div>
        </Card>
      )}

      {/* ETAPA 2 — Comprar créditos */}
      {etapa === 2 && (
        <Card padding={24}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 4 }}>Comprar créditos</h1>
          <p style={{ fontSize: 14, color: colors.textSub, marginBottom: 20 }}>Escolha um pacote para publicar seu pedido. Créditos não expiram!</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {pacotes.map(p => (
              <label
                key={p.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, cursor: 'pointer',
                  ...(pacoteSelecionado === p.id ? { border: `2px solid ${colors.primary}`, background: '#F0FDF4' } : { border: `1px solid ${colors.border}` }),
                }}
              >
                <input type="radio" name="pacote" value={p.id}
                  checked={pacoteSelecionado === p.id}
                  onChange={() => setPacoteSelecionado(p.id)} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: 0 }}>{p.nome}</p>
                    {p.destaque && <Badge tone="plan">Mais popular</Badge>}
                  </div>
                  <p style={{ fontSize: 12, color: colors.textSub, margin: 0 }}>{p.desc}</p>
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: colors.primary, margin: 0 }}>R${p.preco}</p>
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, padding: 14, borderRadius: 14, marginBottom: 20, background: '#FFFBEB' }}>
            <Info size={16} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: '#92610A', margin: 0, lineHeight: 1.5 }}>
              <strong>Atenção:</strong> o pagamento real será integrado com Asaas (Pix/cartão) em breve.
              Por enquanto, os créditos são adicionados diretamente para teste.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" fullWidth onClick={() => setEtapa(1)}>Voltar</Button>
            <Button fullWidth disabled={!pacoteSelecionado || enviando} onClick={comprarCreditos}>
              {enviando ? 'Processando...' : 'Confirmar compra'}
            </Button>
          </div>
        </Card>
      )}

      {/* ETAPA 3 — Créditos comprados, publicar */}
      {etapa === 3 && (
        <Card padding={24} style={{ textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 size={32} color={colors.primary} strokeWidth={1.8} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 8 }}>Créditos adicionados!</h2>
          <p style={{ fontSize: 14, color: colors.textSub, marginBottom: 24 }}>
            Você agora tem <strong style={{ color: colors.primary }}>{creditosDisponiveis} crédito{creditosDisponiveis !== 1 ? 's' : ''}</strong>. Publique seu pedido agora!
          </p>
          <Button fullWidth onClick={() => { setEtapa(1); publicarPedido() }}>Publicar pedido agora</Button>
        </Card>
      )}
    </div>
  )
}
