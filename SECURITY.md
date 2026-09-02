# Segurança — Prestador

Este documento cobre duas coisas: como reportar uma vulnerabilidade encontrada no app, e o plano de resposta caso um incidente de segurança aconteça de verdade (vazamento de dados, chave comprometida, pagamento fraudulento, etc).

## Reportar uma vulnerabilidade

Se você encontrou uma falha de segurança no Prestador, entre em contato diretamente com o responsável pelo projeto antes de divulgar publicamente. Não abra uma issue pública descrevendo a falha.

## Sistemas críticos e onde cada um dói

| Sistema | Função | Se cair/vazar |
|---|---|---|
| **Supabase** | Banco de dados, autenticação, RLS (Row Level Security — regras de quem lê/escreve cada linha) | Dados de usuários (CPF, endereço, mensagens) expostos ou perdidos |
| **Vercel** | Hospedagem do site e das funções de backend (`api/*.js`) | App inteiro fora do ar |
| **Asaas** | Processamento de pagamento (cobrança, split, transferência PIX) | Dinheiro retido incorretamente, cobrança duplicada/indevida |
| **GitHub** | Código-fonte e histórico de commits | Segredos vazados no histórico, código malicioso injetado |

## Plano de resposta a incidente

### 1. Identificar

- Confirme que é um incidente de verdade, não um bug comum: dado exposto pra quem não deveria ver, chave/token vazado, cobrança que não deveria ter acontecido, acesso indevido a uma conta.
- Registre a hora exata em que percebeu e como percebeu (log de erro, aviso de usuário, alerta do Supabase/Vercel/Asaas).

### 2. Conter

Ação imediata conforme o tipo de incidente:

| Tipo de incidente | Ação imediata |
|---|---|
| Chave de API vazada (Supabase service role, Asaas) | Revogar/rotacionar a chave no painel do fornecedor **imediatamente** — todo o resto espera |
| Vulnerabilidade de RLS explorada (alguém lendo/escrevendo dado de outro usuário) | Desativar a policy/coluna afetada, ou colocar a tabela em modo mais restritivo, até corrigir |
| Conta de admin comprometida | Revogar a sessão no Supabase Auth, trocar a senha, revisar `termos_aceitos`/`notificacoes` por ações suspeitas feitas com aquela sessão |
| Pagamento duplicado ou indevido | Pausar a liberação automática (`verificarLiberacaoAutomatica`) via Admin, revisar `pedidos_servico.status_pagamento` manualmente antes de deixar o cron rodar de novo |
| Vazamento de dados de usuário | Identificar exatamente quais tabelas/linhas foram expostas antes de qualquer comunicação — evita superestimar ou subestimar o problema |

### 3. Avaliar o alcance

- Quantos usuários/registros foram afetados? (consulta direta no Supabase, nunca supor)
- Dado sensível envolvido: CPF, endereço, dado de pagamento, mensagem privada?
- Desde quando a falha existia (`git log` na função/policy afetada ajuda a estimar a janela de exposição)?

### 4. Corrigir

- Corrigir a causa raiz (não só o sintoma) — se foi uma policy de RLS, adicionar um teste de integração que cubra exatamente esse cenário antes de considerar resolvido (ver `tests/integration/fluxo-critico.test.js`, que já cobre vários casos de RLS).
- Rodar `npm run build && npm run test && npm run test:integration` antes de reimplantar.

### 5. Notificar

- **Usuários afetados**: se dado pessoal foi exposto, avisar diretamente (email) o que aconteceu, o que foi exposto, e o que foi feito.
- **ANPD** (Autoridade Nacional de Proteção de Dados — o órgão que fiscaliza a LGPD): a lei exige comunicação "em prazo razoável" quando o incidente pode acarretar risco ou dano relevante aos titulares dos dados. Não existe um prazo fixo em horas como na GDPR europeia, mas quanto mais cedo, melhor — documentar a data em que o incidente foi identificado é importante pra essa comunicação.
- Se envolveu dinheiro (pagamento protegido, saldo de crédito), considere se algum usuário específico precisa ser compensado.

### 6. Documentar (post-mortem)

Depois de resolvido, registrar por escrito (pode ser uma issue fechada, um arquivo em `docs/incidentes/`):
- O que aconteceu e desde quando
- Como foi descoberto
- O que foi feito pra conter e corrigir
- O que vai mudar pra não acontecer de novo (novo teste, nova policy, novo alerta)

## Contatos de suporte dos fornecedores

- **Supabase**: [supabase.com/dashboard/support](https://supabase.com/dashboard/support)
- **Vercel**: [vercel.com/help](https://vercel.com/help)
- **Asaas**: central de ajuda dentro do próprio painel (canto inferior direito) — suporte por chat em horário comercial
- **GitHub**: [support.github.com](https://support.github.com)

## Prevenção contínua

- 2FA (autenticação de dois fatores) ativado em todas as contas acima.
- `npm audit` rodado periodicamente — ver `.github/dependabot.yml` pra avisos automáticos de dependência vulnerável.
- Auditoria de RLS revisada a cada funcionalidade nova que toca em dado sensível (pagamento, dado pessoal) — ver histórico em `supabase/*.sql`, cada arquivo numerado documenta o que foi endurecido e por quê.
- Testes de integração (`tests/integration/`) cobrindo os cenários de RLS mais sensíveis, rodando contra o banco de produção antes de qualquer deploy de mudança nessa área.
