import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Wallet, Clock, Crown, Check, Send, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { colors, spacing } from '../lib/design'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'

function InfoTile({ label, value, valueColor }) {
  return (
    <div style={{ padding: 12, borderRadius: 14, background: colors.bg }}>
      <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 2px' }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 700, color: valueColor || colors.text, margin: 0 }}>{value}</p>
    </div>
  )
}

export default function DetalhePedido() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [pedido, setPedido] = useState(null)
  const [midias, setMidias] = useState([])
  const [candidaturas, setCandidaturas] = useState([])
  const [meuPrestador, setMeuPrestador] = useState(null)
  const [jaCandidatei, setJaCandidatei] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [form, setForm] = useState({ mensagem: '', valor_proposto: '', prazo_proposto: '' })
  const [showForm, setShowForm] = useState(false)
  const [erro, setErro] = useState('')
  const [dataAgendada, setDataAgendada] = useState('')
  const [salvandoData, setSalvandoData] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [marcandoEntregue, setMarcandoEntregue] = useState(false)
  const [erroPagamento, setErroPagamento] = useState('')
  const [mostrarFormDisputa, setMostrarFormDisputa] = useState(false)
  const [motivoDisputa, setMotivoDisputa] = useState('')
  const [abrindoDisputa, setAbrindoDisputa] = useState(false)
  const [respostaDisputa, setRespostaDisputa] = useState('')
  const [enviandoResposta, setEnviandoResposta] = useState(false)

  useEffect(() => {
    carregarTudo()
  }, [id, usuario])

  const carregarTudo = async () => {
    setCarregando(true)

    const { data: p } = await supabase
      .from('pedidos_servico')
      .select('*, categorias(nome, emoji)')
      .eq('id', id)
      .single()
    setPedido(p)
    if (p?.data_agendada) setDataAgendada(new Date(p.data_agendada).toISOString().slice(0, 16))

    const { data: mids } = await supabase
      .from('midias_pedido')
      .select('*')
      .eq('pedido_id', id)
    setMidias(mids || [])

    const { data: cands } = await supabase
      .from('candidaturas')
      .select('*, prestadores(id, nome, categoria_id, cidade, estado, foto_perfil)')
      .eq('pedido_id', id)
      .order('criado_em', { ascending: false })
    setCandidaturas(cands || [])

    if (usuario) {
      const { data: prest } = await supabase
        .from('prestadores')
        .select('id, plano_id')
        .eq('user_id', usuario.id)
        .single()
      setMeuPrestador(prest || null)

      if (prest) {
        const jaExiste = (cands || []).find(c => c.prestador_id === prest.id)
        setJaCandidatei(!!jaExiste)
      }
    }

    setCarregando(false)
  }

  const candidatar = async () => {
    if (!meuPrestador) return
    if (meuPrestador.plano_id !== 'premium') {
      alert('Apenas prestadores com plano Premium podem se candidatar a pedidos. Faça upgrade do seu plano!')
      return
    }
    setEnviando(true)

    await supabase.from('candidaturas').insert({
      pedido_id: id,
      prestador_id: meuPrestador.id,
      mensagem: form.mensagem,
      valor_proposto: form.valor_proposto ? parseFloat(form.valor_proposto) : null,
      prazo_proposto: form.prazo_proposto,
    })

    setEnviando(false)
    setJaCandidatei(true)
    setShowForm(false)
    carregarTudo()
  }

  const aceitarCandidatura = async (candidaturaId, prestadorId) => {
    setErro('')

    const candidatura = candidaturas.find(c => c.id === candidaturaId)

    const { error } = await supabase.from('candidaturas').update({ status: 'aceito' }).eq('id', candidaturaId)
    if (error) {
      setErro('Não foi possível aceitar essa candidatura. Tente novamente.')
      return
    }

    await supabase.from('candidaturas').update({ status: 'recusado' })
      .eq('pedido_id', id).neq('id', candidaturaId)
    await supabase.from('pedidos_servico').update({
      status: 'em_andamento',
      valor_acordado: candidatura?.valor_proposto || null,
    }).eq('id', id)

    // Iniciar conversa com o prestador escolhido
    const { data: conv, error: erroConversa } = await supabase.from('conversas').insert({
      prestador_id: prestadorId,
      cliente_user_id: usuario.id,
      cliente_nome: pedido.cliente_nome,
    }).select().single()

    if (erroConversa || !conv) {
      // A candidatura já foi aceita normalmente — só a conversa não abriu.
      setErro('Candidatura aceita, mas não foi possível abrir o chat. Acesse pela lista de Mensagens.')
      carregarTudo()
      return
    }

    navigate(`/chat/${conv.id}`)
  }

  const salvarDataAgendada = async () => {
    setSalvandoData(true)
    await supabase.from('pedidos_servico')
      .update({ data_agendada: dataAgendada ? new Date(dataAgendada).toISOString() : null })
      .eq('id', id)
    setSalvandoData(false)
  }

  const confirmarConclusao = async () => {
    setConfirmando(true)
    setErroPagamento('')
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/confirmar-servico-concluido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ pedidoId: id }),
    })
    const data = await res.json()
    setConfirmando(false)
    if (!res.ok) { setErroPagamento(data.error || 'Não foi possível confirmar a conclusão.'); return }
    carregarTudo()
  }

  const marcarEntregue = async () => {
    setMarcandoEntregue(true)
    setErroPagamento('')
    const { error } = await supabase.rpc('marcar_servico_entregue', { p_pedido_id: id })
    setMarcandoEntregue(false)
    if (error) { setErroPagamento('Não foi possível marcar como entregue.'); return }
    carregarTudo()
  }

  const abrirDisputa = async () => {
    if (!motivoDisputa.trim()) return
    setAbrindoDisputa(true)
    setErroPagamento('')
    const { error } = await supabase.from('pedidos_servico').update({
      disputa_aberta_em: new Date().toISOString(),
      disputa_motivo: motivoDisputa.trim(),
    }).eq('id', id)
    setAbrindoDisputa(false)
    if (error) { setErroPagamento('Não foi possível abrir a disputa.'); return }
    setMostrarFormDisputa(false)
    carregarTudo()
  }

  const responderDisputa = async () => {
    if (!respostaDisputa.trim()) return
    setEnviandoResposta(true)
    setErroPagamento('')
    const { error } = await supabase.rpc('responder_disputa', { p_pedido_id: id, p_resposta: respostaDisputa.trim() })
    setEnviandoResposta(false)
    if (error) { setErroPagamento('Não foi possível enviar a resposta.'); return }
    setRespostaDisputa('')
    carregarTudo()
  }

  if (carregando) return <p style={{ textAlign: 'center', padding: '64px 0', fontSize: 14, color: colors.textSub }}>Carregando...</p>
  if (!pedido) return <p style={{ textAlign: 'center', padding: '64px 0', fontSize: 14, color: colors.textSub }}>Pedido não encontrado.</p>

  const ehDono = usuario?.id === pedido.cliente_user_id
  const souPrestadorAceito = !!meuPrestador && candidaturas.some(c => c.status === 'aceito' && c.prestador_id === meuPrestador.id)
  const orcamentoTexto = pedido.orcamento_min && pedido.orcamento_max
    ? `R$${pedido.orcamento_min} – R$${pedido.orcamento_max}`
    : pedido.orcamento_max ? `até R$${pedido.orcamento_max}` : pedido.orcamento_min ? `a partir de R$${pedido.orcamento_min}` : null

  const inputStyle = {
    width: '100%', padding: '10px 14px', fontSize: 14, borderRadius: 12,
    border: `1px solid ${colors.border}`, outline: 'none', fontFamily: 'inherit',
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Detalhes do pedido */}
      <Card padding={24} style={{ marginBottom: spacing.card }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 8 }}>{pedido.titulo}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#DCFCE7', color: colors.primaryHover }}>
            {pedido.categorias?.nome}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, textTransform: 'capitalize',
            background: pedido.status === 'aberto' ? '#DCFCE7' : '#FEF3C7',
            color: pedido.status === 'aberto' ? colors.primaryHover : '#92610A',
          }}>
            {pedido.status}
          </span>
        </div>

        {pedido.descricao && (
          <p style={{ fontSize: 14, color: colors.textSub, marginBottom: 16, lineHeight: 1.6 }}>{pedido.descricao}</p>
        )}

        {midias.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {midias.map(m => (
              <a key={m.id} href={m.url} target="_blank" rel="noreferrer"
                style={{ width: 84, height: 84, borderRadius: 12, overflow: 'hidden', border: `1px solid ${colors.border}`, display: 'block' }}>
                {m.tipo === 'video' ? (
                  <video src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img src={m.url} alt="Anexo do pedido" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </a>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <InfoTile label="Localização" value={`${pedido.cidade}, ${pedido.estado}`} />
          {orcamentoTexto && <InfoTile label="Orçamento" value={orcamentoTexto} valueColor={colors.primary} />}
          {pedido.prazo && <InfoTile label="Prazo desejado" value={pedido.prazo} />}
          <InfoTile label="Candidaturas" value={`${candidaturas.length} prestador${candidaturas.length !== 1 ? 'es' : ''}`} />
        </div>

        <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
          Postado por {pedido.cliente_nome} · {new Date(pedido.criado_em).toLocaleDateString('pt-BR')}
        </p>
      </Card>

      {/* Data agendada — combinada entre cliente e prestador depois que a candidatura é aceita */}
      {pedido.status === 'em_andamento' && (ehDono || souPrestadorAceito) && (
        <Card padding={16} style={{ marginBottom: spacing.card, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Calendar size={18} color={colors.primary} style={{ flexShrink: 0 }} />
          <label style={{ fontSize: 13, color: colors.textSub, flexShrink: 0 }}>Data agendada</label>
          <input type="datetime-local" value={dataAgendada} onChange={e => setDataAgendada(e.target.value)}
            style={{ ...inputStyle, width: 'auto', flex: '1 1 200px' }} />
          <Button size="sm" disabled={salvandoData} onClick={salvarDataAgendada}>
            {salvandoData ? 'Salvando...' : 'Salvar'}
          </Button>
        </Card>
      )}

      {/* Pagamento protegido do serviço */}
      {pedido.status === 'em_andamento' && (ehDono || souPrestadorAceito) && (
        <Card padding={16} style={{ marginBottom: spacing.card }}>
          {erroPagamento && (
            <p style={{ fontSize: 13, marginBottom: 12, padding: '10px 14px', borderRadius: 12, color: '#B91C1C', background: '#FEF2F2' }}>
              {erroPagamento}
            </p>
          )}

          {!pedido.status_pagamento && (
            ehDono ? (
              <>
                {pedido.valor_acordado ? (
                  <>
                    <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 4 }}>Pagamento protegido</p>
                    <p style={{ fontSize: 13, color: colors.textSub, marginBottom: 12 }}>
                      O valor combinado fica retido até você confirmar que o serviço foi concluído.
                    </p>
                    <Button fullWidth icon={<Wallet size={16} />} onClick={() => navigate(`/pagamento?tipo=servico&pedido=${id}`)}>
                      Pagar pelo app — R${pedido.valor_acordado}
                    </Button>
                  </>
                ) : (
                  <p style={{ fontSize: 13, color: colors.textSub, marginBottom: 12 }}>Combine o valor com o prestador pelo chat pra poder pagar pelo app.</p>
                )}
                <button onClick={confirmarConclusao} disabled={confirmando}
                  style={{ marginTop: 10, fontSize: 12, color: colors.textSub, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {confirmando ? 'Marcando...' : 'Já combinou o pagamento por fora? Marcar serviço como concluído'}
                </button>
              </>
            ) : (
              <p style={{ fontSize: 13, color: colors.textSub, margin: 0 }}>Aguardando o cliente efetuar o pagamento protegido.</p>
            )
          )}

          {pedido.status_pagamento === 'retido' && (
            <>
              <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 4 }}>Pagamento retido</p>

              {pedido.disputa_aberta_em && (
                <div style={{ padding: 12, borderRadius: 12, background: '#FEF3C7', marginBottom: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#92610A', margin: '0 0 4px' }}>Disputa aberta em análise</p>
                  <p style={{ fontSize: 13, color: '#92610A', margin: 0 }}>{pedido.disputa_motivo}</p>

                  {pedido.disputa_resposta_prestador && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(146,97,10,0.25)' }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#92610A', margin: '0 0 4px' }}>Resposta do prestador</p>
                      <p style={{ fontSize: 13, color: '#92610A', margin: 0 }}>{pedido.disputa_resposta_prestador}</p>
                    </div>
                  )}

                  {souPrestadorAceito && !pedido.disputa_respondida_em && (
                    <div style={{ marginTop: 10 }}>
                      <p style={{ fontSize: 12, color: '#92610A', marginBottom: 6 }}>
                        Responda em até 24h — deixar sem resposta desconta pontos de agilidade.
                      </p>
                      <textarea value={respostaDisputa} onChange={e => setRespostaDisputa(e.target.value)}
                        placeholder="Explique sua versão..."
                        style={{ width: '100%', padding: '10px 14px', fontSize: 13, borderRadius: 12, border: `1px solid ${colors.border}`, outline: 'none', fontFamily: 'inherit', resize: 'none', marginBottom: 8 }}
                        rows={3} />
                      <Button size="sm" fullWidth disabled={!respostaDisputa.trim() || enviandoResposta} onClick={responderDisputa}>
                        {enviandoResposta ? 'Enviando...' : 'Responder disputa'}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {souPrestadorAceito && !pedido.entregue_em && (
                <>
                  <p style={{ fontSize: 13, color: colors.textSub, marginBottom: 12 }}>
                    O pagamento já está protegido. Marque como entregue quando concluir o serviço.
                  </p>
                  <Button fullWidth disabled={marcandoEntregue} onClick={marcarEntregue}>
                    {marcandoEntregue ? 'Marcando...' : 'Marcar como entregue'}
                  </Button>
                </>
              )}
              {souPrestadorAceito && pedido.entregue_em && !pedido.disputa_aberta_em && (
                <p style={{ fontSize: 13, color: colors.textSub, margin: 0 }}>
                  Você marcou como entregue em {new Date(pedido.entregue_em).toLocaleDateString('pt-BR')}.
                  O pagamento libera automaticamente em até 3 dias se o cliente não confirmar antes.
                </p>
              )}
              {ehDono && (
                <>
                  <p style={{ fontSize: 13, color: colors.textSub, marginBottom: 12 }}>
                    {pedido.entregue_em
                      ? 'O prestador marcou o serviço como entregue. Se você não confirmar, o pagamento libera automaticamente em até 3 dias.'
                      : 'Confirme quando o serviço for concluído pra liberar o pagamento ao prestador.'}
                  </p>
                  <Button fullWidth disabled={confirmando} onClick={confirmarConclusao}>
                    {confirmando ? 'Confirmando...' : 'Confirmar conclusão e liberar pagamento'}
                  </Button>

                  {!pedido.disputa_aberta_em && !mostrarFormDisputa && (
                    <button onClick={() => setMostrarFormDisputa(true)}
                      style={{ marginTop: 10, fontSize: 12, color: colors.textSub, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      Teve algum problema com o serviço?
                    </button>
                  )}
                  {!pedido.disputa_aberta_em && mostrarFormDisputa && (
                    <div style={{ marginTop: 10 }}>
                      <textarea value={motivoDisputa} onChange={e => setMotivoDisputa(e.target.value)}
                        placeholder="Explique o que houve..."
                        style={{ width: '100%', padding: '10px 14px', fontSize: 13, borderRadius: 12, border: `1px solid ${colors.border}`, outline: 'none', fontFamily: 'inherit', resize: 'none', marginBottom: 8 }}
                        rows={3} />
                      <Button size="sm" variant="secondary" fullWidth disabled={!motivoDisputa.trim() || abrindoDisputa} onClick={abrirDisputa}>
                        {abrindoDisputa ? 'Abrindo...' : 'Abrir disputa'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {pedido.status_pagamento === 'liberando' && (
            <p style={{ fontSize: 13, color: colors.textSub, margin: 0 }}>Processando a liberação do pagamento...</p>
          )}

          {pedido.status_pagamento === 'liberado' && (
            <Badge tone="success" icon={<Check size={12} strokeWidth={3} />}>Pagamento liberado</Badge>
          )}
        </Card>
      )}

      {/* Ação de candidatura (para prestadores Premium) */}
      {meuPrestador && !ehDono && pedido.status === 'aberto' && (
        <div style={{ marginBottom: spacing.card }}>
          {jaCandidatei ? (
            <Card padding={16} style={{ textAlign: 'center', background: '#DCFCE7', border: 'none' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: colors.primaryHover, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: 0 }}>
                <Check size={16} strokeWidth={3} /> Você já se candidatou a este pedido!
              </p>
            </Card>
          ) : meuPrestador.plano_id !== 'premium' ? (
            <Card padding={16}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#92610A', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Crown size={16} /> Recurso exclusivo Premium
              </p>
              <p style={{ fontSize: 13, color: colors.textSub, marginBottom: 12 }}>Apenas prestadores com plano Premium podem se candidatar a pedidos de serviço.</p>
              <Button size="sm" onClick={() => navigate('/planos')}>Fazer upgrade para Premium</Button>
            </Card>
          ) : (
            <div>
              <Button variant="dark" fullWidth icon={<Send size={16} />} onClick={() => setShowForm(!showForm)}>
                Me candidatar a este pedido
              </Button>

              {showForm && (
                <Card padding={16} style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }}>Sua mensagem *</label>
                    <textarea value={form.mensagem} onChange={e => setForm({ ...form, mensagem: e.target.value })}
                      style={{ ...inputStyle, resize: 'none' }}
                      rows={3} placeholder="Apresente-se e explique por que você é o profissional ideal..." />
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }}>Seu valor (R$)</label>
                      <input type="number" value={form.valor_proposto} onChange={e => setForm({ ...form, valor_proposto: e.target.value })}
                        style={inputStyle} placeholder="0" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }}>Prazo</label>
                      <input type="text" value={form.prazo_proposto} onChange={e => setForm({ ...form, prazo_proposto: e.target.value })}
                        style={inputStyle} placeholder="Ex: 3 dias" />
                    </div>
                  </div>
                  <Button variant="dark" fullWidth disabled={!form.mensagem || enviando} onClick={candidatar}>
                    {enviando ? 'Enviando...' : 'Enviar candidatura'}
                  </Button>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lista de candidaturas (visível para o dono do pedido) */}
      {ehDono && (
        <Card padding={24}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 16 }}>
            {candidaturas.length} candidatura{candidaturas.length !== 1 ? 's' : ''} recebida{candidaturas.length !== 1 ? 's' : ''}
          </h2>

          {erro && (
            <p style={{ fontSize: 13, marginBottom: 16, padding: '10px 14px', borderRadius: 12, color: '#B91C1C', background: '#FEF2F2' }}>
              {erro}
            </p>
          )}

          {candidaturas.length === 0 ? (
            <p style={{ fontSize: 14, textAlign: 'center', padding: '32px 0', color: colors.textSub }}>Nenhuma candidatura ainda. Aguarde os prestadores se candidatarem!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.card }}>
              {candidaturas.map(c => (
                <div key={c.id} style={{
                  padding: 16, borderRadius: 14, background: colors.bg,
                  border: c.status === 'aceito' ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar nome={c.prestadores?.nome} foto={c.prestadores?.foto_perfil} size={32} style={{ fontSize: 12 }} />
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: 0 }}>{c.prestadores?.nome}</p>
                        <p style={{ fontSize: 12, color: colors.textSub, textTransform: 'capitalize', margin: 0 }}>{c.prestadores?.cidade}, {c.prestadores?.estado}</p>
                      </div>
                    </div>
                    {c.status === 'aceito' && <Badge tone="success" icon={<Check size={10} strokeWidth={3} />}>Aceito</Badge>}
                  </div>

                  {c.mensagem && <p style={{ fontSize: 14, color: colors.textSub, marginBottom: 10 }}>{c.mensagem}</p>}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    {c.valor_proposto && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#DCFCE7', color: colors.primaryHover }}>
                        <Wallet size={12} /> R${c.valor_proposto}
                      </span>
                    )}
                    {c.prazo_proposto && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '3px 10px', borderRadius: 999, background: '#fff', color: colors.textSub, border: `1px solid ${colors.border}` }}>
                        <Clock size={12} /> {c.prazo_proposto}
                      </span>
                    )}
                  </div>

                  {c.status === 'pendente' && pedido.status === 'aberto' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button variant="secondary" size="sm" fullWidth onClick={() => navigate(`/profissional/${c.prestadores?.id}`)}>
                        Ver perfil
                      </Button>
                      <Button variant="dark" size="sm" fullWidth icon={<Check size={14} strokeWidth={3} />} onClick={() => aceitarCandidatura(c.id, c.prestador_id)}>
                        Aceitar e iniciar chat
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
