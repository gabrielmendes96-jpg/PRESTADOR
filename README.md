# Prestador — MVP

Plataforma para conectar clientes a prestadores de serviços (pedreiros, marceneiros, arquitetos, mecânicos, etc.) com sistema de assinaturas mensais e avaliações.

## ⚠️ Configuração obrigatória: Supabase

Este app agora usa um banco de dados real (Supabase). Antes de rodar,
siga o guia em **`supabase/COMO_CONECTAR.md`** — em resumo:

1. Crie uma conta gratuita em supabase.com e um projeto novo
2. Rode os scripts `supabase/01_schema.sql` e `supabase/02_seed.sql` no SQL Editor do Supabase
3. Copie `.env.example` para `.env` e cole as credenciais do seu projeto
4. Rode `npm install` e `npm run dev`

Sem isso, o app vai mostrar "Carregando..." infinitamente, pois não
há mais dados mockados no código — tudo vem do banco.

## Como rodar

```bash
npm install
npm run dev
```

Acesse: http://localhost:5173

## Estrutura do projeto

```
src/
├── App.jsx              # Roteamento principal
├── lib/
│   └── dados.js         # Dados mockados (substitua por API)
├── pages/
│   ├── Home.jsx         # Página inicial com categorias e destaques
│   ├── Busca.jsx        # Busca com filtros
│   ├── Perfil.jsx       # Perfil do profissional
│   ├── Planos.jsx       # Planos de assinatura
│   ├── CadastroPro.jsx  # Cadastro em 3 etapas
│   └── Admin.jsx        # Painel administrativo
└── components/
    ├── CardPrestador.jsx # Card reutilizável do profissional
    └── Avaliacoes.jsx    # Sistema de avaliações com formulário
```

## Próximos passos (backend)

### 1. Banco de dados (PostgreSQL)
Tabelas principais:
- `users` — clientes (nome, email, cidade)
- `providers` — prestadores (categoria, cidade, raio, plano_id)
- `plans` — planos (básico R$49, profissional R$99, premium R$199)
- `reviews` — avaliações (nota_geral, pontualidade, qualidade, preco, limpeza)
- `subscriptions` — assinaturas ativas, datas, status
- `messages` — chat entre cliente e prestador

### 2. Pagamentos
Integre com **Asaas** (melhor para Brasil) ou **Stripe**:
- Cobrar mensalidade recorrente
- Webhooks para ativar/cancelar planos
- Pix, boleto e cartão

```js
// Exemplo com Asaas
POST /api/subscriptions/create
{ providerId, planId, paymentMethod: 'PIX' }
```

### 3. Autenticação
Use **Supabase Auth** ou **NextAuth**:
- Login com e-mail + senha
- Login social (Google)
- JWT para proteger rotas de prestadores e admin

### 4. Upload de fotos
Use **Cloudflare R2** ou **AWS S3** para fotos de perfil e portfólio.

### 5. Deploy recomendado
- Frontend: **Vercel** (grátis para MVP)
- Backend API: **Railway** ou **Render**
- Banco: **Supabase** (PostgreSQL gerenciado grátis)
- CDN: **Cloudflare**

## Modelo de negócio

| Plano         | Preço   | Público-alvo           |
|---------------|---------|------------------------|
| Básico        | R$49/mês | Profissional começando  |
| Profissional  | R$99/mês | Profissional ativo      |
| Premium       | R$199/mês | Profissional que quer destaque |

**Projeção de receita (MRR) com 1.000 prestadores:**
- 50% Básico = 500 × R$49 = R$24.500
- 39% Pro = 390 × R$99 = R$38.610
- 11% Premium = 110 × R$199 = R$21.890
- **Total: ~R$85.000/mês**

## Tecnologias sugeridas para produção

- **Frontend:** React + Vite + TailwindCSS (este MVP)
- **Backend:** Node.js + Express ou Next.js API Routes
- **Banco:** PostgreSQL via Supabase
- **Pagamentos:** Asaas (Brasil-first, aceita Pix)
- **Mensagens em tempo real:** Supabase Realtime ou Socket.io
- **E-mail:** Resend ou SendGrid
- **SMS/Push:** Twilio ou Firebase Cloud Messaging
