'use client'

import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'

import { getDashboardTopClients } from '@/actions/dashboard'

import { useDashboardValues } from '../DashboardValuesContext'

type DashboardFilters = {
  startDate?: string
  endDate?: string
}

interface TopClientsChartProps {
  filters: DashboardFilters
}

const chartConfig = {
  value: {
    label: 'Valor',
    color: 'var(--chart-brand)',
  },
} satisfies ChartConfig

export function TopClientsChart({ filters }: TopClientsChartProps) {
  const { formatValue } = useDashboardValues()

  const currencyFormatter = (value: unknown) => (
    <div className="flex flex-1 justify-between items-center gap-2 leading-none">
      <span className="text-gray-500">Valor</span>
      <span className="font-mono font-medium tabular-nums text-gray-950">
        {formatValue(Number(value))}
      </span>
    </div>
  )

  const { data = [], isLoading } = useQuery({
    queryKey: ['dashboard-top-clients', filters],
    queryFn: () => getDashboardTopClients(filters),
  })

  if (isLoading) {
    return <Skeleton className="h-[260px] w-full" />
  }

  if (!data.length) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-gray">
        Nenhum cliente com venda aprovada no periodo.
      </div>
    )
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[220px] max-h-[260px] w-full"
    >
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ left: 0, right: 20, top: 0, bottom: 0 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          width={110}
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
  )
}
