export type PayrollItemOperationType = 'INCREASE' | 'DISCOUNT' | 'ADVANCE'

// Item de custo (template) da empresa: existe uma vez por empresa e é
// replicado como linha na folha de cada colaborador
export type PayrollTemplateType = {
  id: string
  name: string
  type: PayrollItemOperationType
  defaultAmount: number
  createdAt: string
  isBase: boolean
  linkedEmployees: number
  canDelete: boolean
}

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
