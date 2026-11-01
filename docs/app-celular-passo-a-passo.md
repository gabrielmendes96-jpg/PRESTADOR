# App de celular (Android e iPhone): passo a passo

O app de celular é o **mesmo código do site**, embrulhado em um "aplicativo" (tecnologia Capacitor).
O pacote já está pronto nas pastas `android/` e `ios/` e foi **sincronizado com a versão atual do site** em 1º/11/2026.

> Sempre que o site mudar e você quiser que o app de celular mude junto, rode antes de abrir o Android Studio ou o Xcode:
> `npm run mobile:sync`

## O que ainda falta antes de publicar (importante)

| Pendência | Por que importa | Quem resolve |
|---|---|---|
| **Notificações push** | Falta o arquivo `google-services.json` (Android) e a chave APNs (iPhone). Sem eles o app abre, mas **não recebe avisos de mensagem e pedido**. | Você cria o projeto no Firebase (grátis) e me passa os arquivos; eu ligo no app. |
| **Login com Google no iPhone** | A Apple **exige "Entrar com Apple"** em qualquer app que ofereça login social (Google, Facebook). Sem isso, ela recusa o app. | Decidir: adicionar "Entrar com Apple" ou tirar o login com Google do app do iPhone. Eu implemento o que você escolher. |
| **Cobrança dos planos dentro do app** | Lojas (Apple e Google) **exigem o pagamento delas** (e ficam com 15% a 30%) para vender *assinaturas de recursos digitais dentro do app*. Os **planos dos profissionais** (Básico, Profissional, Premium) caem nessa regra. O pagamento de **serviços reais** entre cliente e prestador (ex.: um eletricista) é permitido fora da loja. | Decisão de negócio, melhor conversada com seu advogado: (a) vender os planos só pelo site e o app só *usa* o plano; ou (b) usar a cobrança da loja. Hoje o app abre o pagamento do Asaas, e isso pode ser **recusado na revisão**. |
| **Ícone e tela de abertura** | Confira se o ícone do app é o seu e não o padrão do Capacitor. | Você me manda o logo em 1024×1024 px (fundo sólido); eu gero todos os tamanhos. |

## Contas e custos

| Loja | Custo | Prazo | Observação |
|---|---|---|---|
| **Google Play** | US$ 25, uma vez | revisão em poucos dias | Conta de **pessoa física** nova costuma exigir um **teste fechado com 12 pessoas por 14 dias seguidos** antes de liberar para o público (regra que valia na última conferência; confirme no Play Console). Conta de **empresa** (precisa de CNPJ e número D-U-N-S) não tem essa exigência. |
| **Apple App Store** | US$ 99 por ano | revisão de 1 a 3 dias, com recusas comuns na primeira vez | Exige um **Mac com Xcode**. |

Nomes que já estão no pacote: **Prestador**, identificador `com.prestador.app`, versão `1.0` (código 1).
O identificador **não pode mudar depois de publicar**, então confirme que esse é o definitivo.

## Android: gerar o app

1. Instale o **Android Studio** (grátis).
2. Na pasta do projeto: `npm run mobile:android` (sincroniza e abre o Android Studio).
3. Espere o "Gradle sync" terminar. Conecte um celular com depuração USB ou crie um emulador e clique em **Run** para ver o app funcionando.
4. Para publicar: menu **Build → Generate Signed Bundle / APK → Android App Bundle**.
5. Na primeira vez ele pede para **criar uma chave de assinatura** (keystore). **Guarde esse arquivo e a senha em um lugar seguro, com cópia**: sem ele você nunca mais consegue atualizar o app na loja.
6. Envie o arquivo `.aab` gerado no **Google Play Console** → seu app → Produção (ou Teste fechado).

## iPhone: gerar o app (precisa de Mac)

1. Instale o **Xcode** pela App Store do Mac.
2. `npm run mobile:ios` abre o projeto.
3. Em **Signing & Capabilities**, escolha o seu **Team** (conta Apple Developer) e ative **Push Notifications**.
4. Conecte um iPhone e clique em **Run** para testar.
5. Para publicar: **Product → Archive → Distribute App → App Store Connect**. Depois, no site App Store Connect, use o **TestFlight** para testar com pessoas antes de enviar para revisão.

## O que as lojas pedem para enviar (tenha pronto)

- **Política de privacidade** em uma página pública (o app já tem `/termos`; vale publicar a versão revisada pelo advogado).
- **Descrição, capturas de tela e ícone** (posso gerar as capturas com o app real).
- **Formulário de dados coletados** (o que o app guarda: nome, e-mail, telefone, localização, fotos, chave PIX). Eu preencho a lista completa para você copiar.
- **Conta de teste para o revisor**: um e-mail e senha de uma conta fictícia, para a equipe da loja conseguir entrar.
- **Exclusão de conta dentro do app**: já existe (as duas lojas exigem).

## Teste antes de enviar (lista de 10 minutos)

Cadastro e login · buscar "rádio" · abrir um profissional · **Pedir orçamento e preencher a ficha** · enviar mensagem · receber notificação push (depois de ligar o Firebase) · editar o perfil do profissional · tirar e enviar uma foto · sair e entrar de novo.
