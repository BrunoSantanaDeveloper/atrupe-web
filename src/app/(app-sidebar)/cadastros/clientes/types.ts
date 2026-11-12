type CompanyDetails = {
  cnpj: string
  stateRegistration: string
  update: { cnpj: string }
}

export type ListClientsDataType = {
  // Bloqueado no limite de crédito (vem na lista)
  blockClient?: boolean
  requirePrepayment?: boolean
  id: string
  createdAt: string
  updatedAt: string
  type: 'COMPANY' | 'PERSON'
  status: 'PROSPECT' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  name: string
  corporateName?: string
  cpf?: string
  cnpj?: string
  stateRegistration?: string
  email: string
  phoneNumber: string
  mobilePhone: string
  notes: string
  financialNotes: string
  nickname: string
  site: string
  birthdate: string
  addressId: string
  details: CompanyDetails
  responsibleId: string
  responsible?: { id: string; name: string } | null
  companyId: string
  categoryRelation: { id: string; name: string }
}

export type ListClientsType = {
  data: ListClientsDataType[]
  total: number
}

export type StatesType = {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  code: string
  isActive: boolean
}

export type CitiesType = {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  code: string
  isActive: boolean
  stateId: string
}

// export type CategoriesType = {
//   id: string
//   name: string
//   kind: string
//   isActive: boolean
//   isStandard: boolean
//   companyId: string
//   parentId: string
//   children: string[]
// }

export type ClientOrdersType = {
  id: string
  name: string
  date: string
  value: string
  status: string
}

export type ClientQuotationsType = {
  id: string
  name: string
  date: string
  value: string
  status: string
}

export type ClientFinanceType = {
  id: string
  referencia: string
  bank: string
  status: string
  value: string
  date: string
}
