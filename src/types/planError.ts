/**
 * Erro de plano devolvido pela API (contrato da camada de planos, §3 e §8).
 *
 * O servidor recusa com 403 e o corpo do filtro de exceção
 * (`{ statusCode, timestamp, path, userMessage }`); o erro de plano vai em
 * `userMessage`. Os helpers de `_cruds.ts` o repassam em `planError` sem
 * mudar o `code` que já devolvem, que alguns chamadores comparam.
 */
export type PlanErrorCode = 'FEATURE_NOT_AVAILABLE' | 'PLAN_LIMIT_REACHED'

/** O plano a partir do qual a chave está disponível. */
export interface PlanAvailableFrom {
  planType: string
  name: string
  /** O plano pode ser contratado hoje. */
  isActive: boolean
}

export interface PlanError {
  code: PlanErrorCode
  /** A chave (ou as chaves) que o plano não tem, no FEATURE_NOT_AVAILABLE. */
  feature?: string | string[]
  /** O limite estourado (ex.: `max_users`), no PLAN_LIMIT_REACHED. */
  limit?: string
  value?: number
  /** O plano atual da empresa; nulo sem assinatura ativa. */
  planType?: string | null
  /** Nulo quando nenhum plano tem a chave. */
  availableFrom?: PlanAvailableFrom | null
  /** A chave é um módulo contratado à parte (ex.: `nota_fiscal`). */
  module?: boolean
  /** O texto do servidor, que já diz o plano ou o limite. */
  message: string
}
