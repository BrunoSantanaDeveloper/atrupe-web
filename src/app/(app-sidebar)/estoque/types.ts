// Estoque e entrada de nota (documentação funcional §13, recurso do FULL).
// Fluxo: Solicitação → Cotação → Compra → NF → Conferência → Estoque.
// Valores em centavos; quantidades na unidade do material.

export type StockItem = {
  id: string
  materialId: string
  name: string
  variation: string | null
  unit: string
  quantity: number
  // A reserva das vendas aprovadas em andamento (item 23, FULL): o
  // disponível é o saldo menos o reservado
  reserved?: number
  available?: number
  minimum: number
  averageCost: number
  lastEntryCost: number | null
  lastEntryDate: string | null
}

export type StockMovementKind = 'ENTRY' | 'CONSUMPTION' | 'ADJUSTMENT'

export type StockMovement = {
  id: string
  date: string
  kind: StockMovementKind
  name: string
  quantity: number
  unit: string
  origin: string
}

// Item da nota como o fornecedor mandou, antes da conciliação (§13)
export type InvoiceItem = {
  id: string
  supplierCode: string
  description: string
  supplierUnit: string
  quantity: number
  unitValue: number
  gtin: string | null
  // Material interno já vinculado, quando o de-para existe
  materialId: string | null
  materialName: string | null
  conversionFactor: number | null
}

export type Invoice = {
  id: string
  number: string
  supplier: string
  issueDate: string
  total: number
  status: 'PENDING' | 'MATCHED' | 'ENTERED'
  items: InvoiceItem[]
}
