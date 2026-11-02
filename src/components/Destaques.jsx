import { useState, useEffect } from 'react'
import { Plus, X, Play } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { colors } from '../lib/design'
import { prepararArquivo, enviarParaStorage } from '../lib/midia'
import { useErroDeEnvio } from '../lib/useErroDeEnvio'
import SeletorDeFotos from './SeletorDeFotos'

export default function Destaques({ userId }) {
  const [destaques, setDestaques] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [aberto, setAberto] = useState(null)
  const [escolhendo, setEscolhendo] = useState(false)
  const envio = useErroDeEnvio()

  useEffect(() => {
    if (!userId) return
    supabase
      .from('destaques_cliente')
      .select('*')
      .eq('user_id', userId)
      .order('ordem', { ascending: true })
      .then(({ data }) => {
        setDestaques(data || [])
        setCarregando(false)
      })
  }, [userId])

  const handleUpload = async ([arquivo]) => {
    envio.limpar()
    const titulo = window.prompt('Dê um nome para esse destaque (por exemplo: "Minha casa", "Meu pet")')
    if (!titulo || !titulo.trim()) return
    setEnviando(true)
    try {
      const preparado = await prepararArquivo(arquivo)
      const { url, tipo } = await enviarParaStorage(supabase, 'midias', `destaques/${userId}/${Date.now()}`, preparado)
      const { data: novo, error } = await supabase
        .from('destaques_cliente')
        .insert({ user_id: userId, titulo: titulo.trim(), url, tipo, ordem: destaques.length })
        .select()
        .single()
      if (error) throw error
      setDestaques(prev => [...prev, novo])
      envio.deuCerto()
      setEscolhendo(false)
    } catch (e) {
      envio.falhou(e)
    }
    setEnviando(false)
  }

  const remover = async (id) => {
    await supabase.from('destaques_cliente').delete().eq('id', id)
    setDestaques(destaques.filter(d => d.id !== id))
    setAberto(null)
  }

  if (carregando) return null

  return (
    <div className="mb-5">
      <p className="text-sm font-medium mb-2" style={{ color: colors.text }}>Destaques</p>
      <p className="text-xs mb-3" style={{ color: colors.textSub }}>
        Fotos e vídeos que ajudam o prestador a entender seu pedido antes de orçar — sua casa, seu jardim, seu pet.
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1">
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setEscolhendo(v => !v)}
            disabled={enviando}
            aria-label="Adicionar um destaque"
            className="flex items-center justify-center rounded-full disabled:opacity-60"
            style={{ width: 64, height: 64, border: `1.5px dashed ${colors.border}`, background: colors.bg }}
          >
            <Plus size={22} color={colors.textSub} />
          </button>
          <span className="text-xs" style={{ color: colors.textSub }}>{enviando ? 'Enviando...' : 'Adicionar'}</span>
        </div>

        {destaques.map(d => (
          <div key={d.id} className="flex flex-col items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setAberto(d)}
              className="relative rounded-full overflow-hidden"
              style={{ width: 64, height: 64, border: `1.5px solid ${colors.border}`, padding: 0 }}
            >
              {d.tipo === 'video' ? (
                <video src={d.url} className="w-full h-full object-cover" />
              ) : (
                <img src={d.url} alt={d.titulo} className="w-full h-full object-cover" />
              )}
              {d.tipo === 'video' && (
                <span className="absolute bottom-0.5 right-0.5 flex items-center justify-center w-4 h-4 rounded-full text-white" style={{ background: 'rgba(0,0,0,0.6)' }}>
                  <Play size={9} fill="#fff" />
                </span>
              )}
            </button>
            <span className="text-xs truncate" style={{ color: colors.textSub, maxWidth: 64 }}>{d.titulo}</span>
          </div>
        ))}
      </div>

      {(escolhendo || envio.erro) && (
        <div className="mt-3">
          <SeletorDeFotos onArquivos={handleUpload} enviando={enviando} erro={envio.erro} tentativas={envio.tentativas} multiple={false} />
        </div>
      )}

      {aberto && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', zIndex: 100 }}
          onClick={() => setAberto(null)}
        >
          <div className="relative max-w-md w-full" onClick={e => e.stopPropagation()}>
            {aberto.tipo === 'video' ? (
              <video src={aberto.url} controls autoPlay className="w-full rounded-2xl" style={{ maxHeight: '80vh' }} />
            ) : (
              <img src={aberto.url} alt={aberto.titulo} className="w-full rounded-2xl" style={{ maxHeight: '80vh', objectFit: 'contain' }} />
            )}
            <div className="flex items-center justify-between mt-3">
              <p className="text-sm font-medium" style={{ color: '#fff' }}>{aberto.titulo}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { if (window.confirm('Remover este destaque?')) remover(aberto.id) }}
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: 'rgba(185,28,28,0.85)', color: '#fff' }}
                >
                  Remover
                </button>
                <button
                  onClick={() => setAberto(null)}
                  className="flex items-center justify-center rounded-full"
                  style={{ width: 30, height: 30, background: 'rgba(255,255,255,0.15)', color: '#fff' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
