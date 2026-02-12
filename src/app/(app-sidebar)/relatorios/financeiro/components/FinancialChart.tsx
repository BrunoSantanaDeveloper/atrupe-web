'use client'

import { useQuery } from '@tanstack/react-query'

// UI
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartConfig,
  ChartTooltip,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart'

// Chart
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'

// Actions
import { getFinancialChart } from '@/actions/financial-report'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { FinancialTab } from '../types'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

interface FinancialChartProps extends SearchParamsType {
  tab: FinancialTab
}

const getChartConfig = (tab: FinancialTab) =>
  ({
    received: {
      label: tab === 'receitas' ? 'Recebidas' : 'Pagas',
      color: '#6CE9A6',
    },
    confirmed: {
      label: 'Confirmadas',
      color: '#3b82f6',
    },
    toReceive: {
      label: tab === 'receitas' ? 'A receber' : 'A pagar',
      color: '#FEC84B',
    },
    overdue: {
      label: 'Vencidas',
      color: '#F97066',
    },
  }) satisfies ChartConfig

export function FinancialChart({ searchParams, tab }: FinancialChartProps) {
  const { canProvision } = usePlanFeatures()
  const showConfirmed = canProvision()
  const chartConfig = getChartConfig(tab)

  const { data, isLoading } = useQuery({
    queryKey: [
      'financial-chart',
      searchParams?.startDate,
      searchParams?.endDate,
      tab,
    ],
    queryFn: () =>
      getFinancialChart({
        tab,
        startDate: searchParams?.startDate as string,
        endDate: searchParams?.endDate as string,
      }),
  })

  if (isLoading) {
    return (
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-700">
            {tab === 'receitas' ? 'Receitas' : 'Despesas'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-700">
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
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-700">
          {tab === 'receitas' ? 'Receitas' : 'Despesas'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer
          config={chartConfig}
          className="min-h-[250px] max-h-[300px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
          >
            <defs>
              <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-received)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-received)"
                  stopOpacity={0}
                />
              </linearGradient>
              {showConfirmed && (
                <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-confirmed)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-confirmed)"
                    stopOpacity={0}
                  />
                </linearGradient>
              )}
              <linearGradient id="colorToReceive" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-toReceive)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-toReceive)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorOverdue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-overdue)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-overdue)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
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
              tickFormatter={(value) => formatCurrencyToBrl(value)}
              width={90}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => {
                    const countKey = `${String(name)}Count`
                    const count = item.payload?.[countKey] ?? 0
                    const color = item.color || `var(--color-${String(name)})`
                    return (
                      <div className="flex w-full items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: color }}
                        />
                        <div className="flex flex-1 items-center justify-between gap-8">
                          <span className="text-gray">
                            {count}{' '}
                            {
                              chartConfig[name as keyof typeof chartConfig]
                                ?.label
                            }
                          </span>
                          <span className="font-medium tabular-nums">
                            {formatCurrencyToBrl(value as number)}
                          </span>
                        </div>
                      </div>
                    )
                  }}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="received"
              stroke="var(--color-received)"
              fill="url(#colorReceived)"
              strokeWidth={2}
              dot={{ stroke: 'var(--color-received)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 4, strokeWidth: 2, opacity: 0.5 }}
            />
            {showConfirmed && (
              <Area
                type="monotone"
                dataKey="confirmed"
                stroke="var(--color-confirmed)"
                fill="url(#colorConfirmed)"
                strokeWidth={2}
                dot={{ stroke: 'var(--color-confirmed)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2, opacity: 0.5 }}
              />
            )}
            <Area
              type="monotone"
              dataKey="toReceive"
              stroke="var(--color-toReceive)"
              fill="url(#colorToReceive)"
              strokeWidth={2}
              dot={{ stroke: 'var(--color-toReceive)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2, opacity: 0.5 }}
            />
            <Area
              type="monotone"
              dataKey="overdue"
              stroke="var(--color-overdue)"
              fill="url(#colorOverdue)"
              strokeWidth={2}
              dot={{ stroke: 'var(--color-overdue)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2, opacity: 0.5 }}
            />
          </AreaChart>
        </ChartContainer>
        {/* Legenda manual */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-success-400" />
            <span className="text-gray-600">
              {tab === 'receitas' ? 'Recebidas' : 'Pagas'}
            </span>
          </div>
          {showConfirmed && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-gray-600">Confirmadas</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-gray-600">
              {tab === 'receitas' ? 'A receber' : 'A pagar'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-error" />
            <span className="text-gray-600">Vencidas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
