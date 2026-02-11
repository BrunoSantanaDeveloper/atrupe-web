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

// Third-party
import { Line, XAxis, YAxis, CartesianGrid, LineChart } from 'recharts'

// Actions
import { getSalesEvolution } from '@/actions/sales-report'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

const chartConfig = {
  approved: {
    label: 'Aprovadas',
    color: 'var(--chart-brand)',
  },
} satisfies ChartConfig

interface SalesEvolutionChartProps extends SearchParamsType {}

export function SalesEvolutionChart({
  searchParams,
}: SalesEvolutionChartProps) {
  const { data: evolution = [], isLoading } = useQuery({
    queryKey: ['sales-evolution', searchParams],
    queryFn: () =>
      getSalesEvolution({
        sellerId: searchParams?.sellerId as string,
        originId: searchParams?.originId as string,
        startDate: searchParams?.startDate as string,
        endDate: searchParams?.endDate as string,
      }),
  })

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Evolução de vendas do período</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="min-h-[250px] max-h-[300px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={evolution}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
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
                tickFormatter={(value) => formatCurrencyToBrl(value)}
                width={90}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
                formatter={(value) => formatCurrencyToBrl(value as number)}
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
        )}
      </CardContent>
    </Card>
  )
}
