'use server'

import { domainCall } from './domain-call'
import type { PlanFeatureMap } from '@/types/plans'

/**
 * O mapa público chave → plano a partir do qual ela está disponível
 * (contrato da camada de planos, §4): todas as chaves ativas do catálogo,
 * inclusive os módulos pagos, sem dado de empresa nenhuma.
 */
export async function fetchPlanFeatureMap() {
  return domainCall<PlanFeatureMap>((api) =>
    api.get('/plan/public/feature-map'),
  )
}
