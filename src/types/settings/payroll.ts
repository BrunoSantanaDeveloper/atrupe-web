export type PayrollSetupItemType = {
  id: string
  name: string
  amount: number
  type: 'INCREASE' | 'DISCOUNT' | 'ADVANCE'
  isSet: boolean
  createdAt: string
  updatedAt: string
}

export type ListPayrollSetupType = {
  id: string
  name: string
  avatarUrl: string
  sectorId: string
  roleId: string
  roleName: string
  sectorName: string
  items: PayrollSetupItemType[]
}

export type PayrollSetupType = {
  data: ListPayrollSetupType[]
  total: number
  totalPages: number
}
