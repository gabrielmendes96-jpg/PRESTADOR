// Ponte pros recursos nativos do app empacotado (Capacitor) — no navegador
// normal (web), isNative() retorna false e nada aqui é chamado. Fica tudo
// num arquivo só porque só é usado dentro do wrapper nativo (Android/iOS);
// no build web puro, o import dinâmico do plugin nunca roda.
import { Capacitor } from '@capacitor/core'

export const isNative = () => Capacitor.isNativePlatform()

// Abre a câmera nativa (ou a galeria, o sistema deixa escolher) e devolve
// um File pronto pra usar no mesmo fluxo de upload que já existe pra
// arquivos escolhidos por <input type="file">.
export async function tirarFotoNativa() {
  const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')
  const foto = await Camera.getPhoto({
    quality: 80,
    resultType: CameraResultType.Uri,
    source: CameraSource.Prompt,
  })
  const resposta = await fetch(foto.webPath)
  const blob = await resposta.blob()
  const ext = foto.format || 'jpeg'
  return new File([blob], `foto-${Date.now()}.${ext}`, { type: `image/${ext}` })
}
