# Conectando o app ao Supabase (passo a passo)

Este guia assume que você já criou sua conta e um projeto no Supabase
(em supabase.com), na região **South America (São Paulo)**.

## 1. Rodar os scripts SQL

1. No painel do Supabase, abra o menu lateral e clique em **"SQL Editor"**
2. Clique em **"New query"**
3. Abra o arquivo `supabase/01_schema.sql` (nesta pasta), copie todo o
   conteúdo, cole no editor e clique em **"Run"**
   - Isso cria todas as tabelas, views e regras de segurança
4. Repita o processo com o arquivo `supabase/02_seed.sql`
   - Isso popula categorias, tópicos, planos e os 4 prestadores de exemplo

Se aparecer algum erro, leia a mensagem — geralmente é porque algum
script já foi rodado antes (tabela já existe). Nesse caso, pode ignorar
ou apagar as tabelas em "Table Editor" e rodar novamente do zero.

## 2. Pegar as credenciais da API

1. No menu lateral, clique no ícone de engrenagem **"Project Settings"**
2. Clique em **"API"**
3. Você vai ver dois valores importantes:
   - **Project URL** — algo como `https://xxxxxxxxxxxx.supabase.co`
   - **anon public** — uma chave longa começando com `eyJ...`

## 3. Configurar o app

1. Na pasta do projeto (`servicos-app`), copie o arquivo `.env.example`
   e renomeie a cópia para `.env` (sem o ".example")
2. Abra o `.env` e cole os valores:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...sua-chave-aqui
```

3. Salve o arquivo

## 4. Habilitar autenticação por e-mail (necessário para cadastro de prestadores e avaliações)

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Providers"**
3. Confirme que **"Email"** está habilitado (geralmente já vem ativado)
4. Em **"Authentication" > "URL Configuration"**, adicione
   `http://localhost:5173` como Site URL (para testes locais)

> Por enquanto o app não tem tela de login/cadastro de usuário — isso é
> o próximo passo. Sem login, qualquer pessoa pode ver os prestadores
> (leitura pública), mas para **cadastrar um prestador** ou **publicar
> uma avaliação** será necessário estar autenticado.

## 5. Rodar o app

```
npm install
npm run dev
```

Acesse `http://localhost:5173` — agora a Home, a Busca e os Perfis
devem mostrar os dados que vieram do Supabase (os 4 prestadores de
exemplo do seed).

## Verificando se está tudo certo

- Se a Home aparece "Carregando..." e nunca termina → verifique se o
  `.env` está com as credenciais corretas e se você rodou `npm install`
  novamente depois de criar o `.env` (é necessário reiniciar o
  `npm run dev` depois de criar/editar o `.env`)
- Se aparecer erro no console do navegador (F12 > Console) mencionando
  "relation does not exist" → algum script SQL não rodou corretamente,
  volte ao passo 1
- Se aparecer "Supabase não configurado" no console → o `.env` não foi
  encontrado ou está com nome errado (não pode ser `.env.example`)

## Próximos passos sugeridos

1. **Login/cadastro de usuários** — tela de criar conta e entrar,
   necessária para prestadores se cadastrarem e clientes avaliarem
2. **Upload de fotos** — usar o Supabase Storage para os prestadores
   subirem fotos reais do trabalho
3. **Painel do prestador** — tela onde o prestador logado edita seu
   próprio perfil, vê mensagens e status da assinatura
4. **Pagamentos** — integração com Asaas para cobrar a mensalidade
