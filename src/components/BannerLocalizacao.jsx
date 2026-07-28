import { useState, useEffect } from 'react'
import { pegarLocalizacao, salvarLocalizacao, recuperarLocalizacao } from '../lib/gps'

export default function BannerLocalizacao({ onLocalizacao }) {
  const [status, setStatus] = useState('idle') // idle | pedindo | ok | negado
  const [cidade, setCidade] = useState('')

  useEffect(() => {
    // Verificar se já tem localização salva
    const loc = recuperarLocalizacao()
    if (loc) {
      setStatus('ok')
      onLocalizacao(loc)
      buscarCidade(loc.lat, loc.lng)
    }
  }, [])

  const pedir = async () => {
    setStatus('pedindo')
    try {
      const loc = await pegarLocalizacao()
      salvarLocalizacao(loc.lat, loc.lng)
      setStatus('ok')
      onLocalizacao(loc)
      buscarCidade(loc.lat, loc.lng)
    } catch {
      setStatus('negado')
    }
  }

  const buscarCidade = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      const data = await res.json()
      const c = data.address?.city || data.address?.town || data.address?.village || ''
      setCidade(c)
    } catch {}
  }

  if (status === 'ok') return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
      style={{ background: '#E3F6E9', border: '0.5px solid #1FA855' }}>
      <i className="ti ti-map-pin" style={{ fontSize: 14, color: '#0F6E3D' }} aria-hidden="true"></i>
      <span className="text-xs font-medium" style={{ color: '#0F6E3D' }}>
        {cidade ? `${cidade} — mostrando profissionais mais próximos` : 'Localização ativa — mostrando profissionais mais próximos'}
      </span>
    </div>
  )

  if (status === 'negado') return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
      style={{ background: '#FFF4D6', border: '0.5px solid #FFC857' }}>
      <i className="ti ti-map-pin-off" style={{ fontSize: 14, color: '#8A5A00' }} aria-hidden="true"></i>
      <span className="text-xs" style={{ color: '#8A5A00' }}>
        Localização negada. Ative nas configurações do navegador para ver profissionais próximos.
      </span>
    </div>
  )

  if (status === 'pedindo') return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
      style={{ background: '#F0F2F0' }}>
      <i className="ti ti-loader" style={{ fontSize: 14, color: '#7C9485' }} aria-hidden="true"></i>
      <span className="text-xs" style={{ color: '#7C9485' }}>Obtendo sua localização...</span>
    </div>
  )

  return (
    <button onClick={pedir}
      className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4 w-full hover:opacity-90 transition-opacity"
      style={{ background: '#F0FAF4', border: '0.5px solid #1FA855' }}>
      <i className="ti ti-map-pin" style={{ fontSize: 14, color: '#1FA855' }} aria-hidden="true"></i>
      <span className="text-xs font-medium" style={{ color: '#0F6E3D' }}>
        Usar minha localização para ver profissionais próximos
      </span>
      <i className="ti ti-chevron-right ml-auto" style={{ fontSize: 14, color: '#1FA855' }} aria-hidden="true"></i>
    </button>
  )
}
