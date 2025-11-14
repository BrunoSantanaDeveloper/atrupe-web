// import { PaymentConditionsType } from '../settings/paymentCondition'

export type QuotationItemType = {
  id: string
  description: string
  notes: string
  discountType: string
  discount: number
  unitValue: number
  totalValue: number
  finalValue: number
  allowEditDescription: boolean
  allowEditValues: boolean
  image: {
    url: string
    original: boolean
  }
  technicalDescription: string
  product: {
    originalProductId: string
    name: string
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
  orderId: string
  contactSource?: { id: string; name: string }
  createdAt: Date
  updatedAt: Date
  dueDate: Date
  description: string
  status: string
  totalValue: number
  // finalValue: number
  tag: {
    id: string
    text: string
    color: string
  }
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
  }
  company: {
    id: string
    name: string
    cnpj: string
  }
  client: {
    id: string
    type: string
    name: string
    status: string
    cnpj: string
    cpf: string
    email: string
    phoneNumber: string
  }
  contact?: {
    id: string
    name: string
    email?: string
    phone?: string
    notes?: string
  }

  deliveryInfo: DeliveryInfoType
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
  | 'UPDATED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELED'
  | 'FINISHED'
  | 'STATUS_CHANGED'
  | 'CONVERTED_TO_ORDER'

export type QuotationHistoryMetadata = {
  [key: string]: unknown
}

export type QuotationHistoryItem = {
  id: string
  action: QuotationHistoryAction
  description: string
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
