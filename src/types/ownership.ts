/** Um período de titularidade: quem respondeu pela conta, de quando a quando. */
export interface OwnershipPeriod {
  holderName: string
  document: string | null
  email: string | null
  startedAt: string
  endedAt: string | null
}

/** GET /ownership */
export interface OwnershipView {
  /** Quem está logado é o titular: só ele transfere e cancela a assinatura. */
  isOwner: boolean
  owner: { name: string; email: string } | null
  current: OwnershipPeriod | null
  previous: OwnershipPeriod[]
  pending: {
    targetEmail: string
    sentAt: string
    expiresAt: string
    daysLeft: number
    sentByName: string
  } | null
  /** Por que a transferência não pode ser enviada agora (cobrança em aberto, filiais). */
  blocked: { code: string; message: string } | null
  canSend: boolean
  /** Só fora de produção: o link do convite, para testar sem caixa de e-mail. */
  devInviteUrl?: string
}

export type InviteState =
  | 'PENDING'
  | 'CANCELED'
  | 'EXPIRED'
  | 'ACCEPTED'
  | 'INVALID'

/** POST /ownership/invite — o que o link do convite mostra. */
export interface TransferInvite {
  state: InviteState
  message: string | null
  companyName?: string
  senderName?: string
  targetEmail?: string
  sentAt?: string
  expiresAt?: string
  daysLeft?: number
  emailHasAccount?: boolean
  blocked?: { code: string; message: string } | null
  terms?: {
    contractId: string
    name?: string
    version: number
    html: string
  }
}

/** POST /ownership/invite/company */
export interface InviteCompanyView {
  found: boolean
  cnpj: string
  legalName?: string
  tradeName?: string | null
  registrationStatus?: string | null
  isActive?: boolean
  canVerifyRepresentative?: boolean
  /** O CNPJ já tem ambiente na Atrupe: a transferência será recusada. */
  inUse: boolean
}

export interface AcceptTransferRequest {
  token: string
  name: string
  password: string
  company: { cnpj: string; legalName?: string; tradeName?: string }
  representative: { cpf: string; name?: string; isSelf: boolean }
  termsAcceptance: { contractId: string; version: number; accepted: boolean }
}

export interface AcceptTransferResult {
  accepted: true
  email: string
  companyName: string
}

/** GET /ownership/fiscal-history — notas do CNPJ anterior, só para consulta. */
export interface FiscalHistoryLock {
  lockedBefore: string
  historicalEmitterIds: string[]
  reason: string
}
