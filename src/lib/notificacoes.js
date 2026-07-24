import { supabase } from './supabase'

// Registrar service worker para push
export async function registrarPush(userId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null

  try {
    const registro = await navigator.serviceWorker.ready
    const permissao = await Notification.requestPermission()
    if (permissao !== 'granted') return null

    // Chave pública VAPID (gerar em web-push-codelab.glitch.me)
    const VAPID_PUBLIC = process.env.VITE_VAPID_PUBLIC_KEY
    if (!VAPID_PUBLIC) return null

    const subscription = await registro.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC)
    })

    const token = JSON.stringify(subscription)

    await supabase.from('push_tokens').upsert({
      user_id: userId,
      token,
      plataforma: 'web',
      ativo: true,
    })

    return subscription
  } catch (e) {
    console.error('Erro ao registrar push:', e)
    return null
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

// Salvar notificação no banco
export async function salvarNotificacao(userId, titulo, corpo, tipo, url = '/') {
  await supabase.from('notificacoes').insert({ user_id: userId, titulo, corpo, tipo, url })
}

// Buscar notificações não lidas
export async function buscarNaoLidas(userId) {
  const { data } = await supabase
    .from('notificacoes')
    .select('*')
    .eq('user_id', userId)
    .eq('lida', false)
    .order('criado_em', { ascending: false })
  return data || []
}

// Marcar como lida
export async function marcarLida(id) {
  await supabase.from('notificacoes').update({ lida: true }).eq('id', id)
}

// Mostrar notificação nativa (quando app está aberto)
export function mostrarNotificacaoNativa(titulo, corpo, url = '/') {
  if (Notification.permission === 'granted') {
    const n = new Notification(titulo, {
      body: corpo,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
    })
    n.onclick = () => { window.focus(); window.location.href = url }
  }
}
