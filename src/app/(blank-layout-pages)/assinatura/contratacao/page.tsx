'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'
import { useCheckoutStore } from '@/store/checkoutStore'
import { ComplementsFlow } from './components/ComplementsFlow'
import { ContractingFlow } from './components/ContractingFlow'
import { EvolutionFlow } from './components/EvolutionFlow'
import { RegularizationFlow } from './components/RegularizationFlow'

function ContractingRouter() {
  const searchParams = useSearchParams()
  const { selection } = useCheckoutStore()
  // Sem `modo` na URL, vale o que foi escolhido na página de planos.
  const modo =
    searchParams.get('modo') ??
    (selection.mode === 'EVOLUTION'
      ? 'evolucao'
      : selection.mode === 'COMPLEMENTS'
        ? 'complementos'
        : null)

  switch (modo) {
    case 'regularizacao':
      return <RegularizationFlow />
    case 'evolucao':
      return <EvolutionFlow />
    case 'complementos':
      return <ComplementsFlow />
    default:
      return <ContractingFlow />
  }
}

/**
 * Etapas 2 e 3 da contratação (contrato e pagamento) — e as telas que têm a
 * mesma forma: a evolução de plano e os complementos, com o contratante da
 * assinatura em curso em leitura, e a regularização de uma cobrança em aberto.
 */
export default function ContractingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <Spinner />
        </div>
      }
    >
      <ContractingRouter />
    </Suspense>
  )
}
