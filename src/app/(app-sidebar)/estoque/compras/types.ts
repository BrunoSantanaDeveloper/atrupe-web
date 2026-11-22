// As compras e os lotes do FULL (ES-8 a ES-17; 22/11/2026). Valores em
// centavos; quantidades na unidade do material; medidas em metros.

export type TimelineEvent = { text: string; byName: string; at: string }

export type PurchaseRequestStatus =
  | 'REQUESTED'
  | 'QUOTING'
  | 'ORDERED'
  | 'RECEIVED'
  | 'CANCELED'

export type PurchaseQuote = {
  id: string
  supplierId: string | null
  supplierName: string
  quantity: number
  unitPrice: number
  total: number
  deliveryDays: number | null
  paymentTerms: string | null
  validUntil: string | null
  note: string | null
  chosen: boolean
  createdByName: string
}

export type PurchaseRequest = {
  id: string
  number: number
  materialId: string | null
  variationId: string | null
  description: string
  quantity: number
  unit: string
  neededBy: string | null
  note: string | null
  status: PurchaseRequestStatus
  requestedById: string | null
  requestedByName: string
  cancelReason: string | null
  createdAt: string
  quotes: PurchaseQuote[]
  events: TimelineEvent[]
}

export type PurchaseOrderStatus =
  | 'PENDING_DELIVERY'
  | 'CHECKING'
  | 'FINISHED'
  | 'CANCELED'

export type PurchaseOrderItem = {
  id: string
  requestId: string | null
  materialId: string | null
  variationId: string | null
  description: string
  unit: string
  quantity: number
  unitPrice: number
  total: number
  receivedQuantity: number | null
  divergence: string | null
}

export type PurchaseOrder = {
  id: string
  number: number
  supplierId: string | null
  supplierName: string
  status: PurchaseOrderStatus
  expectedAt: string | null
  deliveredAt: string | null
  checkedAt: string | null
  checkedByName: string | null
  invoiceId: string | null
  payableId: string | null
  total: number
  note: string | null
  cancelReason: string | null
  createdByName: string
  createdAt: string
  items: PurchaseOrderItem[]
  events: TimelineEvent[]
}

export type OrderInvoice = {
  id: string
  number: string
  issueDate: string | null
  total: number
  status: string
  items: {
    description: string
    quantity: number
    unit: string
    unitValue: number
    materialId: string | null
    variationId: string | null
    conversionFactor: number | null
  }[]
}

export type LotMeasure = 'ROLL' | 'SHEET' | 'UNIT'
export type LotStatus = 'CLOSED' | 'OPEN' | 'FINISHED' | 'CANCELED'

export type StockLot = {
  id: string
  number: number
  code: string
  materialId: string
  variationId: string | null
  material: string
  unit: string
  supplierName: string
  brand: string
  color: string
  measure: LotMeasure
  cost: number
  unitCost: number
  quantity: number
  width: number | null
  length: number | null
  currentQuantity: number
  currentWidth: number | null
  currentLength: number | null
  currentValue: number
  status: LotStatus
  openedAt: string | null
  finishedAt: string | null
  cancelReason: string | null
  orderId: string | null
  parentId: string | null
  createdByName: string
  createdAt: string
  events: {
    text: string
    quantity: number | null
    byName: string
    at: string
  }[]
}

export type LotPlan = {
  itemId: string
  measure: LotMeasure
  count: number
  width?: number | null
  length?: number | null
  brand?: string
  color?: string
}
