import type { ComponentType } from 'react'

import {
  IconCnc,
  IconTime,
  IconFleet,
  IconPrint,
  IconRental,
  IconCreation,
  IconDelivery,
  IconPainting,
  IconProperty,
  IconClothing,
  IconWoodwork,
  IconCommercial,
  IconFinishing,
  IconMetalwork,
  IconWarehouse,
  IconOutsourced,
  IconProduction,
  IconSerigraphy,
  IconFastPrinting,
  IconInstallation,
  IconClientPickup,
  IconAdministration,
} from '@/assets/icons/pictogramas'
import type { PictogramaProps } from '@/assets/icons/pictogramas'

// Cada setor tem uma cor (regra de 05/10/2026, área 9 §4.14): um padrão
// inicial por setor conhecido, legível sobre fundo branco, que o cadastro de
// setores pode trocar. A cor acompanha o setor em todo lugar: gerenciador,
// ficha de produção, Agenda de entrega, composição e lista de processos. O
// tipo de tarefa não tem cor própria: usa a do setor
const sectors: {
  [key: string]: {
    text: string
    icon: ComponentType<PictogramaProps>
    color: string
  }
} = {
  'device-desktop-analytics': {
    text: 'Administração',
    icon: IconAdministration,
    color: '#6B7280',
  },
  shirt: {
    text: 'Confecção',
    icon: IconClothing,
    color: '#BE185D',
  },
  cnc: {
    text: 'CNC',
    icon: IconCnc,
    color: '#4F46E5',
  },
  'heart-handshake': {
    text: 'Comercial',
    icon: IconCommercial,
    color: '#0369A1',
  },
  bulb: {
    text: 'Criação',
    icon: IconCreation,
    color: '#7C3AED',
  },
  'package-export': {
    text: 'Entrega',
    icon: IconDelivery,
    color: '#EA580C',
  },
  'user-up': {
    text: 'Retirada Cliente',
    icon: IconClientPickup,
    color: '#65A30D',
  },
  printer: {
    text: 'Impressão Rápida',
    icon: IconFastPrinting,
    color: '#0891B2',
  },
  slice: {
    text: 'Acabamento',
    icon: IconFinishing,
    color: '#D97706',
  },
  truck: {
    text: 'Frota',
    icon: IconFleet,
    color: '#0D9488',
  },
  track: {
    text: 'Instalação',
    icon: IconInstallation,
    color: '#DC2626',
  },
  hacksaw: {
    text: 'Marcenaria',
    icon: IconWoodwork,
    color: '#92400E',
  },
  metalwork: {
    text: 'Serralheria',
    icon: IconMetalwork,
    color: '#475569',
  },
  'users-group': {
    text: 'Terceirizado',
    icon: IconOutsourced,
    color: '#B45309',
  },
  painting: {
    text: 'Pintura',
    icon: IconPainting,
    color: '#DB2777',
  },
  print: {
    text: 'Impressão',
    icon: IconPrint,
    color: '#2563EB',
  },
  'settings-cog': {
    text: 'Produção',
    icon: IconProduction,
    color: '#059669',
  },
  'devices-2': {
    text: 'Patrimônio',
    icon: IconProperty,
    color: '#78716C',
  },
  'presentation-analytics': {
    text: 'Painel',
    icon: IconRental,
    color: '#1D4ED8',
  },
  'screen-printing': {
    text: 'Serigrafia',
    icon: IconSerigraphy,
    color: '#9333EA',
  },
  'clock-hour-8': {
    text: 'Controle',
    icon: IconTime,
    color: '#0F766E',
  },
  wallpaper: {
    text: 'Estoque',
    icon: IconWarehouse,
    color: '#A16207',
  },
}

// A paleta oferecida no cadastro de setores: as cores padrão, sem repetição,
// mais algumas neutras. Todas legíveis sobre branco
export const SECTOR_PALETTE = Array.from(
  new Set([
    ...Object.values(sectors).map((item) => item.color),
    '#0E7490',
    '#15803D',
    '#4B5563',
  ]),
)

// Cor de reserva para setor desconhecido
export const SECTOR_FALLBACK_COLOR = '#4B5563'

// Ordena os setores alfabeticamente
export const sectorIcons = Object.fromEntries(
  Object.entries(sectors).sort(([, a], [, b]) => a.text.localeCompare(b.text)),
)

// O setor conhecido pelo nome, para quem só tem o nome (a composição, o
// processo, a tarefa). Setores que o legado nomeia de outro jeito (Gráfica,
// Produção) caem no mais próximo
const sectorByName = (name: string) => {
  const lower = name.trim().toLowerCase()
  const entries = Object.values(sectors)
  const exact = entries.find((item) => item.text.toLowerCase() === lower)
  if (exact) return exact
  const starts = entries.find((item) =>
    lower.startsWith(item.text.toLowerCase()),
  )
  if (starts) return starts
  if (lower.includes('gráfica') || lower.includes('grafica')) {
    return sectors.printer
  }
  if (lower.includes('acabamento')) return sectors.slice
  return null
}

// O ícone do setor pelo nome, para as caixas do fluxo da composição (FL-5):
// a mesma figura que o modal "Qual item deseja adicionar?" usa
export const sectorIconByName = (name: string) =>
  sectorByName(name)?.icon || IconProduction

// A cor padrão do setor, pelo ícone (cadastro) ou pelo nome (composição)
export const sectorDefaultColor = (sector: {
  icon?: string | null
  name?: string | null
}) => {
  if (sector.icon && sectors[sector.icon]) return sectors[sector.icon].color
  if (sector.name)
    return sectorByName(sector.name)?.color || SECTOR_FALLBACK_COLOR
  return SECTOR_FALLBACK_COLOR
}
