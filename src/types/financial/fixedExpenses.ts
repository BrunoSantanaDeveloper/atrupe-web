export type NatureType = {
  id: string
  code: string
  description: string
  level1: string
  level2: string
}

export type SubCategoryType = {
  id: string
  code: string
  description: string
}

export type InstallmentType = {
  status: string
  dueDate: string
  paidDate: string | null
}

export type PayableType = {
  id: string
  status: string
  companyId: string
  createdAt: string
  description: string
  reference: string | null
  referenceDate: string
  subCategoryId: string
  installmentQty: number
  totalAmount: number
  cancelReason: string | null
  natureId: string
  supplierId: string
  notes: string
  cancelNotes: string | null
  changeNotes: string | null
  changeReason: string | null
  updatedAt: string
  quotationId: string | null
  clientId: string | null
  mainAdditionalFee: number
  totalValue: number
  scheduledExpenseId: string
  installments: InstallmentType[]
}

export type LaunchSummaryType = {
  total: number
  pending: number
  paid: number
}

export type FixedExpenseItemType = {
  id: string
  description: string
  amount: number
  dueDay: number
  recurringType: string
  isActive: boolean
  supplierId: string
  companyId: string
  categoryId: string
  subCategoryId: string
  createdAt: string
  updatedAt: string
  nature: NatureType
  subCategory: SubCategoryType
  payables: PayableType[]
  launchStatus: string
  launchSummary: LaunchSummaryType
}

export type FixedExpensesType = {
  id: string
  name: string
  email: string
  phone: string
  totalExpenses: number
  activeExpenses: number
  inactiveExpenses: number
  totalAmount: number
  totalLaunched: number
  totalNotLaunched: number
  items: FixedExpenseItemType[]
}

export type ListFixedExpensesType = {
  total: number
  totalPages: number
  data: FixedExpensesType[]
}
