export type InstallmentType = {
  id: string
  installmentNumber: number
  status: 'PENDING' | 'PROVISIONED' | 'PAID' | 'OVERDUE' | 'CANCELED'
  paymentCondition: {
    id: string
    name: string
  }
  bank: {
    id: string
    name: string
  }
  bankAccount: {
    id: string
    name: string
    bank?: {
      id: string
      name: string
    }
  }
  value: number
  amount: number
  additionalFee: number
  dueDate: Date
  paidValue?: number
  paidAmount?: number
  paymentDate?: Date
  paidDate?: Date
  compensateDate?: Date
}

export type TransactionListType = {
  id: string
  type: 'receivable' | 'payable'
  totalValue: number
  totalPaid: number
  description: string
  client?: {
    id: string
    name: string
  }
  supplier?: {
    id: string
    name: string
  }
  employee?: {
    id: string
    name: string
  }
  installmentsQuantity: number
  currentInstallment: InstallmentType
  notes: string
  status: 'PENDING' | 'PROVISIONED' | 'PAID' | 'OVERDUE' | 'CANCELED'
  expenseSource?: 'SUPPLIER' | 'EMPLOYEE' | 'CLIENT' | 'OTHER'
  quotationId?: string
}

export type TransactionDetailsType = {
  id: string
  type: 'receivable' | 'payable'
  totalAmount: number
  totalPaid: number
  description: string
  client?: {
    id: string
    name: string
  }
  supplier?: {
    id: string
    name: string
  }
  subCategory: {
    id: string
    description: string
  }
  nature: {
    id: string
    description: string
  }
  installmentQty: number
  referenceDate: string
  notes: string
  status: 'PENDING' | 'PROVISIONED' | 'PAID' | 'OVERDUE' | 'CANCELED'
  installments: InstallmentType[]
  expenseSource?: 'SUPPLIER' | 'EMPLOYEE' | 'CLIENT' | 'OTHER'
  quotationId?: string
}

export type TransactionDataType = {
  date: string
  expectedRevenue: number
  expectedExpense: number
  realizedRevenue: number
  realizedExpense: number
  transactions: TransactionListType[]
}

export type TransactionApiResponse = {
  total: number
  lastPage: number
  data: TransactionDataType[]
}

// Types for Transaction History
export type HistoryAction =
  | 'CREATE'
  | 'PAY_INSTALLMENT'
  | 'UPDATE_INSTALLMENTS'
  | 'UPDATE_DETAILS'
  | 'CANCEL'
  | 'CANCEL_INSTALLMENT'
  | 'COMPENSATE'

export type HistoryInstallmentChange = {
  id: string
  installmentNumber: number
  amount: number
  dueDate: string
}

export type HistoryChanges = {
  before: HistoryInstallmentChange[]
  after: HistoryInstallmentChange[]
}

export type HistoryMetadata = {
  installmentNumber?: number
  amount?: number
  paidAmount?: number
  paidDate?: string
  paymentConditionId?: string
  paymentConditionName?: string
  bankAccountId?: string
  bankAccountName?: string
  totalAmount?: number
  installmentQty?: number
  clientName?: string
  supplierName?: string
  cancelReason?: string
  cancelNotes?: string
  changeReason?: string
  changeNotes?: string
  addedCount?: number
  modifiedCount?: number
  removedCount?: number
  totalAmountBefore?: number
  totalAmountAfter?: number
  totalInstallmentsBefore?: number
  totalInstallmentsAfter?: number
  [key: string]: unknown
}

export type TransactionHistoryItem = {
  id: string
  action: HistoryAction
  description: string
  changes: HistoryChanges | null
  metadata: HistoryMetadata | null
  createdBy: string
  createdByName: string
  createdAt: string
}

export type TransactionHistoryResponse = {
  total: number
  history: TransactionHistoryItem[]
}
