import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LifeBuoy, Send, Check, Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { colors, spacing } from '../lib/design'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const CATEGORIAS = [
  { id: 'pagamento', label: 'Pagamento ou cobrança' },
  { id: 'assinatura', label: 'Minha assinatura / plano' },
  { id: 'servico', label: 'Problema com um serviço ou prestador' },
  { id: 'conta', label: 'Minha conta e meus dados (LGPD)' },
  { id: 'sugestao', label: 'Sugestão' },
  { id: 'outro', label: 'Outro assunto' },
]

const STATUS = {
  aberto: { label: 'Aguardando resposta', bg: '#FEF3C7', cor: '#92610A' },
  em_andamento: { label: 'Em andamento', bg: '#E0E7FF', cor: '#3730A3' },
  resolvido: { label: 'Resolvido', bg: '#DCFCE7', cor: '#14853D' },
}

const inputStyle = {
  width: '100%', padding: '10px 14px', fontSize: 14, borderRadius: 12,
  border: `1px solid ${colors.border}`, outline: 'none', fontFamily: 'inherit', background: '#fff',
}

export default function Suporte() {
  const { usuario, carregando: authCarregando } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  // Outras telas podem mandar pra cá já com o assunto preenchido
  // (/suporte?categoria=pagamento&assunto=...).
  const categoriaInicial = CATEGORIAS.some(c => c.id === params.get('categoria')) ? params.get('categoria') : 'pagamento'
  const [categoria, setCategoria] = useState(categoriaInicial)
  const [assunto, setAssunto] = useState(params.get('assunto') || '')
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [chamados, setChamados] = useState([])
  const [carregandoLista, setCarregandoLista] = useState(true)

  useEffect(() => {
    if (!usuario) return
    let cancelado = false
    supabase.from('chamados_suporte').select('*').order('criado_em', { ascending: false })
      .then(({ data }) => {
        if (cancelado) return
        setChamados(data || [])
        setCarregandoLista(false)
      })
    return () => { cancelado = true }
  }, [usuario?.id])

  const enviar = async () => {
    setErro('')
    if (assunto.trim().length < 3) { setErro('Dê um título curto pro seu chamado (pelo menos 3 letras).'); return }
    if (mensagem.trim().length < 10) { setErro('Conte um pouco mais o que está acontecendo (pelo menos 10 letras).'); return }

    setEnviando(true)
    const { data, error } = await supabase
      .from('chamados_suporte')
      .insert({ user_id: usuario.id, categoria, assunto: assunto.trim(), mensagem: mensagem.trim() })
      .select()
      .single()
    setEnviando(false)

    if (error) {
      setErro(error.message?.includes('muitos chamados')
        ? error.message
        : 'Não foi possível enviar agora. Tente de novo em instantes ou escreva para contato@prestador.app.')
      return
    }

    setChamados(prev => [data, ...prev])
    setAssunto('')
    setMensagem('')
    setEnviado(true)
  }

  if (authCarregando) {
    return <p style={{ textAlign: 'center', padding: '64px 0', fontSize: 14, color: colors.textSub }}>Carregando...</p>
  }

  if (!usuario) {
    return (
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <Card padding={28} style={{ textAlign: 'center' }}>
          <LifeBuoy size={36} color={colors.primary} style={{ margin: '0 auto 12px' }} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.text, margin: '0 0 8px' }}>Suporte</h1>
          <p style={{ fontSize: 14, color: colors.textSub, margin: '0 0 20px', lineHeight: 1.6 }}>
            Entre na sua conta pra abrir um chamado e acompanhar a resposta por aqui.
          </p>
          <Button fullWidth onClick={() => navigate('/login')}>Entrar para pedir ajuda</Button>
          <p style={{ fontSize: 12, color: colors.textSub, margin: '16px 0 0' }}>
            Não consegue entrar? Escreva para <strong>contato@prestador.app</strong>
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 22, fontWeight: 700, color: colors.text, margin: '0 0 4px' }}>
        <LifeBuoy size={22} color={colors.primary} /> Suporte
      </h1>
      <p style={{ fontSize: 14, color: colors.textSub, margin: `0 0 ${spacing.card}px`, lineHeight: 1.6 }}>
        Conte o que está acontecendo. A resposta aparece aqui e avisamos você por notificação.
      </p>

      {enviado && (
        <Card padding={16} style={{ marginBottom: spacing.card, background: '#DCFCE7', border: 'none' }}>
          <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: colors.primaryHover, margin: 0 }}>
            <Check size={16} strokeWidth={3} /> Chamado enviado! Vamos responder por aqui.
          </p>
        </Card>
      )}

      <Card padding={20} style={{ marginBottom: spacing.card, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }}>Sobre o que é?</label>
          <select value={categoria} onChange={e => setCategoria(e.target.value)} style={inputStyle}>
            {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }}>Título</label>
          <input
            type="text" value={assunto} maxLength={120} onChange={e => setAssunto(e.target.value)}
            placeholder="Ex: Paguei e meu plano não ativou" style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }}>O que aconteceu?</label>
          <textarea
            value={mensagem} maxLength={4000} rows={5} onChange={e => setMensagem(e.target.value)}
            placeholder="Quanto mais detalhe (datas, valores, nome do prestador), mais rápido a gente resolve."
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {erro && (
          <p style={{ fontSize: 13, margin: 0, padding: '10px 14px', borderRadius: 12, color: '#B91C1C', background: '#FEF2F2' }}>
            {erro}
          </p>
        )}

        <Button fullWidth icon={<Send size={16} />} disabled={enviando} onClick={enviar}>
          {enviando ? 'Enviando...' : 'Enviar chamado'}
        </Button>
        <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: colors.textSub, margin: 0 }}>
          <Mail size={13} /> Prefere e-mail? contato@prestador.app
        </p>
      </Card>

      <h2 style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: `${spacing.card}px 0 10px` }}>Meus chamados</h2>
      {carregandoLista ? (
        <p style={{ fontSize: 13, color: colors.textSub }}>Carregando...</p>
      ) : chamados.length === 0 ? (
        <p style={{ fontSize: 13, color: colors.textSub }}>Você ainda não abriu nenhum chamado.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {chamados.map(c => {
            const st = STATUS[c.status] || STATUS.aberto
            return (
              <Card key={c.id} padding={16}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: 0 }}>{c.assunto}</p>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: st.bg, color: st.cor, flexShrink: 0 }}>
                    {st.label}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: colors.textSub, margin: '0 0 8px' }}>
                  {CATEGORIAS.find(x => x.id === c.categoria)?.label} · {new Date(c.criado_em).toLocaleDateString('pt-BR')}
                  {c.prioridade === 'alta' && ' · prioridade Premium'}
                </p>
                <p style={{ fontSize: 13, color: colors.textSub, margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{c.mensagem}</p>
                {c.resposta && (
                  <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: '#F0FDF4' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: colors.primaryHover, margin: '0 0 4px' }}>Resposta do suporte</p>
                    <p style={{ fontSize: 13, color: colors.text, margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{c.resposta}</p>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
