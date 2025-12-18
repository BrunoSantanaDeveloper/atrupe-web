'use client'

// UI
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'

// Third-party
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

// Mock Data
import { mockSalesReportData } from '../mock-data'

const chartConfig = {
  whatsapp: {
    label: 'WhatsApp',
    color: '#25D366',
  },
  site: {
    label: 'Site',
    color: '#3B82F6',
  },
  instagram: {
    label: 'Instagram',
    color: '#E1306C',
  },
  outros: {
    label: 'Outros',
    color: '#9CA3AF',
  },
} satisfies ChartConfig

export function QuotationsOriginChart() {
  const { quotationsOrigin } = mockSalesReportData

  const _total = quotationsOrigin.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-700">
          Origens dos orçamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <ChartContainer config={chartConfig} className="h-[180px] w-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={quotationsOrigin}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {quotationsOrigin.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          {/* Legend */}
          <div className="flex flex-col gap-2 text-sm">
            {quotationsOrigin.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
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
