/** Onde um recurso é aplicado quando o plano não o inclui. */
export type FeatureEnforcementLevel = 'api' | 'tela' | 'nenhum'

export interface PlanMatrixFeature {
  key: string
  name: string
  description: string | null
  category: string | null
  categoryLabel: string | null
  enforcement: { level: FeatureEnforcementLevel; detail: string }
  dependsOn: string[]
  dependents: string[]
}

export interface PlanMatrixLimit {
  key: string
  name: string
  description: string | null
  unit: string | null
  min: number
  allowUnlimited: boolean
  enforced: boolean
  detail: string
}

export interface PlanMatrixPlan {
  id: string
  name: string
  planType: 'TRIAL' | 'START' | 'LITE' | 'PRO' | 'ELITE' | 'FULL'
  order: number
  isActive: boolean
  basePrice: number
  currentSubscriptions: number
  features: Record<string, boolean>
  limits: Record<string, number | null>
  defaults: { features: string[]; limits: Record<string, number> }
}

export interface PlanMatrix {
  plans: PlanMatrixPlan[]
  features: PlanMatrixFeature[]
  limits: PlanMatrixLimit[]
}

export interface PlanFeatureChange {
  key: string
  name: string
  enabled: boolean
  /** Entrou por dependência de outro recurso. */
  cascade: boolean
}

export interface PlanFeaturePreview {
  planId: string
  planName: string
  planType: string
  featureKey: string
  featureName: string
  enabled: boolean
  noChange: boolean
  changes: PlanFeatureChange[]
  requiresCascade: boolean
  currentSubscriptions: number
  affectedIfApplied: number
  affectedIfKept: number
  retainedGrants: number
  courtesyGrants: number
  requiresChoice: boolean
  enforcement: { level: FeatureEnforcementLevel; detail: string }
}

export interface PlanFeatureChangeResult {
  changed: boolean
  changes: PlanFeatureChange[]
  affected: number
  retainedGrantsCreated?: number
  retainedGrantsRemoved?: number
}

export interface PlanDefaultsDiff {
  planId: string
  planName: string
  planType: string
  enable: { key: string; name: string }[]
  disable: { key: string; name: string }[]
  limits: {
    key: string
    name: string
    value: number | null
    defaultValue: number
  }[]
  noChange: boolean
  currentSubscriptions: number
  requiresChoice: boolean
}

export interface PlanConfigHistoryEntry {
  id: string
  entityType: 'PLAN_FEATURE' | 'PLAN_LIMIT' | 'PLAN'
  planId: string | null
  planType: string | null
  featureKey: string | null
  limitKey: string | null
  action: 'ENABLED' | 'DISABLED' | 'VALUE_CHANGED' | 'AVAILABILITY_CHANGED'
  description: string
  changes: {
    before?: { enabled?: boolean; value?: number | null; isActive?: boolean }
    after?: { enabled?: boolean; value?: number | null; isActive?: boolean }
  } | null
  metadata: Record<string, unknown> | null
  createdBy: string | null
  createdByName: string | null
  createdAt: string
}

export interface PlanConfigHistoryPage {
  data: PlanConfigHistoryEntry[]
  total: number
  page: number
  lastPage: number
}

export type CompanyFeatureState =
  | 'PLAN'
  | 'RETAINED'
  | 'COURTESY'
  | 'EXPIRED'
  | 'OFF'

export interface CompanyFeaturesView {
  company: { id: string; name: string }
  subscription: {
    id: string
    status: string
    planId: string
    planName: string
    planType: string
  } | null
  features: {
    key: string
    name: string
    category: string | null
    categoryLabel: string | null
    enforcement: { level: FeatureEnforcementLevel; detail: string }
    state: CompanyFeatureState
    grant: {
      source: string | null
      reason: string | null
      grantedByName: string | null
      createdAt: string
      expiresAt: string | null
    } | null
  }[]
}
