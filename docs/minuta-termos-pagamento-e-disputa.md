# Minuta — complemento aos Termos de Uso (pra revisão jurídica)

> **Isto NÃO é um texto legal pronto.** É um rascunho descrevendo, em
> linguagem simples, o que o produto realmente faz hoje — pra um
> advogado transformar nas cláusulas de verdade. Não publique isto
> direto em `src/pages/Termos.jsx` sem revisão.
>
> Motivo deste documento: os Termos de Uso atuais (`src/pages/Termos.jsx`,
> versão 1.0, jul/2026) foram escritos antes do pagamento protegido, das
> disputas e do sistema de reputação existirem. A seção 4 (Pagamentos) só
> fala de mensalidade — nada sobre retenção de valor, comissão, disputa ou
> pontuação pública.

## O que mudou no produto desde a v1.0 dos termos

1. **Pagamento protegido do serviço** (além da mensalidade já coberta)
2. **Disputa** sobre o pagamento retido
3. **Reputação pública** — nota 0-10, histórico de serviços, pontuação de
   agilidade

Cada seção abaixo descreve o mecanismo real de código pra virar cláusula.

---

## 1. Pagamento protegido do serviço (complementa a seção 4 atual)

**O que acontece de verdade:**
- O cliente pode pagar o valor combinado com o prestador diretamente
  pelo app (Pix), em vez de combinar por fora.
- Esse valor fica retido pela plataforma até o serviço ser confirmado
  como concluído.
- Confirmação acontece de duas formas: (a) o cliente confirma
  manualmente que o serviço foi concluído, a qualquer momento; ou (b) se
  o prestador marcar "entreguei" e o cliente não confirmar nem abrir uma
  disputa em até **3 dias corridos**, o valor libera automaticamente.
- Na liberação, a plataforma retém **15% de comissão** e transfere o
  restante (85%) direto pra chave Pix cadastrada pelo prestador.
- Enquanto o valor está retido, ele **não é transferido a nenhuma das
  partes** — fica na conta da plataforma na Asaas (processadora de
  pagamento) até a liberação.

**Pontos que um advogado precisa decidir como redigir:**
- O que acontece se a transferência Pix falhar (ex: chave inválida) —
  hoje o valor simplesmente permanece retido até o prestador corrigir o
  cadastro; isso precisa estar em cláusula clara sobre prazo/processo.
- Se há algum cenário de reembolso ao cliente (hoje o produto não tem
  estorno automatizado implementado — só a Asaas oferece estorno parcial
  de Pix via API, mas não está integrado a nenhum fluxo do produto ainda).
- Enquadramento tributário da comissão de 15% (ver a análise de reforma
  tributária já discutida com o contador/advogado da empresa).

## 2. Disputa sobre o pagamento retido (seção nova)

**O que acontece de verdade:**
- Enquanto o pagamento está retido, o cliente pode abrir uma disputa
  (motivo em texto livre) se achar que o serviço não foi concluído como
  combinado.
- Abrir uma disputa **pausa a liberação automática dos 3 dias** — o
  valor só libera se o cliente confirmar manualmente depois, mesmo que a
  disputa continue aberta.
- O prestador é obrigado a responder a disputa em até **24 horas**. Não
  responder desconta 10 pontos da pontuação de agilidade dele (ver
  seção 3).
- **Limitação atual, importante pro advogado saber**: não existe hoje
  nenhum mecanismo de mediação, decisão de terceiro, nem estorno
  automatizado — a disputa só registra as duas versões (motivo do
  cliente + resposta do prestador) e impede a liberação automática. A
  resolução de fato ainda depende de as partes chegarem a um acordo
  fora do fluxo automatizado, ou de uma intervenção manual futura da
  plataforma (não implementada ainda).

**Pontos que um advogado precisa decidir como redigir:**
- Deixar claro que a plataforma **não arbitra o mérito** da disputa —
  só o processo, evitando responsabilização por uma decisão que a
  plataforma não toma.
- Prazo razoável e forma de contato caso a disputa não se resolva
  sozinha (hoje não há canal formal descrito nos termos).

## 3. Reputação pública (seção nova)

**O que acontece de verdade:**
- Toda avaliação usa uma escala de **0 a 10** (não mais estrelas), em 5
  critérios: pontualidade, qualidade, preço, limpeza, comunicação.
- A média fica pública no perfil do prestador, visível pra qualquer
  visitante (não precisa estar logado).
- Cada prestador também tem uma **pontuação de agilidade** pública
  (baseada em tempo de resposta a mensagens e a disputas), visível no
  perfil e usável como critério de busca.
- O histórico de serviços concluídos (com quem, quando, por qual valor)
  fica registrado e visível — pro cliente, no próprio perfil; pro
  prestador, numa aba própria do painel.

**Pontos que um advogado precisa decidir como redigir:**
- Consentimento explícito de que a nota e o histórico de serviços são
  públicos (isso é dado pessoal do prestador exposto — a LGPD exige que
  isso esteja claro no aceite de termos, não só implícito).
- Direito de contestar uma avaliação — hoje o produto permite a
  plataforma remover avaliações que violem as regras (já coberto na
  seção 5 atual), mas não há um processo formal de contestação pelo
  próprio prestador.

## 4. Reforço na cláusula de intermediação (complementa a seção 1 atual)

A seção 1 atual já diz que a plataforma "não é responsável pela
qualidade, pontualidade ou resultado dos serviços". Com o pagamento
protegido existindo agora, vale reforçar explicitamente que:

- A plataforma processa e retém o **pagamento**, mas isso não a torna
  parte do contrato de prestação de serviço em si — o contrato de
  serviço continua sendo só entre cliente e prestador.
- Reter o pagamento é uma garantia de **processo** (o dinheiro só é
  repassado após confirmação), não uma garantia de **resultado** do
  serviço prestado.

Esta distinção importa juridicamente: sem ela, um cliente insatisfeito
poderia argumentar que a plataforma "garantiu" o serviço só por reter o
pagamento — o texto final devia deixar isso explicitamente separado.

---

## Resumo pro advogado

Três blocos de cláusula pra redigir/revisar: (1) pagamento protegido —
retenção, comissão, liberação automática, transferência Pix; (2) disputa
— processo, prazo de resposta, e a limitação de que a plataforma não
arbitra o mérito; (3) reputação pública — natureza pública da nota e do
histórico, base legal LGPD pro consentimento. Mais o reforço da cláusula
de intermediação existente, agora que há dinheiro passando pela
plataforma.
