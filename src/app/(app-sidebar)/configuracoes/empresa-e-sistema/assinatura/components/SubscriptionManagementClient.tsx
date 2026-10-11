'use client'

// React
import { useEffect, useState } from 'react'

// Next
import Link from 'next/link'
import { useSession } from 'next-auth/react'

// Components
import { Topbar } from '@/components/common/Topbar'
import { ActionButton } from '@/components/common/ActionButton'
import { SubscriptionSummaryCards } from './SubscriptionSummaryCards'
import { PaymentsTable } from './PaymentsTable'
import { CancelSubscriptionDialog } from './CancelSubscriptionDialog'
import { ContractSection } from './ContractSection'
import { ModulesSection } from './ModulesSection'
import { OwnershipSection } from './OwnershipSection'

// UI
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'

// Icons
import { IconPrinter, IconPlus } from '@tabler/icons-react'

// Actions
import { getItem, getData } from '@/actions/_cruds'
import { fetchOwnership } from '@/actions/ownership'

// Hooks
import { useRefreshCompanySession } from '@/hooks/useRefreshCompanySession'

// Types
import type { BadgeType, SearchParamsType } from '@/types/coreTypes'

// Third-party
import { useQuery } from '@tanstack/react-query'

const statusMap: Record<string, BadgeType> = {
  ACTIVE: { text: 'Ativa', variant: 'successLight' },
  INACTIVE: { text: 'Inativa', variant: 'neutralLight' },
  BLOCKED: { text: 'Bloqueada', variant: 'errorLight' },
  EXPIRED: { text: 'Expirada', variant: 'warningLight' },
  CANCELED: { text: 'Cancelada', variant: 'errorLight' },
}

export function SubscriptionManagementClient({
  searchParams,
}: SearchParamsType) {
  const { data: session } = useSession()
  const { refresh: refreshCompanySession } = useRefreshCompanySession()
  const [cancelOpen, setCancelOpen] = useState(false)

  const page = Number(searchParams?.page) || 1

  const { data: subscriptionRes, isLoading: loadingSub } = useQuery({
    staleTime: Infinity,
    queryKey: ['subscription-active'],
    queryFn: () => getItem({ route: '/subscriptions/active' }),
  })

  const { data: paymentsRes, isLoading: loadingPayments } = useQuery({
    staleTime: Infinity,
    queryKey: ['subscription-payments', page],
    queryFn: () =>
      getData({
        route: '/subscriptions/my-payments',
        filters: { page: String(page), limit: '10' },
      }),
  })

  // A mesma consulta da seção de titularidade (mesma chave): diz se o
  // ambiente já foi transferido, para a tabela mostrar o titular de cada
  // cobrança.
  const { data: ownershipRes } = useQuery({
    queryKey: ['ownership'],
    queryFn: () => fetchOwnership(),
  })
  const ownership = ownershipRes?.success ? ownershipRes.data : undefined
  const transferred = ownership?.previous.length ?? 0

  // Cancelar a assinatura é ato do titular. A resposta da API vale mais que a
  // sessão, que pode ser de antes de o titular ser registrado.
  const isOwner = ownership ? ownership.isOwner : !!session?.company?.isOwner

  const subscription = subscriptionRes?.data
  const payments = paymentsRes?.data || []
  const paymentsLastPage = paymentsRes?.lastPage || 1

  const isLoading = loadingSub || loadingPayments

  const statusInfo = subscription ? statusMap[subscription.status] : undefined
  const isTrial = subscription?.plan?.planType === 'TRIAL'

  // Ao abrir a assinatura, a sessão passa a refletir o plano do servidor
  // (recursos, limites, bloqueio e cobrança), montado pela mesma função do
  // login. Respeita o intervalo mínimo: a montagem da página já pode ter
  // buscado.
  useEffect(() => {
    if (!subscription) return
    refreshCompanySession({ force: false }).catch(() => null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscription])

  return (
    <div className="space-y-5">
      <Topbar
        title="Assinatura"
        previousPage="/configuracoes/empresa-e-sistema"
        badge={statusInfo}
        secondaryCta={
          subscription ? (
            <TooltipProvider>
              <ActionButton
                tooltip="Imprimir"
                size="iconMd"
                variant="neutralOutline"
                Icon={IconPrinter}
                onClick={() => window.print()}
              />
              {subscription.status === 'ACTIVE' && !isTrial && isOwner && (
                <Button
                  variant="neutralOutline"
                  onClick={() => setCancelOpen(true)}
                >
                  Cancelar assinatura
                </Button>
              )}
            </TooltipProvider>
          ) : undefined
        }
        primaryCta={
          subscription ? (
            <Button asChild LeftIcon={IconPlus}>
              <Link href="/assinatura">
                {subscription.status !== 'ACTIVE'
                  ? 'Recontratar plano'
                  : isTrial
                    ? 'Contratar plano'
                    : 'Alterar assinatura'}
              </Link>
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <SubscriptionSkeleton />
      ) : !subscription ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 text-sm">
              Nenhuma assinatura encontrada para esta empresa.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          <SubscriptionSummaryCards
            subscription={subscription}
            isPrincipalAdmin={isOwner}
          />

          {!isTrial && (
            <ModulesSection
              subscriptionId={subscription.id}
              modules={subscription.subscriptionFeatures ?? []}
              isPrincipalAdmin={isOwner}
              canChange={subscription.status === 'ACTIVE'}
            />
          )}

          {!isTrial && <ContractSection />}

          <PaymentsTable
            payments={payments}
            lastPage={paymentsLastPage}
            searchParams={searchParams}
            showHolder={transferred > 0}
          />

          <CancelSubscriptionDialog
            open={cancelOpen}
            onOpenChange={setCancelOpen}
            subscriptionId={subscription.id}
          />
        </div>
      )}

      {!isLoading && <OwnershipSection />}
    </div>
  )
}

function SubscriptionSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <Skeleton className="h-[calc(100vh-350px)]" />
      </Card>
    </div>
  )
}
