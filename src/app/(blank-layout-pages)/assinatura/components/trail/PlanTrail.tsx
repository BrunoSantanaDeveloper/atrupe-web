'use client'

import { useMemo, useState } from 'react'
import Image, { StaticImageData } from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import {
  IconArrowRight,
  IconMinus,
  IconPlayerPlayFilled,
  IconPlus,
} from '@tabler/icons-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrencyToBrl } from '@/lib/utils'
import { VideoDialog } from '@/app/(app-sidebar)/academy/_components/VideoDialog'
import {
  fetchPublicModules,
  fetchPublicPlans,
  fetchQuote,
} from '@/actions/checkout'
import { useCheckoutStore } from '@/store/checkoutStore'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import type { PlanStatesResponse } from '@/types/checkout'
import type { VisualPlanType } from '@/types/plans'

import { CheckoutHeader } from '../checkout/CheckoutHeader'
import { ComparisonTable } from './ComparisonTable'

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

const MAX_ADDITIONAL_USERS = 20

interface Props {
  planStates: PlanStatesResponse
}

/**
 * Etapa 1 — o plano.
 *
 * Mostra só o que é contratável agora (o card é oferta, não catálogo): sem
 * contratação, o Atrupe Start. Os complementos entram no preço do card, que
 * vem do orçamento calculado no servidor. A tabela comparativa fica recolhida.
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
  const [video, setVideo] = useState<{ url: string; title: string } | null>(
    null,
  )

  const offers = planStates.plans.filter((p) => p.state === 'ELEGIVEL')
  const offer = offers[0] ?? null

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
  const { data: quote, isFetching: isQuoting } = useQuery({
    queryKey: ['trail-quote', offer?.planId, debounced],
    queryFn: async () => {
      const res = await fetchQuote({
        planId: offer!.planId,
        modules: debounced.modules,
        additionalUsers: debounced.additionalUsers,
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
    })
    router.push('/assinatura/contratacao')
  }

  const concept = offerDetails?.sections?.concept
  // Só o rótulo; o valor cobrado vem do orçamento do servidor.
  const userPrice = offerDetails?.additionalUserPrice

  return (
    <div className="w-full bg-gray-100 min-h-screen">
      <CheckoutHeader
        title="Planos"
        backHref={trialExpired ? '/logout' : '/dashboard'}
      />

      <div className="container mx-auto px-4 py-8 space-y-6">
        {trialExpired && (
          <Alert variant="warning" className="border-warning-200 bg-warning-50">
            <AlertTitle className="text-warning-800 font-semibold">
              Seu teste gratuito terminou
            </AlertTitle>
            <AlertDescription className="text-warning-700">
              Contrate para voltar a usar a Atrupe. O que você cadastrou durante
              o teste continua guardado.
            </AlertDescription>
          </Alert>
        )}

        <div>
          <h2 className="text-xl font-semibold text-gray-800">Método Atrupe</h2>
          <p className="text-gray-600">
            Cada etapa organiza uma parte do negócio. Você começa pela primeira
            e evolui quando ela estiver em operação.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {offer ? (
              <Card className="border-brand-200">
                <CardContent className="p-6 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <Image
                      src={LOGOS[offer.planType] ?? atrupe}
                      alt={offer.name}
                      height={40}
                      className="h-10 w-auto"
                    />
                    {offerDetails?.videoUrl && (
                      <Button
                        type="button"
                        variant="neutralLight"
                        LeftIcon={IconPlayerPlayFilled}
                        onClick={() =>
                          setVideo({
                            url: offerDetails.videoUrl!,
                            title: `Entenda o ${offer.name}`,
                          })
                        }
                      >
                        Entenda o {offer.name}
                      </Button>
                    )}
                  </div>

                  {concept?.description && (
                    <p className="text-gray-700">{concept.description}</p>
                  )}

                  <div>
                    {quote?.quote ? (
                      <p className="text-3xl font-bold text-gray-900">
                        {formatCurrencyToBrl(quote.quote.totalCents)}
                        <span className="text-base font-normal text-gray-600">
                          /mês
                        </span>
                      </p>
                    ) : (
                      <Skeleton className="h-9 w-40" />
                    )}
                    <p className="text-sm text-gray-500">
                      Cobrança mensal
                      {isQuoting ? ' · atualizando…' : ''}
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={beginContracting}
                    RightIcon={IconArrowRight}
                    className="w-full sm:w-auto"
                  >
                    Começar
                  </Button>

                  {concept?.mainActions?.length ? (
                    <div>
                      <p className="font-medium text-gray-800 mb-2">
                        Principais ações
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        {concept.mainActions.map((action) => (
                          <li key={action}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertTitle>
                  Nenhum plano disponível para contratação agora
                </AlertTitle>
                <AlertDescription>
                  Fale com a Atrupe para saber quando a próxima etapa estará
                  liberada.
                </AlertDescription>
              </Alert>
            )}

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-700">
                Complementos
              </h2>
              <Card>
                <CardContent className="p-6 space-y-5">
                  {isLoadingModules ? (
                    <Skeleton className="h-6 w-2/3" />
                  ) : (
                    (publicModules ?? []).map((m) => (
                      <label
                        key={m.key}
                        className="flex items-start gap-3 cursor-pointer"
                      >
                        <Checkbox
                          checked={modules.includes(m.key)}
                          onCheckedChange={(v) => toggleModule(m.key, !!v)}
                        />
                        <span className="flex-1">
                          <span className="block font-medium text-gray-800">
                            {m.name}
                          </span>
                          {m.description && (
                            <span className="block text-sm text-gray-600">
                              {m.description}
                            </span>
                          )}
                        </span>
                        <span className="text-gray-800 whitespace-nowrap">
                          {formatCurrencyToBrl(m.price)}/mês
                        </span>
                      </label>
                    ))
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-800">
                        Usuários adicionais
                      </p>
                      {userPrice != null && (
                        <p className="text-sm text-gray-600">
                          {formatCurrencyToBrl(userPrice)}/mês por usuário
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="neutralLight"
                        aria-label="Remover usuário"
                        disabled={additionalUsers <= 0}
                        onClick={() =>
                          setAdditionalUsers((n) => Math.max(0, n - 1))
                        }
                      >
                        <IconMinus size={16} />
                      </Button>
                      <span
                        className="w-8 text-center font-semibold"
                        aria-live="polite"
                      >
                        {additionalUsers}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="neutralLight"
                        aria-label="Adicionar usuário"
                        disabled={additionalUsers >= MAX_ADDITIONAL_USERS}
                        onClick={() =>
                          setAdditionalUsers((n) =>
                            Math.min(MAX_ADDITIONAL_USERS, n + 1),
                          )
                        }
                      >
                        <IconPlus size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <ComparisonTable
              plans={planStates.plans}
              currentPlanType={
                planStates.plans.find((p) => p.state === 'ATUAL')?.planType
              }
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
