// Envio de fotos e vídeos pensado para quem tem pouca prática com celular e formatos de arquivo:
//  - a pessoa escolhe a foto do jeito que sair do aparelho (grande, de lado, em formato do iPhone...);
//  - o app confere, encolhe, endireita e converte sozinho, e só então envia;
//  - quando algo dá errado, explica em português simples o que fazer (nunca "erro 413").

export const LIMITE_VIDEO_MB = 50
export const MAX_LADO = 1600       // maior lado da foto depois de encolher (ótimo para tela, leve para internet móvel)
export const QUALIDADE_JPEG = 0.82
const FOTO_PEQUENA_DEMAIS_PARA_MEXER = 700 * 1024

const EXTENSOES_FOTO = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif', 'bmp', 'avif']
const EXT_POR_MIME_FOTO = { 'image/png': 'png', 'image/webp': 'webp' }
const EXTENSOES_VIDEO = ['mp4', 'mov', 'm4v', '3gp', 'webm', 'mkv']

// Erro que já vem com mensagem pronta para mostrar à pessoa.
export class ErroDeMidia extends Error {}

const extensaoDe = (nome = '') => (nome.includes('.') ? nome.split('.').pop().toLowerCase() : '')
const semExtensao = (nome = '') => (nome.includes('.') ? nome.slice(0, nome.lastIndexOf('.')) : nome)

// 'foto' | 'video' | null. Alguns Androids entregam arquivo sem tipo: nesse caso vale a extensão.
export function tipoDoArquivo(arquivo) {
  const mime = (arquivo?.type || '').toLowerCase()
  if (mime.startsWith('image/')) return 'foto'
  if (mime.startsWith('video/')) return 'video'
  const ext = extensaoDe(arquivo?.name)
  if (EXTENSOES_FOTO.includes(ext)) return 'foto'
  if (EXTENSOES_VIDEO.includes(ext)) return 'video'
  return null
}

// Devolve a mensagem para mostrar à pessoa, ou null se está tudo certo.
export function validarArquivo(arquivo, { permitirVideo = true } = {}) {
  const nome = arquivo?.name ? `"${arquivo.name}" ` : ''
  const tipo = tipoDoArquivo(arquivo)
  if (!arquivo || arquivo.size === 0) return `O arquivo ${nome}parece estar vazio. Escolha outra foto.`
  if (!tipo) return `O arquivo ${nome}não é uma foto nem um vídeo. Escolha uma foto da galeria ou tire uma foto na hora.`
  if (tipo === 'video' && !permitirVideo) return 'Aqui só dá para enviar fotos. Escolha uma foto da galeria ou tire uma foto na hora.'
  if (tipo === 'video' && arquivo.size > LIMITE_VIDEO_MB * 1024 * 1024) {
    const mb = Math.round(arquivo.size / 1024 / 1024)
    return `O vídeo ${nome}é muito grande (${mb} MB; o máximo é ${LIMITE_VIDEO_MB} MB). Grave um vídeo mais curto, de até 1 minuto, ou envie fotos.`
  }
  return null
}

// Tamanho final da foto: só diminui, nunca aumenta; mantém a proporção.
export function dimensoesAlvo(largura, altura, maxLado = MAX_LADO) {
  const maior = Math.max(largura, altura)
  if (!maior || maior <= maxLado) return { largura, altura, reduzir: false }
  const escala = maxLado / maior
  return { largura: Math.round(largura * escala), altura: Math.round(altura * escala), reduzir: true }
}

// Extensão segura para o nome do arquivo guardado (nunca confia no nome que veio do aparelho).
export function extensaoSegura(arquivo, tipo) {
  if (tipo === 'foto') return EXT_POR_MIME_FOTO[arquivo?.type] || 'jpg'
  const ext = extensaoDe(arquivo?.name).replace(/[^a-z0-9]/g, '')
  return EXTENSOES_VIDEO.includes(ext) ? ext : 'mp4'
}

