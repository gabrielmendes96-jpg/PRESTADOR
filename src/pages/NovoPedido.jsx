import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useCategorias, useServicosCatalogo } from '../lib/hooks'
import { ESTADOS, buscarMunicipios } from '../lib/localidades'
import { colors, spacing } from '../lib/design'
import { prepararArquivo, enviarParaStorage, ErroDeMidia } from '../lib/midia'
import { useErroDeEnvio } from '../lib/useErroDeEnvio'
import SeletorDeFotos from '../components/SeletorDeFotos'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import SearchableSelect from '../components/ui/SearchableSelect'
import Chip from '../components/ui/Chip'

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

const MAX_MIDIAS = 10

const labelStyle = { display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }

export default function NovoPedido() {
  const { usuario, carregando: authCarregando } = useAuth()
  const navigate = useNavigate()
  const { categorias } = useCategorias()
  const [etapa, setEtapa] = useState(1) // 1: form, 2: créditos
  const [creditosDisponiveis, setCreditosDisponiveis] = useState(0)
  const [ganhouBoasVindas, setGanhouBoasVindas] = useState(0)
  const [pacoteSelecionado, setPacoteSelecionado] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [dados, setDados] = useState({
    titulo: '',
    descricao: '',
    categoria_id: '',
    servico_id: '',
    cidade: '',
    estado: '',
    orcamento_min: '',
    orcamento_max: '',
    prazo: '',
  })
  const { servicos: catalogo } = useServicosCatalogo(dados.categoria_id)
  const [cidades, setCidades] = useState([])
  const [carregandoCidades, setCarregandoCidades] = useState(false)
  const [midias, setMidias] = useState([]) // [{ preparado, url, tipo }] — já conferidas e encolhidas
  const [preparando, setPreparando] = useState(false)
  const [erro, setErro] = useState('')
  const envioMidia = useErroDeEnvio()

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
    const ler = () => supabase.from('creditos_cliente').select('creditos_disponiveis').eq('user_id', usuario.id).maybeSingle()
    let { data } = await ler()
    // Cliente novo (sem registro de créditos) ganha os pedidos de boas-vindas, uma única vez.
    // Se a função ainda não existir no banco, o erro é ignorado e segue como antes.
    if (!data) {
      const { data: ganhou } = await supabase.rpc('dar_creditos_de_boas_vindas')
      if (ganhou > 0) { setGanhouBoasVindas(ganhou); ({ data } = await ler()) }
    }
    setCreditosDisponiveis(data?.creditos_disponiveis || 0)
  }

  const atualizar = (campo, valor) => setDados({ ...dados, [campo]: valor })

  // Trocar de categoria limpa o serviço escolhido (ele pertence à categoria).
  const mudarCategoria = (id) => setDados(prev => ({ ...prev, categoria_id: id, servico_id: '' }))

  // Escolher um serviço preenche o título sozinho — a menos que a pessoa
  // já tenha escrito um título próprio.
  const escolherServico = (servico) => setDados(prev => {
    const nomeAnterior = catalogo.find(x => x.id === prev.servico_id)?.nome
    const tituloAutomatico = !prev.titulo || prev.titulo === nomeAnterior
    if (prev.servico_id === servico.id) {
      return { ...prev, servico_id: '', titulo: tituloAutomatico ? '' : prev.titulo }
    }
    return { ...prev, servico_id: servico.id, titulo: tituloAutomatico ? servico.nome : prev.titulo }
  })

  const mudarEstado = (uf) => setDados(prev => ({ ...prev, estado: uf, cidade: '' }))

  // Confere e encolhe cada foto assim que é escolhida: o erro aparece na hora, não só no final.
  const handleArquivosMidia = async (arquivos) => {
    envioMidia.limpar()
    const vagas = MAX_MIDIAS - midias.length
    if (vagas <= 0) { envioMidia.falhou(new ErroDeMidia(`Você já adicionou ${MAX_MIDIAS} fotos, que é o máximo. Remova alguma para colocar outra.`)); return }
    setPreparando(true)
    const novas = []
    let ultimoErro = null
    for (const f of arquivos.slice(0, vagas)) {
      try {
        const preparado = await prepararArquivo(f)
        novas.push({ preparado, url: URL.createObjectURL(preparado.arquivo), tipo: preparado.tipo })
      } catch (e) {
        ultimoErro = e
      }
    }
    if (novas.length) setMidias(prev => [...prev, ...novas])
    if (ultimoErro) envioMidia.falhou(ultimoErro)
    else if (arquivos.length > vagas) envioMidia.falhou(new ErroDeMidia(`O máximo é ${MAX_MIDIAS} fotos. Só as primeiras foram adicionadas.`))
    else envioMidia.deuCerto()
    setPreparando(false)
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
        servico_id: dados.servico_id || null,
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
    let naoSubiram = 0
    for (const [i, m] of midias.entries()) {
      try {
        const { url, tipo } = await enviarParaStorage(supabase, 'midias', `pedidos/${data.id}/${Date.now()}-${i}`, m.preparado)
        const { error: erroMidia } = await supabase.from('midias_pedido').insert({ pedido_id: data.id, url, tipo })
        if (erroMidia) throw erroMidia
      } catch {
        naoSubiram++
      }
    }
    if (naoSubiram) {
      alert(`Seu pedido foi publicado, mas ${naoSubiram === 1 ? '1 foto não foi enviada' : `${naoSubiram} fotos não foram enviadas`}. Você pode combinar os detalhes pelo chat com o profissional.`)
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
          {ganhouBoasVindas > 0 && (
            <p role="status" style={{ fontSize: 14, margin: '-8px 0 20px', padding: '10px 14px', borderRadius: 12, background: '#F0FDF4', border: '1px solid #BBF7D0', color: colors.text }}>
              <strong>Boas-vindas!</strong> Você ganhou {ganhouBoasVindas} pedidos grátis para começar. Cada pedido publicado usa 1 crédito.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Categoria *</label>
              <SearchableSelect
                options={categorias.map(c => ({ value: c.id, label: c.nome, busca: c.termos }))}
                value={dados.categoria_id}
                onChange={mudarCategoria}
                placeholder="Digite para buscar a categoria..."
                emptyMessage="Nenhuma categoria encontrada"
              />
            </div>
            {catalogo.length > 0 && (
              <div>
                <label style={labelStyle}>O que você precisa?</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {catalogo.map(sv => (
                    <Chip key={sv.id} active={dados.servico_id === sv.id} onClick={() => escolherServico(sv)}>
                      {sv.nome}
                    </Chip>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: colors.textSub, margin: '8px 0 0' }}>
                  Não é nenhum desses? É só descrever no título abaixo.
                </p>
              </div>
            )}
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
                <label style={labelStyle}>Valor mínimo (R$)</label>
                <input type="number" value={dados.orcamento_min} onChange={e => atualizar('orcamento_min', e.target.value)}
                  style={inputStyle} placeholder="0" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Valor máximo (R$)</label>
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
              <p style={{ fontSize: 14, color: colors.textSub, marginTop: -2, marginBottom: 12, lineHeight: 1.45 }}>
                Mostre a peça quebrada, o cômodo ou o que precisa de serviço — ajuda o profissional a entender melhor. Até {MAX_MIDIAS} fotos.
              </p>
              {midias.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                  {midias.map((m, i) => (
                    <div key={i} style={{ position: 'relative', width: 88, height: 88, borderRadius: 12, overflow: 'hidden', border: `1px solid ${colors.border}` }}>
                      {m.tipo === 'video' ? (
                        <video src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <img src={m.url} alt="Foto anexada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      <button
                        type="button"
                        onClick={() => removerMidia(i)}
                        aria-label="Remover esta foto"
                        style={{ position: 'absolute', top: 3, right: 3, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <SeletorDeFotos
                onArquivos={handleArquivosMidia}
                enviando={preparando}
                verbo="Preparando"
                erro={envioMidia.erro}
                tentativas={envioMidia.tentativas}
              />
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
              disabled={!dados.titulo || !dados.categoria_id || !dados.cidade || enviando || preparando}
              onClick={publicarPedido}
            >
              {enviando ? 'Publicando...' : creditosDisponiveis > 0 ? 'Publicar pedido' : 'Continuar'}
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
