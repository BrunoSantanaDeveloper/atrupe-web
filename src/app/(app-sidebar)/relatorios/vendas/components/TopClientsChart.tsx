'use client'

// React
import { useQuery } from '@tanstack/react-query'

// UI
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartConfig,
  ChartTooltip,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Button } from '@/components/ui/button'

// Components
import { RankingPrintButton } from './print/RankingPrintButton'

// Icons
import { IconMaximize } from '@tabler/icons-react'

// Third-party
import { Bar, XAxis, YAxis, BarChart } from 'recharts'

// Actions
import { getTopClients } from '@/actions/sales-report'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

const chartConfig = {
  value: {
    label: 'Valor',
    color: '#6CE9A6',
  },
} satisfies ChartConfig

const currencyFormatter = (value: unknown) => (
  <div className="flex flex-1 justify-between items-center gap-2 leading-none">
    <span className="text-gray-500">Valor</span>
    <span className="font-mono font-medium tabular-nums text-gray-950">
      {formatCurrencyToBrl(Number(value))}
    </span>
  </div>
)

interface TopClientsChartProps extends SearchParamsType {}

export function TopClientsChart({ searchParams }: TopClientsChartProps) {
  const { data: topClients = [], isLoading } = useQuery({
    queryKey: [
      'sales-top-clients',
      searchParams?.startDate,
      searchParams?.endDate,
      searchParams?.sellerId,
      searchParams?.originId,
      searchParams?.clientId,
      searchParams?.serieId,
    ],
    queryFn: () =>
      getTopClients({
        sellerId: searchParams?.sellerId as string,
        originId: searchParams?.originId as string,
        clientId: searchParams?.clientId as string,
        serieId: searchParams?.serieId as string,
        startDate: searchParams?.startDate as string,
        endDate: searchParams?.endDate as string,
      }),
  })

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-gray-700">
          Melhores clientes
        </CardTitle>
        <div className="flex items-center gap-1">
          <RankingPrintButton
            title="Melhores clientes"
            nameLabel="Cliente"
            items={topClients}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            RightIcon={IconMaximize}
          />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <Skeleton className="h-[280px] w-full" />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="min-h-[280px] max-h-[320px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={topClients}
              layout="vertical"
              margin={{
                left: 0,
                right: 20,
                top: 0,
                bottom: 0,
              }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={80}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent formatter={currencyFormatter} />}
              />
              <Bar
                dataKey="value"
                fill="var(--color-value)"
                radius={[0, 4, 4, 0]}
                barSize={18}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
