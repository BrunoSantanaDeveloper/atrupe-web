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
import { Bar, XAxis, YAxis, CartesianGrid, BarChart } from 'recharts'

// Mock Data
import { mockSalesReportData } from '../mock-data'

const chartConfig = {
  approved: {
    label: 'Aprovadas',
    color: '#6CE9A6',
  },
  expired: {
    label: 'Vencidas',
    color: '#FEC84B',
  },
  rejected: {
    label: 'Rejeitadas',
    color: '#F97066',
  },
} satisfies ChartConfig

export function ApprovedRejectedChart() {
  const { approvedRejected } = mockSalesReportData

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-700">
          Aprovadas x Não aprovadas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer
          config={chartConfig}
          className="min-h-[200px] max-h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={approvedRejected}
            barGap={2}
            margin={{
              left: 0,
              right: 0,
              top: 12,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="approved"
              fill="var(--color-approved)"
              radius={[4, 4, 0, 0]}
              barSize={12}
            />
            <Bar
              dataKey="rejected"
              stackId="naoAprovadas"
              fill="var(--color-rejected)"
              radius={[0, 0, 0, 0]}
              barSize={12}
            />
            <Bar
              dataKey="expired"
              stackId="naoAprovadas"
              fill="var(--color-expired)"
              radius={[4, 4, 0, 0]}
              barSize={12}
            />
          </BarChart>
        </ChartContainer>
        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-brand" />
            <span className="text-gray-600">Aprovadas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-warning" />
            <span className="text-gray-600">Vencidas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-error" />
            <span className="text-gray-600">Rejeitadas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
