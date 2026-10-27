import { Component } from 'react'
import { Wrench, RefreshCw } from 'lucide-react'
import { colors, radius, shadow } from '../lib/design'

// Erro ao baixar um pedaço do app (as páginas são carregadas sob demanda).
// Acontece quando uma aba antiga fica aberta durante um deploy: ela pede um
// arquivo que já não existe mais.
const ehErroDeChunk = (erro) =>
  /dynamically imported module|Importing a module script failed|Loading chunk|ChunkLoadError/i.test(String(erro?.message || erro))

// Rede de segurança do app inteiro: sem isso, qualquer erro dentro de uma
// tela deixava a página em branco. Agora aparece uma tela de manutenção.
export default class ErrorBoundary extends Component {
  state = { erro: null }

  static getDerivedStateFromError(erro) {
    return { erro }
  }

  componentDidCatch(erro, info) {
    console.error('Erro de tela:', erro, info?.componentStack)

    // Aba desatualizada depois de um deploy: recarregar já resolve, então
    // tenta uma vez (com trava de 1 minuto pra nunca entrar em loop).
    if (ehErroDeChunk(erro)) {
      try {
        const ultima = Number(sessionStorage.getItem('recarregou_por_chunk') || 0)
        if (Date.now() - ultima > 60000) {
          sessionStorage.setItem('recarregou_por_chunk', String(Date.now()))
          window.location.reload()
        }
      } catch {
        // sessionStorage indisponível — cai na tela de manutenção mesmo
      }
    }
  }

  render() {
    if (!this.state.erro) return this.props.children

    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, background: colors.bg,
        }}
      >
        <div
          style={{
            maxWidth: 420, width: '100%', textAlign: 'center', padding: '40px 28px',
            background: colors.card, borderRadius: radius.card, boxShadow: shadow.card,
          }}
        >
          <div
            style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
              background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Wrench size={28} color={colors.primaryHover} strokeWidth={1.8} />
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 700, color: colors.text, margin: '0 0 8px' }}>
            Estamos em manutenção
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: colors.textSub, margin: '0 0 28px' }}>
            Algo não saiu como esperado por aqui. Já estamos cuidando disso — tente de novo em alguns instantes.
          </p>

          <button
            onClick={() => window.location.reload()}
            style={{
              width: '100%', padding: '13px 20px', border: 'none', borderRadius: radius.btn,
              background: colors.primary, color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <RefreshCw size={16} /> Tentar novamente
          </button>
          <a
            href="/"
            style={{ display: 'inline-block', marginTop: 14, fontSize: 14, color: colors.textSub, textDecoration: 'underline' }}
          >
            Voltar ao início
          </a>

          {import.meta.env.DEV && (
            <pre style={{ marginTop: 24, textAlign: 'left', fontSize: 11, color: colors.error, whiteSpace: 'pre-wrap' }}>
              {String(this.state.erro?.message || this.state.erro)}
            </pre>
          )}
        </div>
      </div>
    )
  }
}
