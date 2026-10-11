'use client'

import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'

import { fetchPlanFeatureMap } from '@/actions/planCatalog'
import { PLAN_SEQUENCE } from '@/lib/plans/methodTrail'
import type { PlanAvailableFrom } from '@/types/planError'
import type { PlanFeatureMapEntry } from '@/types/plans'

export const PLAN_FEATURE_MAP_QUERY_KEY = ['plan-feature-map']

/** Posição do plano na trilha; fora dela, depois de todos. */
const planOrder = (plan: PlanAvailableFrom) => {
  const index = PLAN_SEQUENCE.indexOf(
    plan.planType as (typeof PLAN_SEQUENCE)[number],
  )
  return index < 0 ? PLAN_SEQUENCE.length : index
}

/**
 * O mapa público chave → plano que a libera (GET /plan/public/feature-map,
 * contrato da camada de planos, §4), com cache de 10 min. Alimenta a parede
 * quando a tela é aberta direto, sem um erro da API que diga o plano.
 */
export function usePlanCatalog() {
  const query = useQuery({
    queryKey: PLAN_FEATURE_MAP_QUERY_KEY,
    queryFn: async () => {
      const res = await fetchPlanFeatureMap()
      if (!res.success || !res.data) {
        throw new Error(
          res.message || 'Não foi possível carregar o mapa de planos.',
        )
      }
      return res.data.features
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  })
  const features = query.data

  /**
   * O plano a partir do qual a chave existe. Com várias chaves, o de menor
   * ordem (basta uma) ou, com `requireAll`, o de maior. `undefined` enquanto
   * o mapa não chega, se falhou ou se a chave não está nele; `null` quando
   * nenhum plano tem a chave.
   */
  const getAvailableFrom = useCallback(
    (
      feature: string | string[],
      requireAll = false,
    ): PlanAvailableFrom | null | undefined => {
      if (!features) return undefined
      const keys = Array.isArray(feature) ? feature : [feature]
      const entries = keys.map((key) => features.find((f) => f.key === key))
      const known = entries.filter(
        (entry): entry is PlanFeatureMapEntry => !!entry,
      )
      if (!known.length || (requireAll && known.length < keys.length)) {
        return undefined
      }

      const plans = known.map((entry) => entry.availableFrom)
      if (requireAll) {
        if (plans.some((plan) => plan === null)) return null
        return (plans as PlanAvailableFrom[]).reduce((last, plan) =>
          planOrder(plan) > planOrder(last) ? plan : last,
        )
      }

      const available = plans.filter(
        (plan): plan is PlanAvailableFrom => !!plan,
      )
      if (!available.length) return null
      return available.reduce((first, plan) =>
        planOrder(plan) < planOrder(first) ? plan : first,
      )
    },
    [features],
  )

  return { ...query, features, getAvailableFrom }
}
