'use client'

// UI
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  ChartConfig,
  ChartTooltip,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart'

// Third-party
import { Line, XAxis, YAxis, CartesianGrid, LineChart } from 'recharts'

// Mock Data
import { mockSalesReportData } from '../mock-data'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

const chartConfig = {
  approved: {
    label: 'Aprovadas',
    color: 'var(--chart-brand)',
  },
} satisfies ChartConfig

export function SalesEvolutionChart() {
  const { evolution } = mockSalesReportData

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-700">
          Evolução de vendas do período
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
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
              dataKey="month"
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
              type="linear"
              stroke="var(--color-approved)"
              strokeWidth={2}
              dot={{
                fill: 'var(--color-approved)',
                stroke: '#fff',
                strokeWidth: 2,
                r: 5,
              }}
              activeDot={{
                r: 7,
                stroke: '#fff',
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
