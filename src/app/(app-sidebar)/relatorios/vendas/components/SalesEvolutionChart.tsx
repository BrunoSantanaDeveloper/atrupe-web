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
    label: 'Aprovados',
    color: 'var(--chart-brand)',
  },
  inProgress: {
    label: 'Em andamento',
    color: 'var(--chart-gray)',
  },
} satisfies ChartConfig

export function SalesEvolutionChart() {
  const { evolution } = mockSalesReportData

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-700">
          Evolução de vendas do mês
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
              width={80}
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
                fill: 'var(--color-approved)',
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
              }}
            />
            <Line
              dataKey="inProgress"
              type="monotone"
              stroke="var(--color-inProgress)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{
                fill: 'var(--color-inProgress)',
                strokeWidth: 2,
                r: 4,
              }}
            />
          </LineChart>
        </ChartContainer>
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand" />
            <span className="text-sm text-gray-600">Aprovados</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-sm text-gray-600">Em andamento</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
