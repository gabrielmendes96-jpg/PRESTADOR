import { lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'

// Escolhe o visual da página inicial.
//  - Para voltar ao visual anterior para todo mundo: troque VISUAL_PADRAO para 'antigo' (uma linha).
//  - Para comparar sem mudar nada: abra a página com ?visual=antigo ou ?visual=novo.
// O visual anterior também está guardado no Git na marca "visual-anterior-home".
const VISUAL_PADRAO = 'antigo'

const HomeNova = lazy(() => import('./HomeNova'))
const HomeAntiga = lazy(() => import('./Home'))

export default function HomeEscolha() {
  const [params] = useSearchParams()
  const visual = params.get('visual') === 'antigo' || params.get('visual') === 'novo' ? params.get('visual') : VISUAL_PADRAO
  return (
    <Suspense fallback={null}>
      {visual === 'antigo' ? <HomeAntiga /> : <HomeNova />}
    </Suspense>
  )
}
