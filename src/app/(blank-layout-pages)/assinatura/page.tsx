'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Spinner } from '@/components/ui/spinner'
import { fetchContractingCurrent, fetchPlanStates } from '@/actions/checkout'
import { EvolutionHub } from './components/trail/EvolutionHub'
import { PlanTrail } from './components/trail/PlanTrail'
import { LegacySubscriptionPage } from './LegacySubscriptionPage'

/**
 * Entrada da assinatura. Decide o fluxo pela situação da empresa, que vem do
 * servidor:
 * - sem contratação → etapa 1 da contratação em três etapas (a trilha);
 * - com cobrança em aberto → regularização;
 * - com plano pago em dia → complementos do plano atual e evolução para o
 *   próximo da trilha.
 *
 * Se a situação não puder ser lida, cai na tela anterior: a pessoa nunca fica
 * sem como contratar — e o frontend pode ir ao ar antes do backend novo.
 */
export default function SubscriptionPage() {
  const router = useRouter()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['plan-states'],
    queryFn: async () => {
      const res = await fetchPlanStates()
      if (!res.success || !res.data) throw new Error(res.message)
      return res.data
    },
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const regularize = data?.intent === 'REGULARIZATION'
  const evolution = data?.intent === 'EVOLUTION'

  const current = useQuery({
    queryKey: ['contracting-current'],
    queryFn: async () => {
      const res = await fetchContractingCurrent()
      if (!res.success || !res.data?.subscription) throw new Error(res.message)
      return res.data
    },
    enabled: evolution,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (regularize) router.replace('/assinatura/contratacao?modo=regularizacao')
  }, [regularize, router])

  if (isLoading || regularize || (evolution && current.isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Spinner />
      </div>
    )
  }

  if (isError || !data) return <LegacySubscriptionPage />

  if (evolution) {
    return current.data ? (
      <EvolutionHub planStates={data} current={current.data} />
    ) : (
      <LegacySubscriptionPage />
    )
  }

  return <PlanTrail planStates={data} />
}
