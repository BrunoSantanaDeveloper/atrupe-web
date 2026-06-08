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

import { getDashboardSalesBySeller } from '@/actions/dashboard'

type DashboardFilters = {
  startDate?: string
  endDate?: string
}

interface SalesBySellerChartProps {
  filters: DashboardFilters
}

const chartConfig = {
  value: {
    label: 'Vendas',
    color: 'var(--chart-success)',
  },
} satisfies ChartConfig

const currencyFormatter = (value: unknown) => (
  <div className="flex flex-1 justify-between items-center gap-2 leading-none">
    <span className="text-gray-500">Vendas</span>
    <span className="font-mono font-medium tabular-nums text-gray-950">
      {new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
      }).format(Number(value))}
    </span>
  </div>
)

export function SalesBySellerChart({ filters }: SalesBySellerChartProps) {
  const { data = [], isLoading } = useQuery({
    queryKey: ['dashboard-sales-by-seller', filters],
    queryFn: () => getDashboardSalesBySeller(filters),
  })

  if (isLoading) {
    return <Skeleton className="h-[260px] w-full" />
  }

  if (!data.length) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-gray">
        Nenhuma venda por vendedor no periodo.
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
