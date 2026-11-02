import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HelpCircle, TriangleAlert, LifeBuoy, ChevronUp } from 'lucide-react'
import { colors, radius } from '../lib/design'
import { LIMITE_VIDEO_MB } from '../lib/midia'

// Ajuda para quem tem pouca prática: sempre à mão ("Como enviar fotos?") e aberta sozinha quando um envio dá erro.
// Depois de 2 erros seguidos oferece falar com o suporte, já com o assunto preenchido.
export default function AjudaEnvioFotos({ erro, tentativas = 0, aceitaVideo = true, podeFotografar = true, className = '' }) {
  const [aberta, setAberta] = useState(Boolean(erro))
  useEffect(() => { if (erro) setAberta(true) }, [erro])

  const linkSuporte = '/suporte?categoria=outro&assunto=' + encodeURIComponent('Ajuda para enviar fotos')

  return (
    <div className={className} style={{ marginTop: 10 }}>
      {erro && (
        <div role="alert" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 14, borderRadius: radius.input, background: '#FEF2F2', border: '1px solid #FECACA', marginBottom: 8 }}>
          <TriangleAlert size={22} color="#B91C1C" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#991B1B' }}>Não deu certo desta vez</p>
            <p style={{ margin: '4px 0 0', fontSize: 15, color: '#7F1D1D', lineHeight: 1.45 }}>{erro}</p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAberta(v => !v)}
        aria-expanded={aberta}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 4px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: colors.primaryHover, textDecoration: aberta ? 'none' : 'underline' }}
      >
        {aberta ? <ChevronUp size={20} /> : <HelpCircle size={20} />}
        {aberta ? 'Fechar a ajuda' : 'Como enviar fotos? Preciso de ajuda'}
      </button>

      {aberta && (
        <div style={{ marginTop: 6, padding: 16, borderRadius: radius.input, background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <p style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 700, color: colors.text }}>É simples, em 3 passos</p>
          <ol style={{ margin: 0, paddingLeft: 22, fontSize: 15, lineHeight: 1.55, color: colors.text, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {podeFotografar ? (
              <>
                <li>Toque em <strong>“Tirar foto agora”</strong> para fotografar na hora, ou em <strong>“Escolher da galeria”</strong> para usar uma foto que já está no seu celular.</li>
                <li>Se escolher da galeria, toque na foto{aceitaVideo ? ' (ou no vídeo)' : ''}. Dá para marcar várias de uma vez. Depois confirme.</li>
              </>
            ) : (
              <>
                <li>Clique em <strong>“Escolher foto do computador”</strong>.</li>
                <li>Na janela que abrir, clique na foto{aceitaVideo ? ' (ou no vídeo)' : ''} e depois em <strong>“Abrir”</strong>. Para várias de uma vez, segure a tecla Ctrl enquanto clica.</li>
              </>
            )}
            <li>Espere uns segundos. A foto aparece aqui na tela quando termina de enviar.</li>
          </ol>

          <p style={{ margin: '14px 0 6px', fontSize: 15, fontWeight: 700, color: colors.text }}>Dicas</p>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.55, color: colors.textSub, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li>Foto grande? Não tem problema: o app <strong>diminui sozinho</strong>, você não precisa fazer nada.</li>
            <li>Boa luz ajuda muito: tire a foto perto de uma janela ou com a luz acesa.</li>
            <li>Mostre o serviço de perto e uma foto mais aberta, do lugar todo.</li>
            {aceitaVideo && <li>Vídeos: até {LIMITE_VIDEO_MB} MB (cerca de 1 minuto).</li>}
            <li>Se aparecer um aviso vermelho, leia o que ele diz: ele explica o que fazer.</li>
          </ul>

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #BBF7D0' }}>
            <p style={{ margin: '0 0 8px', fontSize: 14, color: colors.text }}>
              {tentativas >= 2 ? 'Tentou mais de uma vez e não foi? Sem problema, a gente ajuda.' : 'Não conseguiu? A gente ajuda.'}
            </p>
            <Link
              to={linkSuporte}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 999, fontSize: 15, fontWeight: 700, textDecoration: 'none', background: tentativas >= 2 ? colors.primary : '#fff', color: tentativas >= 2 ? '#fff' : colors.primaryHover, border: `1px solid ${colors.primary}` }}
            >
              <LifeBuoy size={18} /> Falar com o suporte
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
