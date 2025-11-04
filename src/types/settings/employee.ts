import { RoleType } from './role'

export type UserType = {
  id: string
  isActive: boolean
  name: string
  email: string
}

export type EmployeeType = {
  id: string
  createdAt: string
  updatedAt: string
  isActive: boolean
  name: string
  avatarUrl: string
  signatureUrl: string
  sallary: number
  companyId: string
  userId: string
  roleId: string
  sectorId: string
  sellerProfileId: string
  user: UserType
  cpf: string
  rg: string
  phone: string
  mobile: string
  role: RoleType
  sector: {
    id: string
    name: string
    icon: string
    isActive: boolean
    isProductionStage: boolean
    kind: string
    companyId: string
  }
  address: {
    zipcode: string
    state: string
    city: string
    neighborhood: string
    number: string
    street: string
    complement: string
  }[]
}

export type ListEmployeeDataType = {
  sector: { id: string; name: string }
  employees: EmployeeType[]
}

export type ListEmployeeType = {
  data: ListEmployeeDataType[]
  total: number
  lastPage: number
}

// Types for Employee History
export type EmployeeHistoryAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DEACTIVATE'
  | 'REACTIVATE'
  | 'CREATE_USER'
  | 'UPDATE_USER'

export type EmployeeHistoryChanges = {
  before: Partial<{
    isActive: boolean
    name: string
    roleId: string
    sectorId: string
    avatarUrl: string
    signatureUrl: string
    sallary: number
    cpf: string
    mobile: string
    phone: string
    rg: string
    email: string
  }>
  after: Partial<{
    isActive: boolean
    name: string
    roleId: string
    sectorId: string
    avatarUrl: string
    signatureUrl: string
    sallary: number
    cpf: string
    mobile: string
    phone: string
    rg: string
    email: string
  }>
}

export type EmployeeHistoryMetadata = {
  roleId?: string
  sectorId?: string
  changedFields?: string[]
  userId?: string
  userEmail?: string
  userName?: string
  [key: string]: unknown
}

export type HistoryUser = {
  id: string
  name: string
  email: string
  avatar: string | null
}

export type EmployeeHistoryItem = {
  id: string
  action: EmployeeHistoryAction
  description: string
  changes: EmployeeHistoryChanges | null
  metadata: EmployeeHistoryMetadata | null
  createdBy: string
  createdByName: string
  createdAt: string
  user: HistoryUser
}

export type EmployeeHistoryResponse = {
  total: number
  history: EmployeeHistoryItem[]
}
