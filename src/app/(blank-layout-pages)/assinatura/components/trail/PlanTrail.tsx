'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'

import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrencyToBrl } from '@/lib/utils'
import {
  fetchPublicModules,
  fetchPublicPlans,
  fetchQuote,
} from '@/actions/checkout'
import { useCheckoutStore } from '@/store/checkoutStore'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { planPresentation, previousPlanType } from '@/lib/plans/methodTrail'
import type { PlanStatesResponse } from '@/types/checkout'
import type { VisualPlanType } from '@/types/plans'

import { ArrivalNotice, CheckoutShell } from '../checkout/CheckoutLayout'
import { ComparisonTable, allPlansReleased } from './ComparisonTable'
import { monthlyEquivalentCents, type Cycle } from './CycleToggle'
import {
  AddonCard,
  AddonsSection,
  CycleSwitch,
  PlanOfferCard,
  UsersAddonCard,
} from './PlanOffer'

const MAX_ADDITIONAL_USERS = 20

interface Props {
  planStates: PlanStatesResponse
}

/**
 * Etapa 1 — o plano, no desenho do protótipo.
 *
 * O ciclo no topo; a etapa contratável agora num card com o vídeo ao lado (o
 * card é oferta, não catálogo: sem contratação, o Atrupe Start); os
 * complementos logo abaixo, somados ao preço do card, que vem do orçamento do
 * servidor; e a comparação recolhida, só quando todas as etapas estiverem
 * liberadas.
 */
export function PlanTrail({ planStates }: Props) {
  const router = useRouter()
  const { data: session } = useSession()
  const { selection, setSelection } = useCheckoutStore()

  // Volta da etapa do contrato com o que já tinha sido escolhido.
  const resumed = selection.mode === 'NEW'
  const [modules, setModules] = useState<string[]>(
    resumed ? selection.modules : [],
  )
  const [additionalUsers, setAdditionalUsers] = useState(
    resumed ? selection.additionalUsers : 0,
  )
  // O ciclo é preferência: o escolhido aqui ou no pagamento volta marcado.
  const annualAvailable = !!planStates.annualCycleAvailable
  const cycle: Cycle =
    annualAvailable && selection.cycle === 'YEARLY' ? 'YEARLY' : 'MONTHLY'

  const offer = planStates.plans.find((p) => p.state === 'ELEGIVEL') ?? null

  const trialEndsAt = session?.company?.plan?.trialEndsAt
  const trialExpired =
    session?.company?.plan?.name === 'TRIAL' &&
    !!trialEndsAt &&
    new Date(trialEndsAt) < new Date()

  const { data: publicPlans } = useQuery({
    queryKey: ['public-plans'],
    queryFn: async () => (await fetchPublicPlans()).data ?? [],
    staleTime: 5 * 60 * 1000,
  })
  const { data: publicModules, isLoading: isLoadingModules } = useQuery({
    queryKey: ['public-modules'],
    queryFn: async () => (await fetchPublicModules()).data ?? [],
    staleTime: 5 * 60 * 1000,
  })

  const debounced = useDebouncedValue({ modules, additionalUsers }, 300)
  const { data: quote } = useQuery({
    queryKey: ['trail-quote', offer?.planId, debounced, cycle],
    queryFn: async () => {
      const res = await fetchQuote({
        planId: offer!.planId,
        modules: debounced.modules,
        additionalUsers: debounced.additionalUsers,
        cycle,
      })
      return res.success ? res.data : null
    },
    enabled: !!offer,
    placeholderData: (previous) => previous,
  })

  const offerDetails = useMemo(
    () =>
      (publicPlans ?? []).find((p) => p.id === offer?.planId) as
        | (VisualPlanType & { planType: string; additionalUserPrice?: number })
        | undefined,
    [publicPlans, offer?.planId],
  )

  const toggleModule = (key: string, checked: boolean) =>
    setModules((prev) =>
      checked
        ? prev.includes(key)
          ? prev
          : [...prev, key]
        : prev.filter((k) => k !== key),
    )

  const beginContracting = () => {
    if (!offer) return
    setSelection({
      mode: 'NEW',
      planId: offer.planId,
      modules,
      additionalUsers,
      cycle,
    })
    router.push('/assinatura/contratacao')
  }

  const presentation = offer
    ? planPresentation(offer.planType, offerDetails?.presentation)
    : null

  const recurringCents = quote?.quote?.recurringCents
  const previous = offer ? previousPlanType(offer.planType) : null
  const previousName = previous
    ? planStates.plans.find((p) => p.planType === previous)?.name
    : null
  const video = presentation?.video
    ? { url: presentation.video.src, poster: presentation.video.poster }
    : offerDetails?.videoUrl
      ? { url: offerDetails.videoUrl }
      : null

  return (
    <CheckoutShell
      title="Planos"
      backHref={trialExpired ? '/logout' : '/dashboard'}
    >
      {trialExpired && (
        <ArrivalNotice
          tone="warning"
          title="Seu teste gratuito terminou"
          text="Contrate para voltar a usar a Atrupe. O que você cadastrou durante o teste continua guardado."
        />
      )}

      <div className="flex flex-col gap-7">
        {annualAvailable && (
          <div className="flex flex-col items-center gap-4 text-center">
            <CycleSwitch
              value={cycle}
              onChange={(next) => setSelection({ cycle: next })}
            />
          </div>
        )}

        {offer && presentation ? (
          <div className="pt-3">
            <PlanOfferCard
              planType={offer.planType}
              name={offer.name}
              pitch={presentation.pitch}
              actions={presentation.actions}
              previousName={previousName}
              video={video}
              monthlyCents={
                recurringCents != null
                  ? monthlyEquivalentCents(recurringCents, cycle)
                  : null
              }
              priceNote={
                cycle === 'YEARLY' && recurringCents != null
                  ? `Cobrança anual de ${formatCurrencyToBrl(recurringCents)}`
                  : 'Cobrança mensal'
              }
              ctaLabel="Começar"
              onCta={beginContracting}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-600">
            <strong className="block font-semibold text-gray-900">
              Nenhum plano disponível para contratação agora
            </strong>
            Fale com a Atrupe para saber quando a próxima etapa estará liberada.
          </div>
        )}

        <AddonsSection>
          {isLoadingModules ? (
            <Skeleton className="h-14 w-full rounded-lg" />
          ) : (
            (publicModules ?? []).map((m) => (
              <AddonCard
                key={m.key}
                name={m.name}
                description={m.description}
                priceCents={m.price}
                checked={modules.includes(m.key)}
                onCheckedChange={(checked) => toggleModule(m.key, checked)}
              />
            ))
          )}
          <UsersAddonCard
            value={additionalUsers}
            max={MAX_ADDITIONAL_USERS}
            onChange={setAdditionalUsers}
            priceCents={offerDetails?.additionalUserPrice}
          />
        </AddonsSection>

        {allPlansReleased(planStates.plans) && (
          <ComparisonTable
            plans={planStates.plans}
            currentPlanType={
              planStates.plans.find((p) => p.state === 'ATUAL')?.planType
            }
          />
        )}
      </div>
    </CheckoutShell>
  )
}
