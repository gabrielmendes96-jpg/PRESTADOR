// Componente para exibir links de redes sociais
export default function RedesSociais({ links = {}, tamanho = 'normal' }) {
  const redes = [
    { id: 'instagram', icon: 'ti-brand-instagram', cor: '#E1306C', label: 'Instagram', base: 'https://instagram.com/' },
    { id: 'tiktok', icon: 'ti-brand-tiktok', cor: '#010101', label: 'TikTok', base: 'https://tiktok.com/@' },
    { id: 'facebook', icon: 'ti-brand-facebook', cor: '#1877F2', label: 'Facebook', base: 'https://facebook.com/' },
    { id: 'youtube', icon: 'ti-brand-youtube', cor: '#FF0000', label: 'YouTube', base: 'https://youtube.com/@' },
    { id: 'whatsapp', icon: 'ti-brand-whatsapp', cor: '#25D366', label: 'WhatsApp', base: 'https://wa.me/' },
    { id: 'site', icon: 'ti-world', cor: '#1FA855', label: 'Site', base: '' },
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
            style={{ width: size, height: size, background: '#F0F2F0', border: '0.5px solid #DDE3DD' }}>
            <i className={`ti ${r.icon}`} style={{ fontSize: tamanho === 'pequeno' ? 16 : 18, color: r.cor }} aria-hidden="true"></i>
          </a>
        )
      })}
    </div>
  )
}
