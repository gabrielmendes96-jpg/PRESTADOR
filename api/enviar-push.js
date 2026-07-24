// api/enviar-push.js
// Envia notificação push para um usuário

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { userId, titulo, corpo, url, tipo } = req.body

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  try {
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
