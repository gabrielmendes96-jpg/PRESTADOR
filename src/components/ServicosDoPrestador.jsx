import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCategorias, useServicosCatalogo } from '../lib/hooks'
import { colors } from '../lib/design'
import Chip from './ui/Chip'

// Editor dos serviços que o prestador faz. O que ele marca aqui é o que o
// cliente enxerga no perfil, o que aparece como opção quando alguém pede
// orçamento ("combina com seus serviços") e o que a busca encontra.
export default function ServicosDoPrestador({ prestadorId, categoriaId }) {
  const { categorias } = useCategorias()
  const [categoriaVista, setCategoriaVista] = useState(categoriaId)
  const { servicos, loading } = useServicosCatalogo(categoriaVista)
  const [marcados, setMarcados] = useState(new Set())
  const [carregado, setCarregado] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { setCategoriaVista(categoriaId) }, [categoriaId])

  useEffect(() => {
    if (!prestadorId) return
    let cancelado = false
    supabase.from('prestador_servicos').select('servico_id').eq('prestador_id', prestadorId)
      .then(({ data }) => {
        if (cancelado) return
        setMarcados(new Set((data || []).map(r => r.servico_id)))
        setCarregado(true)
      })
    return () => { cancelado = true }
  }, [prestadorId])

  const alternar = async (servicoId) => {
    setErro('')
    const estava = marcados.has(servicoId)
    // Atualiza na hora; se o banco recusar, desfaz.
    setMarcados(prev => {
      const novo = new Set(prev)
      estava ? novo.delete(servicoId) : novo.add(servicoId)
      return novo
    })

    const { error } = estava
      ? await supabase.from('prestador_servicos').delete().eq('prestador_id', prestadorId).eq('servico_id', servicoId)
      : await supabase.from('prestador_servicos').insert({ prestador_id: prestadorId, servico_id: servicoId })

    if (error) {
      setErro('Não foi possível salvar essa alteração. Tente de novo.')
      setMarcados(prev => {
        const novo = new Set(prev)
        estava ? novo.add(servicoId) : novo.delete(servicoId)
        return novo
      })
    }
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: '0 0 4px' }}>
        Serviços que você faz {carregado && marcados.size > 0 && `(${marcados.size} marcado${marcados.size !== 1 ? 's' : ''})`}
      </p>
      <p style={{ fontSize: 13, color: colors.textSub, margin: '0 0 12px', lineHeight: 1.5 }}>
        Marque o que você realiza. O cliente escolhe um desses ao pedir orçamento, e você é encontrado nas buscas por eles.
      </p>

      <select
        value={categoriaVista || ''}
        onChange={e => setCategoriaVista(e.target.value)}
        style={{ width: '100%', padding: '9px 12px', fontSize: 13, borderRadius: 10, border: `1px solid ${colors.border}`, background: '#fff', marginBottom: 12 }}
      >
        {categorias.map(c => (
          <option key={c.id} value={c.id}>{c.nome}{c.id === categoriaId ? ' (sua categoria)' : ''}</option>
        ))}
      </select>

      {erro && (
        <p style={{ fontSize: 12, margin: '0 0 10px', padding: '8px 12px', borderRadius: 10, color: '#B91C1C', background: '#FEF2F2' }}>{erro}</p>
      )}

      {loading || !carregado ? (
        <p style={{ fontSize: 13, color: colors.textSub }}>Carregando serviços...</p>
      ) : servicos.length === 0 ? (
        <p style={{ fontSize: 13, color: colors.textSub, padding: 12, borderRadius: 10, background: colors.bg }}>
          Ainda não temos uma lista pronta pra essa categoria. Use as hashtags abaixo pra descrever o que você faz.
        </p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {servicos.map(s => (
            <Chip
              key={s.id}
              active={marcados.has(s.id)}
              onClick={() => alternar(s.id)}
              icon={marcados.has(s.id) ? <Check size={13} strokeWidth={3} /> : undefined}
            >
              {s.nome}
            </Chip>
          ))}
        </div>
      )}
    </div>
  )
}
