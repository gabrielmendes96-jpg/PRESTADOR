export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { userId } = req.body
  if (!userId) return res.status(400).json({ error: 'userId obrigatório' })

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  try {
    // Deletar dados do usuário em ordem
    const { data: prestador } = await supabase.from('prestadores').select('id').eq('user_id', userId).single()
    if (prestador) {
      await supabase.from('portfolio_prestador').delete().eq('prestador_id', prestador.id)
      await supabase.from('avaliacoes').delete().eq('prestador_id', prestador.id)
      await supabase.from('servicos_prestador').delete().eq('prestador_id', prestador.id)
      await supabase.from('boosts').delete().eq('prestador_id', prestador.id)
      await supabase.from('candidaturas').delete().eq('prestador_id', prestador.id)
      await supabase.from('prestadores').delete().eq('id', prestador.id)
    }

    await supabase.from('conversas').delete().eq('cliente_user_id', userId)
    await supabase.from('pedidos_servico').delete().eq('cliente_user_id', userId)
    await supabase.from('creditos_cliente').delete().eq('user_id', userId)
    await supabase.from('codigos_indicacao').delete().eq('user_id', userId)
    await supabase.from('push_tokens').delete().eq('user_id', userId)
    await supabase.from('notificacoes').delete().eq('user_id', userId)
    await supabase.from('termos_aceitos').delete().eq('user_id', userId)

    // Deletar conta do Auth
    await supabase.auth.admin.deleteUser(userId)

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Erro ao excluir conta:', error)
    return res.status(500).json({ error: 'Erro ao excluir conta' })
  }
}
