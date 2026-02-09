'use client'

import { useQuery } from '@tanstack/react-query'

// UI
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Chart
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// Actions
import { getFinancialChart } from '@/actions/financial-report'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { FinancialTab } from '../types'

interface FinancialChartProps extends SearchParamsType {
  tab: FinancialTab
}

const chartColors = {
  received: '#22c55e', // green-500
  confirmed: '#3b82f6', // blue-500
  toReceive: '#eab308', // yellow-500
  overdue: '#ef4444', // red-500
}

export function FinancialChart({ searchParams, tab }: FinancialChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['financial-chart', searchParams, tab],
    queryFn: () => getFinancialChart({ tab }),
  })

  const formatTooltipValue = (value: number) => formatCurrencyToBrl(value)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {tab === 'receitas' ? 'Receitas' : 'Despesas'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-[300px]" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {tab === 'receitas' ? 'Receitas' : 'Despesas'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-gray-500">
            Nenhum dado disponível para o período selecionado
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {tab === 'receitas' ? 'Receitas' : 'Despesas'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartColors.received}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={chartColors.received}
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartColors.confirmed}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={chartColors.confirmed}
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorToReceive" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartColors.toReceive}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={chartColors.toReceive}
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorOverdue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartColors.overdue}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={chartColors.overdue}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                `R$ ${(value / 100).toLocaleString('pt-BR')}`
              }
            />
            <Tooltip
              formatter={formatTooltipValue}
              labelFormatter={(label) => label}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  received: 'Recebidas',
                  confirmed: 'Confirmadas',
                  toReceive: 'A receber',
                  overdue: 'Vencidas',
                }
                return labels[value] || value
              }}
            />
            <Area
              type="monotone"
              dataKey="received"
              stroke={chartColors.received}
              fill="url(#colorReceived)"
              strokeWidth={2}
              dot={{ fill: chartColors.received, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="confirmed"
              stroke={chartColors.confirmed}
              fill="url(#colorConfirmed)"
              strokeWidth={2}
              dot={{ fill: chartColors.confirmed, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="toReceive"
              stroke={chartColors.toReceive}
              fill="url(#colorToReceive)"
              strokeWidth={2}
              dot={{ fill: chartColors.toReceive, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="overdue"
              stroke={chartColors.overdue}
              fill="url(#colorOverdue)"
              strokeWidth={2}
              dot={{ fill: chartColors.overdue, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
