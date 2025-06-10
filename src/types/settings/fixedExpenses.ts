interface Supplier {
  id: string
  createdAt: string
  updatedAt: string
  type: string
  status: string
  name: string
  email: string
  phone: string
  mobile: string
  rg: string
  cpf: string
  cnpj: string
  activity: string
  tradeName: string
  corporateName: string
  notes: string
  financialNotes: string
  nickname: string
  site: string
  birthdate: string
  companyId: string
  category: string
  minValue: number
  maxValue: number
  blockClient: boolean
}

interface SubCategory {
  id: string
  description: string
  code: string
  companyId: string
  natureId: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export type FixedExpensesConfigType = {
  id: string
  description: string
  amount: number
  dueDay: number
  recurringType: string
  supplierId: string
  companyId: string
  categoryId: string
  subCategoryId: string
  nature: {
    id: string
    code: string
    level2: string
  }
  createdAt: string
  updatedAt: string
  supplier: Supplier
  subCategory: SubCategory
}

export type ListFixedExpensesConfigType = {
  data: FixedExpensesConfigType[]
  total: number
}
