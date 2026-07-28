// Mapa categoria -> ícone Lucide + cor de destaque.
// As categorias vêm do Supabase (tabela `categorias`) e não carregam
// referência de ícone, então este mapa faz a ponte visual.
import {
  Zap, Droplet, Paintbrush, Building2, Hammer, Sparkles, Trees, Car,
  Monitor, HeartPulse, Scissors, GraduationCap, PartyPopper, UtensilsCrossed,
  Truck, Shield, PawPrint, Scale, Palette, Shirt, Wrench, Camera, Sun,
  DoorOpen, Lightbulb, Flame, Waves, Wind,
} from 'lucide-react'

// Correspondências diretas por categoria_id (slugs usados em src/lib/dados.js
// e replicados nas tabelas do Supabase).
const ID_ICON_MAP = {
  pedreiro: { icon: Building2, bg: '#FFF7ED', color: '#EA580C' },
  mestre_obras: { icon: Building2, bg: '#FFF7ED', color: '#EA580C' },
  azulejista: { icon: Building2, bg: '#FFF7ED', color: '#EA580C' },
  gesseiro: { icon: Building2, bg: '#FFF7ED', color: '#EA580C' },
  carpinteiro: { icon: Hammer, bg: '#FEF3C7', color: '#B45309' },
  marceneiro: { icon: Hammer, bg: '#FEF3C7', color: '#B45309' },
  telhador: { icon: Building2, bg: '#FFF7ED', color: '#EA580C' },
  drywall: { icon: Building2, bg: '#FFF7ED', color: '#EA580C' },
  piscina: { icon: Waves, bg: '#EFF6FF', color: '#2563EB' },
  porcelanato: { icon: Building2, bg: '#FFF7ED', color: '#EA580C' },
  eletricista: { icon: Zap, bg: '#FFFBEB', color: '#D97706' },
  ar_condicionado: { icon: Wind, bg: '#EFF6FF', color: '#2563EB' },
  automacao: { icon: Lightbulb, bg: '#FFFBEB', color: '#D97706' },
  cameras: { icon: Camera, bg: '#F1F5F9', color: '#475569' },
  painel_solar: { icon: Sun, bg: '#FFFBEB', color: '#D97706' },
  portao_eletrico: { icon: DoorOpen, bg: '#FFFBEB', color: '#D97706' },
  iluminacao: { icon: Lightbulb, bg: '#FFFBEB', color: '#D97706' },
  quadro_eletrico: { icon: Zap, bg: '#FFFBEB', color: '#D97706' },
  encanador: { icon: Droplet, bg: '#EFF6FF', color: '#2563EB' },
  desentupidor: { icon: Droplet, bg: '#EFF6FF', color: '#2563EB' },
  vazamento: { icon: Droplet, bg: '#EFF6FF', color: '#2563EB' },
  aquecedor: { icon: Flame, bg: '#FEF2F2', color: '#DC2626' },
  gas: { icon: Flame, bg: '#FEF2F2', color: '#DC2626' },
  pintor: { icon: Paintbrush, bg: '#FDF4FF', color: '#9333EA' },
  diarista: { icon: Sparkles, bg: '#F0F9FF', color: '#0284C7' },
  faxineira: { icon: Sparkles, bg: '#F0F9FF', color: '#0284C7' },
  jardineiro: { icon: Trees, bg: '#F0FDF4', color: '#15803D' },
  mecanico: { icon: Car, bg: '#FEF2F2', color: '#DC2626' },
  cabeleireiro: { icon: Scissors, bg: '#FFF0F6', color: '#DB2777' },
  manicure: { icon: Scissors, bg: '#FFF0F6', color: '#DB2777' },
  professor: { icon: GraduationCap, bg: '#EEF2FF', color: '#4338CA' },
  dj: { icon: PartyPopper, bg: '#FDF4FF', color: '#9333EA' },
  fotografo: { icon: Camera, bg: '#F1F5F9', color: '#475569' },
  cozinheiro: { icon: UtensilsCrossed, bg: '#FFF7ED', color: '#C2410C' },
  motorista: { icon: Truck, bg: '#F1F5F9', color: '#475569' },
  advogado: { icon: Scale, bg: '#EEF2FF', color: '#4338CA' },
  designer: { icon: Palette, bg: '#FDF4FF', color: '#9333EA' },
  costureira: { icon: Shirt, bg: '#FFF0F6', color: '#DB2777' },
}

