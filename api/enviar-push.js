// api/enviar-push.js
// Envia notificação push para o outro participante de uma conversa

import { verificarUsuario } from './_verificarUsuario.js'
import { checkRateLimit } from './_rateLimit.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const usuarioAutenticado = await verificarUsuario(req)
  if (!usuarioAutenticado) return res.status(401).json({ error: 'Não autenticado' })

  // Sem isso, quem participa de uma conversa podia inundar a outra
  // pessoa de notificações push repetidas — o limite é por pessoa que
  // envia, não por conversa, pra não travar quem conversa com vários
  // clientes/prestadores ao mesmo tempo.
  if (!(await checkRateLimit(`enviar-push:${usuarioAutenticado.id}`, 20, 60))) {
    return res.status(429).json({ error: 'Muitas notificações enviadas. Tente novamente em instantes.' })
  }

  const { conversaId, titulo, corpo, url, tipo } = req.body
  if (!conversaId) return res.status(400).json({ error: 'conversaId obrigatório' })

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  try {
    // Confirma que quem está enviando participa da conversa, e descobre
    // o destinatário a partir dela — nunca confiamos num userId vindo do cliente.
    const { data: conversa } = await supabase
      .from('conversas')
      .select('cliente_user_id, prestadores(user_id)')
      .eq('id', conversaId)
      .single()

    if (!conversa) return res.status(404).json({ error: 'Conversa não encontrada' })

    const idCliente = conversa.cliente_user_id
    const idPrestador = conversa.prestadores?.user_id
    const souCliente = usuarioAutenticado.id === idCliente
    const souPrestador = usuarioAutenticado.id === idPrestador

    if (!souCliente && !souPrestador) {
      return res.status(403).json({ error: 'Você não participa desta conversa' })
    }

    const userId = souCliente ? idPrestador : idCliente
    if (!userId) return res.status(200).json({ ok: true, aviso: 'Destinatário indisponível' })

    // 1. Salvar notificação no banco
    await supabase.from('notificacoes').insert({
      user_id: userId, titulo, corpo, tipo: tipo || 'geral', url: url || '/'
    })

    // 2. Buscar tokens push do usuário
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', userId)
      .eq('ativo', true)

    if (!tokens?.length) {
      return res.status(200).json({ ok: true, aviso: 'Sem tokens push' })
    }

    // 3. Enviar push via Web Push (requer VAPID)
    const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY
    const VAPID_PUBLIC = process.env.VITE_VAPID_PUBLIC_KEY

    if (!VAPID_PRIVATE || !VAPID_PUBLIC) {
      return res.status(200).json({ ok: true, aviso: 'VAPID não configurado' })
    }

    const webpush = await import('web-push')
    webpush.default.setVapidDetails(
      'mailto:contato@prestador.app',
      VAPID_PUBLIC,
      VAPID_PRIVATE
    )

    const payload = JSON.stringify({ titulo, corpo, url, icon: '/icons/icon-192.png' })
    const enviados = []

    for (const { token } of tokens) {
      try {
        const subscription = JSON.parse(token)
        await webpush.default.sendNotification(subscription, payload)
        enviados.push(true)
      } catch (e) {
        // Token inválido — desativar
        if (e.statusCode === 410) {
          await supabase.from('push_tokens').update({ ativo: false })
            .eq('user_id', userId).eq('token', token)
        }
      }
    }

    return res.status(200).json({ ok: true, enviados: enviados.length })
  } catch (error) {
    console.error('Erro ao enviar push:', error)
    return res.status(500).json({ error: 'Erro ao enviar push' })
  }
}
