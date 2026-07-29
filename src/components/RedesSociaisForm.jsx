import { Camera, Video, Users, MessageCircle, Globe, X } from 'lucide-react'
import { colors } from '../lib/design'

// Lucide não inclui logos de marca (Instagram, TikTok etc.) — usamos ícones
// genéricos que representam cada plataforma, mantendo a cor oficial de cada uma.
export default function RedesSociaisForm({ links = {}, onChange }) {
  const redes = [
    { id: 'instagram', icon: Camera, cor: '#E1306C', label: 'Instagram', placeholder: 'seu.usuario' },
    { id: 'tiktok', icon: Video, cor: '#010101', label: 'TikTok', placeholder: '@seuusuario' },
    { id: 'facebook', icon: Users, cor: '#1877F2', label: 'Facebook', placeholder: 'seu.usuario' },
    { id: 'youtube', icon: Video, cor: '#FF0000', label: 'YouTube', placeholder: '@seucanal' },
    { id: 'whatsapp', icon: MessageCircle, cor: '#25D366', label: 'WhatsApp', placeholder: '16999999999' },
    { id: 'site', icon: Globe, cor: colors.primary, label: 'Site próprio', placeholder: 'www.meusite.com.br' },
  ]

  return (
    <div className="space-y-3">
      {redes.map(r => (
        <div key={r.id} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: colors.bg }}>
            <r.icon size={17} color={r.cor} />
          </div>
          <div className="flex-1">
            <label className="block text-xs mb-1" style={{ color: colors.textSub }}>{r.label}</label>
            <input
              type="text"
              value={links[r.id] || ''}
              onChange={e => onChange({ ...links, [r.id]: e.target.value })}
              placeholder={r.placeholder}
              className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none"
              style={{ borderColor: colors.border }}
            />
          </div>
          {links[r.id] && (
            <button onClick={() => onChange({ ...links, [r.id]: '' })}
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 hover:opacity-70"
              style={{ color: '#9CA3AF' }}>
              <X size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
