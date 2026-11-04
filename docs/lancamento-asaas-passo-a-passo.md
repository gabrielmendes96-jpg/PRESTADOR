# Asaas de verdade: roteiro do dia do lançamento

Hoje a Vercel roda no **ambiente de testes** do Asaas (`ASAAS_SANDBOX=true`): ninguém é cobrado. Este roteiro liga o dinheiro de verdade.
**Não execute antes de cumprir os "Pré-requisitos".** Cada passo marcado com 🔒 só você faz (chaves e senhas nunca passam pelo Claude).

## Pré-requisitos (sem isso, não ligar)

- [ ] **Conta real do Asaas aprovada** para cobrar (documentos enviados e validados).
- [ ] **Transferência por API funcionando.** O pagamento protegido retém o dinheiro e depois repassa ao prestador por transferência. Sem isso, o cliente paga, o dinheiro fica retido e o prestador não recebe.
  Enquanto não estiver funcionando, **não ofereça pagamento protegido** em produção (assinaturas e créditos funcionam sem isso).
  Segundo o atendimento do Asaas (04/11/2026, chat), os requisitos para transferir por API são: **conta aprovada**, **primeira TED concluída ou selfie aprovada** e **chave Pix cadastrada** na conta.
  Para o webhook de validação: Menu do usuário → Integrações → Segurança → **desative "Validar também saques via interface"**, para que a API use o webhook e o painel/app usem token. Se mantiver a opção ligada, o endpoint precisa validar por dados bancários, chave Pix ou valor, e não só pelo ID.
  Limites, documentos adicionais e prazos: o atendimento automático não soube informar. O pedido a um atendente humano foi enviado pelo chat da conta real em 04/11/2026.
- [ ] **Chave de produção ativa** (a conta real "PRESTADOR APP"). O Asaas desabilita chave sem uso após 3 meses. Se estiver "Desabilitada", reabilite em Integrações → Chaves de API.
- [ ] Limpeza dos dados de teste feita (`node scripts/limpar-dados-de-teste.mjs`).
- [ ] Números fictícios da Home e de Planos trocados por reais ou removidos.

## Passo a passo

### 1. Webhook de pagamentos na conta real  🔒
Asaas (conta real) → Integrações → Webhooks → **Novo webhook**:
- URL: `https://SEU-SITE/api/webhook-asaas`
- Token de autenticação: **o mesmo valor** que está em `ASAAS_WEBHOOK_TOKEN` na Vercel
- Eventos: `PAYMENT_CONFIRMED` e `PAYMENT_RECEIVED` (são os que o app trata)
- Fila de envio: ativa. (A fila **pausa após 15 falhas seguidas**; se acontecer, reative e veja o log da Vercel.)

### 2. Validação de saque  🔒
O Asaas exige aprovação manual de toda transferência, a menos que haja um "mecanismo de validação de saque". Em Integrações → Mecanismos de segurança → **Validação de saque via webhook**:
- URL: `https://SEU-SITE/api/validar-saque-asaas`
- Token: o valor de `ASAAS_SAQUE_WEBHOOK_TOKEN` na Vercel (token **diferente** do webhook de pagamentos)

### 3. Variáveis na Vercel  🔒
Vercel → Projeto → Settings → Environment Variables (Production):
- `ASAAS_KEY_PROD` = chave de produção da conta real
- `ASAAS_SANDBOX` = `false` (ou apague a variável)
- Mantenha `ASAAS_WEBHOOK_TOKEN` e `ASAAS_SAQUE_WEBHOOK_TOKEN`
- Depois de salvar, faça **Redeploy** (variável nova só vale em um deploy novo)

Valores "Secret" da Vercel não podem ser lidos de volta, só substituídos. Se precisar conferir um valor, regrave.

### 4. Teste com dinheiro de verdade (valor mínimo)
Com **você autorizando cada cobrança**:
1. Compre o pacote de créditos mais barato com Pix (confira se o valor cai na conta real e se os créditos aparecem).
2. Confira no log da Vercel: sem "sem correspondência" e sem "Falha".
3. Só depois, se a transferência por API estiver liberada, teste um pagamento protegido de ponta a ponta com valor baixo e confira o repasse.
4. Estorne o teste pelo painel do Asaas se quiser recuperar o valor (as taxas podem não voltar).

### 5. Se algo der errado
- Voltar rápido ao modo de teste: `ASAAS_SANDBOX=true` + Redeploy.
- Diagnóstico: Vercel → Logs, buscar "Falha" ou "sem correspondência". A mensagem de erro indica `[sandbox]` ou `[conta real]`.
- Chave inválida: "A chave de API fornecida é inválida". Confira se a chave certa está em `ASAAS_KEY_PROD`.
