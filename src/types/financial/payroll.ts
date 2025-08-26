import { TransactionListType } from './financialFlow'

export type PayrollListType = {
  id: string
  employee: {
    id: string
    name: string
    role: string
  }
  totalSalary: number
  balance: number
  status: string
}

export interface PayrollItemType {
  id: string
  type: 'INCREASE' | 'DISCOUNT' | 'ADVANCE'
  amount: number
  description: string
  createdAt: string
  paidAt?: string
  payables: TransactionListType
}

export interface FinancialTransactionType {
  id: string
  type: 'OUTCOME' | 'INCOME'
  amount: number
  description: string
  transactionDate: string
  reason: string
  status: 'PENDING' | 'PAID' | 'CANCELED'
  relatedPayable?: {
    id: string
    description: string
    totalAmount: number
  }
  relatedInstallment?: {
    id: string
    installmentNumber: number
    amount: number
    status: string
  }
  cashRegister?: {
    id: string
    description: string
    bankAccount: {
      id: string
      name: string
      bank: {
        id: string
        name: string
        code: string
      }
    }
  } | null
  createdAt?: string
}

export interface PayrollDetailType {
  id: string
  month: number
  year: number
  status: string
  employee: {
    id: string
    name: string
    role: string
  }
  items: PayrollItemType[]
  balance: number
  financialTransactions: FinancialTransactionType[]
}

export type PayrollPdfType = {
  company: {
    name: string
    cnpj: string
    email: string
    logo: string
    address: {
      street: string
      number: string
      neighborhood: string
      city: string
      state: string
    }
  }
  employeeName: string
  reference: string
  items: {
    id: string
    description: string
    type: 'INCREASE' | 'DISCOUNT' | 'ADVANCE'
    amount: number
  }[]
  netSalary: number
  payment: {
    dueDate: string
    paidAt: string
    amountPaid: number
    paymentMethod: string
  }
}
