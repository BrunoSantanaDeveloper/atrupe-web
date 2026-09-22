/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { headers } from 'next/headers'
import apiInstance from '@/lib/api'
import type {
  CheckoutActionResult,
  CheckoutRequest,
  CheckoutResult,
  CompanyRegistryView,
  CompanySessionBlock,
  ComplementsQuote,
  ComplementsRequest,
  ComplementsResult,
  ContractingCurrent,
  ContractTerms,
  EvolutionRequest,
  EvolutionResult,
  PlanStatesResponse,
  QuoteRequest,
  QuoteResponse,
  RegularizationView,
  RepresentativeCheck,
  CheckoutBillingType,
} from '@/types/checkout'

/**
 * Ações da contratação em três etapas.
 *
 * Diferem das ações genéricas de `_cruds` em dois pontos que a contratação
 * precisa: preservam o CÓDIGO de domínio do erro (PRICE_CHANGED,
 * REPRESENTATIVE_NOT_IN_REGISTRY...), que a tela usa para decidir o que
 * fazer; e repassam o IP e o navegador de quem aceitou o contrato — sem isso,
 * o aceite registraria o IP do servidor do frontend.
 */

async function clientMeta(): Promise<Record<string, string>> {
  const h = headers()
  const forwarded = h.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || h.get('x-real-ip') || ''
  const userAgent = h.get('user-agent') || ''
  return {
    ...(ip ? { 'x-user-ip': ip } : {}),
    ...(userAgent ? { 'x-user-agent': userAgent } : {}),
  }
}

async function call<T>(
  request: (
    api: Awaited<ReturnType<typeof apiInstance>>,
  ) => Promise<{ data: T }>,
): Promise<CheckoutActionResult<T>> {
  try {
    const res = await request(await apiInstance())
    return { success: true, data: res.data }
  } catch (error: any) {
    if (error?.digest?.startsWith?.('NEXT_REDIRECT')) throw error
    const payload = error?.response?.data
    const userMessage = payload?.userMessage
    const body =
      userMessage && typeof userMessage === 'object' ? userMessage : {}
    const rawMessage =
      typeof userMessage === 'string' ? userMessage : body.message
    const message = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { code, message: _ignored, statusCode, error: _e, ...details } = body

    return {
      success: false,
      status: error?.response?.status,
      code,
      message: message || 'Não foi possível concluir agora. Tente novamente.',
      details,
    }
  }
}

export async function fetchPlanStates() {
  return call<PlanStatesResponse>((api) =>
    api.get('/subscriptions/plan-states'),
  )
}

export async function fetchQuote(input: QuoteRequest) {
  return call<QuoteResponse>((api) => api.post('/subscriptions/quote', input))
}

export async function lookupCompany(cnpj: string) {
  const digits = cnpj.replace(/\D/g, '')
  return call<CompanyRegistryView>((api) =>
    api.get(`/subscriptions/checkout/company/${digits}`),
  )
}

export async function checkRepresentative(cnpj: string, cpf: string) {
  return call<RepresentativeCheck>((api) =>
    api.post('/subscriptions/checkout/representative-check', { cnpj, cpf }),
  )
}

export async function fetchContractTerms() {
  return call<ContractTerms>((api) => api.get('/contract/terms'))
}

export async function submitCheckout(
  input: CheckoutRequest,
  idempotencyKey: string,
) {
  const meta = await clientMeta()
  return call<CheckoutResult>((api) =>
    api.post('/subscriptions/checkout', input, {
      headers: { 'idempotency-key': idempotencyKey, ...meta },
    }),
  )
}

export async function fetchRegularization() {
  return call<RegularizationView>((api) =>
    api.get('/subscriptions/regularization'),
  )
}

export async function submitRegularization(
  input: {
    billingType: CheckoutBillingType
    termsAcceptance: { contractId: string; version: number; accepted: true }
  },
  idempotencyKey: string,
) {
  const meta = await clientMeta()
  return call<{
    paymentUrl: string | null
    session: CompanySessionBlock | null
  }>((api) =>
    api.post('/subscriptions/regularization', input, {
      headers: { 'idempotency-key': idempotencyKey, ...meta },
    }),
  )
}

export async function fetchContractingCurrent() {
  return call<ContractingCurrent>((api) =>
    api.get('/subscriptions/contracting/current'),
  )
}

export async function fetchComplementsQuote(input: ComplementsRequest) {
  return call<ComplementsQuote>((api) =>
    api.post('/subscriptions/complements/quote', input),
  )
}

export async function submitComplements(
  input: ComplementsRequest & {
    expectedRecurringCents?: number
    termsAcceptance: { contractId: string; version: number; accepted: true }
  },
  idempotencyKey: string,
) {
  const meta = await clientMeta()
  return call<ComplementsResult>((api) =>
    api.post('/subscriptions/complements', input, {
      headers: { 'idempotency-key': idempotencyKey, ...meta },
    }),
  )
}

export async function submitEvolution(
  input: EvolutionRequest,
  idempotencyKey: string,
) {
  const meta = await clientMeta()
  return call<EvolutionResult>((api) =>
    api.post('/subscriptions/evolution', input, {
      headers: { 'idempotency-key': idempotencyKey, ...meta },
    }),
  )
}

export async function fetchCompanySession() {
  return call<CompanySessionBlock>((api) => api.get('/subscriptions/session'))
}

export async function fetchPublicPlans() {
  return call<
    {
      id: string
      name: string
      planType: string
      order: number
      basePrice?: number
      additionalUserPrice?: number
      isActive: boolean
      videoUrl: string | null
      sections: { concept: any; features: any }
    }[]
  >((api) => api.get('/plan/public/subscription'))
}

export async function fetchPublicModules() {
  return call<
    {
      id: string
      key: string
      name: string
      description: string | null
      price: number
    }[]
  >((api) => api.get('/plan/public/modules'))
}
