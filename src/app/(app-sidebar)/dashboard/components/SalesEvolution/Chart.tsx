'use client'

import { useQuery } from '@tanstack/react-query'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'

import { getDashboardSalesEvolution } from '@/actions/dashboard'

import { useDashboardValues } from '../DashboardValuesContext'

type DashboardFilters = {
  startDate?: string
  endDate?: string
}

interface SalesEvolutionChartProps {
  filters: DashboardFilters
}

const chartConfig = {
  approved: {
    label: 'Aprovadas',
    color: 'var(--chart-brand)',
  },
} satisfies ChartConfig

export function SalesEvolutionChart({ filters }: SalesEvolutionChartProps) {
  const { showValues, formatValue } = useDashboardValues()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-sales-evolution', filters],
    queryFn: () => getDashboardSalesEvolution(filters),
  })

  const chartData = data?.data || []

  if (isLoading) {
    return <Skeleton className="h-[260px] w-full" />
  }

  if (!chartData.length) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-gray">
        Nenhuma venda aprovada no periodo.
      </div>
    )
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[220px] max-h-[260px] w-full"
    >
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatValue(value)}
          width={showValues ? 90 : 60}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value, name, item) => (
                <div className="flex w-full items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex flex-1 items-center justify-between gap-8">
                    <span className="text-gray">
                      {item.payload?.count || 0}{' '}
                      {chartConfig[name as keyof typeof chartConfig]?.label}
                    </span>
                    <span className="font-medium tabular-nums">
                      {formatValue(value as number)}
                    </span>
                  </div>
                </div>
              )}
            />
          }
        />
        <Line
          dataKey="approved"
          type="monotone"
          stroke="var(--color-approved)"
          strokeWidth={2}
          dot={{
            stroke: 'var(--color-approved)',
            strokeWidth: 2,
            r: 4,
          }}
          activeDot={{
            r: 4,
            strokeWidth: 2,
            opacity: 0.5,
          }}
        />
      </LineChart>
    </ChartContainer>
  )
}
