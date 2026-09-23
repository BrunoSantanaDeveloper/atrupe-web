/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { clientMeta, domainCall } from './domain-call'
import type {
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

const call = domainCall

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
