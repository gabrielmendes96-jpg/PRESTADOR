import { useState, useEffect } from 'react'

// Componente que mostra um banner "Instalar app" no celular
// O banner aparece automaticamente quando o navegador detecta que
// o app pode ser instalado (evento beforeinstallprompt)

export default function InstallPWA() {
  const [promptEvento, setPromptEvento] = useState(null)
  const [mostrar, setMostrar] = useState(false)

  useEffect(() => {
    // Escuta o evento do navegador que indica que o app pode ser instalado
    const handler = (e) => {
      e.preventDefault()
      setPromptEvento(e)
      setMostrar(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const instalar = async () => {
    if (!promptEvento) return
    promptEvento.prompt()
    const { outcome } = await promptEvento.userChoice
    if (outcome === 'accepted') setMostrar(false)
    setPromptEvento(null)
  }

  if (!mostrar) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        right: '16px',
        background: '#1FA855',
        borderRadius: '16px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 9999,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ flex: 1 }}>
        <p style={{ color: '#fff', fontWeight: 500, fontSize: '14px', margin: 0 }}>
          Instalar o Prestador
        </p>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', margin: 0 }}>
          Adicione à tela inicial do seu celular
        </p>
      </div>
      <button
        onClick={() => setMostrar(false)}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '18px', padding: '4px' }}
        aria-label="Fechar"
      >
        ✕
      </button>
      <button
        onClick={instalar}
        style={{
          background: '#FFC857',
          color: '#5C4400',
          border: 'none',
          borderRadius: '10px',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Instalar
      </button>
    </div>
  )
}
