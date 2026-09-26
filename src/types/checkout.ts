/**
 * Contratos da contratação em três etapas (plano → contrato → pagamento).
 *
 * Espelham as respostas do backend (atrupe-back/src/core/subscriptions). Todo
 * valor monetário vem em CENTAVOS e é calculado no servidor pelo motor de
 * preço: a tela exibe o orçamento, não o calcula.
 */

export type BillingSituationKind =
  | 'EM_DIA'
  | 'ATRASADA'
  | 'BLOQUEADA'
  | 'INATIVA'

export interface ChargeInFocus {
  asaasPaymentId: string
  dueDate: string
  /** Em reais, como o Asaas guarda. */
  value: number
  billingType: string
  status: string
  invoiceUrl: string | null
}

export interface BillingSituation {
  situation: BillingSituationKind
  daysOverdue: number
  /** Contratação registrada, acesso liberado, primeira cobrança ainda não paga. */
  paymentPending: boolean
  chargeInFocus: ChargeInFocus | null
}

/** O bloco `company` que o `update()` do NextAuth consome. */
export interface CompanySessionBlock {
  plan: {
    name: 'TRIAL' | 'START' | 'LITE' | 'PRO' | 'ELITE' | 'FULL'
    active: boolean
    trialEndsAt: string | null
    features: string[]
    limits: Record<string, number>
  }
  blockLevel: 'NONE' | 'PARTIAL' | 'FULL'
  billing: BillingSituation
  isOwner: boolean
}

export type ContractingIntent = 'NEW' | 'EVOLUTION' | 'REGULARIZATION'

export type PlanTrailState =
  | 'CONCLUIDO'
  | 'ATUAL'
  | 'ELEGIVEL'
  | 'BLOQUEADO'
  | 'EM_BREVE'

export interface PlanTrailItem {
  planId: string
  planType: 'START' | 'LITE' | 'PRO' | 'ELITE' | 'FULL'
  state: PlanTrailState
  reason?: 'SEQUENCE' | 'OPEN_CHARGE' | 'NOT_RELEASED'
  name: string
  /** Nulo quando o plano ainda não foi liberado: o preço não é exibido. */
  priceMonthlyCents: number | null
}

export interface PlanStatesResponse {
  intent: ContractingIntent
  hasOpenCharge: boolean
  /** O ciclo anual pode ser contratado agora (chave no servidor). */
  annualCycleAvailable?: boolean
  currentPlanId: string | null
  currentCycle: string | null
  plans: PlanTrailItem[]
}

export type CheckoutBillingType = 'CREDIT_CARD' | 'PIX' | 'BOLETO'

export interface QuoteLine {
  kind: 'PLAN' | 'MODULE' | 'ADDITIONAL_USERS'
  label: string
  quantity?: number
  monthlyCents: number
}

export interface QuoteDiscount {
  kind: 'FREE_MONTH' | 'COUPON' | 'EVOLUTION_CREDIT'
  label: string
  amountCents: number
}

export interface QuoteCoupon {
  code: string
  applied: boolean
  reason?: 'MIN_VALUE' | 'INVALID'
  minPlanValueCents?: number
  message?: string
}

export interface QuoteResult {
  cycle: 'MONTHLY' | 'YEARLY'
  lines: QuoteLine[]
  grossMonthlyCents: number
  subtotalCents: number
  freeMonthCents: number
  couponDiscountCents: number
  creditCents: number
  discounts: QuoteDiscount[]
  totalCents: number
  recurringCents: number
  totalSuffix: '/mês' | '/ano'
  coupon: QuoteCoupon | null
  installments: {
    allowed: boolean
    max: number
    selected: number
    options: { count: number; amountCents: number; lastAmountCents: number }[]
  }
}

export interface QuoteResponse {
  intent: ContractingIntent
  eligible: boolean
  annualCycleAvailable?: boolean
  ineligibilityReason?: string
  plan: { id: string; name: string; planType: string }
  quote: QuoteResult | null
}

export interface QuoteRequest {
  planId: string
  cycle?: 'MONTHLY' | 'YEARLY'
  billingType?: CheckoutBillingType
  /** Só no anual, no cartão: 1 é à vista. */
  installmentCount?: number
  modules?: string[]
  additionalUsers?: number
  couponCode?: string
}

export interface CompanyRegistryView {
  found: boolean
  cnpj: string
  legalName?: string
  tradeName?: string | null
  registrationStatus?: string | null
  isActive?: boolean
  canVerifyRepresentative?: boolean
}

export interface RepresentativeCheck {
  registryAvailable: boolean
  verified: boolean
  requiresName: boolean
  representativeName?: string
  qualification?: string
}

