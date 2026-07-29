import { useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { colors } from '../lib/design'
import FotoPerfilEditor from './FotoPerfilEditor'

export default function FotoPerfilUpload({ prestadorId, fotoAtual, onAtualizar }) {
  const [uploading, setUploading] = useState(false)
  const [previewSrc, setPreviewSrc] = useState(null)

  const handleSelecionar = (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    setPreviewSrc(URL.createObjectURL(file))
  }

  const handleConfirmar = async (blob) => {
    setPreviewSrc(null)
    setUploading(true)

    const caminho = `perfil/${prestadorId}/foto.jpg`
    const { error } = await supabase.storage
      .from('midias')
      .upload(caminho, blob, { upsert: true, contentType: 'image/jpeg' })

    if (!error) {
      const { data: urlData } = supabase.storage.from('midias').getPublicUrl(caminho)
      const urlComVersao = `${urlData.publicUrl}?v=${Date.now()}`
      await supabase.from('prestadores').update({ foto_perfil: urlComVersao }).eq('id', prestadorId)
      onAtualizar(urlComVersao)
    }
    setUploading(false)
  }

  return (
    <>
      <label className="cursor-pointer group">
        <div style={{ position: 'relative', width: 80, height: 80 }}>
          {fotoAtual ? (
            <img src={fotoAtual} alt="Foto de perfil" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.primary }}>
              <Camera size={26} color="#fff" strokeWidth={1.8} />
            </div>
          )}
          <div style={{
            position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: colors.primary, border: '2px solid #fff',
          }}>
            {uploading
              ? <Loader2 size={14} color="#fff" className="animate-spin" />
              : <Camera size={14} color="#fff" />
            }
          </div>
        </div>
        <input type="file" accept="image/*" onChange={handleSelecionar} className="hidden" disabled={uploading} />
      </label>

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
