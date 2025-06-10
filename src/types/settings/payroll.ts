export type PayrollConfigItemType = {
  id: string
  reference: string
  amount: number
  date: string
  type: 'INCREASE' | 'DISCOUNT'
  isSet: boolean
  createdAt: string
  updatedAt: string
}

export type ListPayrollConfigType = {
  id: string
  name: string
  avatarUrl: string
  sectorId: string
  roleId: string
  roleName: string
  sectorName: string
  items: PayrollConfigItemType[]
}

export type PayrollConfigType = {
  data: ListPayrollConfigType[]
  total: number
  totalPages: number
}
