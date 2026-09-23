'use client'

import { useMemo, useState } from 'react'
import Image, { StaticImageData } from 'next/image'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  IconArrowRight,
  IconMinus,
  IconPlayerPlayFilled,
  IconPlus,
} from '@tabler/icons-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrencyToBrl } from '@/lib/utils'
import { VideoDialog } from '@/app/(app-sidebar)/academy/_components/VideoDialog'
import {
  fetchComplementsQuote,
  fetchPublicPlans,
  fetchQuote,
} from '@/actions/checkout'
import { useCheckoutStore } from '@/store/checkoutStore'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import type {
  ComplementsRestriction,
  ContractingCurrent,
  PlanStatesResponse,
} from '@/types/checkout'
import type { VisualPlanType } from '@/types/plans'

import { CheckoutHeader } from '../checkout/CheckoutHeader'
import { ComparisonTable } from './ComparisonTable'
import { CycleToggle, monthlyEquivalentCents, type Cycle } from './CycleToggle'

import pro from '@/assets/images/pro-logo.png'
import lite from '@/assets/images/lite-logo.png'
import full from '@/assets/images/full-logo.png'
import elite from '@/assets/images/elite-logo.png'
import start from '@/assets/images/start-logo.png'
import atrupe from '@/assets/images/atrupe-logo.png'

const LOGOS: Record<string, StaticImageData> = {
  START: start,
  LITE: lite,
  PRO: pro,
  ELITE: elite,
  FULL: full,
}

