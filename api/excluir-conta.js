import { verificarUsuario } from './_verificarUsuario.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const usuarioAutenticado = await verificarUsuario(req)
  if (!usuarioAutenticado) return res.status(401).json({ error: 'Não autenticado' })
  const userId = usuarioAutenticado.id

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  try {
    // Deletar dados do lado prestador (se o usuário tiver um perfil)
    const { data: prestador } = await supabase.from('prestadores').select('id').eq('user_id', userId).single()
    if (prestador) {
      const { data: avaliacoesRecebidas } = await supabase
        .from('avaliacoes').select('id').eq('prestador_id', prestador.id)
      const idsAvaliacoes = (avaliacoesRecebidas || []).map(a => a.id)
      if (idsAvaliacoes.length) {
        await supabase.from('midias_avaliacao').delete().in('avaliacao_id', idsAvaliacoes)
      }

      await supabase.from('portfolio_prestador').delete().eq('prestador_id', prestador.id)
      await supabase.from('avaliacoes').delete().eq('prestador_id', prestador.id)
      await supabase.from('avaliacoes_cliente').delete().eq('prestador_id', prestador.id)
      await supabase.from('servicos_prestador').delete().eq('prestador_id', prestador.id)
      await supabase.from('boosts').delete().eq('prestador_id', prestador.id)
      await supabase.from('candidaturas').delete().eq('prestador_id', prestador.id)
      await supabase.from('historico_servicos').delete().eq('prestador_id', prestador.id)
      await supabase.from('zona_interesses').delete().eq('prestador_id', prestador.id)
      await supabase.from('mensagens').delete().eq('prestador_id', prestador.id)
      await supabase.from('conversas').delete().eq('prestador_id', prestador.id)
      await supabase.from('assinaturas').delete().eq('prestador_id', prestador.id)
      await supabase.from('prestadores').delete().eq('id', prestador.id)
    }

    // Avaliações que o usuário escreveu como cliente (sobre prestadores)
    const { data: avaliacoesEscritas } = await supabase
      .from('avaliacoes').select('id').eq('autor_user_id', userId)
    const idsAvaliacoesEscritas = (avaliacoesEscritas || []).map(a => a.id)
    if (idsAvaliacoesEscritas.length) {
      await supabase.from('midias_avaliacao').delete().in('avaliacao_id', idsAvaliacoesEscritas)
    }
    await supabase.from('avaliacoes').delete().eq('autor_user_id', userId)

    // Dados do lado cliente
    await supabase.from('mensagens').delete().eq('cliente_user_id', userId)
    await supabase.from('conversas').delete().eq('cliente_user_id', userId)
    await supabase.from('pedidos_servico').delete().eq('cliente_user_id', userId)
    await supabase.from('creditos_cliente').delete().eq('user_id', userId)
    await supabase.from('compras_creditos').delete().eq('user_id', userId)
    await supabase.from('codigos_indicacao').delete().eq('user_id', userId)
    await supabase.from('indicacoes').delete().or(`indicador_user_id.eq.${userId},indicado_user_id.eq.${userId}`)
    await supabase.from('perfis_cliente').delete().eq('user_id', userId)
    await supabase.from('historico_servicos').delete().eq('cliente_user_id', userId)
    await supabase.from('avaliacoes_cliente').delete().eq('cliente_user_id', userId)
    await supabase.from('zonas_quentes').delete().eq('sugerido_por', userId)
    await supabase.from('push_tokens').delete().eq('user_id', userId)
    await supabase.from('notificacoes').delete().eq('user_id', userId)
    await supabase.from('termos_aceitos').delete().eq('user_id', userId)
    if (usuarioAutenticado.email) {
      await supabase.from('emails_log').delete().eq('destinatario', usuarioAutenticado.email)
    }

    // Deletar conta do Auth
    await supabase.auth.admin.deleteUser(userId)

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Erro ao excluir conta:', error)
    return res.status(500).json({ error: 'Erro ao excluir conta' })
  }
}
