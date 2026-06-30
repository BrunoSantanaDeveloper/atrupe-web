// import { QuotationType } from './quotation'

import { QuotationType } from './quotation'

export type NfeType = {
  id: string
  numero: number
  serie: number
  status: string
  chaveAcesso?: string
  danfeUrl?: string
  dataEmissao?: string
}

export type OrderType = {
  id: string
  status: string
  quotation: QuotationType
  nfes?: NfeType[]
}

export type OrderListType = {
  date: string
  orders: OrderType[]
}

export type ListOrdersType = {
  data: OrderListType[]
  total: number
}

// Types for Order History
export type OrderHistoryAction =
  | 'CREATED'
  | 'CANCELED'
  | 'DUPLICATED'
  | 'EDITED'

export type OrderHistoryChanges = {
  before: Record<string, unknown>
  after: Record<string, unknown>
}

export type OrderHistoryMetadata = {
  [key: string]: unknown
}

export type OrderHistoryItem = {
  id: string
  action: OrderHistoryAction
  description: string
  changes: OrderHistoryChanges | null
  metadata: OrderHistoryMetadata | null
  createdBy: string
  createdByName: string
  createdAt: string
  user?: {
    id: string
    name: string
  }
}

export type OrderHistoryResponse = {
  total: number
  history: OrderHistoryItem[]
}
