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
    label: 'Aprovados',
    color: '#4CBC89',
  },
  rejected: {
    label: 'Vendas',
    color: '#F97316',
  },
  inProgress: {
    label: 'Em andamento',
    color: '#FCD34D',
  },
} satisfies ChartConfig

export function ApprovedRejectedChart() {
  const { approvedRejected } = mockSalesReportData

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-700">
          Aprovados x Não aprovados
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
            <YAxis tickLine={false} axisLine={false} hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="approved"
              fill="var(--color-approved)"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="rejected"
              fill="var(--color-rejected)"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="inProgress"
              fill="var(--color-inProgress)"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ChartContainer>
        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#4CBC89]" />
            <span className="text-gray-600">Aprovados</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#F97316]" />
            <span className="text-gray-600">Vendas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#FCD34D]" />
            <span className="text-gray-600">Em andamento</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