// Traduz qualquer erro de envio para algo que uma pessoa sem prática entende.
export function mensagemAmigavel(erro) {
  if (erro instanceof ErroDeMidia) return erro.message
  const texto = `${erro?.message || ''} ${erro?.error || ''} ${erro?.statusCode || ''}`.toLowerCase()
  if (/failed to fetch|network|load failed|timeout|offline|abort/.test(texto)) {
    return 'Parece que a sua internet falhou durante o envio. Confira o Wi-Fi ou o sinal do celular e tente de novo.'
  }
  if (/maximum allowed size|too large|payload|413/.test(texto)) {
    return 'O arquivo é maior do que o permitido. Escolha uma foto menor ou um vídeo mais curto.'
  }
  if (/row-level security|jwt|not authorized|unauthorized|401|403|expired/.test(texto)) {
    return 'Sua sessão pode ter expirado. Saia do app, entre de novo e tente outra vez.'
  }
  return 'Não foi possível enviar agora. Espere um instante e tente de novo.'
}

// ---------- partes que dependem do navegador (testadas na prática, não em teste automático) ----------

function abrirComoImagem(arquivo) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('imagem ilegível')) }
    img.src = url
  })
}

async function abrirFoto(arquivo) {
  try { return await createImageBitmap(arquivo, { imageOrientation: 'from-image' }) } catch { /* tenta o jeito antigo */ }
  try { return await abrirComoImagem(arquivo) } catch {
    throw new ErroDeMidia('Não conseguimos abrir essa foto. Ela pode estar em um formato que o seu aparelho não lê (comum em fotos de iPhone antigas). Tire a foto de novo pela câmera, ou escolha outra.')
  }
}

// Valida e deixa o arquivo pronto para enviar: foto encolhida, endireitada e em JPEG; vídeo como veio.
export async function prepararArquivo(arquivo, opcoes = {}) {
  const problema = validarArquivo(arquivo, opcoes)
  if (problema) throw new ErroDeMidia(problema)
  const tipo = tipoDoArquivo(arquivo)
  if (tipo === 'video') return { arquivo, tipo }

  const fonte = await abrirFoto(arquivo)
  const largura = fonte.width || fonte.naturalWidth
  const altura = fonte.height || fonte.naturalHeight
  const alvo = dimensoesAlvo(largura, altura, opcoes.maxLado || MAX_LADO)
  const jaLeve = !alvo.reduzir && arquivo.size <= FOTO_PEQUENA_DEMAIS_PARA_MEXER && /^image\/(jpeg|png|webp)$/.test(arquivo.type)
  if (jaLeve) { fonte.close?.(); return { arquivo, tipo } }

  const canvas = document.createElement('canvas')
  canvas.width = alvo.largura
  canvas.height = alvo.altura
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff' // PNG com fundo transparente vira branco, não preto
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(fonte, 0, 0, canvas.width, canvas.height)
  fonte.close?.()

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', QUALIDADE_JPEG))
  if (!blob) throw new ErroDeMidia('Não conseguimos preparar essa foto. Tente tirar outra.')
  const pronto = new File([blob], `${semExtensao(arquivo.name) || 'foto'}.jpg`, { type: 'image/jpeg' })
  // Só mantém o original se ele já for de um formato que todo navegador abre (jpeg/png/webp).
  const originalServe = /^image\/(jpeg|png|webp)$/.test(arquivo.type)
  return { arquivo: originalServe && pronto.size >= arquivo.size ? arquivo : pronto, tipo }
}

// Envia para o armazenamento do Supabase. Tenta duas vezes se for só falha de internet.
export async function enviarParaStorage(supabase, bucket, caminhoSemExtensao, preparado, { upsert = false } = {}) {
  const ext = extensaoSegura(preparado.arquivo, preparado.tipo)
  const caminho = `${caminhoSemExtensao}.${ext}`
  const contentType = preparado.tipo === 'foto'
    ? (/^image\/(jpeg|png|webp)$/.test(preparado.arquivo.type) ? preparado.arquivo.type : 'image/jpeg')
    : (preparado.arquivo.type || undefined)

  let ultimoErro
  for (let tentativa = 0; tentativa < 2; tentativa++) {
    const { error } = await supabase.storage.from(bucket).upload(caminho, preparado.arquivo, { upsert, contentType })
    if (!error) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(caminho)
      return { url: data.publicUrl, tipo: preparado.tipo, caminho }
    }
    ultimoErro = error
    if (!/failed to fetch|network|load failed|timeout/i.test(error.message || '')) break
  }
  throw new ErroDeMidia(mensagemAmigavel(ultimoErro))
}
