import { useState, useEffect } from 'react'
import { Image, Play, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { colors } from '../lib/design'
import { prepararArquivo, enviarParaStorage } from '../lib/midia'
import { useErroDeEnvio } from '../lib/useErroDeEnvio'
import SeletorDeFotos from './SeletorDeFotos'

export default function Portfolio({ prestadorId }) {
  const [midias, setMidias] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [progresso, setProgresso] = useState('')
  const envio = useErroDeEnvio()

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

  const enviarArquivos = async (arquivos) => {
    setEnviando(true)
    envio.limpar()
    let ordem = midias.length
    let falhas = 0
    let ultimoErro = null

    for (let i = 0; i < arquivos.length; i++) {
      setProgresso(arquivos.length > 1 ? `${i + 1} de ${arquivos.length}` : '')
      try {
        const preparado = await prepararArquivo(arquivos[i])
        const { url, tipo } = await enviarParaStorage(supabase, 'midias', `portfolio/${prestadorId}/${Date.now()}-${i}`, preparado)
        const { data: nova, error } = await supabase
          .from('portfolio_prestador')
          .insert({ prestador_id: prestadorId, url, tipo, ordem: ordem++ })
          .select()
          .single()
        if (error) throw error
        setMidias(prev => [...prev, nova])
      } catch (e) {
        falhas++
        ultimoErro = e
      }
    }

    if (falhas) envio.falhou(ultimoErro)
    else envio.deuCerto()
    setProgresso('')
    setEnviando(false)
  }

  const remover = async (id) => {
    await supabase.from('portfolio_prestador').delete().eq('id', id)
    setMidias(midias.filter(m => m.id !== id))
  }

  if (carregando) return (
    <p className="text-sm" style={{ color: colors.textSub }}>Carregando portfólio...</p>
  )

  return (
    <div>
      <div className="mb-4">
        <SeletorDeFotos onArquivos={enviarArquivos} enviando={enviando} progresso={progresso} erro={envio.erro} tentativas={envio.tentativas} />
      </div>

      {/* Grade de mídias */}
      {midias.length === 0 ? (
        <div className="text-center py-12 rounded-xl" style={{ border: `2px dashed ${colors.border}` }}>
          <Image size={36} color="#D1D5DB" style={{ margin: '0 auto 8px' }} />
          <p className="text-sm" style={{ color: colors.textSub }}>
            Nenhuma foto ainda. Adicione fotos dos seus trabalhos!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {midias.map(m => (
            <div key={m.id} className="relative group aspect-square rounded-xl overflow-hidden" style={{ border: `0.5px solid ${colors.border}` }}>
              {m.tipo === 'video' ? (
                <button
                  onClick={() => window.open(m.url, '_blank')}
                  className="w-full h-full block"
                  style={{ padding: 0, border: 'none', cursor: 'pointer' }}
                  aria-label="Abrir vídeo em tamanho real"
                >
                  <video src={m.url} className="w-full h-full object-cover" />
                </button>
              ) : (
                <img src={m.url} alt="portfólio" className="w-full h-full object-cover" />
              )}
              {m.tipo === 'video' && (
                <span className="absolute top-1 left-1 flex items-center justify-center w-5 h-5 rounded text-white pointer-events-none" style={{ background: 'rgba(0,0,0,0.6)' }}>
                  <Play size={11} fill="#fff" />
                </span>
              )}
              <button
                onClick={() => { if (window.confirm('Remover esta foto do seu portfólio?')) remover(m.id) }}
                aria-label="Remover esta foto"
                className="absolute top-1 right-1 w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ background: 'rgba(185,28,28,0.85)' }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs mt-3" style={{ color: colors.textSub }}>
        {midias.length} {midias.length === 1 ? 'item' : 'itens'} no portfólio · Toque no X da foto para remover
      </p>
    </div>
  )
}
