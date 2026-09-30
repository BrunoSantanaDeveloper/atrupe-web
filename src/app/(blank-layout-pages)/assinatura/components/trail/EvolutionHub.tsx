'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconArrowRight } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrencyToBrl } from '@/lib/utils'
import {
  fetchComplementsQuote,
  fetchPublicPlans,
  fetchQuote,
} from '@/actions/checkout'
import { useCheckoutStore } from '@/store/checkoutStore'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { planPresentation } from '@/lib/plans/methodTrail'
import type {
  ComplementsRestriction,
  ContractingCurrent,
  PlanStatesResponse,
} from '@/types/checkout'
import type { VisualPlanType } from '@/types/plans'

import { CheckoutShell } from '../checkout/CheckoutLayout'
import { ComparisonTable, allPlansReleased } from './ComparisonTable'
import { monthlyEquivalentCents, type Cycle } from './CycleToggle'
import {
  AddonCard,
  AddonsSection,
  CycleSwitch,
  PlanLogo,
  PlanOfferCard,
  UsersAddonCard,
} from './PlanOffer'

const RESTRICTION_TEXT: Record<ComplementsRestriction, string> = {
  OPEN_CHARGE:
    'Há uma cobrança em aberto. Regularize-a para incluir complementos.',
  ANNUAL_CYCLE:
    'A inclusão de complementos no plano anual ainda não está disponível.',
  NOT_BILLED_BY_GATEWAY:
    'Sua assinatura não é cobrada pelo gateway de pagamento. Fale com a Atrupe para incluir complementos.',
}

const PRINCIPAL_ADMIN_ONLY =
  'Só o administrador principal da conta (Usuário nº 1) altera o plano e os complementos.'

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' })

interface Props {
  planStates: PlanStatesResponse
  current: ContractingCurrent
}

/**
 * Etapa 1 para quem já tem plano: os complementos do plano atual e a
 * evolução para o próximo da trilha.
 *
 * Complemento incluído aqui é liberado na hora e entra na próxima
 * mensalidade — nada é cobrado agora. Na evolução, os complementos seguem com
 * o plano novo: os contratados chegam marcados, e o que for marcado aqui vai
 * junto.
 */
