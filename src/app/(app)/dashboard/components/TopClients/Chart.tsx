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
import { Bar, XAxis, CartesianGrid, BarChart, YAxis } from 'recharts'

const generateChartData = (client: string) => ({
  client,
  sales: getRandomValue([20000, 250000]),
})

const clients = [
  'Aurora',
  'Gráfica CKz',
  'Alfa e Ômega',
  'Plus Digital',
  'OG Comunicação Visual',
  'Silk Premium',
  'Gráfica Renascer',
  'Tecnograf',
  'Marka Gráfica Rápida',
  'Ligeirinho',
]

const chartData = clients
  .map(generateChartData)
  .sort((a, b) => b.sales - a.sales)

const chartConfig = {
  sales: {
    label: 'Vendas',
    color: 'var(--chart-brand)',
  },
} satisfies ChartConfig

export function TopClientsChart() {
  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[200px] max-h-[300px] w-full"
    >
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{
          left: -20,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} horizontal={false} />
        <XAxis type="number" dataKey="sales" hide />
        <YAxis
          dataKey="client"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 15)}
          width={150}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent />}
          isAnimationActive={false}
        />
        <Bar
          dataKey="sales"
          fill="var(--color-sales)"
          radius={2}
          barSize={20}
        />
      </BarChart>
    </ChartContainer>
  )
}
