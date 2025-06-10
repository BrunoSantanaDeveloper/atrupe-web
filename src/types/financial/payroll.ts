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

export interface PayrollMovementType {
  id: string
  reference: string
  status: 'COMPLETED' | 'PENDING'
  dueDate: string
  completedDate?: string
  amount: number
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
  movements: PayrollMovementType[]
}

export type PayrollPdfType = {
  id: string
  reference: string
  employee: {
    id: string
    name: string
    email?: string
    phone?: string
  }
  status: 'OPEN' | 'CLOSED'
  totalSalary: number
  totalDeductions: number
  netSalary: number
  createdAt: string
  updatedAt: string
  items: PayrollItemType[]
  movements: PayrollMovementType[]
}

export type PayrollsDataType = {
  data: PayrollListType[]
  count: number
  limit: number
  page: number
  totalPages: number
}
