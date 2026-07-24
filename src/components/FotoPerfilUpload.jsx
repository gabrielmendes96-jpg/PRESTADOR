import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function FotoPerfilUpload({ prestadorId, fotoAtual, onAtualizar }) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)

    const ext = file.name.split('.').pop()
    const caminho = `perfil/${prestadorId}/foto.${ext}`

    const { data, error } = await supabase.storage
      .from('midias')
      .upload(caminho, file, { upsert: true })

    if (!error) {
      const { data: urlData } = supabase.storage.from('midias').getPublicUrl(caminho)
      await supabase.from('prestadores').update({ foto_perfil: urlData.publicUrl }).eq('id', prestadorId)
      onAtualizar(urlData.publicUrl)
    }
    setUploading(false)
  }

  return (
    <label className="cursor-pointer group">
      <div className="relative w-20 h-20">
        {fotoAtual ? (
          <img src={fotoAtual} alt="Foto de perfil" className="w-20 h-20 rounded-full object-cover" style={{ border: '2px solid #1FA855' }} />
        ) : (
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-medium text-white" style={{ background: '#1FA855' }}>
            <i className="ti ti-user" style={{ fontSize: 32 }} aria-hidden="true"></i>
          </div>
        )}
        <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: '#1FA855', border: '2px solid #fff' }}>
          {uploading
            ? <i className="ti ti-loader" style={{ fontSize: 14, color: '#fff' }} aria-hidden="true"></i>
            : <i className="ti ti-camera" style={{ fontSize: 14, color: '#fff' }} aria-hidden="true"></i>
          }
        </div>
      </div>
      <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
    </label>
  )
}
