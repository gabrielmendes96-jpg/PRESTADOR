import { useState } from 'react'
import { useCategorias } from '../lib/hooks'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { TOPICOS } from '../lib/dados'
import { colors, spacing } from '../lib/design'
import { getCategoriaIcone } from '../lib/categoriaIcones'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Chip from '../components/ui/Chip'

const topicosDisponiveis = TOPICOS

const inputStyle = {
  width: '100%', padding: '10px 14px', fontSize: 14, borderRadius: 12,
  border: `1px solid ${colors.border}`, outline: 'none', color: colors.text, fontFamily: 'inherit',
}

const labelStyle = { display: 'block', fontSize: 13, color: colors.textSub, marginBottom: 6 }

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
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.text, marginBottom: 4 }}>Cadastre-se como profissional</h1>
      <p style={{ fontSize: 14, color: colors.textSub, marginBottom: 24 }}>Etapa {etapa} de 3</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {[1, 2, 3].map(e => (
          <div key={e} style={{ height: 6, flex: 1, borderRadius: 999, transition: 'background 0.25s ease', background: e <= etapa ? colors.primary : colors.border }} />
        ))}
      </div>

      <Card padding={24}>
        {/* ETAPA 1 — Dados pessoais */}
        {etapa === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Nome completo</label>
              <input type="text" value={dados.nome} onChange={e => atualizar('nome', e.target.value)} style={inputStyle} placeholder="Seu nome" />
            </div>
            <div>
              <label style={labelStyle}>E-mail</label>
              <input type="email" value={dados.email} onChange={e => atualizar('email', e.target.value)} style={inputStyle} placeholder="seu@email.com" />
            </div>
            <div>
              <label style={labelStyle}>WhatsApp</label>
              <input type="text" value={dados.whatsapp} onChange={e => atualizar('whatsapp', e.target.value)} style={inputStyle} placeholder="(00) 00000-0000" />
            </div>
          </div>
        )}

        {/* ETAPA 2 — Profissão e localização */}
        {etapa === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Profissão</label>
              <select value={dados.categoria} onChange={e => atualizar('categoria', e.target.value)} style={inputStyle}>
                <option value="">Selecione sua profissão</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                <option value="__outro__">Outra profissão (digitar)</option>
              </select>
            </div>

            {/* Campo para profissão personalizada */}
            {dados.categoria === '__outro__' && (
              <div>
                <label style={labelStyle}>Digite sua profissão</label>
                <input
                  type="text"
                  value={dados.categoriaCustom}
                  onChange={e => atualizar('categoriaCustom', e.target.value)}
                  style={inputStyle}
                  placeholder="Ex: Gesseiro, Marmorista, Técnico em Refrigeração..."
                />
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>
                  Sua profissão será adicionada à plataforma e ficará disponível para outros prestadores também.
                </p>

                {/* Alocação em tópicos */}
                <div style={{ marginTop: 14 }}>
                  <label style={{ ...labelStyle, marginBottom: 8 }}>Em quais tópicos sua profissão se encaixa?</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {topicosDisponiveis.map(top => {
                      const { icon: Icon } = getCategoriaIcone(top)
                      return (
                        <Chip key={top.id} active={dados.topicos.includes(top.id)} onClick={() => toggleTopico(top.id)} icon={<Icon size={13} />}>
                          {top.nome}
                        </Chip>
                      )
                    })}
                  </div>
                  <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>
                    Selecione um ou mais tópicos para que clientes te encontrem mais facilmente.
                  </p>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Cidade</label>
                <input type="text" value={dados.cidade} onChange={e => atualizar('cidade', e.target.value)} style={inputStyle} placeholder="Sua cidade" />
              </div>
              <div style={{ width: 90 }}>
                <label style={labelStyle}>Estado</label>
                <input type="text" value={dados.estado} onChange={e => atualizar('estado', e.target.value)} style={inputStyle} placeholder="SP" maxLength={2} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Sobre você</label>
              <textarea value={dados.descricao} onChange={e => atualizar('descricao', e.target.value)}
                style={{ ...inputStyle, resize: 'none' }} rows={4} placeholder="Descreva sua experiência e os serviços que oferece..." />
            </div>

            <div>
              <label style={labelStyle}>Fotos do seu trabalho</label>
              <p style={{ fontSize: 12, color: '#9CA3AF' }}>Adicione fotos no painel após finalizar o cadastro. Perfis com fotos recebem 3x mais contatos!</p>
            </div>
          </div>
        )}

        {/* ETAPA 3 — Plano */}
        {etapa === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 14, color: colors.textSub, marginBottom: 4 }}>Escolha seu plano para começar:</p>
            {['basico', 'profissional', 'premium'].map((id) => {
              const nomes = { basico: 'Básico — R$49/mês', profissional: 'Profissional — R$99/mês', premium: 'Premium — R$199/mês' }
              const descs = {
                basico: 'Perfil básico + até 10 fotos + chat',
                profissional: 'Destaque nos resultados + selo de plano Profissional',
                premium: 'Topo das buscas + suporte prioritário'
              }
              return (
                <label key={id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, cursor: 'pointer',
                  ...(dados.plano === id ? { border: `2px solid ${colors.primary}`, background: '#F0FDF4' } : { border: `1px solid ${colors.border}` }),
                }}>
                  <input type="radio" name="plano" value={id} checked={dados.plano === id} onChange={() => atualizar('plano', id)} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: 0 }}>{nomes[id]}</p>
                    <p style={{ fontSize: 12, color: colors.textSub, margin: 0 }}>{descs[id]}</p>
                  </div>
                </label>
              )
            })}
            {erro && <p style={{ fontSize: 12, color: '#B91C1C' }}>{erro}</p>}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: spacing.xl }}>
          {etapa > 1 && (
            <Button variant="secondary" fullWidth onClick={() => setEtapa(etapa - 1)}>Voltar</Button>
          )}
          <Button fullWidth disabled={enviando} onClick={() => etapa < 3 ? setEtapa(etapa + 1) : finalizar()}>
            {etapa === 3 ? (enviando ? 'Enviando...' : 'Finalizar cadastro') : 'Continuar'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default CadastroPro
