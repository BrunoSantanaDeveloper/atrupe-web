'use client'

// UI
import {
  ChartConfig,
  ChartTooltip,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart'

// Lib
import { getRandomValue } from '@/lib/utils'

// Third-party
import { Bar, Line, XAxis, ComposedChart, CartesianGrid, YAxis } from 'recharts'

const generateChartData = (month: string) => ({
  month,
  sales: getRandomValue([45000, 224000]),
  average: getRandomValue([1000, 4000]),
})

const months = [
  'Novembro 2023',
  'Dezembro 2023',
  'Janeiro 2024',
  'Fevereiro 2024',
  'Março 2024',
  'Abril 2024',
  'Maio 2024',
  'Junho 2024',
  'Julho 2024',
  'Agosto 2024',
  'Setembro 2024',
  'Outubro 2024',
]

const chartData = months.map(generateChartData)

const chartConfig = {
  sales: {
    label: 'Vendas',
    color: 'var(--chart-brand)',
  },
  average: {
    label: 'Ticket médio',
    color: 'var(--chart-blue)',
  },
} satisfies ChartConfig

export function SalesEvolutionChart() {
  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[200px] max-h-[256px] w-full"
    >
      <ComposedChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis yAxisId="sales" hide />
        <YAxis yAxisId="average" hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent />}
          isAnimationActive={false}
        />
        <Bar
          yAxisId="sales"
          dataKey="sales"
          fill="var(--color-sales)"
          radius={2}
          barSize={40}
        />
        <Line
          yAxisId="average"
          dataKey="average"
          type="linear"
          stroke="var(--color-average)"
          strokeWidth={2}
          dot={true}
        />
      </ComposedChart>
    </ChartContainer>
  )
}
