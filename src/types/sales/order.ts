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
  ambiente: number
}

export type NfceType = {
  id: string
  numero: number
  serie: number
  status: string
  chaveAcesso?: string
  danfeUrl?: string
  dataEmissao?: string
  qrCodeUrl?: string
  xmlAutorizado?: string
  motivoRejeicao?: string
  ambiente: number
}

export type NfseType = {
  id: string
  numero: number
  serie: string
  rpsNumero?: number
  rpsSerie?: string
  status: string
  codigoVerificacao?: string
  pdfUrl?: string
  dataEmissao?: string
  xmlRetorno?: string
  motivoRejeicao?: string
  ambiente: number
}

export type OrderType = {
  id: string
  status: string
  // Motivo do cancelamento, quando a venda foi cancelada com um (CRM fase 1)
  cancelReason?: { id: string; reason: string } | null
  quotation: QuotationType
  nfes?: NfeType[]
  nfces?: NfceType[]
  nfses?: NfseType[]
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
