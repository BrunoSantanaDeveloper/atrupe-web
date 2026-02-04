// Tipos para endereço
type AddressType = {
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

// Tipo para documento
type DocumentType = {
  type: 'CNPJ' | 'CPF'
  value: string
}

// Tipo para endereço com tipo
type AddressWithTypeType = AddressType & {
  type: 'PRINCIPAL' | 'ENTREGA' | 'COBRANCA'
}

// Tipo para empresa
type CompanyType = {
  name: string
  cnpj: string
  address: AddressType
  logo: string
  textBeforeItems: string
  textAfterItems: string
  siteUrl?: string
  email?: string
  socialNetworks: {
    instagram: string
    facebook: string
    linkedin: string
  }
}

// Tipo para cliente
type ClientType = {
  name: string
  document: DocumentType
  phone: string
  email: string
  address: AddressWithTypeType
  notes?: string
  financialNotes?: string
}

// Tipo para contato
type ContactType = {
  name: string
  phone: string
  email: string
  notes?: string
}

// Tipo para vendedor
type SellerType = {
  name: string
  signature: string
}

// Tipo para status do orçamento
type QuotationStatusType =
  | 'OPEN'
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'DONE'

// Tipo para orçamento
type QuotationType = {
  number: number
  seriesCode: string
  description: string
  seller: SellerType
  createdAt: string
  dueDate: string
  approvedAt?: string
  finishedAt?: string
  status: QuotationStatusType
}

// Tipo para status do pedido
type OrderStatusType = 'PENDING' | 'IN_PRODUCTION' | 'COMPLETED' | 'CANCELLED'

// Tipo para pedido
type OrderType = {
  id: string
  createdAt: string
  status: OrderStatusType
  approvedAt: string
}

// Tipo para composição de item
type CompositionItemType = {
  id: string
  originalCompositionId: string
  name: string
  unitOfMeasure: string
  quantity: number
  originalQuantity: number
  unitValue: number
  totalValue: number
  weight: number
  width: number
  height: number
  duration: number
  length: number
  distance: number
  volume: number
}

// Tipo para produto
type ProductType = {
  originalProductId: string
  name: string
  quantity: number
  unitValue: number
  finalValue: number
  compositions: CompositionItemType[]
}

// Tipo para imagem
type ImageType = {
  url: string
  original: boolean
  size?: 'small' | 'large'
}

// Tipo para item do orçamento
type QuotationItemType = {
  id: string
  description: string
  allowEditDescription: boolean
  allowEditValues: boolean
  technicalDescription: string
  notes: string
  discountType: 'VALUE' | 'PERCENT'
  discount: number
  unitValue: number
  totalValue: number
  finalValue: number
  image: ImageType
  product: ProductType
}

// Tipo para fornecedor de entrega
type DeliverySupplierType = {
  name: string
  cnpj: string
  notes?: string
  financialNotes?: string
}

// Tipo para entrega
type DeliveryType = {
  supplier: DeliverySupplierType
  daysAfterApproval: number
  estimatedDate: string
  clientAddress: AddressWithTypeType
  freightCost: number
  freightPrice: number
  notes?: string
}

// Tipo para custo
type CostType = {
  delivery: number
  total: number
}

// Tipo para parcela
type InstallmentType = {
  number: string
  dueDate: string
  value: number
  paymentCondition: string
}

// Tipo para pagamento
type PaymentType = {
  condition: string
  method: string
  totalInstallments: number
  installments: InstallmentType[]
  availablePaymentMethods?: string[]
  description?: string
  downPayment: {
    amount: number
    dueDate: string
    additionalFee: number
    paymentConditionId: string
    paymentCondition: {
      id: string
      name: string
      paymentMethod: string
    }
  }
}

// Tipo para totais
type TotalType = {
  subtotal: number
  totalDiscount: number
  finalTotal: number
}

// Tipo principal do orçamento
export type PrintQuotationType = {
  company: CompanyType
  client: ClientType
  contact: ContactType
  quotation: QuotationType
  order: OrderType
  quotationItems: QuotationItemType[]
  delivery: DeliveryType
  cost: CostType
  payment: PaymentType
  total: TotalType
}
