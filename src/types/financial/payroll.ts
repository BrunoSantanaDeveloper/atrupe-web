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
  payable?: {
    id: string
    description: string
    totalAmount: number
    status: string
    referenceDate: string
    installments: {
      id: string
      installmentNumber: number
      dueDate: string
      amount: number
      status: string
      paidDate: string | null
      paidAmount: number | null
    }[]
  }
  payables: TransactionListType
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
  financialTransactions: TransactionListType[]
}

export type PayrollPdfType = {
  company: {
    name: string
    cnpj: string
    email: string
    phone: string
    siteUrl: string
    logo: string
    socialNetworks: {
      instagram: string
      facebook: string
      linkedin: string
    }
    address: {
      street: string
      number: string
      complement: string
      neighborhood: string
      city: string
      state: string
      zipCode: string
    }
  }
  employeeName: string
  employeeSignatureUrl?: string | null
  reference: string
  items: {
    id: string
    description: string
    type: 'INCREASE' | 'DISCOUNT' | 'ADVANCE'
    amount: number
  }[]
  netSalary: number
  payables: {
    id: string
    description: string
    totalAmount: number
    installments: {
      id: string
      installmentNumber: number
      dueDate: string
      amount: number
      status: string
      paidDate: string | null
      paidAmount: number | null
      paymentCondition: string | null
    }[]
  }[]
}
