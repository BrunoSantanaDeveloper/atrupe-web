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

// Components
import { PrintButton } from '@/components/common/PrintButton'

// Icons
import { IconMaximize } from '@tabler/icons-react'

// Third-party
import { Bar, XAxis, YAxis, BarChart } from 'recharts'

// Mock Data
import { mockSalesReportData } from '../mock-data'

const chartConfig = {
  value: {
    label: 'Quantidade',
    color: '#6CE9A6',
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
        <div className="flex items-center gap-1">
          <PrintButton size="icon" variant="ghost" />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            RightIcon={IconMaximize}
          />
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
              barSize={18}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
