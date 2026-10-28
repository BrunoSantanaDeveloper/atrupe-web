// import { PaymentConditionsType } from '../settings/paymentCondition'
import type { ItemComposition } from '@/app/(app-sidebar)/vendas/orcamentos/[quotationId]/composicao/types'

// A linha acrescentada como o detalhe do orçamento devolve: medida em mm,
// sem custo nem retrato (ORC-7)
export type QuotationItemLineView = {
  id: string
  kind: 'PROCESS' | 'PART' | 'LOOSE'
  name: string
  sector: string
  tags: string[]
  price?: number
  followsBase: boolean | null
  measure: { quantity: number; width: number; height: number } | null
  processId: string | null
  productId: string | null
}

export type QuotationItemType = {
  id: string
  description: string
  notes: string
  discountType: string
  discount: number
  // Acréscimo em centavos, fora do desconto (ALT-25)
  addition?: number
  // Preço base do cadastro na medida e na quantidade do item, em centavos;
  // nulo sem referência (preço R$ 0,00). Mede o limite de desconto (ALT-8)
  basePrice?: number | null
  origin?: 'PRODUCT' | 'COMPOSED' | 'MATERIAL' | 'OUTSOURCED'
  // O item montado na hora (ORC-11): o rascunho, a medida em mm e as
  // etapas; sem etapa, "Exige atenção" (MS-12)
  draft?: {
    id: string
    width: number | null
    height: number | null
    stages: number
  } | null
  attention?: boolean
  // O material de venda direta (ORG-1); nulo nos outros itens. O preço por
  // unidade só vem com a permissão de valores
  material?: {
    id: string
    name: string | null
    unit: string | null
    sector: string | null
    variationId: string | null
    variation: string | null
    unitPrice?: number | null
  } | null
  variation?: { id: string; name: string } | null
  // As escolhas da composição e o resumo; o retrato com custo fica no
  // servidor (ORC-7)
  composition?: ItemComposition | null
  // As linhas acrescentadas dentro do item (ORC-5) e a soma delas, que já
  // está no valor final; o preço só vem com a permissão de valores
  linesTotal?: number
  lines?: QuotationItemLineView[]
  unitValue: number
  totalValue: number
  originalValue: number
  finalValue: number
  allowEditDescription: boolean
  allowEditValues: boolean
  image: {
    url: string
    original: boolean
    size?: 'small' | 'large'
  }
  technicalDescription: string
  product: {
    originalProductId: string
    name: string
    // Produto inativado depois de lançado (PAD-7)
    isActive?: boolean
    hasComposition?: boolean
    // A marca discreta do produto terceirizado (T-3, T-5)
    isOutsourced?: boolean
    quantity: number
    unitValue: number
    finalValue: number
    compositions: {
      id: string
      originalCompositionId: string
      originalQuantity?: number
      name: string
      unitKind: string
      unitOfMeasure: {
        id: string
        name: string
        code: string
        description: string
        isActive: boolean
        companyId: string
      }
      quantity: number
      unitValue: number
      totalValue: number
      width: number
      height: number
      length: number
      weight: number
      volume: number
      distance: number
      duration: number
    }[]
  }
}

export type DeliveryInfoType = {
  id: string
  status: string
  type: string
  timeFrame: number
  estimateDate: Date
  cost: number
  value: number
  notes: string
  deliveryTime?: string
  deliveryDisplayMode?: 'DAYS' | 'DATE'
  supplier: {
    id: string
    name: string
  }
  modality: string
  clientAddress?: {
    id: string
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    state: string
    zipcode: string
    type: string
  }
  createdAt: string
  updatedAt: string
}

export type CommissionType = {
  type: string
  supplier: {
    id: string
    name: string
  }
  transferMethod: string
  commissionValue: number
  commissionType: string
  totalCommission: number
}

type FinancialItemType = {
  id: number
  company: string
  method: string
  status: 'Realizado' | 'Pendente'
  dueAmount: number
  dueDate: string
  paidAmount: number
  paidDate: string | null
}

