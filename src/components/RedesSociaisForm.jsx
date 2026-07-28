// Formulário para editar links de redes sociais
export default function RedesSociaisForm({ links = {}, onChange }) {
  const redes = [
    { id: 'instagram', icon: 'ti-brand-instagram', cor: '#E1306C', label: 'Instagram', placeholder: 'seu.usuario' },
    { id: 'tiktok', icon: 'ti-brand-tiktok', cor: '#010101', label: 'TikTok', placeholder: '@seuusuario' },
    { id: 'facebook', icon: 'ti-brand-facebook', cor: '#1877F2', label: 'Facebook', placeholder: 'seu.usuario' },
    { id: 'youtube', icon: 'ti-brand-youtube', cor: '#FF0000', label: 'YouTube', placeholder: '@seucanal' },
    { id: 'whatsapp', icon: 'ti-brand-whatsapp', cor: '#25D366', label: 'WhatsApp', placeholder: '16999999999' },
    { id: 'site', icon: 'ti-world', cor: '#1FA855', label: 'Site próprio', placeholder: 'www.meusite.com.br' },
  ]

  return (
    <div className="space-y-3">
      {redes.map(r => (
        <div key={r.id} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#F0F2F0' }}>
            <i className={`ti ${r.icon}`} style={{ fontSize: 18, color: r.cor }} aria-hidden="true"></i>
          </div>
          <div className="flex-1">
            <label className="block text-xs mb-1" style={{ color: '#7C9485' }}>{r.label}</label>
            <input
              type="text"
              value={links[r.id] || ''}
              onChange={e => onChange({ ...links, [r.id]: e.target.value })}
              placeholder={r.placeholder}
              className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none"
              style={{ borderColor: '#DDE3DD' }}
            />
          </div>
          {links[r.id] && (
            <button onClick={() => onChange({ ...links, [r.id]: '' })}
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 hover:opacity-70"
              style={{ color: '#C9BFA8' }}>
              <i className="ti ti-x" style={{ fontSize: 14 }} aria-hidden="true"></i>
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
