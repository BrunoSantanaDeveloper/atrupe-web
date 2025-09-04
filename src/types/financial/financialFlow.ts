export type InstallmentType = {
  id: string
  installmentNumber: number
  status: 'PENDING' | 'PROVISIONED' | 'PAID' | 'OVERDUE' | 'CANCELED'
  paymentMethod: {
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
  }
  value: number
  amount: number
  additionalFee: number
  dueDate: string
  paidValue: number
  paymentDate?: string
  compensateDate?: string
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
  isSale: boolean
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
