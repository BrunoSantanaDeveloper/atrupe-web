/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  PlanAvailableFrom,
  PlanError,
  PlanErrorCode,
} from '@/types/planError'

/**
 * Texto do 403 que não diz o motivo. O guard de permissão recusa com o padrão
 * do Nest ("Forbidden resource"), que chegava assim à tela.
 */
export const FORBIDDEN_MESSAGE = 'Você não tem permissão para esta ação.'

const PLAN_ERROR_CODES: readonly PlanErrorCode[] = [
  'FEATURE_NOT_AVAILABLE',
  'PLAN_LIMIT_REACHED',
]

export function isPlanErrorCode(code: unknown): code is PlanErrorCode {
  return PLAN_ERROR_CODES.includes(code as PlanErrorCode)
}

/**
 * 403 sem código de domínio e sem texto próprio: o do guard de permissão. Um
 * 403 com código (plano, bloqueio, titular) ou com mensagem do servidor
 * ("Orçamento pertence a outra empresa") continua com o texto que veio.
 */
export function isGenericForbidden(payload: any): boolean {
  const userMessage = payload?.userMessage
  const statusCode = Number(payload?.statusCode ?? userMessage?.statusCode)
  if (statusCode !== 403) return false
  if (userMessage && typeof userMessage === 'object' && userMessage.code) {
    return false
  }
  const message =
    typeof userMessage === 'string' ? userMessage : userMessage?.message
  return !message || message === 'Forbidden resource' || message === 'Forbidden'
}

/**
 * Mensagem legível a partir do corpo de erro da API.
 *
 * O HttpExceptionFilter do backend responde `{ statusCode, timestamp, path,
 * userMessage }` — não existe `message` na raiz — e o 400 do class-validator
 * traz `userMessage.message` como array. Quem lia `data.message` direto
 * mostrava "Erro desconhecido." ou o array cru.
 */
export function extractApiErrorMessage(payload: any): string {
  if (isGenericForbidden(payload)) return FORBIDDEN_MESSAGE

  const userMessage = payload?.userMessage
  const message =
    userMessage?.message ||
    payload?.message ||
    payload?.data?.message ||
    payload?.data?.error ||
    userMessage

  return Array.isArray(message)
    ? message[0]
    : typeof message === 'string'
      ? message
      : 'Erro desconhecido.'
}

function parseAvailableFrom(value: any): PlanAvailableFrom | null | undefined {
  if (value === null) return null
  if (!value || typeof value !== 'object') return undefined
  if (typeof value.planType !== 'string') return undefined
  return {
    planType: value.planType,
    name: typeof value.name === 'string' ? value.name : value.planType,
    isActive: !!value.isActive,
  }
}

/**
 * O erro de plano (FEATURE_NOT_AVAILABLE ou PLAN_LIMIT_REACHED) a partir do
 * corpo de erro da API; `undefined` para qualquer outro erro. Só leva os
 * campos que vieram, para o retorno das server actions continuar
 * serializável.
 */
export function parsePlanError(payload: any): PlanError | undefined {
  const body = payload?.userMessage
  if (!body || typeof body !== 'object' || !isPlanErrorCode(body.code)) {
    return undefined
  }

  const rawMessage = Array.isArray(body.message)
    ? body.message[0]
    : body.message
  const planError: PlanError = {
    code: body.code,
    message:
      typeof rawMessage === 'string' && rawMessage
        ? rawMessage
        : body.code === 'PLAN_LIMIT_REACHED'
          ? 'O limite do plano foi atingido.'
          : 'O recurso não está disponível no seu plano.',
  }

  if (typeof body.feature === 'string' || Array.isArray(body.feature)) {
    planError.feature = body.feature
  }
  if (typeof body.limit === 'string') planError.limit = body.limit
  if (typeof body.value === 'number') planError.value = body.value
  if (typeof body.planType === 'string' || body.planType === null) {
    planError.planType = body.planType
  }
  const availableFrom = parseAvailableFrom(body.availableFrom)
  if (availableFrom !== undefined) planError.availableFrom = availableFrom
  if (typeof body.module === 'boolean') planError.module = body.module

  return planError
}

/**
 * O erro de plano do retorno de uma ação: o `planError` dos helpers de
 * `_cruds`, ou o código que o `domainCall` preserva (com os campos em
 * `details`).
 */
export function planErrorFromResult(result: any): PlanError | undefined {
  if (result?.planError) return result.planError
  if (!isPlanErrorCode(result?.code)) return undefined
  return parsePlanError({
    userMessage: {
      ...(result.details ?? {}),
      code: result.code,
      message: result.message,
    },
  })
}