const RESTRICTION_TEXT: Record<ComplementsRestriction, string> = {
  OPEN_CHARGE:
    'Há uma cobrança em aberto. Regularize-a para incluir complementos.',
  ANNUAL_CYCLE:
    'A inclusão de complementos no plano anual ainda não está disponível.',
  NOT_BILLED_BY_GATEWAY:
    'Sua assinatura não é cobrada pelo gateway de pagamento. Fale com a Atrupe para incluir complementos.',
}

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
  const { setSelection } = useCheckoutStore()
  const sub = current.subscription!
  const contractedKeys = sub.modules.map((m) => m.key)
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
  const [video, setVideo] = useState<{ url: string; title: string } | null>(
    null,
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
  const concept = nextDetails?.sections?.concept

  return (
    <div className="w-full bg-gray-100 min-h-screen">
      <CheckoutHeader
        title="Plano e complementos"
        backHref="/configuracoes/empresa-e-sistema/assinatura"
      />

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Sua assinatura
          </h2>
          <p className="text-gray-600">
            Inclua complementos no plano atual ou evolua para a próxima etapa do
            Método.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 flex flex-wrap items-center justify-between gap-4">
                <Image
                  src={LOGOS[sub.planType] ?? atrupe}
                  alt={sub.planName}
                  height={40}
                  className="h-10 w-auto"
                />
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {currentAnnual ? 'Anuidade atual' : 'Mensalidade atual'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrencyToBrl(sub.recurringCents)}
                    <span className="text-base font-normal text-gray-600">
                      {currentAnnual ? '/ano' : '/mês'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Próxima cobrança em {formatDay(sub.nextChargeDate)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-700">
                Complementos
              </h2>
              <Card>
                <CardContent className="p-6 space-y-5">
                  {restriction && (
                    <Alert
                      variant="warning"
                      className="border-warning-200 bg-warning-50"
                    >
                      <AlertDescription className="text-warning-700">
                        {RESTRICTION_TEXT[restriction]}
                      </AlertDescription>
                    </Alert>
                  )}

                  {sub.modules.map((m) => (
                    <div key={m.key} className="flex items-start gap-3">
                      <Checkbox checked disabled aria-label={m.name} />
                      <span className="flex-1 font-medium text-gray-800">
                        {m.name}
                      </span>
                      <Badge variant="light">Contratado</Badge>
                      <span className="text-gray-800 whitespace-nowrap">
                        {formatCurrencyToBrl(m.priceCents)}/mês
                      </span>
                    </div>
                  ))}

                  {(current.availableModules ?? []).map((m) => (
                    <label
                      key={m.key}
                      className="flex items-start gap-3 cursor-pointer"
                    >
                      <Checkbox
                        checked={added.includes(m.key)}
                        disabled={!!restriction}
                        onCheckedChange={(v) => toggleModule(m.key, !!v)}
                      />
                      <span className="flex-1">
                        <span className="block font-medium text-gray-800">
                          {m.name}
                        </span>
                        {m.description && (
                          <span className="block text-sm text-gray-600 whitespace-pre-line">
                            {m.description}
                          </span>
                        )}
                      </span>
                      <span className="text-gray-800 whitespace-nowrap">
                        {formatCurrencyToBrl(m.priceCents)}/mês
                      </span>
                    </label>
                  ))}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-800">
                        Usuários adicionais
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrencyToBrl(sub.additionalUserPriceCents)}/mês
                        por usuário · hoje você tem {sub.additionalUsers}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="neutralLight"
                        aria-label="Remover usuário"
                        disabled={!!restriction || users <= sub.additionalUsers}
                        onClick={() =>
                          setUsers((n) => Math.max(sub.additionalUsers, n - 1))
                        }
                      >
                        <IconMinus size={16} />
                      </Button>
                      <span
                        className="w-8 text-center font-semibold"
                        aria-live="polite"
                      >
                        {users}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="neutralLight"
                        aria-label="Adicionar usuário"
                        disabled={
                          !!restriction || users >= sub.maxAdditionalUsers
                        }
                        onClick={() =>
                          setUsers((n) =>
                            Math.min(sub.maxAdditionalUsers, n + 1),
                          )
                        }
                      >
                        <IconPlus size={16} />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    {hasChanges && complements ? (
                      <p className="text-sm text-gray-700">
                        Nada é cobrado agora. A partir da mensalidade de{' '}
                        <strong>{formatDay(complements.nextChargeDate)}</strong>
                        , o valor passa de{' '}
                        {formatCurrencyToBrl(complements.currentRecurringCents)}{' '}
                        para{' '}
                        <strong>
                          {formatCurrencyToBrl(complements.recurringCents)}/mês
                        </strong>
                        .
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">
                        O complemento é liberado na hora e cobrado a partir da
                        próxima mensalidade. Nada é cobrado agora.
                      </p>
                    )}
                    {hasChanges && complementsQuery.isError && (
                      <p className="text-sm text-error-600" role="alert">
                        {complementsQuery.error.message}
                      </p>
                    )}
                    <Button
                      type="button"
                      onClick={contractComplements}
                      disabled={!!restriction}
                      RightIcon={IconArrowRight}
                      className="w-full sm:w-auto"
                    >
                      Contratar complementos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {next ? (
              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-700">
                  Próxima etapa do Método
                </h2>
                <Card className="border-brand-200">
                  <CardContent className="p-6 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <Image
                        src={LOGOS[next.planType] ?? atrupe}
                        alt={next.name}
                        height={40}
                        className="h-10 w-auto"
                      />
                      {nextDetails?.videoUrl && (
                        <Button
                          type="button"
                          variant="neutralLight"
                          LeftIcon={IconPlayerPlayFilled}
                          onClick={() =>
                            setVideo({
                              url: nextDetails.videoUrl!,
                              title: `Entenda o ${next.name}`,
                            })
                          }
                        >
                          Entenda o {next.name}
                        </Button>
                      )}
                    </div>

                    {concept?.description && (
                      <p className="text-gray-700">{concept.description}</p>
                    )}

                    {(annualAvailable || currentAnnual) && (
                      <CycleToggle
                        value={evolutionCycle}
                        onChange={setEvolutionCycle}
                        only={currentAnnual ? 'YEARLY' : undefined}
                      />
                    )}

                    {evolutionQuote ? (
                      <div>
                        <p className="text-3xl font-bold text-gray-900">
                          {formatCurrencyToBrl(
                            monthlyEquivalentCents(
                              evolutionQuote.recurringCents,
                              evolutionCycle,
                            ),
                          )}
                          <span className="text-base font-normal text-gray-600">
                            /mês
                          </span>
                        </p>
                        {evolutionCycle === 'YEARLY' && (
                          <p className="text-sm text-gray-500">
                            Cobrança anual de{' '}
                            {formatCurrencyToBrl(evolutionQuote.recurringCents)}
                            , com 1 mês grátis
                          </p>
                        )}
                        {evolutionQuote.creditCents > 0 && (
                          <p className="text-sm text-gray-600">
                            Primeira cobrança de{' '}
                            {formatCurrencyToBrl(evolutionQuote.totalCents)}: os
                            dias não usados do {sub.planName} viram{' '}
                            {formatCurrencyToBrl(evolutionQuote.creditCents)} de
                            crédito.
                          </p>
                        )}
                      </div>
                    ) : evolution === null ? (
                      <p className="text-sm text-error-600" role="alert">
                        Não foi possível calcular o valor da evolução agora.
                        Tente de novo em instantes.
                      </p>
                    ) : (
                      <Skeleton className="h-9 w-40" />
                    )}

                    <p className="text-sm text-gray-500">
                      Os complementos contratados e os marcados acima vão junto.
                      O ciclo recomeça na data da evolução.
                    </p>

                    <Button
                      type="button"
                      onClick={evolve}
                      disabled={restriction === 'OPEN_CHARGE'}
                      RightIcon={IconArrowRight}
                      className="w-full sm:w-auto"
                    >
                      Evoluir para o {next.name}
                    </Button>
                  </CardContent>
                </Card>
              </section>
            ) : upcoming ? (
              <Alert>
                <AlertTitle>{upcoming.name}: em breve</AlertTitle>
                <AlertDescription>
                  A próxima etapa do Método ainda não foi liberada. Enquanto
                  isso, você pode incluir complementos no plano atual.
                </AlertDescription>
              </Alert>
            ) : null}

            <ComparisonTable
              plans={planStates.plans}
              currentPlanType={sub.planType}
            />
          </div>
        </div>
      </div>

      {video && (
        <VideoDialog
          open={!!video}
          onOpenChange={(open) => !open && setVideo(null)}
          video={video.url}
          title={video.title}
        />
      )}
    </div>
  )
}
