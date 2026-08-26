// Teste de integração do fluxo crítico do app: cadastro → pedido →
// candidatura → mensagem → avaliação → pagamento. Roda contra o Supabase
// de produção de verdade (RLS real), usando duas contas descartáveis
// criadas e apagadas nesta mesma execução. Ver tests/integration/setup.js
// e .env.test.example para como configurar antes de rodar.
import { describe, it, expect, afterAll } from 'vitest'
import criarCobranca from '../../api/criar-cobranca.js'
import webhookAsaas from '../../api/webhook-asaas.js'
import { admin, criarUsuarioTeste, invocarFuncao, pegarCategoriaTeste, limpar } from './setup.js'

const state = {}

describe('Fluxo crítico', () => {
  afterAll(async () => {
    await limpar(state)
  })

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
      await admin.auth.admin.deleteUser(indicador.userId)
      await admin.auth.admin.deleteUser(indicado.userId)
    },
    20000
  )
})
