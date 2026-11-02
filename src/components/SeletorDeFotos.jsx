import { useRef } from 'react'
import { Camera, Images, Loader2 } from 'lucide-react'
import { colors, radius } from '../lib/design'
import { isNative, tirarFotoNativa } from '../lib/native'
import AjudaEnvioFotos from './AjudaEnvioFotos'

const aparelhoComToque = () => typeof window !== 'undefined' && (navigator.maxTouchPoints > 0 || 'ontouchstart' in window)

const estiloBotao = (principal, desabilitado) => ({
  flex: '1 1 200px', minHeight: 56, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
  padding: '12px 18px', borderRadius: radius.input, fontSize: 16, fontWeight: 700, cursor: desabilitado ? 'not-allowed' : 'pointer',
  opacity: desabilitado ? 0.6 : 1, fontFamily: 'inherit',
  border: principal ? 'none' : `2px solid ${colors.primary}`,
  background: principal ? colors.primary : '#fff', color: principal ? '#fff' : colors.primaryHover,
})

// Dois botões grandes e com nomes que qualquer pessoa entende, mais status de envio e ajuda.
// `onArquivos` recebe a lista de arquivos escolhidos (o envio e a conferência ficam com quem usa).
export default function SeletorDeFotos({ onArquivos, enviando = false, progresso = '', verbo = 'Enviando', erro = '', tentativas = 0, aceitaVideo = true, multiple = true, className = '' }) {
  const camera = useRef(null)
  const galeria = useRef(null)
  const podeFotografar = isNative() || aparelhoComToque()

  const aoEscolher = (e) => {
    const arquivos = Array.from(e.target.files || [])
    e.target.value = '' // permite escolher a mesma foto de novo
    if (arquivos.length) onArquivos(arquivos)
  }

  const tirarFoto = async () => {
    if (isNative()) {
      try { onArquivos([await tirarFotoNativa()]) } catch { /* a pessoa cancelou a câmera: não é erro */ }
    } else {
      camera.current?.click()
    }
  }

  return (
    <div className={className}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {podeFotografar && (
          <button type="button" onClick={tirarFoto} disabled={enviando} style={estiloBotao(true, enviando)}>
            <Camera size={24} /> Tirar foto agora
          </button>
        )}
        <button type="button" onClick={() => galeria.current?.click()} disabled={enviando} style={estiloBotao(!podeFotografar, enviando)}>
          <Images size={24} /> {podeFotografar ? 'Escolher da galeria' : 'Escolher foto do computador'}
        </button>
      </div>

      <input ref={camera} type="file" accept="image/*" capture="environment" onChange={aoEscolher} style={{ display: 'none' }} aria-hidden="true" tabIndex={-1} />
      <input ref={galeria} type="file" accept={aceitaVideo ? 'image/*,video/*' : 'image/*'} multiple={multiple} onChange={aoEscolher} style={{ display: 'none' }} aria-hidden="true" tabIndex={-1} />

      <div aria-live="polite" style={{ minHeight: enviando ? 28 : 0 }}>
        {enviando && (
          <p style={{ margin: '10px 0 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, color: colors.primaryHover }}>
            <Loader2 size={18} className="animate-spin" /> {verbo}{progresso ? ` ${progresso}` : ''}… aguarde um instante.
          </p>
        )}
      </div>

      <AjudaEnvioFotos erro={erro} tentativas={tentativas} aceitaVideo={aceitaVideo} />
    </div>
  )
}
