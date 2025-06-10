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
