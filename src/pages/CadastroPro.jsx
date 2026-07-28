import { useState } from 'react'
import { useCategorias } from '../lib/hooks'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { TOPICOS, CATEGORIAS_POR_TOPICO } from '../lib/dados'

const topicosDisponiveis = TOPICOS

export function CadastroPro() {
  const [etapa, setEtapa] = useState(1)
  const [dados, setDados] = useState({
    nome: '', email: '', whatsapp: '', cidade: '', estado: '',
    categoria: '', categoriaCustom: '', topicos: [], descricao: '', plano: ''
  })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const navigate = useNavigate()
  const { categorias } = useCategorias()

  const atualizar = (campo, valor) => setDados({ ...dados, [campo]: valor })

  const toggleTopico = (id) => {
    const topicos = dados.topicos.includes(id)
      ? dados.topicos.filter(t => t !== id)
      : [...dados.topicos, id]
    atualizar('topicos', topicos)
  }

  const finalizar = async () => {
    if (!dados.plano) return alert('Escolha um plano para continuar.')
    setEnviando(true)
    setErro('')

    const { data: userData } = await supabase.auth.getUser()

    let categoriaId = dados.categoria

    // Se digitou profissão personalizada, criar nova categoria
    if (!categoriaId && dados.categoriaCustom.trim()) {
      const nomeNovo = dados.categoriaCustom.trim()
      const idNovo = nomeNovo.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')

      const { data: catExistente } = await supabase
        .from('categorias')
        .select('id')
        .eq('id', idNovo)
        .single()

      if (!catExistente) {
        await supabase.from('categorias').insert({
          id: idNovo,
          nome: nomeNovo,
          emoji: '🔧',
          ordem: 99,
          personalizada: true,
        })
      }

      // Alocar nos tópicos selecionados manualmente
      for (const topicoId of dados.topicos) {
        await supabase.from('topico_categorias')
          .insert({ topico_id: topicoId, categoria_id: idNovo })
          .on('conflict', 'do nothing')
      }

      categoriaId = idNovo
    }

    const { error } = await supabase.from('prestadores').insert({
      user_id: userData?.user?.id || null,
      nome: dados.nome,
      email: dados.email,
      whatsapp: dados.whatsapp,
      categoria_id: categoriaId,
      cidade: dados.cidade,
      estado: dados.estado,
      descricao: dados.descricao,
      plano_id: dados.plano,
      servicos: [],
      disponivel: true,
    })

    setEnviando(false)

    if (error) {
      setErro('Não foi possível concluir o cadastro. Verifique se está logado.')
      return
    }

    navigate('/onboarding')
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-1" style={{ color: '#1F2D24' }}>Cadastre-se como profissional</h1>
      <p className="text-sm mb-6" style={{ color: '#7C9485' }}>Etapa {etapa} de 3</p>

      <div className="flex gap-2 mb-8">
        {[1,2,3].map(e => (
          <div key={e} className="h-1.5 flex-1 rounded-full transition-colors" style={{ background: e <= etapa ? '#1FA855' : '#E3E9E5' }} />
        ))}
      </div>

      {/* ETAPA 1 — Dados pessoais */}
      {etapa === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Nome completo</label>
            <input type="text" value={dados.nome} onChange={e => atualizar('nome', e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" placeholder="Seu nome" />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>E-mail</label>
            <input type="email" value={dados.email} onChange={e => atualizar('email', e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" placeholder="seu@email.com" />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>WhatsApp</label>
            <input type="text" value={dados.whatsapp} onChange={e => atualizar('whatsapp', e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" placeholder="(00) 00000-0000" />
          </div>
        </div>
      )}

      {/* ETAPA 2 — Profissão e localização */}
      {etapa === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Profissão</label>
            <select value={dados.categoria} onChange={e => atualizar('categoria', e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none">
              <option value="">Selecione sua profissão</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.nome}</option>)}
              <option value="__outro__">Outra profissão (digitar)</option>
            </select>
          </div>

          {/* Campo para profissão personalizada */}
          {dados.categoria === '__outro__' && (
            <div>
              <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Digite sua profissão</label>
              <input
                type="text"
                value={dados.categoriaCustom}
                onChange={e => atualizar('categoriaCustom', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none"
                placeholder="Ex: Gesseiro, Marmorista, Técnico em Refrigeração..."
              />
              <p className="text-xs mt-1" style={{ color: '#C9BFA8' }}>
                Sua profissão será adicionada à plataforma e ficará disponível para outros prestadores também.
              </p>

              {/* Alocação em tópicos */}
              <div className="mt-3">
                <label className="block text-sm mb-2" style={{ color: '#5F6F65' }}>
                  Em quais tópicos sua profissão se encaixa?
                </label>
                <div className="flex flex-wrap gap-2">
                  {topicosDisponiveis.map(top => (
                    <button
                      key={top.id}
                      type="button"
                      onClick={() => toggleTopico(top.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors"
                      style={dados.topicos.includes(top.id)
                        ? { background: '#1FA855', color: '#fff' }
                        : { background: '#FAF6EE', color: '#1F2D24', border: '0.5px solid #EDE3CE' }
                      }
                    >
                      {top.emoji} {top.nome}
                    </button>
                  ))}
                </div>
                <p className="text-xs mt-1" style={{ color: '#C9BFA8' }}>
                  Selecione um ou mais tópicos para que clientes te encontrem mais facilmente.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Cidade</label>
              <input type="text" value={dados.cidade} onChange={e => atualizar('cidade', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" placeholder="Sua cidade" />
            </div>
            <div className="w-24">
              <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Estado</label>
              <input type="text" value={dados.estado} onChange={e => atualizar('estado', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" placeholder="SP" maxLength={2} />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Sobre você</label>
            <textarea value={dados.descricao} onChange={e => atualizar('descricao', e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none resize-none"
              rows={4} placeholder="Descreva sua experiência e os serviços que oferece..." />
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: '#5F6F65' }}>Fotos do seu trabalho</label>
            <p className="text-xs mb-2" style={{ color: '#C9BFA8' }}>Adicione fotos no painel após finalizar o cadastro. Perfis com fotos recebem 3x mais contatos!</p>
          </div>
        </div>
      )}

      {/* ETAPA 3 — Plano */}
      {etapa === 3 && (
        <div className="space-y-4">
          <p className="text-sm mb-4" style={{ color: '#5F6F65' }}>Escolha seu plano para começar:</p>
          {['basico', 'profissional', 'premium'].map((id) => {
            const nomes = { basico: 'Básico — R$49/mês', profissional: 'Profissional — R$99/mês', premium: 'Premium — R$199/mês' }
            const descs = {
              basico: 'Perfil básico + até 10 fotos + chat',
              profissional: 'Destaque nos resultados + selo verificado',
              premium: 'Topo das buscas + suporte prioritário'
            }
            return (
              <label key={id} className="flex items-center gap-3 p-4 rounded-xl cursor-pointer"
                style={dados.plano === id ? { border: '2px solid #1FA855', background: '#F4FAF6' } : { border: '0.5px solid #EDE3CE' }}>
                <input type="radio" name="plano" value={id} checked={dados.plano === id} onChange={() => atualizar('plano', id)} />
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>{nomes[id]}</p>
                  <p className="text-xs" style={{ color: '#7C9485' }}>{descs[id]}</p>
                </div>
              </label>
            )
          })}
          {erro && <p className="text-xs" style={{ color: '#A32D2D' }}>{erro}</p>}
        </div>
      )}

      <div className="flex gap-3 mt-8">
        {etapa > 1 && (
          <button onClick={() => setEtapa(etapa - 1)}
            className="flex-1 py-2.5 text-sm rounded-xl hover:opacity-80"
            style={{ border: '0.5px solid #EDE3CE', color: '#1F2D24', background: '#fff' }}>
            Voltar
          </button>
        )}
        <button
          onClick={() => etapa < 3 ? setEtapa(etapa + 1) : finalizar()}
          disabled={enviando}
          className="flex-1 py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-60"
          style={{ background: '#1FA855' }}
        >
          {etapa === 3 ? (enviando ? 'Enviando...' : 'Finalizar cadastro') : 'Continuar'}
        </button>
      </div>
    </div>
  )
}

export default CadastroPro
