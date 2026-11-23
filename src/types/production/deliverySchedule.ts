import { OrderType } from '@/types/sales/order'
import { TransactionListType } from '@/types/financial/financialFlow'

export type DeliveryScheduleType = {
  id: string
  deliveryInfoId: string
  isActive: boolean
  status: string
  completed: boolean
  notes: string
  scheduledDate: Date
  addScheduleTime: boolean
  // Venda com projeto no gerenciador (ELITE): as etapas espelham as
  // tarefas e não se editam na agenda (D20)
  managedByProduction?: boolean
  financial: {
    billed: boolean
    invoiceStatus: string
    data: TransactionListType
  }
  order: OrderType
  productionStages: {
    id: string
    stage: {
      id: string
      name: string
      icon: string
    }
    status: string
    prevStatus: string
    notes: string
  }[]
  // O segundo nível (área 9 §4.7): os itens da ordem com a medida e as
  // etapas de cada um: as tarefas, com projeto no gerenciador; senão, as
  // etapas por item da agenda (editable), que se trocam aqui. Pedidos
  // antigos vêm sem etapas por item
  items?: {
    id: string
    name: string
    quantity: number
    measure: string
    stages: {
      id: string
      name: string
      sectorId: string | null
      sector: string
      status: string
      notes?: string | null
      prevStatus?: string | null
      editable?: boolean
    }[]
  }[]
  createdAt: Date
  updatedAt: Date
}

export type ListDeliveryScheduleDataType = {
  date: string
  deliveries: DeliveryScheduleType[]
}

export type ListDeliveryScheduleType = {
  data: ListDeliveryScheduleDataType[]
  total: number
}
