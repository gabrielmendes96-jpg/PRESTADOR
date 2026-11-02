import { useState } from 'react'
import { Camera } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { colors } from '../lib/design'
import { prepararArquivo, enviarParaStorage } from '../lib/midia'
import { useErroDeEnvio } from '../lib/useErroDeEnvio'
import FotoPerfilEditor from './FotoPerfilEditor'
import SeletorDeFotos from './SeletorDeFotos'

export default function FotoPerfilUpload({ prestadorId, fotoAtual, onAtualizar }) {
  const [uploading, setUploading] = useState(false)
  const [previewSrc, setPreviewSrc] = useState(null)
  const envio = useErroDeEnvio()

  // A foto é conferida e encolhida antes de abrir o ajuste, para não travar com foto gigante ou em formato estranho.
  const handleSelecionar = async ([arquivo]) => {
    envio.limpar()
    try {
      const preparado = await prepararArquivo(arquivo, { permitirVideo: false, maxLado: 2000 })
      setPreviewSrc(URL.createObjectURL(preparado.arquivo))
    } catch (e) {
      envio.falhou(e)
    }
  }

  const handleConfirmar = async (blob) => {
    setPreviewSrc(null)
    setUploading(true)
    try {
      const { url } = await enviarParaStorage(supabase, 'midias', `perfil/${prestadorId}/foto`, { arquivo: blob, tipo: 'foto' }, { upsert: true })
      const urlComVersao = `${url}?v=${Date.now()}`
      const { error } = await supabase.from('prestadores').update({ foto_perfil: urlComVersao }).eq('id', prestadorId)
      if (error) throw error
      onAtualizar(urlComVersao)
      envio.deuCerto()
    } catch (e) {
      envio.falhou(e)
    }
    setUploading(false)
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        {fotoAtual ? (
          <img src={fotoAtual} alt="Foto de perfil" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.primary, flexShrink: 0 }}>
            <Camera size={26} color="#fff" strokeWidth={1.8} />
          </div>
        )}
        <div style={{ flex: '1 1 240px', minWidth: 0 }}>
          <p style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: colors.text }}>
            {fotoAtual ? 'Trocar a foto do perfil' : 'Coloque uma foto sua'}
          </p>
          <SeletorDeFotos
            onArquivos={handleSelecionar}
            enviando={uploading}
            erro={envio.erro}
            tentativas={envio.tentativas}
            aceitaVideo={false}
            multiple={false}
          />
        </div>
      </div>

      {previewSrc && (
        <FotoPerfilEditor
          src={previewSrc}
          onCancel={() => setPreviewSrc(null)}
          onConfirm={handleConfirmar}
        />
      )}
    </>
  )
}
