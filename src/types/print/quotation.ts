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
}

// Tipo para cliente
type ClientType = {
  name: string
  document: DocumentType
  phone: string
  email: string
  address: AddressWithTypeType
}

// Tipo para contato
type ContactType = {
  name: string
  phone: string
  email: string
}

// Tipo para vendedor
type SellerType = {
  name: string
  signature: string
}

// Tipo para status do orçamento
type QuotationStatusType =
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
  name: string
  quantity: number
  unitOfMeasure: string
  unitPrice: number
  totalPrice: number
}

// Tipo para desconto
type DiscountType = {
  type: 'PERCENT' | 'VALUE'
  value: number
  discountedValue: number
}

// Tipo para item do orçamento
type QuotationItemType = {
  id: string
  image: string
  description: string
  composition: CompositionItemType[]
  totalQuantity: number
  totalUnitPrice: number
  discount: DiscountType
  finalPrice: number
}

// Tipo para fornecedor de entrega
type DeliverySupplierType = {
  name: string
  cnpj: string
}

// Tipo para entrega
type DeliveryType = {
  supplier: DeliverySupplierType
  daysAfterApproval: number
  clientAddress: AddressWithTypeType
  freightCost: number
  freightPrice: number
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
  paymentMethod: string
}

// Tipo para pagamento
type PaymentType = {
  condition: string
  method: string
  totalInstallments: number
  installments: InstallmentType[]
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
  items: QuotationItemType[]
  delivery: DeliveryType
  cost: CostType
  payment: PaymentType
  total: TotalType
}
