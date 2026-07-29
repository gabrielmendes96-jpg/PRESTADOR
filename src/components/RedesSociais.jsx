import { Camera, Video, Users, MessageCircle, Globe } from 'lucide-react'
import { colors } from '../lib/design'

// Lucide não inclui logos de marca — usamos ícones genéricos representando
// cada plataforma, mantendo a cor oficial de cada uma para reconhecimento.
export default function RedesSociais({ links = {}, tamanho = 'normal' }) {
  const redes = [
    { id: 'instagram', icon: Camera, cor: '#E1306C', label: 'Instagram', base: 'https://instagram.com/' },
    { id: 'tiktok', icon: Video, cor: '#010101', label: 'TikTok', base: 'https://tiktok.com/@' },
    { id: 'facebook', icon: Users, cor: '#1877F2', label: 'Facebook', base: 'https://facebook.com/' },
    { id: 'youtube', icon: Video, cor: '#FF0000', label: 'YouTube', base: 'https://youtube.com/@' },
    { id: 'whatsapp', icon: MessageCircle, cor: '#25D366', label: 'WhatsApp', base: 'https://wa.me/' },
    { id: 'site', icon: Globe, cor: colors.primary, label: 'Site', base: '' },
  ]

  const ativos = redes.filter(r => links[r.id])
  if (!ativos.length) return null

  const size = tamanho === 'pequeno' ? 32 : 38

  return (
    <div className="flex flex-wrap gap-2">
      {ativos.map(r => {
        const url = r.id === 'site' ? links[r.id] : `${r.base}${links[r.id]}`
        return (
          <a key={r.id} href={url.startsWith('http') ? url : `https://${url}`}
            target="_blank" rel="noreferrer"
            title={r.label}
            className="flex items-center justify-center rounded-xl hover:opacity-80 transition-opacity"
            style={{ width: size, height: size, background: colors.bg, border: `0.5px solid ${colors.border}` }}>
            <r.icon size={tamanho === 'pequeno' ? 15 : 17} color={r.cor} />
          </a>
        )
      })}
    </div>
  )
}
