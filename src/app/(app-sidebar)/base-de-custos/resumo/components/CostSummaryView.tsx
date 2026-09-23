'use client'

// React / Next
import Link from 'next/link'

// UI
import { Skeleton } from '@/components/ui/skeleton'
import { FeaturedIcon, FeaturedIconProps } from '@/components/ui/featured-icon'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

// Components
import { CostBySectorChart } from './CostBySectorChart'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Actions
import { getCostSummary } from '@/actions/cost-base'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import {
  IconUsers,
  IconReceipt,
  IconBuilding,
  IconTrendingDown,
  IconBuildingFactory,
  IconBuildingWarehouse,
} from '@tabler/icons-react'

const formatReferenceMonth = (month?: string) => {
  if (!month) return ''

  const [year, monthNumber] = month.split('-').map(Number)

  return new Date(year, monthNumber - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    .replace('.', '')
    .replace(' de ', '/')
}

export function CostSummaryView() {
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['cost-summary'],
    queryFn: () => getCostSummary(),
  })

  const summary = data?.data

  const origins = [
    {
      icon: IconReceipt,
      variant: 'neutralLight',
      label: 'Despesas administrativas',
      value: summary?.byOrigin.adminExpenses,
      href: '/base-de-custos/despesas-administrativas',
    },
    {
      icon: IconUsers,
      variant: 'blueLight',
      label: 'Mão de obra',
      value: summary?.byOrigin.labor,
      href: '/base-de-custos/mao-de-obra',
    },
    {
      icon: IconBuildingWarehouse,
      variant: 'indigoLight',
      label: 'Custos de patrimônios',
      value: summary?.byOrigin.assets,
      href: '/base-de-custos/patrimonios',
    },
    {
      icon: IconTrendingDown,
      variant: 'neutralLight',
      label: 'Depreciação',
      value: summary?.byOrigin.depreciation,
      href: '/base-de-custos/patrimonios',
    },
  ] as const

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-[132px] w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-[92px] w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[320px] w-full rounded-xl" />
      </div>
    )
  }

  if (!summary?.total) {
    return (
      <Card>
        <ListDataTotalEmpty
          icon={IconBuilding}
          title="Base de custos ainda vazia"
          description="Defina as despesas administrativas, a folha e os patrimônios para ver o custo da empresa."
        />
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <p className="text-sm text-gray">Custo mensal de referência</p>
        <p className="text-display-sm font-semibold text-gray-900">
          {formatCurrencyToBrl(summary.total)}
        </p>
        <p className="text-sm text-gray mt-2">
          Médias calculadas até {formatReferenceMonth(summary.referenceMonth)}.
          O valor inclui depreciação, que é custo gerencial e não sai do caixa.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {origins.map((origin) => (
          <Link key={origin.label} href={origin.href}>
            <Card className="p-6 flex items-center gap-3 rounded-xl h-full hover:border-gray-300">
              <FeaturedIcon
                size="md"
                variant={origin.variant as FeaturedIconProps['variant']}
                Icon={origin.icon}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-gray truncate">
                  {origin.label}
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {origin.value ? formatCurrencyToBrl(origin.value) : '-'}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CostBySectorChart sectors={summary.bySector} />

        <Card>
          <CardHeader>
            <CardTitle>Produtivo e administrativo</CardTitle>
            <CardDescription>
              Pelo método do custo puro, o administrativo fica fora do custo dos
              setores produtivos e é coberto pelo resultado das vendas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            <div className="flex items-center gap-3">
              <FeaturedIcon
                size="md"
                variant="successLight"
                Icon={IconBuildingFactory}
              />
              <div>
                <p className="text-xs text-gray">Estrutura produtiva</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrencyToBrl(summary.productiveCost)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FeaturedIcon
                size="md"
                variant="neutralLight"
                Icon={IconBuilding}
              />
              <div>
                <p className="text-xs text-gray">Estrutura administrativa</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrencyToBrl(summary.administrativeCost)}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray">
              {summary.distributedCost
                ? `${formatCurrencyToBrl(summary.distributedCost)} do administrativo está distribuído entre os setores produtivos.`
                : 'Nenhum custo administrativo está sendo distribuído entre os setores.'}{' '}
              <Link
                href="/base-de-custos/distribuicao"
                className="text-brand hover:underline"
              >
                Ver distribuição
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