export function EvolutionHub({ planStates, current }: Props) {
  const router = useRouter()
  const { data: session } = useSession()
  const { setSelection } = useCheckoutStore()
  const sub = current.subscription!
  const contractedKeys = sub.modules.map((m) => m.key)
  // Alterar o plano e os complementos é do Administrador Principal da Conta
  // (contrato 1.1, 4.2); os demais veem a oferta, sem poder contratá-la.
  const isPrincipalAdmin = !!session?.company?.isOwner
  const restriction = current.restriction

  const [added, setAdded] = useState<string[]>([])
  const [users, setUsers] = useState(sub.additionalUsers)
  // Do anual só se evolui para o anual; do mensal, o anual aparece quando
  // está disponível.
  const currentAnnual = sub.cycle === 'YEARLY'
  const annualAvailable = !!planStates.annualCycleAvailable
  const [evolutionCycle, setEvolutionCycle] = useState<Cycle>(
    currentAnnual ? 'YEARLY' : 'MONTHLY',
  )
  const next = planStates.plans.find((p) => p.state === 'ELEGIVEL') ?? null
  const upcoming = planStates.plans.find((p) => p.state === 'EM_BREVE') ?? null
  const hasChanges = added.length > 0 || users > sub.additionalUsers

  const debounced = useDebouncedValue({ added, users }, 300)
  const debouncedHasChanges =
    debounced.added.length > 0 || debounced.users > sub.additionalUsers

  const complementsQuery = useQuery({
    queryKey: ['complements-quote', debounced],
    queryFn: async () => {
      const res = await fetchComplementsQuote({
        modules: debounced.added,
        additionalUsers: debounced.users,
      })
      if (!res.success || !res.data) throw new Error(res.message)
      return res.data
    },
    enabled: !restriction && debouncedHasChanges,
    placeholderData: (previous) => previous,
    retry: false,
  })

  const { data: evolution } = useQuery({
    queryKey: ['evolution-quote', next?.planId, debounced, evolutionCycle],
    queryFn: async () => {
      const res = await fetchQuote({
        planId: next!.planId,
        modules: [...contractedKeys, ...debounced.added],
        additionalUsers: debounced.users,
        cycle: evolutionCycle,
      })
      return res.success ? res.data : null
    },
    enabled: !!next,
    placeholderData: (previous) => previous,
  })

  const { data: publicPlans } = useQuery({
    queryKey: ['public-plans'],
    queryFn: async () => (await fetchPublicPlans()).data ?? [],
    staleTime: 5 * 60 * 1000,
  })
  const nextDetails = useMemo(
    () =>
      (publicPlans ?? []).find((p) => p.id === next?.planId) as
        | (VisualPlanType & { planType: string })
        | undefined,
    [publicPlans, next?.planId],
  )

  const toggleModule = (key: string, checked: boolean) =>
    setAdded((prev) =>
      checked
        ? prev.includes(key)
          ? prev
          : [...prev, key]
        : prev.filter((k) => k !== key),
    )

  const contractComplements = () => {
    if (!hasChanges) {
      toast.warning('Escolha um complemento para incluir.')
      return
    }
    setSelection({
      mode: 'COMPLEMENTS',
      planId: sub.planId,
      modules: added,
      additionalUsers: users,
      cycle: 'MONTHLY',
    })
    router.push('/assinatura/contratacao?modo=complementos')
  }

  const evolve = () => {
    if (!next) return
    setSelection({
      mode: 'EVOLUTION',
      planId: next.planId,
      modules: [...contractedKeys, ...added],
      additionalUsers: users,
      cycle: evolutionCycle,
    })
    router.push('/assinatura/contratacao?modo=evolucao')
  }

  const complements = complementsQuery.data
  const evolutionQuote = evolution?.quote ?? null
  const nextPresentation = next
    ? planPresentation(next.planType, nextDetails?.presentation)
    : null
  const nextVideo = nextPresentation?.video
    ? {
        url: nextPresentation.video.src,
        poster: nextPresentation.video.poster,
      }
    : nextDetails?.videoUrl
      ? { url: nextDetails.videoUrl }
      : null

  return (
    <CheckoutShell
      title="Planos"
      backHref="/configuracoes/empresa-e-sistema/assinatura"
    >
      <div className="flex flex-col gap-7">
        {next && (annualAvailable || currentAnnual) && (
          <div className="flex flex-col items-center gap-4 text-center">
            <CycleSwitch
              value={evolutionCycle}
              onChange={setEvolutionCycle}
              only={currentAnnual ? 'YEARLY' : undefined}
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-gray-200 bg-white px-5 py-4">
          <PlanLogo planType={sub.planType} name={sub.planName} />
          <span className="text-sm text-gray-600">
            Seu plano hoje:{' '}
            <strong className="font-semibold text-gray-900">
              {formatCurrencyToBrl(sub.recurringCents)}
              {currentAnnual ? '/ano' : '/mês'}
            </strong>
            , próxima cobrança em {formatDay(sub.nextChargeDate)}.
          </span>
        </div>

        {next && nextPresentation ? (
          <PlanOfferCard
            planType={next.planType}
            name={next.name}
            pitch={nextPresentation.pitch}
            actions={nextPresentation.actions}
            previousName={sub.planName}
            video={nextVideo}
            monthlyCents={
              evolutionQuote
                ? monthlyEquivalentCents(
                    evolutionQuote.recurringCents,
                    evolutionCycle,
                  )
                : null
            }
            priceNote={
              evolutionCycle === 'YEARLY' && evolutionQuote
                ? `Cobrança anual de ${formatCurrencyToBrl(evolutionQuote.recurringCents)}`
                : 'Cobrança mensal'
            }
            priceExtra={
              evolution === null ? (
                <p className="text-xs text-error-700" role="alert">
                  Não foi possível calcular o valor da evolução agora. Tente de
                  novo em instantes.
                </p>
              ) : evolutionQuote && evolutionQuote.creditCents > 0 ? (
                <p className="text-xs leading-[1.4] text-brand-600">
                  Primeira cobrança de{' '}
                  {formatCurrencyToBrl(evolutionQuote.totalCents)}: os dias não
                  usados do {sub.planName} viram{' '}
                  {formatCurrencyToBrl(evolutionQuote.creditCents)} de crédito.
                </p>
              ) : null
            }
            ctaLabel="Evoluir"
            onCta={evolve}
            ctaDisabled={restriction === 'OPEN_CHARGE' || !isPrincipalAdmin}
          />
        ) : upcoming ? (
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-600">
            <strong className="block font-semibold text-gray-900">
              {upcoming.name}: em breve
            </strong>
            A próxima etapa do Método ainda não foi liberada. Enquanto isso,
            você pode incluir complementos no plano atual.
          </div>
        ) : null}

        <AddonsSection
          footer={
            <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600">
                {!isPrincipalAdmin ? (
                  <span className="text-warning-700">
                    {PRINCIPAL_ADMIN_ONLY}
                  </span>
                ) : restriction ? (
                  <span className="text-warning-700">
                    {RESTRICTION_TEXT[restriction]}
                  </span>
                ) : hasChanges && complements ? (
                  <>
                    Nada é cobrado agora. A partir da mensalidade de{' '}
                    <strong>{formatDay(complements.nextChargeDate)}</strong>, o
                    valor passa de{' '}
                    {formatCurrencyToBrl(complements.currentRecurringCents)}{' '}
                    para{' '}
                    <strong>
                      {formatCurrencyToBrl(complements.recurringCents)}/mês
                    </strong>
                    .
                  </>
                ) : (
                  <>
                    Os complementos marcados seguem com a evolução. Para
                    incluí-los no plano atual: liberados na hora e cobrados a
                    partir da próxima mensalidade.
                  </>
                )}
                {hasChanges && complementsQuery.isError && (
                  <span className="mt-1 block text-error-700" role="alert">
                    {complementsQuery.error.message}
                  </span>
                )}
              </div>
              <Button
                type="button"
                variant="neutralOutline"
                className="flex-none"
                onClick={contractComplements}
                disabled={!!restriction || !isPrincipalAdmin}
                RightIcon={IconArrowRight}
              >
                Incluir no plano atual
              </Button>
            </div>
          }
        >
          {sub.modules.map((m) => (
            <AddonCard
              key={m.key}
              name={m.name}
              priceCents={m.priceCents}
              checked
              disabled
              onCheckedChange={() => undefined}
              badge={<Badge variant="light">Contratado</Badge>}
            />
          ))}
          {(current.availableModules ?? []).map((m) => (
            <AddonCard
              key={m.key}
              name={m.name}
              description={m.description}
              priceCents={m.priceCents}
              checked={added.includes(m.key)}
              disabled={!!restriction || !isPrincipalAdmin}
              onCheckedChange={(checked) => toggleModule(m.key, checked)}
            />
          ))}
          <UsersAddonCard
            value={users}
            min={sub.additionalUsers}
            max={sub.maxAdditionalUsers}
            disabled={!!restriction || !isPrincipalAdmin}
            onChange={setUsers}
            priceCents={sub.additionalUserPriceCents}
            hint={`Hoje você tem ${sub.additionalUsers}`}
          />
        </AddonsSection>

        {allPlansReleased(planStates.plans) && (
          <ComparisonTable
            plans={planStates.plans}
            currentPlanType={sub.planType}
          />
        )}
      </div>
    </CheckoutShell>
  )
}