// Fallback por palavra-chave no nome/tópico, para cobrir categorias que
// ainda não têm entrada direta no mapa acima.
const KEYWORD_ICON_MAP = [
  [/el[eé]tric/i, { icon: Zap, bg: '#FFFBEB', color: '#D97706' }],
  [/hidr[aá]ulic|encanad|vazamento|[aá]gua/i, { icon: Droplet, bg: '#EFF6FF', color: '#2563EB' }],
  [/pint/i, { icon: Paintbrush, bg: '#FDF4FF', color: '#9333EA' }],
  [/constru|reform|obra|pedreiro|alvenaria/i, { icon: Building2, bg: '#FFF7ED', color: '#EA580C' }],
  [/marcen|madeira|carpint|m[oó]vel/i, { icon: Hammer, bg: '#FEF3C7', color: '#B45309' }],
  [/limpez|faxina|diarist/i, { icon: Sparkles, bg: '#F0F9FF', color: '#0284C7' }],
  [/jardim|paisag/i, { icon: Trees, bg: '#F0FDF4', color: '#15803D' }],
  [/automotiv|mec[aâ]nic|carro|ve[ií]culo/i, { icon: Car, bg: '#FEF2F2', color: '#DC2626' }],
  [/tecnologia|inform[aá]tic|computador|ti\b/i, { icon: Monitor, bg: '#EEF2FF', color: '#4338CA' }],
  [/sa[uú]de|terapia|massagem|fisio/i, { icon: HeartPulse, bg: '#FEF2F2', color: '#DC2626' }],
  [/beleza|cabelo|est[eé]tic|unha|manicure/i, { icon: Scissors, bg: '#FFF0F6', color: '#DB2777' }],
  [/educa[cç][aã]o|aula|professor|curso/i, { icon: GraduationCap, bg: '#EEF2FF', color: '#4338CA' }],
  [/evento|festa|\bdj\b|anima[cç][aã]o/i, { icon: PartyPopper, bg: '#FDF4FF', color: '#9333EA' }],
  [/alimenta[cç][aã]o|culin[aá]ri|cozinh|chef|confeit/i, { icon: UtensilsCrossed, bg: '#FFF7ED', color: '#C2410C' }],
  [/transporte|mudan[cç]a|entrega|motorista|frete/i, { icon: Truck, bg: '#F1F5F9', color: '#475569' }],
  [/seguran[cç]a|alarme|c[aâ]mera/i, { icon: Shield, bg: '#F1F5F9', color: '#475569' }],
  [/animal|pet\b/i, { icon: PawPrint, bg: '#F0FDF4', color: '#15803D' }],
  [/jur[ií]dic|advogad|contador|financeiro/i, { icon: Scale, bg: '#EEF2FF', color: '#4338CA' }],
  [/design|gr[aá]fico|cria[cç][aã]o/i, { icon: Palette, bg: '#FDF4FF', color: '#9333EA' }],
  [/moda|costur|roupa/i, { icon: Shirt, bg: '#FFF0F6', color: '#DB2777' }],
  [/fot[oó]graf/i, { icon: Camera, bg: '#F1F5F9', color: '#475569' }],
]

export const CATEGORIA_FALLBACK = { icon: Wrench, bg: '#F3F6F2', color: '#6B7280' }

/**
 * Aceita um id (string) ou um objeto de categoria { id, nome } e retorna
 * { icon, bg, color } — sempre com um fallback seguro.
 */
export function getCategoriaIcone(categoria) {
  const id = typeof categoria === 'string' ? categoria : categoria?.id
  const nome = typeof categoria === 'string' ? categoria : categoria?.nome

  if (id && ID_ICON_MAP[id]) return ID_ICON_MAP[id]

  if (nome) {
    const match = KEYWORD_ICON_MAP.find(([regex]) => regex.test(nome))
    if (match) return match[1]
  }

  return CATEGORIA_FALLBACK
}
