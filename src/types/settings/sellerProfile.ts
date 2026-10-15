export type SellerProfileType = {
  id: string
  name: string
  isActive: boolean
  companyId: string
  commission: number
  maxDiscount: number
  minValue: number
  canApprovePreRegistration: boolean
  canCancelSale: boolean
  onlySendToCash?: boolean
}

export type SellerProfileEmployeesType = {
  id: string
  name: string
  avatar: string // TODO : falta receber esta propriedade
  role: string
}

export type ListSellerProfileDataType = {
  profile: SellerProfileType
  employees: SellerProfileEmployeesType[]
}

export type ListSellerProfileType = {
  profiles: ListSellerProfileDataType[]
  total: number
}
