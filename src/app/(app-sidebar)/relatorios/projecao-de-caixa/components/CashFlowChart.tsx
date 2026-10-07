'use client'

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

// Recharts
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  Legend,
} from 'recharts'

// Actions
import { getCashFlowChart } from '@/actions/cash-flow-report'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

const chartConfig = {
  revenue: {
    label: 'Receitas',
    color: '#12B76A',
  },
  expenses: {
    label: 'Despesas',
    color: '#F04438',
  },
  balance: {
    label: 'Saldo de caixa',
    color: '#0EA5E9',
  },
} satisfies ChartConfig

export function CashFlowChart({ searchParams }: SearchParamsType) {
  const { data, isLoading } = useQuery({
    queryKey: ['cash-flow-chart', searchParams],
    queryFn: () =>
      getCashFlowChart({
        startDate: searchParams?.startDate as string,
        endDate: searchParams?.endDate as string,
      }),
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projeção de caixa</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[320px]">
          <Skeleton className="h-[304px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projeção de caixa</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[320px] flex items-center justify-center">
          <p className="text-gray-500">
            Nenhum dado disponível para o período selecionado
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projeção de caixa</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[320px]">
        <ChartContainer
          config={chartConfig}
          className="min-h-[280px] max-h-[320px] w-full"
        >
          <ComposedChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              fontSize={11}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrencyToBrl(value)}
              width={90}
              fontSize={11}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
              formatter={(value) => formatCurrencyToBrl(value as number)}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="rect"
              formatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label || value
              }
            />
            <Bar
              dataKey="revenue"
              fill="var(--color-revenue)"
              radius={[4, 4, 0, 0]}
              barSize={16}
            />
            <Bar
              dataKey="expenses"
              fill="var(--color-expenses)"
              radius={[4, 4, 0, 0]}
              barSize={16}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="var(--color-balance)"
              strokeWidth={2}
              dot={{
                fill: 'var(--color-balance)',
                stroke: 'var(--surface)',
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
                stroke: 'var(--surface)',
                strokeWidth: 2,
              }}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
