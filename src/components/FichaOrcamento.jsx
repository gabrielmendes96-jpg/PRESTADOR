import { useState, useEffect, useRef } from 'react'
import { X, Send } from 'lucide-react'
import { colors, radius } from '../lib/design'
import Button from './ui/Button'
import { validar, montarBriefing, LIMITE_RESPOSTA, LIMITE_OBSERVACOES } from '../lib/briefing'

const estiloCampo = (erro) => ({
  width: '100%', padding: '12px 14px', fontSize: 15, borderRadius: radius.input, fontFamily: 'inherit',
  border: `1px solid ${erro ? '#DC2626' : colors.border}`, background: '#fff', color: colors.text, outline: 'none',
})

// Ficha rápida antes de abrir a conversa. `perguntas` vem de perguntasPara(); ao confirmar, `onEnviar` recebe
// a lista [{ rotulo, valor }] pronta para guardar na conversa.
export default function FichaOrcamento({ perguntas, nomePrestador, servico, enviando, onEnviar, onFechar }) {
  const [respostas, setRespostas] = useState({})
  const [erros, setErros] = useState({})
  const primeiroCampo = useRef(null)

  useEffect(() => {
    primeiroCampo.current?.focus()
    const aoTeclar = (e) => { if (e.key === 'Escape' && !enviando) onFechar() }
    document.addEventListener('keydown', aoTeclar)
    const overflowAntes = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', aoTeclar); document.body.style.overflow = overflowAntes }
  }, [enviando, onFechar])

  const mudar = (id, valor) => {
    setRespostas(r => ({ ...r, [id]: valor }))
    if (erros[id]) setErros(e => { const { [id]: _, ...resto } = e; return resto })
  }

  const enviar = (e) => {
    e.preventDefault()
    const encontrados = validar(perguntas, respostas)
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0) {
      document.getElementById('ficha-' + Object.keys(encontrados)[0])?.focus()
      return
    }
    onEnviar(montarBriefing(perguntas, respostas))
  }

  const hoje = new Date().toISOString().slice(0, 10)

  return (
    <div
      role="dialog" aria-modal="true" aria-labelledby="ficha-titulo"
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(17,24,39,0.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget && !enviando) onFechar() }}
    >
      <form
        onSubmit={enviar}
        noValidate
        style={{ width: '100%', maxWidth: 520, maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '24px 24px 0 0', boxShadow: '0 -8px 30px rgba(0,0,0,0.18)' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '18px 20px 12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 id="ficha-titulo" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: colors.text }}>Conte o que você precisa</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: colors.textSub }}>
              {servico ? <>Orçamento de <strong>{servico}</strong> com </> : 'Pedido de orçamento para '}<strong>{nomePrestador}</strong>. Leva menos de 1 minuto e o profissional já responde com o preço certo.
            </p>
          </div>
          <button type="button" onClick={onFechar} disabled={enviando} aria-label="Fechar" style={{ flexShrink: 0, border: 'none', background: colors.bg, borderRadius: 999, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} color={colors.textSub} />
          </button>
        </div>

        <div style={{ padding: '4px 20px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {perguntas.map((p, i) => (
            <div key={p.id}>
              <label htmlFor={'ficha-' + p.id} style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 6 }}>
                {p.rotulo}{p.obrigatoria ? <span aria-hidden="true" style={{ color: '#DC2626' }}> *</span> : <span style={{ fontWeight: 400, color: colors.textSub }}> (opcional)</span>}
              </label>

              {p.tipo === 'opcoes' ? (
                <div id={'ficha-' + p.id} role="radiogroup" aria-label={p.rotulo} tabIndex={-1} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {p.opcoes.map(op => {
                    const ativo = respostas[p.id] === op
                    return (
                      <button
                        key={op} type="button" role="radio" aria-checked={ativo}
                        onClick={() => mudar(p.id, ativo ? '' : op)}
                        style={{ padding: '9px 14px', fontSize: 13, fontWeight: 600, borderRadius: 999, cursor: 'pointer', border: `1px solid ${ativo ? colors.primary : colors.border}`, background: ativo ? '#F0FDF4' : '#fff', color: ativo ? colors.primaryHover : colors.text }}
                      >{op}</button>
                    )
                  })}
                </div>
              ) : p.tipo === 'texto_longo' ? (
                <>
                  <textarea
                    id={'ficha-' + p.id} rows={4} maxLength={LIMITE_OBSERVACOES}
                    value={respostas[p.id] || ''} onChange={e => mudar(p.id, e.target.value)}
                    placeholder={p.dica} style={{ ...estiloCampo(erros[p.id]), resize: 'vertical' }}
                  />
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: colors.textSub, textAlign: 'right' }}>{(respostas[p.id] || '').length}/{LIMITE_OBSERVACOES}</p>
                </>
              ) : (
                <input
                  id={'ficha-' + p.id} ref={i === 0 ? primeiroCampo : null}
                  type={p.tipo === 'numero' ? 'number' : p.tipo === 'data' ? 'date' : 'text'}
                  inputMode={p.tipo === 'numero' ? 'numeric' : undefined}
                  min={p.tipo === 'data' ? hoje : p.min} max={p.tipo === 'numero' ? p.max : undefined}
                  maxLength={p.tipo === 'texto' ? LIMITE_RESPOSTA : undefined}
                  value={respostas[p.id] || ''} onChange={e => mudar(p.id, e.target.value)}
                  placeholder={p.dica} style={estiloCampo(erros[p.id])}
                  aria-invalid={!!erros[p.id]}
                />
              )}
              {erros[p.id] && <p role="alert" style={{ margin: '4px 0 0', fontSize: 12, color: '#DC2626' }}>{erros[p.id]}</p>}
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 20px calc(16px + env(safe-area-inset-bottom))', borderTop: `1px solid ${colors.border}` }}>
          <Button type="submit" fullWidth icon={<Send size={17} />} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar pedido e abrir a conversa'}
          </Button>
        </div>
      </form>
    </div>
  )
}
