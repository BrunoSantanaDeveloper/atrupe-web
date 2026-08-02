type ContactType = {
  id: string
  name?: string
  email?: string
  phone?: string
  notes?: string
}

type AddressType = {
  id: string
  type?: string
  zipcode?: string
  state?: string
  city?: string
  neighborhood?: string
  street?: string
  number?: string
  complement?: string
}

export type ClientInfoType = {
  id: string
  status: 'ACTIVE' | 'INACTIVE' | 'PROSPECT'
  type: 'PERSON' | 'COMPANY'
  general: {
    name: string
    email: string
    cpf: string
    rg: string
    cnpj: string
    activity: string
    category: { name: string }
    phone: string
    mobile: string
    notes: string
    stateRegistration?: string
    indicadorIE?: number
    responsible?: { id: string; name: string } | null
  }
  // addind id to address
  addresses: AddressType[]
  contacts: ContactType[]
  creditLimit: {
    minValue: number
    maxValue: number
    paymentMethods: string[]
    blockClient: boolean
  }
  // Falta:
  createdAt: Date
  quotationsQuantity: number
  ordersQuantity: number
}
