// O assistente de IA (área 11; seção 9 do documento de 28/10/2026): o chat,
// o acesso pelo plano e pela cota, e as propostas que a IA faz e a pessoa
// confirma (Aplicar) ou descarta. Valores em centavos.

export type AiToolCallStatus = 'success' | 'denied' | 'error'

export type AiMessageRole = 'user' | 'assistant' | 'tool' | 'system'

export interface AiConversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface AiMessage {
  id: string
  role: AiMessageRole
  content: string
  // A ferramenta que propôs algo traz o id da proposta, para o cartão
  toolCalls?:
    | { name: string; status: AiToolCallStatus; actionId?: string }[]
    | null
  metadata?: Record<string, unknown> | null
  createdAt: string
}

// A cota do mês da empresa: `limit` nulo = sem limite
export interface AiQuota {
  used: number
  limit: number | null
  renewsAt: string
}

export type AiAccessReason = 'SYSTEM_OFF' | 'NOT_IN_PLAN' | 'QUOTA_EXCEEDED'

export interface AiAccessStatus {
  enabled: boolean
  reason?: AiAccessReason
  quota: AiQuota | null
}

export type AiActionType =
  | 'QUOTATION_DRAFT'
  | 'QUICK_SALE_DRAFT'
  | 'ITEM_DESCRIPTION'
  | 'FINANCIAL_CATEGORY'
  | 'NEXT_CONTACT'

export type AiActionStatus =
  | 'PROPOSED'
  | 'APPLYING'
  | 'APPLIED'
  | 'DISCARDED'
  | 'EXPIRED'
  | 'FAILED'

// O que a resposta do chat traz de cada proposta
export interface AiActionSummary {
  id: string
  type: AiActionType
  summary: string
}

export interface AiChatResponse {
  conversationId: string
  message: string
  sources?: string[]
  toolCalls?: { name: string; status: AiToolCallStatus }[]
  actions?: AiActionSummary[]
}

// --- As propostas -----------------------------------------------------------

export type DraftItemStatus =
  | 'OK'
  | 'NEEDS_CHOICE'
  | 'NEEDS_MEASURE'
  | 'BASE_PRODUCT'

export interface DraftCandidate {
  id: string
  name: string
  code: string | null
  unit: string
}

export interface DraftItem {
  // O trecho original do pedido
  text: string
  status: DraftItemStatus
  productId?: string
  productName?: string
  // A unidade comercial: un, m2, m, kg, l, h, km
  unit?: string
  quantity: number
  // Largura e altura em metros (produto em m²)
  width?: number
  height?: number
  // A medida nas outras unidades (m, kg, l, km, h), por unidade
  measure?: number
  variationId?: string
  variationName?: string
  description?: string
  technicalDescription?: string
  // Centavos; fora quando a pessoa não vê valores
  unitPrice?: number
  total?: number
  rules?: string[]
  // O que falta para aplicar
  missing?: string
  candidates?: DraftCandidate[]
  variations?: { id: string; name: string }[]
}

export interface QuotationDraftPayload {
  client: {
    id: string | null
    name: string | null
    match: 'EXACT' | 'NEEDS_CHOICE' | 'NONE'
    candidates?: { id: string; name: string }[]
  }
  deliveryDate: string | null
  notes: string | null
  target: 'NEW' | 'CURRENT'
  quotationId: string | null
  quickSale: boolean
  items: DraftItem[]
  total?: number
  warnings: string[]
}

// O que a pessoa mudou no cartão antes de aplicar
export interface QuotationDraftEdits {
  clientId?: string | null
  deliveryDate?: string | null
  items?: {
    index: number
    removed?: boolean
    productId?: string
    variationId?: string
    quantity?: number
    width?: number
    height?: number
    measure?: number
  }[]
}

export interface ItemDescriptionPayload {
  target: 'QUOTATION_ITEM' | 'PRODUCT'
  id: string
  quotationId: string | null
  name: string
  current: string | null
  proposed: string
}

export interface FinancialCategoryPayload {
  description: string
  payableId: string | null
  suggestion: {
    natureId: string
    natureName: string | null
    subCategoryId: string | null
    subCategoryName: string | null
    supplierId: string | null
    supplierName: string | null
  } | null
  confidence: 'HIGH' | 'LOW'
  basis: { similar: number; examples: string[] }
  warnings: string[]
}

export interface NextContactPayload {
  quotationId: string
  quotationNumber: number | null
  clientName: string | null
  nextContactAt: string
  note: string | null
  current: { nextContactAt: string | null; note: string | null }
}

export type AiActionPayload =
  | QuotationDraftPayload
  | ItemDescriptionPayload
  | FinancialCategoryPayload
  | NextContactPayload

export interface AiAction {
  id: string
  type: AiActionType
  status: AiActionStatus
  payload: AiActionPayload
  // O resultado de aplicar (os ids criados) ou o erro da falha
  result: Record<string, unknown> | null
  expiresAt: string
  appliedAt: string | null
  createdAt: string
}