type FinancialInfoType = {
  status: string
  payment: FinancialItemType[]
  commission: FinancialItemType[]
  delivery: FinancialItemType[]
}

export type QuotationPaymentConditionsType = {
  id: string
  type: string
  billing: string
  discount: {
    discountType: string
    discountValue: number
    discountTotal: number
  }
  downPayment: {
    paymentConditionId: string
    dueDate: Date
    additionalFee: number
    amount: number
  }
  paymentCondition: {
    id: string
    name: string
    generateInvoice?: boolean
    invoiceType?: 'NFE' | 'NFSE' | 'NFCE' | null
  }
  totalValue: number
  finalValue: number
  description: string
  status: string
  installments: {
    id: string
    dueDate: Date
    paymentConditionId: string
    additionalFee: number
    amount: number
  }[]
  commission: CommissionType

  minInstallmentQty: number
  maxInstallmentQty: number
  mainAdditionalFee: number
  additionalFeeType: 'PERCENT' | 'VALUE'
  installmentQty: number
}

// TODO : separar entre listagem e detalhes
export type QuotationType = {
  id: string
  /** Empresa dona do documento; `company` abaixo é a subempresa fiscal. */
  companyId: string
  orderId: string
  quotationNumber: number
  contactSource?: { id: string; name: string }
  createdAt: Date
  updatedAt: Date
  dueDate: Date
  description: string
  status: string
  totalValue: number
  // Dados para cálculo do total na listagem
  deliveryInfo: DeliveryInfoType
  quotationPayment?: {
    finalValue?: number
    discountTotal?: number
    downPaymentAdditionalFee?: number
    commission?: {
      type?: string
      totalCommission?: number
    }
    quotationInstallment?: {
      additionalFee?: number
    }[]
  }
  tag: {
    id: string
    text: string
    color: string
  }
  // CRM fase 1 (24/10/2026): motivo da rejeição e próximo contato combinado
  rejectionReason?: { id: string; reason: string } | null
  nextContactAt?: string | null
  nextContactNote?: string | null
  // O último contato registrado (CRM fase 2)
  lastContact?: import('./followUp').LastContact | null
  quickSale: boolean
  serie: {
    id: string
    name: string
    code: string
    quotation: number
  }
  seller: {
    id: string
    name: string
    maxDiscount?: number | null
    // "Somente enviar ao caixa" do perfil do vendedor (FC-12.1): a venda
    // rápida dele vai sempre para a frente de caixa
    onlySendToCash?: boolean
  }
  company: {
    id: string
    name: string
    cnpj: string
  }
  // A API retorna null quando o orçamento não tem cliente informado
  client: {
    id: string
    type: string
    name: string
    status: string
    cnpj: string
    cpf: string
    email: string
    phoneNumber: string
  } | null
  contact?: {
    id: string
    name: string
    email?: string
    phone?: string
    notes?: string
  }

  paymentConditions: QuotationPaymentConditionsType
  quotationItems: QuotationItemType[]
  financial: FinancialInfoType
  approvedAt: string
  finishedAt: string
}

export type ListQuotationsDataType = {
  date: string
  quotations: QuotationType[]
}

export type ListQuotationsType = {
  data: ListQuotationsDataType[]
  total: number
}

// Types for Quotation History
export type QuotationHistoryAction =
  | 'CREATED'
  | 'FINISHED'
  | 'REOPENED'
  | 'REJECTED'
  | 'VALUE_CHANGED'
  | 'APPROVED'
  | 'DUPLICATED'
  | 'EDITED'

export type QuotationHistoryChanges = {
  before: Record<string, unknown>
  after: Record<string, unknown>
}

export type QuotationHistoryMetadata = {
  [key: string]: unknown
}

export type QuotationHistoryItem = {
  id: string
  action: QuotationHistoryAction
  description: string
  changes: QuotationHistoryChanges | null
  metadata: QuotationHistoryMetadata | null
  createdBy: string
  createdByName: string
  createdAt: string
  user?: {
    id: string
    name: string
  }
}

export type QuotationHistoryResponse = {
  total: number
  history: QuotationHistoryItem[]
}