export interface CheckoutRequest extends QuoteRequest {
  billingType: CheckoutBillingType
  expectedTotalCents?: number
  contractor: {
    type: 'PJ' | 'PF'
    cnpj?: string
    cpf?: string
    email: string
    name?: string
    legalName?: string
    tradeName?: string
  }
  representative?: { cpf: string; name?: string; isSelf: boolean }
  /** O Usuário nº 1 indicado; sem ele, fica o atual. */
  principalAdminUserId?: string
  termsAcceptance: { contractId: string; version: number; accepted: true }
}

/** Um administrador ativo que pode ser o Usuário nº 1 da conta. */
export interface PrincipalAdminCandidate {
  userId: string
  name: string
  email: string
}

export interface PrincipalAdminOptions {
  currentUserId: string | null
  candidates: PrincipalAdminCandidate[]
}

export interface CheckoutResult {
  subscription: {
    id: string
    planName: string
    cycle?: 'MONTHLY' | 'YEARLY'
    installmentCount?: number | null
    nextDueDate: string
  }
  payment: { invoiceUrl: string | null; valueCents: number; dueDate: string }
  paymentUrl: string | null
  session: CompanySessionBlock | null
}

/** Quem contratou a assinatura em curso, exibido em leitura. */
export interface ContractorOnFile {
  type: 'PJ' | 'PF'
  document: string
  name: string
  tradeName: string | null
  email: string
  representativeName: string | null
}

export interface RegularizationView {
  required: boolean
  reason?: 'FIRST_CHARGE_PENDING' | 'OVERDUE' | 'CHECKOUT_PENDING'
  situation?: BillingSituationKind
  daysOverdue?: number
  subscription?: {
    id: string
    planName: string
    cycle: string
    billingType: string
    valueCents: number
    installmentCount?: number | null
  }
  contractor?: ContractorOnFile | null
  chargeInFocus?: ChargeInFocus | null
  /** No anual parcelado, só o cartão. */
  allowedBillingTypes?: CheckoutBillingType[]
  terms?: { id: string; version: number }
}

/** Por que os complementos não podem ser alterados agora. */
export type ComplementsRestriction =
  | 'OPEN_CHARGE'
  | 'ANNUAL_CYCLE'
  | 'NOT_BILLED_BY_GATEWAY'

export interface ContractedModule {
  key: string
  name: string
  priceCents: number
}

/** O que está contratado hoje: base da evolução e dos complementos. */
export interface ContractingCurrent {
  intent: ContractingIntent
  restriction: ComplementsRestriction | null
  subscription: {
    id: string
    planId: string
    planName: string
    planType: string
    cycle: 'MONTHLY' | 'YEARLY'
    billingType: string
    /** A mensalidade de hoje, como o Asaas cobra. */
    recurringCents: number
    /** Quando um complemento incluído agora começa a ser cobrado. */
    nextChargeDate: string
    additionalUsers: number
    additionalUserPriceCents: number
    maxAdditionalUsers: number
    modules: ContractedModule[]
  } | null
  availableModules?: (ContractedModule & { description: string | null })[]
  contractor?: ContractorOnFile | null
  terms?: { id: string; version: number } | null
}

/** Complementos: nada é cobrado agora; a mensalidade seguinte muda. */
export interface ComplementsQuote {
  lines: QuoteLine[]
  deltaMonthlyCents: number
  deltaCycleCents: number
  currentRecurringCents: number
  recurringCents: number
  chargedNowCents: 0
  additionalUsers: number
  nextChargeDate: string
}

export interface ComplementsRequest {
  /** Só os módulos que entram; os contratados continuam. */
  modules?: string[]
  /** Quantos usuários adicionais a assinatura passa a ter. */
  additionalUsers?: number
}

export interface ComplementsResult extends ComplementsQuote {
  subscriptionId: string
  session: CompanySessionBlock | null
}

/** Evolução: o contratante é o da assinatura em curso, não vem no pedido. */
export interface EvolutionRequest {
  planId: string
  cycle?: 'MONTHLY' | 'YEARLY'
  installmentCount?: number
  billingType: CheckoutBillingType
  modules?: string[]
  additionalUsers?: number
  couponCode?: string
  expectedTotalCents?: number
  termsAcceptance: { contractId: string; version: number; accepted: true }
}

export interface EvolutionResult extends CheckoutResult {
  creditCents: number
}

export interface ContractTerms {
  html: string
  contractId: string
  /** O nome da versão, como o contrato se apresenta (ex.: "— versão 1.1"). */
  name?: string
  version: number
}

/** Resposta das ações da contratação: o código de domínio é preservado. */
export interface CheckoutActionResult<T> {
  success: boolean
  data?: T
  status?: number
  /** Ex.: PRICE_CHANGED, REPRESENTATIVE_NOT_IN_REGISTRY, TERMS_OUTDATED. */
  code?: string
  message?: string
  /** Campos extras do erro (ex.: o orçamento novo em PRICE_CHANGED). */
  details?: Record<string, unknown>
}
