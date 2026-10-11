'use client'

import { useSession } from 'next-auth/react'
import { usePermissions } from '@/hooks/usePermissions'

import { useQuery } from '@tanstack/react-query'

// UI
import { Card } from '@/components/ui/card'
import { FeaturedIcon, FeaturedIconProps } from '@/components/ui/featured-icon'
import { Skeleton } from '@/components/ui/skeleton'

// Icons
import { IconCircleCheck, IconCoin, IconReceipt } from '@tabler/icons-react'

// Actions
import { getCommissionSummary } from '@/actions/commission-report'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Mode
import { commissionFilters, commissionModeOf } from '../mode'

export function SummaryCards({ searchParams }: SearchParamsType) {
  // EC-25: sem a permissão de ver vendas de outros vendedores, o relatório
  // vai preso ao vendedor da sessão — o de Vendas já faz isso
  const { data: session } = useSession()
  const { hasAnyPermission } = usePermissions()
  const canSeeOtherSellers = hasAnyPermission([
    'sale:other_quotation:view',
    'sale:other_sellers:view',
  ])
  const restrictedSellerId = canSeeOtherSellers
    ? undefined
    : session?.user?.employeeId

  const { data, isLoading } = useQuery({
    queryKey: [
      'commission-summary',
      searchParams?.commissionType,
      searchParams?.startDate,
      searchParams?.endDate,
      searchParams?.receivedStartDate,
      searchParams?.receivedEndDate,
      searchParams?.period,
      searchParams?.sellerId,
      restrictedSellerId,
    ],
    queryFn: () =>
      getCommissionSummary(
        commissionFilters(
          {
            commissionType: searchParams?.commissionType as string,
            period: searchParams?.period as string,
            startDate: searchParams?.startDate as string,
            endDate: searchParams?.endDate as string,
            receivedStartDate: searchParams?.receivedStartDate as string,
            receivedEndDate: searchParams?.receivedEndDate as string,
            sellerId: searchParams?.sellerId as string,
          },
          restrictedSellerId,
        ),
      ),
  })

  const mode = commissionModeOf(searchParams?.commissionType as string)
  const plural = (count: number | undefined, one: string, many: string) =>
    `${count ?? 0} ${count === 1 ? one : many}`

  // A comissão vem primeiro, porque é a pergunta do relatório; ao lado, a
  // base sobre a qual ela foi calculada, e por último o outro valor, só como
  // referência
  const cards =
    mode === 'received_value'
      ? [
          {
            icon: IconReceipt,
            variant: 'successLight',
            label: 'Comissão a pagar',
            value: formatCurrencyToBrl(data?.commissionTotal || 0),
            support: 'sobre o recebido no período',
          },
          {
            icon: IconCoin,
            variant: 'neutralLight',
            label: 'Recebido no período',
            value: formatCurrencyToBrl(data?.receivedTotal || 0),
            support: plural(data?.receivedCount, 'recebimento', 'recebimentos'),
          },
          {
            icon: IconCircleCheck,
            variant: 'neutralLight',
            label: 'Vendido no período',
            value: formatCurrencyToBrl(data?.salesTotal || 0),
            support: 'só referência — não é a base',
          },
        ]
      : [
          {
            icon: IconReceipt,
            variant: 'successLight',
            label: 'Comissão a pagar',
            value: formatCurrencyToBrl(data?.commissionTotal || 0),
            support: 'sobre o vendido no período',
          },
          {
            icon: IconCircleCheck,
            variant: 'neutralLight',
            label: 'Vendido no período',
            value: formatCurrencyToBrl(data?.salesTotal || 0),
            support: plural(data?.salesCount, 'venda', 'vendas'),
          },
          {
            icon: IconCoin,
            variant: 'neutralLight',
            label: 'Já recebido dessas vendas',
            value: formatCurrencyToBrl(data?.receivedTotal || 0),
            support: 'só referência — não é a base',
          },
        ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 flex items-center gap-3 rounded-xl">
            <Skeleton className="h-11 w-11 rounded-[10px]" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-6 w-24" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="p-6 flex items-center gap-3 rounded-xl">
          <FeaturedIcon
            size="md"
            variant={card.variant as FeaturedIconProps['variant']}
            Icon={card.icon}
          />
          <div className="flex flex-col min-w-0">
            <span className="type-kpi-label truncate">{card.label}</span>
            <span className="type-kpi-value">{card.value}</span>
            <span className="text-xs text-gray truncate">{card.support}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}
