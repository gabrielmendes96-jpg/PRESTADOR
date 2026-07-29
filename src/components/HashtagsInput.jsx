import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { colors } from '../lib/design'

export default function HashtagsInput({ prestadorId }) {
  const [tags, setTags] = useState([])
  const [input, setInput] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!prestadorId) return
    supabase
      .from('servicos_prestador')
      .select('*')
      .eq('prestador_id', prestadorId)
      .then(({ data }) => {
        setTags(data || [])
        setCarregando(false)
      })
  }, [prestadorId])

  const adicionarTag = async () => {
    const tag = input.trim().toLowerCase().replace(/[^a-záàãâéêíóôõúüçñ0-9\s]/gi, '').replace(/\s+/g, ' ')
    if (!tag || tags.find(t => t.tag === tag)) {
      setInput('')
      return
    }

    const { data } = await supabase
      .from('servicos_prestador')
      .insert({ prestador_id: prestadorId, tag })
      .select()
      .single()

    if (data) setTags([...tags, data])
    setInput('')
  }

  const removerTag = async (id) => {
    await supabase.from('servicos_prestador').delete().eq('id', id)
    setTags(tags.filter(t => t.id !== id))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault()
      adicionarTag()
    }
  }

  if (carregando) return <p className="text-sm" style={{ color: colors.textSub }}>Carregando...</p>

  return (
    <div>
      {/* Tags existentes */}
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map(t => (
          <span
            key={t.id}
            className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full"
            style={{ background: '#DCFCE7', color: colors.primaryHover, border: `0.5px solid ${colors.primary}` }}
          >
            #{t.tag}
            <button
              onClick={() => removerTag(t.id)}
              className="flex hover:opacity-70 transition-opacity"
              style={{ color: colors.primaryHover }}
              aria-label={`Remover #${t.tag}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        {tags.length === 0 && (
          <p className="text-sm" style={{ color: colors.textSub }}>Nenhuma hashtag ainda. Adicione serviços que você realiza!</p>
        )}
      </div>

      {/* Input para nova tag */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ex: pintura externa, reboco, reforma banheiro..."
          className="flex-1 px-3 py-2.5 text-sm rounded-lg focus:outline-none"
          style={{ border: `0.5px solid ${colors.border}`, background: colors.bg }}
        />
        <button
          onClick={adicionarTag}
          className="px-4 py-2.5 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          style={{ background: colors.primary, color: '#fff' }}
        >
          + Adicionar
        </button>
      </div>
      <p className="text-xs mt-1.5" style={{ color: colors.textSub }}>
        Aperte Enter, vírgula ou espaço para adicionar. Ex: #pintura #reboco #reforma
      </p>
    </div>
  )
}
