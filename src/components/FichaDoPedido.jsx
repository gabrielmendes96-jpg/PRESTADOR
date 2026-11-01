import { useState } from 'react'
import { ClipboardList, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { colors, radius } from '../lib/design'
import Card from './ui/Card'

// Quadro com o que o cliente respondeu na ficha de orçamento: campo | resposta.
// O profissional vê aberto (é o que ele precisa para orçar) e ainda ganha o botão de modelo de orçamento.
export default function FichaDoPedido({ briefing, assunto, ehPrestador, onMontarOrcamento }) {
  const [aberta, setAberta] = useState(ehPrestador)
  const campos = briefing.filter(i => i.rotulo !== 'Observações')
  const observacoes = briefing.find(i => i.rotulo === 'Observações')

  return (
    <Card padding={0} style={{ marginBottom: 12, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setAberta(v => !v)}
        aria-expanded={aberta}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: 'none', background: colors.bg, cursor: 'pointer', textAlign: 'left' }}
      >
        <ClipboardList size={18} color={colors.primaryHover} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: colors.text }}>Ficha do pedido</span>
          {assunto && <span style={{ display: 'block', fontSize: 12, color: colors.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{assunto}</span>}
        </span>
        {aberta ? <ChevronUp size={18} color={colors.textSub} /> : <ChevronDown size={18} color={colors.textSub} />}
      </button>

      {aberta && (
        <div style={{ padding: '4px 16px 14px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <tbody>
              {campos.map((c, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <th scope="row" style={{ textAlign: 'left', fontWeight: 600, color: colors.textSub, padding: '8px 12px 8px 0', width: '42%', verticalAlign: 'top' }}>{c.rotulo}</th>
                  <td style={{ color: colors.text, padding: '8px 0', wordBreak: 'break-word' }}>{/^\d{4}-\d{2}-\d{2}$/.test(c.valor) ? c.valor.split('-').reverse().join('/') : c.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {observacoes && (
            <div style={{ marginTop: 10, padding: 12, borderRadius: radius.input, background: colors.bg }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: colors.textSub }}>Observações do cliente</p>
              <p style={{ margin: 0, fontSize: 13, color: colors.text, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{observacoes.valor}</p>
            </div>
          )}

          {ehPrestador && onMontarOrcamento && (
            <button
              type="button"
              onClick={onMontarOrcamento}
              style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, border: `1px solid ${colors.primary}`, background: '#fff', color: colors.primaryHover, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              <FileText size={15} /> Montar orçamento
            </button>
          )}
        </div>
      )}
    </Card>
  )
}
