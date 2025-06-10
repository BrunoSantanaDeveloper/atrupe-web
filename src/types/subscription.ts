export interface Plan {
  id: string
  name: string
  price: number
  status: 'available' | 'coming_soon' | 'inactive'
  badge?: string
  badgeVariant?: 'success' | 'warning'
  svg?: React.ReactNode
  namesvg?: React.ReactNode
  concept: {
    description: string | string[]
    objective?: string
    mainActions: string[]
    expectedResults?: string
  }
  features?: string[]
}

export interface CustomerData {
  personType: 'individual' | 'company'
  companyName?: string
  cnpj?: string
  responsibleName: string
  responsibleCpf: string
  email: string
  phone: string
  mobile: string
  address: {
    zipCode: string
    state: string
    city: string
    neighborhood: string
    street: string
    number: string
    complement?: string
  }
}

export interface SubscriptionData {
  plan: Plan
  invoiceModule: boolean
  additionalUsers: number
  customer: CustomerData
  termsAccepted: boolean
  totalAmount: number
}

export interface PaymentData {
  planId: string
  companyId: string
  customerData: CustomerData
  billingType: 'CREDIT_CARD' | 'BOLETO' | 'PIX'
}

export interface StateOption {
  value: string
  label: string
}

export interface CityOption {
  value: string
  label: string
}

export type PersonType = 'individual' | 'company'
