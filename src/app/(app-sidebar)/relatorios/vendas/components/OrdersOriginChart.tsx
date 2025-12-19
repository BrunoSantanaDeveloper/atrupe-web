'use client'

// UI
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

// Third-party
import { PieChart, Pie, Cell } from 'recharts'

// Mock Data
import { mockSalesReportData } from '../mock-data'

const COLORS = {
  whatsapp: '#039855',
  balcao: '#F97066',
  instagram: '#475467',
  site: '#F79009',
  outros: '#FDB022',
}

const chartConfig = {
  whatsapp: { label: 'WhatsApp', color: COLORS.whatsapp },
  balcao: { label: 'Balcão', color: COLORS.balcao },
  instagram: { label: 'Instagram', color: COLORS.instagram },
  site: { label: 'Site', color: COLORS.site },
  outros: { label: 'Outros', color: COLORS.outros },
} satisfies ChartConfig

export function OrdersOriginChart() {
  const { ordersOrigin } = mockSalesReportData

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-700">
          Origens das OS
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <ChartContainer config={chartConfig} className="h-[200px] w-[200px]">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={ordersOrigin}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={90}
                paddingAngle={0}
                dataKey="value"
                nameKey="name"
              >
                {ordersOrigin.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="none"
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-4 text-sm">
            {ordersOrigin.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
