import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Sparkles, MapPin, ClipboardList, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { buscarPrestadores } from '../lib/hooks'
import { semAcento } from '../lib/semAcento'
import { rankearPrestadores } from '../lib/oportunidades'
import { interpretarComIA } from '../lib/assistenteIA'
import { calcularDistancia, recuperarLocalizacao, pegarLocalizacao, salvarLocalizacao } from '../lib/gps'
import { colors, radius } from '../lib/design'
import CartaoSugestao from '../components/CartaoSugestao'
import Button from '../components/ui/Button'

const EXEMPLOS = ['Trocar o chuveiro', 'Pintar a sala', 'Cano vazando', 'Montar um guarda-roupa', 'Limpeza da casa']

// Assistente do cliente: a pessoa conta o que precisa e recebe os melhores profissionais, com o motivo de cada sugestão.
export default function Assistente() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [texto, setTexto] = useState(params.get('q') || '')
  const [carregando, setCarregando] = useState(false)
  const [resposta, setResposta] = useState(null) // { termo, ia, sugestoes }
  const [loc, setLoc] = useState(() => recuperarLocalizacao())
  const [pedindoLoc, setPedindoLoc] = useState(false)
  const [erroLoc, setErroLoc] = useState('')
  const ultimaBusca = useRef('')

  const buscar = async (entrada, localizacao = loc) => {
    const termo = String(entrada || '').trim()
    if (termo.length < 2) return
    ultimaBusca.current = termo
    setCarregando(true)
    setParams({ q: termo }, { replace: true })

    const ia = await interpretarComIA(termo)
    const busca = ia?.busca || termo
    let resultado = await buscarPrestadores({ busca, limite: 30 })
    if ((!resultado || resultado.prestadores.length === 0) && ia?.categoria_id) {
      resultado = await buscarPrestadores({ categoria: ia.categoria_id, limite: 30 })
    }

    const { data: marcados } = await supabase
      .from('prestador_servicos')
      .select('prestador_id, servicos_catalogo!inner(nome)')
      .ilike('servicos_catalogo.nome_busca', `%${semAcento(busca)}%`)
    const idsComServico = new Set((marcados || []).map(m => m.prestador_id))

    const lista = (resultado?.prestadores || []).map(p => ({
      ...p,
      distanciaReal: localizacao && p.latitude && p.longitude ? calcularDistancia(localizacao.lat, localizacao.lng, p.latitude, p.longitude) : null,
    }))
    if (ultimaBusca.current !== termo) return // chegou uma busca mais nova
    setResposta({ termo, ia, sugestoes: rankearPrestadores(lista, { idsComServico }, 4) })
    setCarregando(false)
  }

  useEffect(() => { if (params.get('q')) buscar(params.get('q')) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const usarLocalizacao = async () => {
    setPedindoLoc(true); setErroLoc('')
    try {
      const l = await pegarLocalizacao()
      salvarLocalizacao(l.lat, l.lng)
      setLoc(l)
      if (ultimaBusca.current) await buscar(ultimaBusca.current, l)
    } catch {
      setErroLoc('Não consegui pegar a sua localização. Confira se o aparelho permitiu.')
    }
    setPedindoLoc(false)
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: radius.card, padding: 22, marginBottom: 20 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, fontWeight: 800, color: colors.text, margin: '0 0 6px' }}>
          <Sparkles size={22} color={colors.primary} /> Assistente
        </h1>
        <p style={{ fontSize: 14, color: colors.textSub, margin: '0 0 16px', lineHeight: 1.5 }}>Conte com as suas palavras o que você precisa. Eu encontro os profissionais que mais combinam e explico por quê.</p>

        <form onSubmit={e => { e.preventDefault(); buscar(texto) }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); buscar(texto) } }}
            rows={3}
            maxLength={300}
            placeholder="Ex.: a resistência do chuveiro queimou e preciso trocar ainda esta semana"
            aria-label="O que você precisa"
            style={{ width: '100%', padding: '14px 16px', fontSize: 16, lineHeight: 1.4, borderRadius: 16, border: `1px solid ${colors.border}`, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
          />
          <Button type="submit" fullWidth variant="dark" disabled={carregando || texto.trim().length < 2} icon={carregando ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}>
            {carregando ? 'Procurando…' : 'Encontrar os melhores profissionais'}
          </Button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          {EXEMPLOS.map(e => (
            <button key={e} type="button" onClick={() => { setTexto(e); buscar(e) }} className="btn-press"
              style={{ padding: '7px 13px', borderRadius: 999, border: `1px solid ${colors.border}`, background: colors.bg, fontSize: 13, fontWeight: 600, color: colors.text }}>{e}</button>
          ))}
        </div>
      </div>

      {!loc && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 16, padding: '12px 16px', marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: colors.primaryHover, display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={16} /> Diga onde você está para eu priorizar quem atende perto.</span>
          <Button size="sm" variant="secondary" onClick={usarLocalizacao} disabled={pedindoLoc}>{pedindoLoc ? 'Obtendo…' : 'Usar minha localização'}</Button>
        </div>
      )}
      {erroLoc && <p style={{ fontSize: 13, color: colors.error, margin: '-8px 0 16px' }}>{erroLoc}</p>}

      {resposta && !carregando && (
        <section aria-live="polite">
          {resposta.ia?.resumo && (
            <p style={{ fontSize: 14, color: colors.text, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color={colors.primary} /> Entendi: <strong>{resposta.ia.resumo}</strong>
            </p>
          )}
          {resposta.sugestoes.length > 0 ? (
            <>
              <p style={{ fontSize: 13, color: colors.textSub, margin: '0 0 16px' }}>
                {resposta.sugestoes.length === 1 ? 'Encontrei 1 profissional' : `Encontrei ${resposta.sugestoes.length} profissionais`} para “{resposta.termo}”, do que mais combina para o que menos.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {resposta.sugestoes.map((p, i) => <CartaoSugestao key={p.id} prestador={p} destaque={i === 0} />)}
              </div>
            </>
          ) : (
            <div style={{ background: '#fff', border: `1px dashed ${colors.border}`, borderRadius: radius.card, padding: '28px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: colors.text, margin: '0 0 6px' }}>Ainda não achei ninguém para isso</p>
              <p style={{ fontSize: 14, color: colors.textSub, margin: '0 0 16px', lineHeight: 1.5 }}>Mas você pode publicar o pedido e receber propostas de quem atende o que você precisa.</p>
            </div>
          )}

          <div style={{ marginTop: 22, background: '#fff', border: `1px solid ${colors.border}`, borderRadius: radius.card, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: colors.text, flex: '1 1 220px' }}><strong>Quer receber propostas?</strong><br /><span style={{ color: colors.textSub }}>Publique o pedido e deixe os profissionais virem até você.</span></span>
            <Button variant="secondary" icon={<ClipboardList size={16} />} onClick={() => navigate(`/pedidos/novo?titulo=${encodeURIComponent(resposta.termo.slice(0, 120))}`)}>Publicar pedido</Button>
          </div>
        </section>
      )}
    </div>
  )
}
