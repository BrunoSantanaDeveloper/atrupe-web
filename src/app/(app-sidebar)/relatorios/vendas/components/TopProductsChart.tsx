'use client'

// UI
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  ChartConfig,
  ChartTooltip,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Button } from '@/components/ui/button'

// Icons
import { IconFileTypePdf, IconFileSpreadsheet } from '@tabler/icons-react'

// Third-party
import { Bar, XAxis, YAxis, BarChart } from 'recharts'

// Mock Data
import { mockSalesReportData } from '../mock-data'

const chartConfig = {
  value: {
    label: 'Quantidade',
    color: 'var(--chart-brand)',
  },
} satisfies ChartConfig

export function TopProductsChart() {
  const { topProducts } = mockSalesReportData

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-gray-700">
          Produtos mais vendidos
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <IconFileTypePdf className="h-5 w-5 text-red-500" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <IconFileSpreadsheet className="h-5 w-5 text-green-600" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer
          config={chartConfig}
          className="min-h-[280px] max-h-[320px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={topProducts}
            layout="vertical"
            margin={{
              left: 0,
              right: 20,
              top: 0,
              bottom: 0,
            }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={80}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={[0, 4, 4, 0]}
              barSize={16}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
