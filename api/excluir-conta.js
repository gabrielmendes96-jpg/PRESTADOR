import { verificarUsuario } from './_verificarUsuario.js'
import { cancelarAssinaturaAsaas } from './_asaas.js'

// Apaga os arquivos de uma "pasta" do bucket (as pastas do app são planas:
// só arquivos diretamente dentro). Falha aqui não impede a exclusão da
// conta — vira só um registro no log.
async function removerPasta(supabase, prefixo) {
  try {
    const { data: arquivos } = await supabase.storage.from('midias').list(prefixo, { limit: 1000 })
    if (arquivos?.length) {
      await supabase.storage.from('midias').remove(arquivos.map(a => `${prefixo}/${a.name}`))
    }
  } catch (erro) {
    console.error(`Falha ao limpar a pasta ${prefixo} do Storage:`, erro)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const usuarioAutenticado = await verificarUsuario(req)
  if (!usuarioAutenticado) return res.status(401).json({ error: 'Não autenticado' })
  const userId = usuarioAutenticado.id

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  try {
    const { data: prestador } = await supabase.from('prestadores').select('id').eq('user_id', userId).single()

    // 1) Não exclui enquanto houver dinheiro retido: o valor ficaria preso
    // sem ninguém a quem liberar ou devolver. Vale pros dois lados — quem
    // pagou um serviço e quem vai receber por ele.
    const { data: retidoComoCliente } = await supabase
      .from('pedidos_servico').select('id')
      .eq('cliente_user_id', userId).in('status_pagamento', ['retido', 'liberando']).limit(1)

    let retidoComoPrestador = []
    if (prestador) {
      const { data: aceitas } = await supabase
        .from('candidaturas').select('pedido_id').eq('prestador_id', prestador.id).eq('status', 'aceito')
      const idsAceitos = (aceitas || []).map(c => c.pedido_id)
      if (idsAceitos.length) {
        const { data } = await supabase
          .from('pedidos_servico').select('id')
          .in('id', idsAceitos).in('status_pagamento', ['retido', 'liberando']).limit(1)
        retidoComoPrestador = data || []
      }
    }

    if (retidoComoCliente?.length || retidoComoPrestador.length) {
      return res.status(409).json({
        codigo: 'pagamento_em_andamento',
        error: 'Você tem um pagamento protegido em andamento (dinheiro retido aguardando a conclusão de um serviço). Conclua o serviço ou resolva a disputa antes de excluir a conta, pra ninguém ficar sem receber ou sem reembolso.',
      })
    }

    // 2) Cancela a renovação automática no cartão ANTES de apagar qualquer
    // coisa — senão a Asaas continuaria cobrando de quem já não tem conta.
    // Se não conseguir cancelar, não exclui (e nada foi apagado ainda).
    if (prestador) {
      const { data: recorrentes } = await supabase
        .from('assinaturas').select('asaas_subscription_id')
        .eq('prestador_id', prestador.id).not('asaas_subscription_id', 'is', null)

      for (const id of new Set((recorrentes || []).map(r => r.asaas_subscription_id))) {
        const r = await cancelarAssinaturaAsaas(id)
        if (!r.ok) {
          console.error(`Exclusão de conta bloqueada: não cancelou a assinatura ${id}:`, r.motivo)
          return res.status(502).json({
            codigo: 'falha_cancelar_assinatura',
            error: 'Não conseguimos cancelar sua renovação automática agora. Tente novamente em instantes — sua conta não foi excluída.',
          })
        }
      }
    }

    // Fotos e vídeos do Storage (as linhas do banco só guardam a URL).
    const { data: pedidosDoCliente } = await supabase
      .from('pedidos_servico').select('id').eq('cliente_user_id', userId)
    for (const p of (pedidosDoCliente || [])) await removerPasta(supabase, `pedidos/${p.id}`)
    await removerPasta(supabase, `clientes/${userId}`)
    await removerPasta(supabase, `destaques/${userId}`)

    // Deletar dados do lado prestador (se o usuário tiver um perfil)
    if (prestador) {
      await removerPasta(supabase, `portfolio/${prestador.id}`)
      await removerPasta(supabase, `perfil/${prestador.id}`)

      const { data: avaliacoesRecebidas } = await supabase
        .from('avaliacoes').select('id').eq('prestador_id', prestador.id)
      const idsAvaliacoes = (avaliacoesRecebidas || []).map(a => a.id)
      for (const id of idsAvaliacoes) await removerPasta(supabase, `avaliacoes/${id}`)
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
    for (const id of idsAvaliacoesEscritas) await removerPasta(supabase, `avaliacoes/${id}`)
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
