'use server'

import { domainCall } from './domain-call'
import type {
  CompanyFeaturesView,
  PlanConfigHistoryPage,
  PlanDefaultsDiff,
  PlanFeatureChangeResult,
  PlanFeaturePreview,
  PlanMatrix,
} from '@/types/planConfig'

/**
 * Configuração dos planos pelo superadmin (Super Admin › Sistema › Planos).
 *
 * Usa o `domainCall` para preservar o código de domínio do erro, que o painel
 * usa para decidir o que fazer: CHOICE_REQUIRED (falta dizer se a retirada
 * atinge as assinaturas atuais), DEPENDENCY_REQUIRED (falta confirmar a
 * cascata), PASSWORD_REQUIRED / INVALID_PASSWORD e PREVIEW_CHANGED (a
 * contagem de assinaturas mudou desde a prévia).
 */

export async function fetchPlanMatrix() {
  return domainCall<PlanMatrix>((api) => api.get('/plan/config/matrix'))
}

export async function fetchFeaturePreview(
  planId: string,
  featureKey: string,
  enabled: boolean,
) {
  return domainCall<PlanFeaturePreview>((api) =>
    api.get('/plan/config/preview', {
      params: { planId, featureKey, enabled },
    }),
  )
}

export async function savePlanFeature(
  planId: string,
  body: {
    featureKey: string
    enabled: boolean
    keepCurrentSubscriptions?: boolean
    cascade?: boolean
    expectedAffected?: number
    password?: string
    source?: 'PANEL' | 'REVERT'
    revertOf?: string
  },
) {
  return domainCall<PlanFeatureChangeResult>((api) =>
    api.patch(`/plan/config/${planId}/features`, body),
  )
}

export async function savePlanLimit(
  planId: string,
  body: {
    limitKey: string
    value: number
    expectedAffected?: number
    password?: string
    source?: 'PANEL' | 'REVERT'
    revertOf?: string
  },
) {
  return domainCall<{ changed: boolean; affected: number }>((api) =>
    api.patch(`/plan/config/${planId}/limits`, body),
  )
}

export async function fetchPlanDefaultsDiff(planId: string) {
  return domainCall<PlanDefaultsDiff>((api) =>
    api.get(`/plan/config/${planId}/defaults-diff`),
  )
}

export async function restorePlanDefaults(
  planId: string,
  body: {
    keepCurrentSubscriptions?: boolean
    expectedAffected?: number
    password?: string
  },
) {
  return domainCall<{ changed: boolean; affected: number }>((api) =>
    api.post(`/plan/config/${planId}/restore-default`, body),
  )
}

export async function fetchPlanConfigHistory(params: {
  planId?: string
  featureKey?: string
  page?: number
  limit?: number
}) {
  return domainCall<PlanConfigHistoryPage>((api) =>
    api.get('/plan/config/history/list', { params }),
  )
}

export async function fetchCompanyFeatures(companyId: string) {
  return domainCall<CompanyFeaturesView>((api) =>
    api.get(`/plan/config/companies/${companyId}/features`),
  )
}

export async function saveCompanyFeature(
  companyId: string,
  body: {
    featureKey: string
    enabled: boolean
    reason?: string
    expiresAt?: string
    password?: string
  },
) {
  return domainCall<{ changed: boolean }>((api) =>
    api.patch(`/plan/config/companies/${companyId}/features`, body),
  )
}
