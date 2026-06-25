export type FiscalEnv = 'HOMOLOGACAO' | 'PRODUCAO'

export type ReadinessCheckStatus = 'PASS' | 'FAIL' | 'PENDING'

export interface ReadinessCheck {
  check: string
  status: ReadinessCheckStatus
  message?: string
}

export interface ReadinessResult {
  environment: FiscalEnv
  localReady: boolean
  ready: boolean
  requiresProviderRegistration: boolean | null
  /** Nomes dos checks com status FAIL — bloqueiam a ativação. */
  blocking: string[]
  checks: ReadinessCheck[]
  evaluatedAt: string
}

/** Rótulos amigáveis dos checks de readiness (sem segredos). */
export const READINESS_LABELS: Record<string, string> = {
  company_document: 'CNPJ da empresa',
  state_registration: 'Inscrição estadual (IE)',
  company_address: 'Endereço e código IBGE',
  certificate: 'Certificado digital',
  nfce_csc: 'CSC da NFC-e',
  nfce_numbering: 'Série e numeração',
  provider_registration: 'Cadastro no Invoicy',
  provider_authentication: 'Autenticação no Invoicy',
}

/** Ordem de exibição dos checks no diagnóstico. */
const CHECK_ORDER = [
  'company_document',
  'state_registration',
  'company_address',
  'certificate',
  'nfce_csc',
  'nfce_numbering',
  'provider_registration',
  'provider_authentication',
]

export function sortReadinessChecks(
  checks: ReadinessCheck[],
): ReadinessCheck[] {
  return [...checks].sort((a, b) => {
    const ia = CHECK_ORDER.indexOf(a.check)
    const ib = CHECK_ORDER.indexOf(b.check)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })
}

export function readinessLabel(check: string): string {
  return READINESS_LABELS[check] ?? check
}

export const ENV_LABEL: Record<FiscalEnv, string> = {
  HOMOLOGACAO: 'Homologação',
  PRODUCAO: 'Produção',
}
