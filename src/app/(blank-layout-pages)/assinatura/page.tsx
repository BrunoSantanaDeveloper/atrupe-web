'use client'

import { useEffect } from 'react'
import { useRouter } from '@/hooks/useRouter'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Spinner } from '@/components/ui/spinner'
import { fetchContractingCurrent, fetchPlanStates } from '@/actions/checkout'
import { EvolutionHub } from './components/trail/EvolutionHub'
import { PlanTrail } from './components/trail/PlanTrail'

/**
 * Entrada da assinatura. Decide o fluxo pela situação da empresa, que vem do
 * servidor:
 * - sem contratação → etapa 1 da contratação em três etapas (a trilha);
 * - com cobrança em aberto → regularização;
 * - com plano pago em dia → complementos do plano atual e evolução para o
 *   próximo da trilha.
 *
 * Se a situação não puder ser lida, a tela diz isso e oferece tentar de novo:
 * contratar sem saber a situação da empresa poderia cobrar em dobro.
 */
export default function SubscriptionPage() {
  const router = useRouter()
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
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

  if (isError || !data || (evolution && !current.data)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <EmptyState
          iconType="error"
          title="Não foi possível carregar a sua assinatura"
          description="A situação da assinatura não pôde ser lida agora. Tente novamente em instantes."
          action={
            <Button
              isLoading={isRefetching || current.isRefetching}
              onClick={() => {
                refetch()
                if (evolution) current.refetch()
              }}
            >
              Tentar novamente
            </Button>
          }
        />
      </div>
    )
  }

  if (evolution && current.data) {
    return <EvolutionHub planStates={data} current={current.data} />
  }

  return <PlanTrail planStates={data} />
}
