// Fonte única das categorias/cidades usadas nas páginas de SEO
// (SEOCategoria.jsx, SEOCidadeCategoria.jsx) e na geração do sitemap
// (scripts/gerar-sitemap.mjs). Antes esse mapa existia duplicado (e
// divergente) em cada página — mantendo aqui, os dois sempre cobrem
// exatamente o mesmo conjunto de categorias.
export const SEO_CATEGORIAS = {
  'eletricista': { nome: 'Eletricista', desc: 'Instalação elétrica, manutenção, quadro de luz, tomadas e interruptores' },
  'pedreiro': { nome: 'Pedreiro', desc: 'Alvenaria, construção civil, reformas e reparos em geral' },
  'encanador': { nome: 'Encanador', desc: 'Conserto de vazamentos, instalação hidráulica, desentupimento' },
  'pintor': { nome: 'Pintor', desc: 'Pintura residencial e comercial, textura, massa corrida' },
  'marceneiro': { nome: 'Marceneiro', desc: 'Móveis planejados, armários, marcenaria em geral' },
  'mecanico': { nome: 'Mecânico', desc: 'Manutenção preventiva e corretiva de veículos' },
  'jardineiro': { nome: 'Jardineiro', desc: 'Jardinagem, paisagismo, poda de árvores e grama' },
  'diarista': { nome: 'Diarista', desc: 'Limpeza residencial, faxina, organização doméstica' },
  'serralheiro': { nome: 'Serralheiro', desc: 'Grades, portões, serralheria, estruturas metálicas' },
  'vidraceiro': { nome: 'Vidraceiro', desc: 'Vidros temperados, espelhos, box de banheiro, janelas' },
  'arquiteto': { nome: 'Arquiteto', desc: 'Projetos arquitetônicos e interiores' },
  'azulejista': { nome: 'Azulejista', desc: 'Assentamento de pisos e azulejos' },
  'dedetizador': { nome: 'Dedetizador', desc: 'Controle de pragas e insetos' },
  'informatica': { nome: 'Técnico em Informática', desc: 'Manutenção de computadores e redes' },
}

export const SEO_CIDADES = ['Araraquara', 'São Carlos', 'Ribeirão Preto', 'Campinas', 'São Paulo', 'Bauru', 'Franca', 'Limeira']

export const SITE_URL = 'https://prestador-lyart.vercel.app'
