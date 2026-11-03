/** Como a assinatura em vigor é cobrada (billing-mode.ts no backend). */
export type AccountBillingMode =
  | 'ASAAS_SUBSCRIPTION'
  | 'ASAAS_INSTALLMENT'
  | 'MANUAL'
  | 'TRIAL'

/** Módulo contratado: preço travado na assinatura, em centavos por mês. */
export interface AccountModule {
  key: string
  name: string
  priceCents: number
  since: string
}

export interface AccountUsers {
  /** Colaboradores ativos com acesso: o que conta para o limite. */
  inUse: number
  /** Incluídos no plano; nulo quando o plano não limita usuários. */
  included: number | null
  /** Usuários adicionais contratados. */
  additional: number
  /** Plano mais adicionais; nulo quando não há limite. */
  limit: number | null
  /** Preço de hoje no plano: a assinatura guarda só a quantidade. */
  additionalUserPriceCents: number
}

export interface AccountItem {
  id: string // ID da company (usado para edição)
  avatar?: string
  companyName: string
  code: string
  document: string
  /** Primeiro colaborador com acesso: é ele que Editar e Redefinir senha alteram. */
  userId: string
  userName: string
  userDocument: string
  phone: string
  email: string
  createdAt: string
  plan: string
  planType: 'TRIAL' | 'START' | 'LITE' | 'PRO' | 'ELITE' | 'FULL'
  status: 'ACTIVE' | 'BLOCKED' | 'AWAITING_PAYMENT' | 'INACTIVE' | 'CANCELED'
  state: { id: string; name: string }
  city: { id: string; name: string }
  /** Titular (Usuário nº 1): quem responde pela conta perante a Atrupe. */
  owner: {
    id: string
    name: string
    email: string
    phone: string | null
  } | null
  subscriptionId: string
  cycle: string
  billingMode: AccountBillingMode
  installmentCount: number | null
  /** Valor de cada renovação em centavos: por mês ou, no anual, pelo ano. */
  valueCents: number
  /** Nulo na assinatura manual, que não tem cobrança. */
  nextChargeDate: string | null
  hasOverdueCharge: boolean
  modules: AccountModule[]
  users: AccountUsers
}

export interface AccountFilterOptions {
  modules: { key: string; name: string }[]
  states: string[]
}

export interface AccountDetails {
  account: AccountItem
  company: {
    name: string
    legalName: string | null
    email: string | null
    phone: string | null
    createdAt: string
    blockedAt: string | null
    blockReason: string | null
  }
  subscription: {
    id: string
    status: string
    billingType: string
    contractedAt: string
    couponCode: string | null
  }
  users: {
    id: string
    name: string
    email: string
    role: string | null
    isAdmin: boolean
    isOwner: boolean
    lastAccessAt: string | null
  }[]
  payments: {
    id: string
    dueDate: string
    valueCents: number
    status: string
    paidAt: string | null
    billingType: string
    description: string | null
    invoiceUrl: string | null
  }[]
  changes: {
    id: string
    action: string
    description: string
    createdAt: string
    createdByName: string | null
  }[]
}
