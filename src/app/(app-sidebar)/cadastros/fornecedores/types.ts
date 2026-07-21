// Supplier list
export type ListSuppliersDataType = {
  id: string
  createdAt: string
  updatedAt: string
  kind: string
  type?: 'COMPANY' | 'PERSON'
  status: string
  name: string
  corporateName?: string
  cpf?: string
  cnpj?: string
  stateRegistration?: string
  email: null
  phoneNumber: null
  mobilePhone: null
  notes: null
  financialNotes: null
  nickname: string
  site: null
  birthdate: null
  details: {
    cnpj: string
    stateRegistration: string
  }
  addressId: string
  companyId: string
  categoryRelation: { id: string; name: string }
}

export type ListSuppliersType = {
  data: ListSuppliersDataType[]
  total: number
}

// Single supplier
export type SupplierType = unknown
