// Teste de integração do fluxo crítico do app: cadastro → pedido →
// candidatura → mensagem → avaliação → pagamento. Roda contra o Supabase
// de produção de verdade (RLS real), usando duas contas descartáveis
// criadas e apagadas nesta mesma execução. Ver tests/integration/setup.js
// e .env.test.example para como configurar antes de rodar.
import { describe, it, expect, afterAll } from 'vitest'
import criarCobranca from '../../api/criar-cobranca.js'
import webhookAsaas from '../../api/webhook-asaas.js'
import { verificarTempoResposta, verificarLiberacaoAutomatica, verificarSuporteDisputa } from '../../api/manutencao.js'
import confirmarServicoConcluido from '../../api/confirmar-servico-concluido.js'
import { admin, criarUsuarioTeste, invocarFuncao, pegarCategoriaTeste, limpar } from './setup.js'

const state = {}

describe('Fluxo crítico', () => {
  afterAll(async () => {
    await limpar(state)
  }, 30000)

  it('1. Cadastro — cria conta cliente e conta prestador (plano básico)', async () => {
    state.categoriaId = await pegarCategoriaTeste()

    state.clienteSessao = await criarUsuarioTeste('cliente')
    state.clienteUserId = state.clienteSessao.userId

    state.prestadorSessao = await criarUsuarioTeste('prestador')
    state.prestadorUserId = state.prestadorSessao.userId

    const { data: prestadorRow, error } = await state.prestadorSessao.cliente
      .from('prestadores')
      .insert({
        user_id: state.prestadorUserId,
        nome: 'Prestador de Teste',
        whatsapp: '11999999999',
        categoria_id: state.categoriaId,
        cidade: 'São Paulo',
        estado: 'SP',
        descricao: 'Conta criada pelo teste de integração.',
        plano_id: 'basico',
        servicos: [],
        disponivel: true,
      })
      .select()
      .single()

    expect(error).toBeNull()
    expect(prestadorRow).toBeTruthy()
    state.prestadorId = prestadorRow.id
  }, 30000)

  it('2. Pedido — cliente cria um pedido de serviço e consegue vê-lo', async () => {
    const { data: pedido, error } = await state.clienteSessao.cliente
      .from('pedidos_servico')
      .insert({
        cliente_user_id: state.clienteUserId,
        cliente_nome: 'Cliente de Teste',
        titulo: 'Preciso de um eletricista',
        descricao: 'Teste de integração — instalação de tomada.',
        categoria_id: state.categoriaId,
        cidade: 'São Paulo',
        estado: 'SP',
        valor_pago: 9.0,
        pago: true,
        status: 'aberto',
      })
      .select()
      .single()

    expect(error).toBeNull()
    state.pedidoId = pedido.id

    const { data: visivel } = await state.clienteSessao.cliente
      .from('pedidos_servico')
      .select('id')
      .eq('id', pedido.id)
      .single()
    expect(visivel?.id).toBe(pedido.id)
  }, 15000)

  it('3a. Candidatura — RLS recusa prestador do plano básico', async () => {
    const { error: erroRecusado } = await state.prestadorSessao.cliente
      .from('candidaturas')
      .insert({
        pedido_id: state.pedidoId,
        prestador_id: state.prestadorId,
        mensagem: 'Tentativa como básico — deve falhar.',
      })
    expect(erroRecusado).toBeTruthy()
  }, 15000)

  it('3b. Candidatura — vira Premium e a RLS aceita', async () => {
    const { error: erroPromover } = await admin
      .from('prestadores')
      .update({ plano_id: 'premium', plano_status: 'ativo' })
      .eq('id', state.prestadorId)
    expect(erroPromover).toBeNull()

    const { data: candidatura, error: erroAceito } = await state.prestadorSessao.cliente
      .from('candidaturas')
      .insert({
        pedido_id: state.pedidoId,
        prestador_id: state.prestadorId,
        mensagem: 'Tentativa como Premium — deve funcionar.',
      })
      .select()
      .single()

    expect(erroAceito).toBeNull()
    state.candidaturaId = candidatura.id
  }, 15000)

  it('3c. Candidatura — cliente (dono do pedido) consegue aceitar', async () => {
    const { error } = await state.clienteSessao.cliente
      .from('candidaturas')
      .update({ status: 'aceito' })
      .eq('id', state.candidaturaId)
    expect(error).toBeNull()

    const { data: candidatura } = await admin
      .from('candidaturas')
      .select('status')
      .eq('id', state.candidaturaId)
      .single()
    expect(candidatura.status).toBe('aceito')
  }, 15000)

  // Opcional — só roda se ASAAS_WEBHOOK_TOKEN estiver preenchido no .env.test.
  // Re-testa o mesmo upgrade de plano, mas passando pelo webhook de verdade
  // em vez de atualizar o banco direto (cobertura extra, não bloqueia o resto).
  it.skipIf(!process.env.ASAAS_WEBHOOK_TOKEN)(
    '3d. (opcional) Webhook real de mensalidade também promove pra Premium',
    async () => {
      await admin.from('prestadores').update({ plano_id: 'basico' }).eq('id', state.prestadorId)

      const { statusCode } = await invocarFuncao(webhookAsaas, {
        // host precisa de um valor de verdade — mensalidade dispara um
        // email de confirmação que monta a URL a partir dele.
        headers: { 'asaas-access-token': process.env.ASAAS_WEBHOOK_TOKEN, host: 'prestador-lyart.vercel.app' },
        body: {
          event: 'PAYMENT_CONFIRMED',
          payment: {
            externalReference: `mensalidade:${state.prestadorUserId}:premium`,
            value: 199,
            billingType: 'PIX',
          },
        },
      })
      expect(statusCode).toBe(200)

      const { data: prestadorAtualizado } = await admin
        .from('prestadores')
        .select('plano_id')
        .eq('id', state.prestadorId)
        .single()
      expect(prestadorAtualizado.plano_id).toBe('premium')
    },
    15000
  )

  it('4. Mensagens — cliente e prestador trocam mensagem e leem dos dois lados', async () => {
    const { data: conversa, error: erroConversa } = await state.clienteSessao.cliente
      .from('conversas')
      .insert({
        prestador_id: state.prestadorId,
        cliente_user_id: state.clienteUserId,
        cliente_nome: 'Cliente de Teste',
      })
      .select()
      .single()

    expect(erroConversa).toBeNull()
    state.conversaId = conversa.id

    const { error: erroMsgCliente } = await state.clienteSessao.cliente.from('mensagens').insert({
      conversa_id: conversa.id,
      prestador_id: state.prestadorId,
      cliente_user_id: state.clienteUserId,
      remetente: 'cliente',
      texto: 'Olá, tudo bem?',
    })
    expect(erroMsgCliente).toBeNull()

    const { error: erroMsgPrestador } = await state.prestadorSessao.cliente.from('mensagens').insert({
      conversa_id: conversa.id,
      prestador_id: state.prestadorId,
      cliente_user_id: state.clienteUserId,
      remetente: 'prestador',
      texto: 'Tudo certo, como posso ajudar?',
    })
    expect(erroMsgPrestador).toBeNull()

    const { data: paraOCliente } = await state.clienteSessao.cliente
      .from('mensagens')
      .select('remetente, texto')
      .eq('conversa_id', conversa.id)
      .order('criado_em')
    const { data: paraOPrestador } = await state.prestadorSessao.cliente
      .from('mensagens')
      .select('remetente, texto')
      .eq('conversa_id', conversa.id)
      .order('criado_em')

    expect(paraOCliente).toHaveLength(2)
    expect(paraOPrestador).toHaveLength(2)
    expect(paraOCliente.map(m => m.remetente)).toEqual(['cliente', 'prestador'])
  }, 20000)

  it('5. Avaliação — cliente avalia o prestador e a média reflete', async () => {
    const { data: avaliacao, error } = await state.clienteSessao.cliente
      .from('avaliacoes')
      .insert({
        prestador_id: state.prestadorId,
        autor_user_id: state.clienteUserId,
        autor_nome: 'Cliente de Teste',
        nota: 5,
        pontualidade: 5,
        qualidade: 5,
        preco: 4,
        limpeza: 5,
        comentario: 'Ótimo serviço, teste de integração.',
      })
      .select()
      .single()

    expect(error).toBeNull()
    state.avaliacaoId = avaliacao.id

    const { data: completo } = await admin
      .from('prestadores_completo')
      .select('avaliacao_media, total_avaliacoes')
      .eq('id', state.prestadorId)
      .single()
    expect(completo.total_avaliacoes).toBeGreaterThanOrEqual(1)
    expect(completo.avaliacao_media).toBeGreaterThan(0)
  }, 15000)

  it('5b. Perfil do cliente — editar e salvar duas vezes preserva a última edição', async () => {
    const { error: erroPrimeiro } = await state.clienteSessao.cliente
      .from('perfis_cliente')
      .upsert({ user_id: state.clienteUserId, bio: 'Primeira versão', cidade: 'São Paulo' }, { onConflict: 'user_id' })
    expect(erroPrimeiro).toBeNull()

    const { error: erroSegundo } = await state.clienteSessao.cliente
      .from('perfis_cliente')
      .upsert({ user_id: state.clienteUserId, bio: 'Segunda versão (editada)', cidade: 'Araraquara' }, { onConflict: 'user_id' })
    expect(erroSegundo).toBeNull()

    const { data: perfil } = await state.clienteSessao.cliente
      .from('perfis_cliente')
      .select('bio, cidade')
      .eq('user_id', state.clienteUserId)
      .single()

    expect(perfil.bio).toBe('Segunda versão (editada)')
    expect(perfil.cidade).toBe('Araraquara')
  }, 15000)

  it('5c. Perfil social do cliente — pastas e destaques respeitam RLS', async () => {
    // Pastas — organização pessoal dos pedidos do cliente
    const { data: pasta, error: erroPasta } = await state.clienteSessao.cliente
      .from('pastas_pedidos')
      .insert({ user_id: state.clienteUserId, nome: 'Pasta de teste' })
      .select()
      .single()
    expect(erroPasta).toBeNull()

    const { error: erroAtribuir } = await state.clienteSessao.cliente
      .from('pedidos_servico')
      .update({ pasta_id: pasta.id })
      .eq('id', state.pedidoId)
    expect(erroAtribuir).toBeNull()

    const { data: pedidosNaPasta } = await state.clienteSessao.cliente
      .from('pedidos_servico')
      .select('id')
      .eq('pasta_id', pasta.id)
    expect(pedidosNaPasta.map(p => p.id)).toContain(state.pedidoId)

    // Outro cliente não pode ver a pasta de ninguém — é organização pessoal.
    const outroCliente = await criarUsuarioTeste('outro-cliente')
    const { data: pastaVistaPorOutro } = await outroCliente.cliente
      .from('pastas_pedidos')
      .select('id')
      .eq('id', pasta.id)
    expect(pastaVistaPorOutro).toHaveLength(0)
    await admin.auth.admin.deleteUser(outroCliente.userId)

    // Destaques — dono sempre vê; prestador com conversa ativa vê (dá
    // contexto pra orçar); prestador sem nenhuma conversa não vê.
    const { data: destaque, error: erroDestaque } = await state.clienteSessao.cliente
      .from('destaques_cliente')
      .insert({ user_id: state.clienteUserId, titulo: 'Minha casa', url: 'https://example.com/foto.jpg' })
      .select()
      .single()
    expect(erroDestaque).toBeNull()

    const { data: paraODono } = await state.clienteSessao.cliente
      .from('destaques_cliente').select('id').eq('id', destaque.id)
    expect(paraODono).toHaveLength(1)

    const { data: paraOPrestadorComConversa } = await state.prestadorSessao.cliente
      .from('destaques_cliente').select('id').eq('id', destaque.id)
    expect(paraOPrestadorComConversa).toHaveLength(1)

    const outroPrestador = await criarUsuarioTeste('outro-prestador')
    await admin.from('prestadores').insert({
      user_id: outroPrestador.userId, nome: 'Outro Prestador Teste', categoria_id: state.categoriaId,
      cidade: 'São Paulo', estado: 'SP', plano_id: 'basico', servicos: [], disponivel: true,
    })
    const { data: paraOutroPrestador } = await outroPrestador.cliente
      .from('destaques_cliente').select('id').eq('id', destaque.id)
    expect(paraOutroPrestador).toHaveLength(0)

    await admin.from('prestadores').delete().eq('user_id', outroPrestador.userId)
    await admin.auth.admin.deleteUser(outroPrestador.userId)
  }, 25000)

  // Opcional — só roda se ASAAS_WEBHOOK_TOKEN estiver preenchido no .env.test
  // (usado aqui como o token de disparo manual do endpoint, igual ao botão do Admin.jsx).
  it.skipIf(!process.env.ASAAS_WEBHOOK_TOKEN)(
    '5d. Pontuação por tempo de resposta — cron penaliza e RPC de bônus soma pontos',
    async () => {
      // Simula uma conversa esperando resposta há 10 dias — bem além do
      // prazo de 2h úteis, sem depender de que horas são agora de verdade.
      const dezDiasAtras = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      await admin.from('conversas')
        .update({ cliente_aguardando_desde: dezDiasAtras, penalizado_em: null })
        .eq('id', state.conversaId)

      const { data: antes } = await admin.from('prestadores').select('pontos_resposta').eq('id', state.prestadorId).single()

      const resultado = await verificarTempoResposta(admin)
      expect(resultado.ok).toBe(true)
      expect(resultado.penalizados).toBeGreaterThanOrEqual(1)

      const { data: depois } = await admin.from('prestadores').select('pontos_resposta').eq('id', state.prestadorId).single()
      expect(depois.pontos_resposta).toBe(Math.max(0, (antes.pontos_resposta || 0) - 5))

      const { data: conversaAtualizada } = await admin.from('conversas').select('penalizado_em').eq('id', state.conversaId).single()
      expect(conversaAtualizada.penalizado_em).not.toBeNull()

      // Rodar de novo não deve penalizar a mesma janela outra vez.
      const segunda = await verificarTempoResposta(admin)
      expect(segunda.penalizados).toBe(0)

      // Bônus — o próprio prestador chama a RPC ao responder dentro do prazo.
      const { data: pontosAntesBonus } = await admin.from('prestadores').select('pontos_resposta').eq('id', state.prestadorId).single()
      const { data: novoTotal, error: erroRpc } = await state.prestadorSessao.cliente.rpc('incrementar_pontos_resposta_bonus')
      expect(erroRpc).toBeNull()
      expect(novoTotal).toBe((pontosAntesBonus.pontos_resposta || 0) + 2)
    },
    20000
  )

  // Opcional — só roda se ASAAS_KEY_SANDBOX estiver preenchido no .env.test.
  it.skipIf(!process.env.ASAAS_KEY_SANDBOX)('6a. (opcional) Pagamento — preço vem sempre do servidor (item inválido é recusado)', async () => {
    const invalido = await invocarFuncao(criarCobranca, {
      headers: { authorization: `Bearer ${state.clienteSessao.session.access_token}` },
      body: { tipo: 'creditos', extra: 'nao-existe-no-servidor', descricao: 'Teste' },
    })
    expect(invalido.statusCode).toBe(400)

    const valido = await invocarFuncao(criarCobranca, {
      // origin precisa de um host de verdade — é o que vira successUrl/
      // cancelUrl/expiredUrl no checkout, e a Asaas recusa URL relativa.
      headers: {
        authorization: `Bearer ${state.clienteSessao.session.access_token}`,
        origin: 'https://prestador-lyart.vercel.app',
      },
      body: {
        tipo: 'creditos',
        extra: '5',
        descricao: 'Teste de integração',
        nomeCliente: 'Cliente de Teste',
        emailCliente: state.clienteSessao.email,
        cpfCliente: '12345678909',
        telefoneCliente: '11999998888',
        cepCliente: '01310100',
        enderecoCliente: 'Avenida Paulista',
        numeroCliente: '1000',
        bairroCliente: 'Bela Vista',
      },
    })
    expect(valido.statusCode).toBe(200)
    expect(valido.body.link).toMatch(/^https:\/\//)
  }, 20000)

  // Opcional — só roda se ASAAS_WEBHOOK_TOKEN estiver preenchido no .env.test.
  it.skipIf(!process.env.ASAAS_WEBHOOK_TOKEN)('6b. (opcional) Pagamento — webhook de créditos incrementa o saldo do cliente', async () => {
    const { statusCode } = await invocarFuncao(webhookAsaas, {
      headers: { 'asaas-access-token': process.env.ASAAS_WEBHOOK_TOKEN },
      body: {
        event: 'PAYMENT_CONFIRMED',
        payment: {
          externalReference: `creditos:${state.clienteUserId}:5`,
          value: 35,
          billingType: 'PIX',
        },
      },
    })
    expect(statusCode).toBe(200)

    const { data: creditos } = await admin
      .from('creditos_cliente')
      .select('creditos_disponiveis')
      .eq('user_id', state.clienteUserId)
      .single()
    expect(creditos.creditos_disponiveis).toBe(5)
  }, 15000)

  // Opcional — só roda se ASAAS_KEY_SANDBOX/ASAAS_WEBHOOK_TOKEN estiverem
  // preenchidos. Cobre até a retenção do pagamento e a marcação de
  // "entregue" — a liberação de verdade (transferência PIX) depende de
  // uma permissão de saque via API que precisa ser habilitada na conta
  // Asaas (fora do nosso código), então aqui só confirmamos que nosso
  // lado se comporta corretamente nos dois desfechos possíveis.
  it.skipIf(!process.env.ASAAS_KEY_SANDBOX || !process.env.ASAAS_WEBHOOK_TOKEN)(
    '6c. (opcional) Pagamento protegido do serviço — retém, marca entregue, tenta liberar',
    async () => {
      await admin.from('prestadores').update({
        chave_pix: state.prestadorSessao.email, tipo_chave_pix: 'EMAIL',
      }).eq('id', state.prestadorId)
      await admin.from('pedidos_servico').update({ status: 'em_andamento', valor_acordado: 150 }).eq('id', state.pedidoId)

      const cobranca = await invocarFuncao(criarCobranca, {
        headers: { authorization: `Bearer ${state.clienteSessao.session.access_token}`, origin: 'https://prestador-lyart.vercel.app' },
        body: {
          tipo: 'servico', pedidoId: state.pedidoId, nomeCliente: 'Cliente de Teste', emailCliente: state.clienteSessao.email,
          cpfCliente: '12345678909', telefoneCliente: '11999998888', cepCliente: '01310100',
          enderecoCliente: 'Avenida Paulista', numeroCliente: '1000', bairroCliente: 'Bela Vista',
        },
      })
      expect(cobranca.statusCode).toBe(200)
      expect(cobranca.body.link).toMatch(/^https:\/\//)

      const webhook = await invocarFuncao(webhookAsaas, {
        headers: { 'asaas-access-token': process.env.ASAAS_WEBHOOK_TOKEN },
        body: {
          event: 'PAYMENT_CONFIRMED',
          payment: { externalReference: `servico:${state.clienteUserId}:${state.pedidoId}`, value: 150, billingType: 'PIX' },
        },
      })
      expect(webhook.statusCode).toBe(200)

      const { data: retido } = await admin.from('pedidos_servico').select('status_pagamento').eq('id', state.pedidoId).single()
      expect(retido.status_pagamento).toBe('retido')

      const { error: erroRpc } = await state.prestadorSessao.cliente.rpc('marcar_servico_entregue', { p_pedido_id: state.pedidoId })
      expect(erroRpc).toBeNull()

      const { data: entregue } = await admin.from('pedidos_servico').select('entregue_em').eq('id', state.pedidoId).single()
      expect(entregue.entregue_em).not.toBeNull()

      // A liberação de verdade depende da conta Asaas ter permissão de
      // saque via API — sem isso, o esperado é falhar e reverter pra
      // 'retido' (não travar em 'liberando'). Aceitamos os dois
      // desfechos, mas nunca um estado travado.
      const confirmar = await invocarFuncao(confirmarServicoConcluido, {
        headers: { authorization: `Bearer ${state.clienteSessao.session.access_token}` },
        body: { pedidoId: state.pedidoId },
      })

      const { data: final } = await admin.from('pedidos_servico').select('status_pagamento').eq('id', state.pedidoId).single()
      expect(['retido', 'liberado']).toContain(final.status_pagamento)
      if (confirmar.statusCode !== 200) {
        expect(final.status_pagamento).toBe('retido')
      }
    },
    20000
  )

  it('6d. Disputa aberta pausa a liberação automática do pagamento', async () => {
    // Independente do desfecho do teste 6c (que depende de permissão de
    // saque na conta Asaas, fora do nosso controle) — reseta o estado
    // aqui pra este teste ficar determinístico.
    const dezDiasAtras = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    await admin.from('pedidos_servico').update({
      status_pagamento: 'retido',
      entregue_em: dezDiasAtras,
      disputa_aberta_em: new Date().toISOString(),
      disputa_motivo: 'Serviço não foi concluído como combinado.',
    }).eq('id', state.pedidoId)

    const resultado = await verificarLiberacaoAutomatica(admin)
    expect(resultado.ok).toBe(true)

    const { data: pedido } = await admin.from('pedidos_servico')
      .select('status_pagamento, disputa_aberta_em')
      .eq('id', state.pedidoId)
      .single()
    // Mesmo com entregue_em de 10 dias atrás (bem além do prazo de 3
    // dias), a disputa aberta impede a liberação automática.
    expect(pedido.status_pagamento).toBe('retido')
    expect(pedido.disputa_aberta_em).not.toBeNull()
  }, 15000)

  // Opcional — só roda se ASAAS_WEBHOOK_TOKEN estiver preenchido no .env.test.
  it.skipIf(!process.env.ASAAS_WEBHOOK_TOKEN)(
    '7. (opcional) Indicação — ativa quando o indicado paga a mensalidade',
    async () => {
      const indicador = await criarUsuarioTeste('indicador')
      const indicado = await criarUsuarioTeste('indicado')

      const { data: prestadorIndicador } = await indicador.cliente.from('prestadores').insert({
        user_id: indicador.userId, nome: 'Indicador Teste', categoria_id: state.categoriaId,
        cidade: 'São Paulo', estado: 'SP', plano_id: 'basico', servicos: [], disponivel: true,
      }).select().single()

      await indicado.cliente.from('prestadores').insert({
        user_id: indicado.userId, nome: 'Indicado Teste', categoria_id: state.categoriaId,
        cidade: 'São Paulo', estado: 'SP', plano_id: 'basico', servicos: [], disponivel: true,
      })

      const { data: cod } = await indicador.cliente.from('codigos_indicacao').insert({
        user_id: indicador.userId, codigo: `teste${Date.now()}`, tipo: 'prestador',
      }).select().single()

      const { error: erroResgate } = await indicado.cliente.rpc('resgatar_indicacao', { p_codigo: cod.codigo })
      expect(erroResgate).toBeNull()

      const { statusCode } = await invocarFuncao(webhookAsaas, {
        // host precisa de um valor de verdade — mensalidade dispara um
        // email de confirmação que monta a URL a partir dele.
        headers: { 'asaas-access-token': process.env.ASAAS_WEBHOOK_TOKEN, host: 'prestador-lyart.vercel.app' },
        body: {
          event: 'PAYMENT_CONFIRMED',
          payment: { externalReference: `mensalidade:${indicado.userId}:basico`, value: 49, billingType: 'PIX' },
        },
      })
      expect(statusCode).toBe(200)

      const { data: indicacao } = await admin
        .from('indicacoes')
        .select('status')
        .eq('indicador_user_id', indicador.userId)
        .eq('indicado_user_id', indicado.userId)
        .single()
      expect(indicacao.status).toBe('ativo')

      // limpeza específica deste bloco (contas próprias, não fazem parte do state principal)
      await admin.from('indicacoes').delete().eq('indicador_user_id', indicador.userId)
      await admin.from('codigos_indicacao').delete().eq('user_id', indicador.userId)
      await admin.from('prestadores').delete().eq('user_id', indicador.userId)
      await admin.from('prestadores').delete().eq('user_id', indicado.userId)
      // o webhook de mensalidade acima grava notificacoes pros dois lados, e
      // resgatar_indicacao() dá 3 créditos pro indicado via creditos_cliente —
      // sem apagar isso primeiro, deleteUser falha (FK) silenciosamente.
      await admin.from('notificacoes').delete().eq('user_id', indicador.userId)
      await admin.from('notificacoes').delete().eq('user_id', indicado.userId)
      await admin.from('creditos_cliente').delete().eq('user_id', indicador.userId)
      await admin.from('creditos_cliente').delete().eq('user_id', indicado.userId)
      const { error: erroDelIndicador } = await admin.auth.admin.deleteUser(indicador.userId)
      const { error: erroDelIndicado } = await admin.auth.admin.deleteUser(indicado.userId)
      if (erroDelIndicador) console.warn('Falha ao apagar usuário indicador de teste:', erroDelIndicador.message)
      if (erroDelIndicado) console.warn('Falha ao apagar usuário indicado de teste:', erroDelIndicado.message)
    },
    20000
  )

  it('8. Avaliações — constraint aceita 0 e 10, recusa acima de 10', async () => {
    const { error: erroDez } = await state.clienteSessao.cliente.from('avaliacoes').insert({
      prestador_id: state.prestadorId, autor_user_id: state.clienteUserId, autor_nome: 'Cliente de Teste',
      nota: 10, pontualidade: 10, qualidade: 0, preco: 0, limpeza: 10, comunicacao: 10,
    })
    expect(erroDez).toBeNull()
    await admin.from('avaliacoes').delete().eq('prestador_id', state.prestadorId).eq('nota', 10)

    const { error: erroOnze } = await state.clienteSessao.cliente.from('avaliacoes').insert({
      prestador_id: state.prestadorId, autor_user_id: state.clienteUserId, autor_nome: 'Cliente de Teste',
      nota: 11, pontualidade: 5, qualidade: 5, preco: 5, limpeza: 5, comunicacao: 5,
    })
    expect(erroOnze).toBeTruthy()
  }, 15000)

  it('9. Serviço concluído sem pagamento — grava histórico e incrementa total_servicos', async () => {
    await admin.from('pedidos_servico').update({
      status: 'em_andamento', status_pagamento: null, valor_acordado: 80,
    }).eq('id', state.pedidoId)

    const { data: antes } = await admin.from('prestadores').select('total_servicos').eq('id', state.prestadorId).single()

    const resultado = await invocarFuncao(confirmarServicoConcluido, {
      headers: { authorization: `Bearer ${state.clienteSessao.session.access_token}` },
      body: { pedidoId: state.pedidoId },
    })
    expect(resultado.statusCode).toBe(200)

    const { data: pedido } = await admin.from('pedidos_servico').select('status, concluido_em').eq('id', state.pedidoId).single()
    expect(pedido.status).toBe('concluido')
    expect(pedido.concluido_em).not.toBeNull()

    const { data: historico } = await admin.from('historico_servicos')
      .select('*').eq('prestador_id', state.prestadorId).eq('cliente_user_id', state.clienteUserId)
    expect(historico.length).toBeGreaterThanOrEqual(1)

    const { data: depois } = await admin.from('prestadores').select('total_servicos').eq('id', state.prestadorId).single()
    expect(depois.total_servicos).toBe((antes.total_servicos || 0) + 1)
  }, 20000)

  it('10. Suporte obrigatório — disputa sem resposta em 24h desconta 10 pontos, sem penalizar duas vezes', async () => {
    const doisDiasAtras = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    await admin.from('pedidos_servico').update({
      disputa_aberta_em: doisDiasAtras, disputa_motivo: 'Teste de suporte obrigatório.',
      disputa_respondida_em: null, disputa_penalizada_em: null,
    }).eq('id', state.pedidoId)

    const { data: antes } = await admin.from('prestadores').select('pontos_resposta').eq('id', state.prestadorId).single()

    const primeira = await verificarSuporteDisputa(admin)
    expect(primeira.ok).toBe(true)
    expect(primeira.penalizados).toBeGreaterThanOrEqual(1)

    const { data: depois } = await admin.from('prestadores').select('pontos_resposta').eq('id', state.prestadorId).single()
    expect(depois.pontos_resposta).toBe(Math.max(0, (antes.pontos_resposta || 0) - 10))

    const { data: pedido } = await admin.from('pedidos_servico').select('disputa_penalizada_em').eq('id', state.pedidoId).single()
    expect(pedido.disputa_penalizada_em).not.toBeNull()

    // Rodar de novo não deve descontar a mesma disputa outra vez.
    const segunda = await verificarSuporteDisputa(admin)
    const { data: aindaMesmo } = await admin.from('prestadores').select('pontos_resposta').eq('id', state.prestadorId).single()
    expect(aindaMesmo.pontos_resposta).toBe(depois.pontos_resposta)
  }, 15000)

  it('11. Responder disputa — RPC grava a resposta do prestador e evita a penalidade', async () => {
    const doisDiasAtras = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    await admin.from('pedidos_servico').update({
      disputa_aberta_em: doisDiasAtras, disputa_motivo: 'Segunda disputa de teste.',
      disputa_respondida_em: null, disputa_penalizada_em: null, disputa_resposta_prestador: null,
    }).eq('id', state.pedidoId)

    const { error: erroRpc } = await state.prestadorSessao.cliente.rpc('responder_disputa', {
      p_pedido_id: state.pedidoId, p_resposta: 'O serviço foi concluído conforme combinado.',
    })
    expect(erroRpc).toBeNull()

    const { data: pedido } = await admin.from('pedidos_servico')
      .select('disputa_respondida_em, disputa_resposta_prestador').eq('id', state.pedidoId).single()
    expect(pedido.disputa_respondida_em).not.toBeNull()
    expect(pedido.disputa_resposta_prestador).toBe('O serviço foi concluído conforme combinado.')

    const { data: antes } = await admin.from('prestadores').select('pontos_resposta').eq('id', state.prestadorId).single()
    await verificarSuporteDisputa(admin)
    const { data: depois } = await admin.from('prestadores').select('pontos_resposta').eq('id', state.prestadorId).single()
    expect(depois.pontos_resposta).toBe(antes.pontos_resposta)
  }, 15000)
})
