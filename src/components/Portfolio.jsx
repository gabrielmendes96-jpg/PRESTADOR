import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function Portfolio({ prestadorId }) {
  const [midias, setMidias] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!prestadorId) return
    supabase
      .from('portfolio_prestador')
      .select('*')
      .eq('prestador_id', prestadorId)
      .order('ordem', { ascending: true })
      .then(({ data }) => {
        setMidias(data || [])
        setCarregando(false)
      })
  }, [prestadorId])

  const handleUpload = async (e) => {
    const arquivos = Array.from(e.target.files)
    if (!arquivos.length) return
    setEnviando(true)

    for (const arquivo of arquivos) {
      const ext = arquivo.name.split('.').pop()
      const caminho = `portfolio/${prestadorId}/${Date.now()}.${ext}`

      const { data: upload, error } = await supabase.storage
        .from('midias')
        .upload(caminho, arquivo, { upsert: true })

      if (error) {
        console.error('Erro upload:', error)
        continue
      }

      const { data: urlData } = supabase.storage.from('midias').getPublicUrl(caminho)

      const { data: nova } = await supabase
        .from('portfolio_prestador')
        .insert({
          prestador_id: prestadorId,
          url: urlData.publicUrl,
          tipo: arquivo.type.startsWith('video') ? 'video' : 'foto',
          ordem: midias.length,
        })
        .select()
        .single()

      if (nova) setMidias(prev => [...prev, nova])
    }

    setEnviando(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const remover = async (id) => {
    await supabase.from('portfolio_prestador').delete().eq('id', id)
    setMidias(midias.filter(m => m.id !== id))
  }

  if (carregando) return (
    <p className="text-sm" style={{ color: '#C9BFA8' }}>Carregando portfólio...</p>
  )

  return (
    <div>
      {/* Botão de upload */}
      <div className="mb-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleUpload}
          style={{ display: 'none' }}
          id="portfolio-upload"
        />
        <button
          onClick={() => document.getElementById('portfolio-upload').click()}
          disabled={enviando}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-60 transition-opacity"
          style={{ background: '#1FA855', color: '#fff' }}
        >
          <i className="ti ti-upload" style={{ fontSize: '16px' }} aria-hidden="true"></i>
          {enviando ? 'Enviando...' : 'Adicionar fotos ou vídeos'}
        </button>
        <p className="text-xs mt-1" style={{ color: '#C9BFA8' }}>
          Você pode selecionar múltiplos arquivos de uma vez
        </p>
      </div>

      {/* Grade de mídias */}
      {midias.length === 0 ? (
        <div className="text-center py-12 rounded-xl" style={{ border: '2px dashed #EDE3CE' }}>
          <div className="text-4xl mb-2">📷</div>
          <p className="text-sm" style={{ color: '#7C9485' }}>
            Nenhuma foto ainda. Adicione fotos dos seus trabalhos!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {midias.map(m => (
            <div key={m.id} className="relative group aspect-square rounded-xl overflow-hidden" style={{ border: '0.5px solid #EDE3CE' }}>
              {m.tipo === 'video' ? (
                <video src={m.url} className="w-full h-full object-cover" />
              ) : (
                <img src={m.url} alt="portfólio" className="w-full h-full object-cover" />
              )}
              {m.tipo === 'video' && (
                <span className="absolute top-1 left-1 text-xs text-white px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.6)' }}>▶</span>
              )}
              <button
                onClick={() => remover(m.id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(163,45,45,0.85)' }}
              >✕</button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs mt-3" style={{ color: '#C9BFA8' }}>
        {midias.length} item{midias.length !== 1 ? 's' : ''} no portfólio · Passe o mouse sobre a foto para remover
      </p>
    </div>
  )
}
