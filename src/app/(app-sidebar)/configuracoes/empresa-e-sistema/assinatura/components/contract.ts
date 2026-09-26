import { maskCnpj } from '@/lib/utils'

/** O contrato que rege a assinatura, como `/contract/accepted` o devolve. */
export interface AcceptedContract {
  html: string
  contractId: string
  name?: string
  version: number
  acceptedAt: string
  ipAddress: string | null
  acceptedBy?: { name: string; email: string }
  contractor?: {
    type: 'PJ' | 'PF'
    document: string
    name: string
    tradeName?: string | null
    email: string
  }
  representative?: {
    name: string
    /** Já mascarado pelo backend. */
    cpf: string | null
    verified: boolean | null
  } | null
  /** O Usuário nº 1 indicado no aceite. */
  principalAdmin?: { name: string; email: string | null } | null
}

/**
 * O documento do contratante. O CPF de pessoa física sai mascarado, como o do
 * representante: a tela é vista por quem tem acesso à assinatura, não só pelo
 * titular.
 */
export function contractorDocumentLabel(
  contractor: NonNullable<AcceptedContract['contractor']>,
): string {
  const digits = contractor.document.replace(/\D/g, '')
  if (contractor.type === 'PJ') return `CNPJ ${maskCnpj(digits)}`
  return digits.length === 11
    ? `CPF ***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`
    : 'CPF'
}
