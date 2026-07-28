import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useCategorias } from '../lib/hooks'

const pacotes = [
  { id: 'avulso', nome: 'Avulso', preco: 9, creditos: 1, destaque: false, desc: '1 pedido' },
  { id: 'basico', nome: 'Básico', preco: 35, creditos: 5, destaque: false, desc: '5 pedidos · R$7/pedido' },
  { id: 'popular', nome: 'Popular', preco: 59, creditos: 10, destaque: true, desc: '10 pedidos · R$5,90/pedido' },
  { id: 'pro', nome: 'Pro', preco: 99, creditos: 20, destaque: false, desc: '20 pedidos · R$4,95/pedido' },
]

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
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex gap-2 mb-6">
        {[1,2,3].map(e => (
          <div key={e} className="h-1.5 flex-1 rounded-full" style={{ background: e <= etapa ? '#1FA855' : '#EDE3CE' }} />
        ))}
      </div>

      {/* ETAPA 1 — Formulário do pedido */}
      {etapa === 1 && (
        <div>
          <h1 className="text-xl font-semibold mb-1" style={{ color: '#1F2D24' }}>Postar pedido de serviço</h1>
          <p className="text-sm mb-5" style={{ color: '#7C9485' }}>
            Você tem <strong style={{ color: '#1FA855' }}>{creditosDisponiveis} crédito{creditosDisponiveis !== 1 ? 's' : ''}</strong> disponíve{creditosDisponiveis !== 1 ? 'is' : 'l'}.
            {creditosDisponiveis === 0 && ' Será necessário comprar créditos para publicar.'}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Título do pedido *</label>
              <input type="text" value={dados.titulo} onChange={e => atualizar('titulo', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none"
                placeholder="Ex: Preciso pintar sala e quartos" />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Descrição</label>
              <textarea value={dados.descricao} onChange={e => atualizar('descricao', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none resize-none"
                rows={3} placeholder="Detalhes do serviço que você precisa..." />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Categoria *</label>
              <select value={dados.categoria_id} onChange={e => atualizar('categoria_id', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none">
                <option value="">Selecione a categoria</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.nome}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Cidade *</label>
                <input type="text" value={dados.cidade} onChange={e => atualizar('cidade', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none"
                  placeholder="Sua cidade" />
              </div>
              <div className="w-20">
                <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Estado</label>
                <input type="text" value={dados.estado} onChange={e => atualizar('estado', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none"
                  placeholder="SP" maxLength={2} />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Orçamento mínimo (R$)</label>
                <input type="number" value={dados.orcamento_min} onChange={e => atualizar('orcamento_min', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none"
                  placeholder="0" />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Orçamento máximo (R$)</label>
                <input type="number" value={dados.orcamento_max} onChange={e => atualizar('orcamento_max', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none"
                  placeholder="0" />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Prazo desejado</label>
              <input type="text" value={dados.prazo} onChange={e => atualizar('prazo', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none"
                placeholder="Ex: Esta semana, Em 15 dias, Sem pressa..." />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => navigate('/pedidos')}
              className="flex-1 py-2.5 text-sm rounded-xl"
              style={{ border: '0.5px solid #EDE3CE', color: '#7C9485' }}>
              Cancelar
            </button>
            <button
              onClick={publicarPedido}
              disabled={!dados.titulo || !dados.categoria_id || !dados.cidade || enviando}
              className="flex-1 py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-50"
              style={{ background: '#1FA855' }}
            >
              {enviando ? 'Publicando...' : creditosDisponiveis > 0 ? 'Publicar (1 crédito)' : 'Continuar'}
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 2 — Comprar créditos */}
      {etapa === 2 && (
        <div>
          <h1 className="text-xl font-semibold mb-1" style={{ color: '#1F2D24' }}>Comprar créditos</h1>
          <p className="text-sm mb-5" style={{ color: '#7C9485' }}>Escolha um pacote para publicar seu pedido. Créditos não expiram!</p>

          <div className="flex flex-col gap-3 mb-6">
            {pacotes.map(p => (
              <label
                key={p.id}
                className="flex items-center gap-3 p-4 rounded-xl cursor-pointer"
                style={pacoteSelecionado === p.id
                  ? { border: '2px solid #1FA855', background: '#F4FAF6' }
                  : { border: '0.5px solid #EDE3CE' }
                }
              >
                <input type="radio" name="pacote" value={p.id}
                  checked={pacoteSelecionado === p.id}
                  onChange={() => setPacoteSelecionado(p.id)} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>{p.nome}</p>
                    {p.destaque && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#FFF4D6', color: '#8A5A00' }}>
                        Mais popular
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: '#7C9485' }}>{p.desc}</p>
                </div>
                <p className="text-base font-semibold" style={{ color: '#1FA855' }}>R${p.preco}</p>
              </label>
            ))}
          </div>

          <div className="p-4 rounded-xl mb-5" style={{ background: '#FFF4D6' }}>
            <p className="text-xs" style={{ color: '#8A5A00' }}>
              ⚠️ <strong>Atenção:</strong> O pagamento real será integrado com Asaas (Pix/cartão) em breve.
              Por enquanto, os créditos são adicionados diretamente para teste.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setEtapa(1)}
              className="flex-1 py-2.5 text-sm rounded-xl"
              style={{ border: '0.5px solid #EDE3CE', color: '#7C9485' }}>
              Voltar
            </button>
            <button
              onClick={comprarCreditos}
              disabled={!pacoteSelecionado || enviando}
              className="flex-1 py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-50"
              style={{ background: '#1FA855' }}
            >
              {enviando ? 'Processando...' : 'Confirmar compra'}
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 3 — Créditos comprados, publicar */}
      {etapa === 3 && (
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#1F2D24' }}>Créditos adicionados!</h2>
          <p className="text-sm mb-6" style={{ color: '#7C9485' }}>
            Você agora tem <strong style={{ color: '#1FA855' }}>{creditosDisponiveis} crédito{creditosDisponiveis !== 1 ? 's' : ''}</strong>. Publique seu pedido agora!
          </p>
          <button
            onClick={() => { setEtapa(1); publicarPedido() }}
            className="w-full py-3 text-white text-sm font-medium rounded-xl hover:opacity-90"
            style={{ background: '#1FA855' }}
          >
            Publicar pedido agora
          </button>
        </div>
      )}
    </div>
  )
}
