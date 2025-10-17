// Tipos para integração com Asaas

export type AsaasBillingType = 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED'

export interface AsaasCustomer {
  id?: string
  name: string
  email: string
  phone?: string
  mobilePhone: string
  cpfCnpj: string
  postalCode: string
  address: string
  addressNumber: string
  complement?: string
  province: string
  city: string
  state: string
  notificationDisabled?: boolean
  additionalEmails?: string
  externalReference?: string
}

export interface AsaasSubscriptionPayload {
  customer: string // ID do cliente no Asaas
  billingType: AsaasBillingType
  value: number
  nextDueDate: string
  cycle:
    | 'WEEKLY'
    | 'BIWEEKLY'
    | 'MONTHLY'
    | 'QUARTERLY'
    | 'SEMIANNUALLY'
    | 'YEARLY'
  description?: string
  externalReference?: string
  maxPayments?: number
}

export interface AsaasCheckoutConfig {
  name: string
  description?: string
  billingType: AsaasBillingType
  chargeType: 'DETACHED' | 'RECURRENT'
  subscriptionCycle?:
    | 'WEEKLY'
    | 'BIWEEKLY'
    | 'MONTHLY'
    | 'QUARTERLY'
    | 'SEMIANNUALLY'
    | 'YEARLY'
  value?: number
  dueDateLimitDays?: number
  maxInstallmentCount?: number
  notificationEnabled?: boolean
  successUrl?: string
}

export interface AsaasCheckoutResponse {
  id: string
  name: string
  url: string
  expirationDate?: string
  viewCount: number
  active: boolean
  billingType: AsaasBillingType
}

export interface AsaasPaymentResponse {
  id: string
  customer: string
  subscription?: string
  installment?: string
  billingType: AsaasBillingType
  value: number
  netValue: number
  status:
    | 'PENDING'
    | 'RECEIVED'
    | 'CONFIRMED'
    | 'OVERDUE'
    | 'REFUNDED'
    | 'RECEIVED_IN_CASH'
    | 'REFUND_REQUESTED'
    | 'CHARGEBACK_REQUESTED'
    | 'CHARGEBACK_DISPUTE'
    | 'AWAITING_CHARGEBACK_REVERSAL'
    | 'DUNNING_REQUESTED'
    | 'DUNNING_RECEIVED'
    | 'AWAITING_RISK_ANALYSIS'
  dueDate: string
  originalDueDate: string
  invoiceUrl?: string
  bankSlipUrl?: string
  invoiceNumber?: string
  externalReference?: string
  description?: string
}

export interface AsaasWebhookPayload {
  event:
    | 'PAYMENT_CREATED'
    | 'PAYMENT_UPDATED'
    | 'PAYMENT_CONFIRMED'
    | 'PAYMENT_RECEIVED'
    | 'PAYMENT_OVERDUE'
    | 'PAYMENT_DELETED'
    | 'PAYMENT_RESTORED'
    | 'PAYMENT_REFUNDED'
    | 'PAYMENT_RECEIVED_IN_CASH_UNDONE'
    | 'PAYMENT_CHARGEBACK_REQUESTED'
    | 'PAYMENT_CHARGEBACK_DISPUTE'
    | 'PAYMENT_AWAITING_CHARGEBACK_REVERSAL'
    | 'PAYMENT_DUNNING_RECEIVED'
    | 'PAYMENT_DUNNING_REQUESTED'
    | 'PAYMENT_BANK_SLIP_VIEWED'
    | 'PAYMENT_CHECKOUT_VIEWED'
  payment: AsaasPaymentResponse
}

// Tipos para o fluxo de assinatura do sistema
export interface SubscriptionCheckoutData {
  selectedPlanId: string
  selectedModules: string[]
  additionalUsers: number
  customerData: {
    type: 'PF' | 'PJ'
    name?: string
    taxId?: string
    razaoSocial?: string
    cnpj?: string
    nomeResponsavel?: string
    cpfResponsavel?: string
    email: string
    phone?: string
    mobile: string
    zipCode: string
    state: string
    city: string
    neighborhood: string
    number: string
    street: string
    complement?: string
  }
  agreedToTerms: boolean
}

export interface CreateSubscriptionPayload {
  planId: string
  modules: string[]
  additionalUsers: number
  billingType: AsaasBillingType
  customer: AsaasCustomer
}

export interface SubscriptionCheckoutResponse {
  checkoutId: string
  checkoutUrl: string
  subscriptionData: {
    planId: string
    modules: string[]
    additionalUsers: number
    totalValue: number
  }
}
