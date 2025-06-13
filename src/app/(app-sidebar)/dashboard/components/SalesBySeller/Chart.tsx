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
import { Bar, XAxis, BarChart, CartesianGrid } from 'recharts'

const range: [number, number] = [10450.05, 3700.8]

const generateChartData = (month: string) => ({
  month,
  angelica: getRandomValue(range),
  maicol: getRandomValue(range),
  marcos: getRandomValue(range),
  fernando: getRandomValue(range),
})

const months = [
  'Maio 2024',
  'Junho 2024',
  'Julho 2024',
  'Agosto 2024',
  'Setembro 2024',
  'Outubro 2024',
]

const chartData = months.map(generateChartData)

const chartConfig = {
  angelica: {
    label: 'Angélica',
    color: 'var(--chart-rose)',
  },
  maicol: {
    label: 'Maicol',
    color: 'var(--chart-orange)',
  },
  marcos: {
    label: 'Marcos',
    color: 'var(--chart-success)',
  },
  fernando: {
    label: 'Fernando',
    color: 'var(--chart-indigo)',
  },
} satisfies ChartConfig

export function SalesBySellerChart() {
  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[200px] max-h-[300px] w-full"
    >
      <BarChart
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
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent />}
          isAnimationActive={false}
        />
        <Bar
          dataKey="angelica"
          fill="var(--color-angelica)"
          radius={2}
          barSize={10}
        />
        <Bar
          dataKey="maicol"
          fill="var(--color-maicol)"
          radius={2}
          barSize={10}
        />
        <Bar
          dataKey="marcos"
          fill="var(--color-marcos)"
          radius={2}
          barSize={10}
        />
        <Bar
          dataKey="fernando"
          fill="var(--color-fernando)"
          radius={2}
          barSize={10}
        />
      </BarChart>
    </ChartContainer>
  )
}
