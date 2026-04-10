'use client'

// React
import { useState } from 'react'

// Next
import Link from 'next/link'

// Components
import { Topbar } from '@/components/common/Topbar'
import { ActionButton } from '@/components/common/ActionButton'
import { SubscriptionSummaryCards } from './SubscriptionSummaryCards'
import { PaymentsTable } from './PaymentsTable'
import { CancelSubscriptionDialog } from './CancelSubscriptionDialog'
import { ContractModal } from './ContractModal'

// UI
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'

// Icons
import {
  IconPencil,
  IconPrinter,
  IconFileText,
  IconPlus,
} from '@tabler/icons-react'

// Actions
import { getItem, getData } from '@/actions/_cruds'

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
  const [cancelOpen, setCancelOpen] = useState(false)
  const [contractOpen, setContractOpen] = useState(false)

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

  const subscription = subscriptionRes?.data
  const payments = paymentsRes?.data || []
  const paymentsLastPage = paymentsRes?.lastPage || 1

  const isLoading = loadingSub || loadingPayments

  const statusInfo = subscription ? statusMap[subscription.status] : undefined
  const isTrial = subscription?.plan?.planType === 'TRIAL'

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
              {!isTrial && (
                <ActionButton
                  tooltip="Contrato"
                  size="iconMd"
                  variant="neutralOutline"
                  Icon={IconFileText}
                  onClick={() => setContractOpen(true)}
                />
              )}
              {subscription.status === 'ACTIVE' && !isTrial && (
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
            <Button asChild LeftIcon={isTrial ? IconPlus : IconPencil}>
              <Link href="/assinatura">
                {isTrial ? 'Contratar plano' : 'Editar assinatura'}
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
          <SubscriptionSummaryCards subscription={subscription} />

          <PaymentsTable
            payments={payments}
            lastPage={paymentsLastPage}
            searchParams={searchParams}
          />

          <CancelSubscriptionDialog
            open={cancelOpen}
            onOpenChange={setCancelOpen}
            subscriptionId={subscription.id}
          />

          <ContractModal open={contractOpen} onOpenChange={setContractOpen} />
        </div>
      )}
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
