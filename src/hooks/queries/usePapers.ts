'use client'

// Os papéis ativos da empresa (GR-0), para escolher o da variação e o de
// cada seção da apostila. Só com o recurso paper_register

import { useQuery } from '@tanstack/react-query'
import { getPapers } from '@/actions/papers'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { FEATURES } from '@/consts/features'

export function usePapers(enabled = true) {
  const { hasFeature } = usePlanFeatures()
  const active = enabled && hasFeature(FEATURES.PRODUCTS.PAPER_REGISTER)
  const query = useQuery({
    enabled: active,
    staleTime: 60_000,
    queryKey: ['papers-select'],
    queryFn: () => getPapers({}),
  })
  return { active, papers: query.data?.data ?? [], isLoading: query.isLoading }
}
