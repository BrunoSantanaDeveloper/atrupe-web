import type { ComponentType } from 'react'

import { BadgeProps } from '@/components/ui/badge'

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

// Third-party
import { v4 as uuidv4 } from 'uuid'

type ProductionStagesType = {
  [key: string]: {
    icon: ComponentType<PictogramaProps>
    name: string
  }
}

export const productionStagesOld: ProductionStagesType = {
  administration: {
    icon: IconAdministration,
    name: 'Administração',
  },
  clothing: {
    icon: IconClothing,
    name: 'Confecção',
  },
  cnc: {
    icon: IconCnc,
    name: 'CNC',
  },
  comercial: {
    icon: IconCommercial,
    name: 'Comercial',
  },
  creation: {
    icon: IconCreation,
    name: 'Criação',
  },
  delivery: {
    icon: IconDelivery,
    name: 'Entrega',
  },
  clientPickup: {
    icon: IconClientPickup,
    name: 'Retirada',
  },
  fastPrinting: {
    icon: IconFastPrinting,
    name: 'Gráfica rápida',
  },
  finishing: {
    icon: IconFinishing,
    name: 'Acabamento',
  },
  fleet: {
    icon: IconFleet,
    name: 'Frota',
  },
  installation: {
    icon: IconInstallation,
    name: 'Instalação',
  },
  woodwork: {
    icon: IconWoodwork,
    name: 'Marcenaria',
  },
  metalwork: {
    icon: IconMetalwork,
    name: 'Serralheria',
  },
  outsourced: {
    icon: IconOutsourced,
    name: 'Terceirizados',
  },
  painting: {
    icon: IconPainting,
    name: 'Pintura',
  },
  print: {
    icon: IconPrint,
    name: 'Impressão',
  },
  production: {
    icon: IconProduction,
    name: 'Produção',
  },
  property: {
    icon: IconProperty,
    name: 'Patrimônio',
  },
  rental: {
    icon: IconRental,
    name: 'Locação',
  },
  serigraphy: {
    icon: IconSerigraphy,
    name: 'Serigrafia',
  },
  time: {
    icon: IconTime,
    name: 'Tempo',
  },
  warehouse: {
    icon: IconWarehouse,
    name: 'Almoxarifado',
  },
}

type stageStatusType = {
  [key: string]: {
    tooltip: string
    badge?: BadgeProps['variant']
  }
}

export const stageStatus: stageStatusType = {
  NOT_STARTED: { tooltip: 'não iniciado' },
  IN_PROGRESS: { tooltip: 'em andamento', badge: 'blueLight' },
  PAUSED: { tooltip: 'pausado', badge: 'pinkLight' },
  PENDING: { tooltip: 'com pendência', badge: 'warningLight' },
  DONE: { tooltip: 'finalizado', badge: 'successLight' },
  // Cancelado tem cor própria (Maicol, 23/11/2026)
  CANCELED: { tooltip: 'cancelado', badge: 'errorLight' },
  WAITING_PRODUCTION: { tooltip: 'aguardando produção', badge: 'warningLight' },
  OVERDUE: { tooltip: 'atrasada', badge: 'errorLight' },
}

export const stageStatusChange = [
  {
    id: uuidv4(),
    text: 'Iniciar',
    color: 'blue',
    newStatus: 'IN_PROGRESS',
    statusToShow: ['NOT_STARTED'],
  },
  {
    id: uuidv4(),
    text: 'Adicionar pendência',
    color: 'warning',
    newStatus: 'PENDING',
    statusToShow: ['NOT_STARTED', 'IN_PROGRESS', 'PAUSED'],
  },
  {
    id: uuidv4(),
    text: 'Ver pendência',
    color: 'warning',
    newStatus: 'PENDING',
    statusToShow: ['PENDING'],
  },
  {
    id: uuidv4(),
    text: 'Cancelar',
    color: 'error',
    newStatus: 'CANCELED',
    statusToShow: ['NOT_STARTED', 'IN_PROGRESS', 'PENDING', 'PAUSED'],
  },
  {
    id: uuidv4(),
    text: 'Finalizar',
    color: 'success',
    newStatus: 'DONE',
    statusToShow: ['NOT_STARTED', 'IN_PROGRESS', 'PAUSED'],
  },
  {
    id: uuidv4(),
    text: 'Pausar',
    color: 'pink',
    newStatus: 'PAUSED',
    statusToShow: ['IN_PROGRESS'],
  },
  {
    id: uuidv4(),
    text: 'Continuar',
    color: 'blue',
    newStatus: 'IN_PROGRESS',
    statusToShow: ['PAUSED'],
  },
  {
    id: uuidv4(),
    text: 'Reiniciar',
    color: 'white',
    newStatus: 'NOT_STARTED',
    statusToShow: ['DONE', 'CANCELED'],
  },
]

export const invoiceStatus: stageStatusType = {
  WAITING: { tooltip: 'Aguardando faturamento' },
  NFE_NOT_ISSUED: { tooltip: 'NF-e não emitida' },
  NFSE_NOT_ISSUED: { tooltip: 'NFS-e não emitida' },
  NFE_ISSUED: { tooltip: 'NF-e emitida', badge: 'successLight' },
  NFSE_ISSUED: { tooltip: 'NFS-e emitida', badge: 'successLight' },
}

export const deliveryType: { [key: string]: string } = {
  CARRIER: 'Transportadora',
  PICKUP: 'Cliente retira',
  INSTALLATION: 'Entrega na instalação',
}
