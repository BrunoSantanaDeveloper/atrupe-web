'use client'

// React
import { useQuery } from '@tanstack/react-query'

// UI
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

// Third-party
import { PieChart, Pie, Cell } from 'recharts'

// Actions
import { getOrdersOrigin } from '@/actions/sales-report'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

const chartConfig = {
  whatsapp: { label: 'WhatsApp', color: '#039855' },
  balcao: { label: 'Balcão', color: '#F97066' },
  instagram: { label: 'Instagram', color: '#475467' },
  site: { label: 'Site', color: '#F79009' },
  outros: { label: 'Outros', color: '#FDB022' },
} satisfies ChartConfig

interface OrdersOriginChartProps extends SearchParamsType {}

export function OrdersOriginChart({ searchParams }: OrdersOriginChartProps) {
  const { data: ordersOrigin = [], isLoading } = useQuery({
    queryKey: ['sales-orders-origin', searchParams],
    queryFn: () =>
      getOrdersOrigin({
        sellerId: searchParams?.sellerId as string,
        originId: searchParams?.originId as string,
        startDate: searchParams?.startDate as string,
        endDate: searchParams?.endDate as string,
      }),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-700">
          Origens das OS
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center">
            <Skeleton className="h-[200px] w-[200px] rounded-full" />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <ChartContainer
              config={chartConfig}
              className="h-[200px] w-[200px]"
            >
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
        )}
      </CardContent>
    </Card>
  )
}
