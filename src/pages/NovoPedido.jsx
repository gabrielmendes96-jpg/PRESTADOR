import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Video, X, Upload } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useCategorias } from '../lib/hooks'
import { ESTADOS, buscarMunicipios } from '../lib/localidades'
import { colors, spacing } from '../lib/design'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import SearchableSelect from '../components/ui/SearchableSelect'

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
  const { usuario, carregando: authCarregando } = useAuth()
  const navigate = useNavigate()
  const { categorias } = useCategorias()
  const [etapa, setEtapa] = useState(1) // 1: form, 2: créditos
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
  const [cidades, setCidades] = useState([])
  const [carregandoCidades, setCarregandoCidades] = useState(false)
  const [midias, setMidias] = useState([]) // [{ file, url, tipo }]
  const [erro, setErro] = useState('')
  const inputMidiaRef = useRef(null)

  useEffect(() => {
    if (authCarregando) return
    if (!usuario) { navigate('/login'); return }
    buscarCreditos()
  }, [usuario, authCarregando])

  // Busca os municípios do estado escolhido (API do IBGE) toda vez que o
  // estado muda, e reseta a cidade — evita cidade/estado incoerentes.
  useEffect(() => {
    if (!dados.estado) { setCidades([]); return }
    setCarregandoCidades(true)
    buscarMunicipios(dados.estado).then(lista => {
      setCidades(lista)
      setCarregandoCidades(false)
    })
  }, [dados.estado])

  const buscarCreditos = async () => {
    const { data } = await supabase
      .from('creditos_cliente')
      .select('creditos_disponiveis')
      .eq('user_id', usuario.id)
      .single()
    setCreditosDisponiveis(data?.creditos_disponiveis || 0)
  }

  const atualizar = (campo, valor) => setDados({ ...dados, [campo]: valor })

  const mudarEstado = (uf) => setDados(prev => ({ ...prev, estado: uf, cidade: '' }))

  const handleArquivosMidia = (e) => {
    const arquivos = Array.from(e.target.files)
    const novas = arquivos.map(f => ({
      file: f,
      url: URL.createObjectURL(f),
      tipo: f.type.startsWith('video') ? 'video' : 'foto',
    }))
    setMidias(prev => [...prev, ...novas])
    e.target.value = ''
  }

  const removerMidia = (idx) => setMidias(prev => prev.filter((_, i) => i !== idx))

  const publicarPedido = async () => {
    if (creditosDisponiveis < 1) { setEtapa(2); return }
    setEnviando(true)
    setErro('')

    // Cria o pedido ANTES de debitar o crédito — ainda como não pago.
    // Se cobrássemos primeiro e a criação falhasse depois, o cliente
    // perderia o crédito sem ficar com pedido nenhum. Assim, nada é
    // cobrado até termos certeza de que o pedido existe de verdade.
    const { data, error: erroPedido } = await supabase
      .from('pedidos_servico')
      .insert({
        cliente_user_id: usuario.id,
        cliente_nome: usuario.user_metadata?.nome || usuario.email?.split('@')[0] || 'Cliente',
        ...dados,
        orcamento_min: dados.orcamento_min ? parseFloat(dados.orcamento_min) : null,
        orcamento_max: dados.orcamento_max ? parseFloat(dados.orcamento_max) : null,
        valor_pago: 9.00,
        pago: false,
        status: 'aberto',
      })
      .select()
      .single()

    if (erroPedido || !data) {
      setEnviando(false)
      setErro('Não foi possível publicar seu pedido. Tente novamente.')
      return
    }

    // Debita 1 crédito e marca o pedido como pago na mesma função de banco
    // (garante que nunca fica negativo e que ninguém consegue marcar o
    // pedido como pago sem realmente descontar o crédito).
    const { error: erroCredito } = await supabase.rpc('debitar_credito', { p_pedido_id: data.id })
    if (erroCredito) {
      // Sem crédito de verdade — desfaz o pedido que acabou de ser criado.
      await supabase.from('pedidos_servico').update({ status: 'cancelado' }).eq('id', data.id)
      setEnviando(false)
      buscarCreditos()
      setEtapa(2)
      return
    }

    // Sobe as fotos/vídeos anexados (precisa do id do pedido pra montar o caminho)
    if (midias.length > 0) {
      for (const m of midias) {
        const ext = m.file.name.split('.').pop()
        const caminho = `pedidos/${data.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
        const { error: erroUpload } = await supabase.storage.from('midias').upload(caminho, m.file)
        if (!erroUpload) {
          const { data: urlData } = supabase.storage.from('midias').getPublicUrl(caminho)
          await supabase.from('midias_pedido').insert({ pedido_id: data.id, url: urlData.publicUrl, tipo: m.tipo })
        }
      }
    }

    setEnviando(false)
    navigate(`/pedidos/${data.id}`)
  }

  const comprarCreditos = () => {
    if (!pacoteSelecionado) return alert('Selecione um pacote!')
    // Os créditos só são liberados depois que o Asaas confirma o pagamento
    // (ver webhook-asaas.js) — aqui só redireciona para a cobrança real.
    navigate(`/pagamento?tipo=creditos&item=${pacoteSelecionado}`)
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[1, 2].map(e => (
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
              <SearchableSelect
                options={categorias.map(c => ({ value: c.id, label: c.nome }))}
                value={dados.categoria_id}
                onChange={v => atualizar('categoria_id', v)}
                placeholder="Digite para buscar a categoria..."
                emptyMessage="Nenhuma categoria encontrada"
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 140 }}>
                <label style={labelStyle}>Estado *</label>
                <select value={dados.estado} onChange={e => mudarEstado(e.target.value)} style={inputStyle}>
                  <option value="">UF</option>
                  {ESTADOS.map(e => <option key={e.sigla} value={e.sigla}>{e.sigla}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Cidade *</label>
                <SearchableSelect
                  options={cidades.map(nome => ({ value: nome, label: nome }))}
                  value={dados.cidade}
                  onChange={v => atualizar('cidade', v)}
                  placeholder={dados.estado ? 'Digite para buscar a cidade...' : 'Escolha o estado primeiro'}
                  emptyMessage="Nenhuma cidade encontrada"
                  disabled={!dados.estado}
                  loading={carregandoCidades}
                />
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

            <div>
              <label style={labelStyle}>Fotos ou vídeos (opcional)</label>
              <p style={{ fontSize: 12, color: colors.textSub, marginTop: -2, marginBottom: 10 }}>
                Mostre a peça quebrada, o cômodo ou o que precisa de serviço — ajuda o profissional a entender melhor.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {midias.map((m, i) => (
                  <div key={i} style={{ position: 'relative', width: 72, height: 72, borderRadius: 12, overflow: 'hidden', border: `1px solid ${colors.border}` }}>
                    {m.tipo === 'video' ? (
                      <video src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src={m.url} alt="Anexo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    <button
                      type="button"
                      onClick={() => removerMidia(i)}
                      aria-label="Remover anexo"
                      style={{ position: 'absolute', top: 2, right: 2, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <label style={{ width: 72, height: 72, borderRadius: 12, border: `1.5px dashed ${colors.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer', color: colors.textSub }}>
                  <Upload size={16} />
                  <span style={{ fontSize: 10 }}>Adicionar</span>
                  <input ref={inputMidiaRef} type="file" accept="image/*,video/*" multiple onChange={handleArquivosMidia} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
          </div>

          {erro && (
            <p style={{ fontSize: 13, marginTop: spacing.xl, padding: '10px 14px', borderRadius: 12, color: '#B91C1C', background: '#FEF2F2' }}>
              {erro}
            </p>
          )}

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

          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" fullWidth onClick={() => setEtapa(1)}>Voltar</Button>
            <Button fullWidth disabled={!pacoteSelecionado || enviando} onClick={comprarCreditos}>
              {enviando ? 'Processando...' : 'Continuar para pagamento'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
