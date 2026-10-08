import { SVGProps } from 'react'

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

const sectors: {
  [key: string]: {
    text: string
    icon: (props: SVGProps<SVGSVGElement>) => JSX.Element
  }
} = {
  'device-desktop-analytics': {
    text: 'Administração',
    icon: IconAdministration,
  },
  shirt: {
    text: 'Confecção',
    icon: IconClothing,
  },
  cnc: {
    text: 'CNC',
    icon: IconCnc,
  },
  'heart-handshake': {
    text: 'Comercial',
    icon: IconCommercial,
  },
  bulb: {
    text: 'Criação',
    icon: IconCreation,
  },
  'package-export': {
    text: 'Entrega',
    icon: IconDelivery,
  },
  'user-up': {
    text: 'Retirada Cliente',
    icon: IconClientPickup,
  },
  printer: {
    text: 'Impressão Rápida',
    icon: IconFastPrinting,
  },
  slice: {
    text: 'Acabamento',
    icon: IconFinishing,
  },
  truck: {
    text: 'Frota',
    icon: IconFleet,
  },
  track: {
    text: 'Instalação',
    icon: IconInstallation,
  },
  hacksaw: {
    text: 'Marcenaria',
    icon: IconWoodwork,
  },
  metalwork: {
    text: 'Serralheria',
    icon: IconMetalwork,
  },
  'users-group': {
    text: 'Terceirizado',
    icon: IconOutsourced,
  },
  painting: {
    text: 'Pintura',
    icon: IconPainting,
  },
  print: {
    text: 'Impressão',
    icon: IconPrint,
  },
  'settings-cog': {
    text: 'Produção',
    icon: IconProduction,
  },
  'devices-2': {
    text: 'Patrimônio',
    icon: IconProperty,
  },
  'presentation-analytics': {
    text: 'Painel',
    icon: IconRental,
  },
  'screen-printing': {
    text: 'Serigrafia',
    icon: IconSerigraphy,
  },
  'clock-hour-8': {
    text: 'Controle',
    icon: IconTime,
  },
  wallpaper: {
    text: 'Estoque',
    icon: IconWarehouse,
  },
}

// Ordena os setores alfabeticamente
export const sectorIcons = Object.fromEntries(
  Object.entries(sectors).sort(([, a], [, b]) => a.text.localeCompare(b.text)),
)

// O ícone do setor pelo nome, para as caixas do fluxo da composição (FL-5):
// a mesma figura que o modal "Qual item deseja adicionar?" usa. Setores que o
// legado nomeia de outro jeito (Gráfica, Produção) caem no mais próximo
export const sectorIconByName = (name: string) => {
  const lower = name.trim().toLowerCase()
  const entries = Object.values(sectors)
  const exact = entries.find((item) => item.text.toLowerCase() === lower)
  if (exact) return exact.icon
  const starts = entries.find((item) =>
    lower.startsWith(item.text.toLowerCase()),
  )
  if (starts) return starts.icon
  if (lower.includes('gráfica') || lower.includes('grafica')) {
    return IconFastPrinting
  }
  if (lower.includes('acabamento')) return IconFinishing
  return IconProduction
}
