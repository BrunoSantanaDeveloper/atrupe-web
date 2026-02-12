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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts'

// Actions
import {
  getDfcCashFlowChart,
  getDfcRevenueExpenseChart,
} from '@/actions/dfc-report'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

const cashFlowConfig = {
  positive: {
    label: 'Positivo',
    color: '#6CE9A6',
  },
  negative: {
    label: 'Negativo',
    color: '#F97066',
  },
} satisfies ChartConfig

const revenueExpenseConfig = {
  revenue: {
    label: 'Receitas',
    color: '#6CE9A6',
  },
  expenses: {
    label: 'Despesas',
    color: '#F97066',
  },
} satisfies ChartConfig

export function ChartsSection({ searchParams }: SearchParamsType) {
  const { data: cashFlowData, isLoading: loadingCashFlow } = useQuery({
    queryKey: [
      'dfc-cash-flow-chart',
      searchParams?.startDate,
      searchParams?.endDate,
      searchParams?.regime,
    ],
    queryFn: () =>
      getDfcCashFlowChart({
        startDate: searchParams?.startDate as string,
        endDate: searchParams?.endDate as string,
        regime:
          (searchParams?.regime as 'realizado' | 'competencia') || undefined,
      }),
  })

  const { data: revenueExpenseData, isLoading: loadingRevenueExpense } =
    useQuery({
      queryKey: [
        'dfc-revenue-expense-chart',
        searchParams?.startDate,
        searchParams?.endDate,
        searchParams?.regime,
      ],
      queryFn: () =>
        getDfcRevenueExpenseChart({
          startDate: searchParams?.startDate as string,
          endDate: searchParams?.endDate as string,
          regime:
            (searchParams?.regime as 'realizado' | 'competencia') || undefined,
        }),
    })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Fluxo de Caixa */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-700">
            Fluxo de Caixa
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loadingCashFlow ? (
            <Skeleton className="h-[250px] w-full" />
          ) : (
            <>
              <ChartContainer
                config={cashFlowConfig}
                className="min-h-[200px] max-h-[250px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={cashFlowData}
                  margin={{ left: 0, right: 0, top: 12, bottom: 0 }}
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
                    tickFormatter={(value) => formatCurrencyToBrl(value)}
                    width={90}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, item) => {
                          const color = item.color || `var(--color-${name})`
                          return (
                            <div className="flex w-full items-center gap-2">
                              <div
                                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                style={{ backgroundColor: color }}
                              />
                              <div className="flex flex-1 items-center justify-between gap-8">
                                <span className="text-gray">
                                  {
                                    cashFlowConfig[
                                      name as keyof typeof cashFlowConfig
                                    ]?.label
                                  }
                                </span>
                                <span className="font-medium tabular-nums">
                                  {formatCurrencyToBrl(
                                    Math.abs(value as number),
                                  )}
                                </span>
                              </div>
                            </div>
                          )
                        }}
                      />
                    }
                  />
                  <ReferenceLine y={0} stroke="#d1d5db" />
                  <Bar dataKey="positive" stackId="stack" radius={[4, 4, 0, 0]}>
                    {cashFlowData?.map((_, index) => (
                      <Cell key={`pos-${index}`} fill="var(--color-positive)" />
                    ))}
                  </Bar>
                  <Bar dataKey="negative" stackId="stack" radius={[0, 0, 4, 4]}>
                    {cashFlowData?.map((_, index) => (
                      <Cell key={`neg-${index}`} fill="var(--color-negative)" />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
              {/* Legenda manual */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-success-400" />
                  <span className="text-gray-600">Positivo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-error" />
                  <span className="text-gray-600">Negativo</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Receitas x Despesas */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-700">
            Receitas x Despesas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loadingRevenueExpense ? (
            <Skeleton className="h-[250px] w-full" />
          ) : (
            <>
              <ChartContainer
                config={revenueExpenseConfig}
                className="min-h-[200px] max-h-[250px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={revenueExpenseData}
                  barGap={2}
                  margin={{ left: 0, right: 0, top: 12, bottom: 0 }}
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
                    tickFormatter={(value) => formatCurrencyToBrl(value)}
                    width={90}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, item) => {
                          const color = item.color || `var(--color-${name})`
                          return (
                            <div className="flex w-full items-center gap-2">
                              <div
                                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                style={{ backgroundColor: color }}
                              />
                              <div className="flex flex-1 items-center justify-between gap-8">
                                <span className="text-gray">
                                  {
                                    revenueExpenseConfig[
                                      name as keyof typeof revenueExpenseConfig
                                    ]?.label
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
                  <Bar
                    dataKey="revenue"
                    fill="var(--color-revenue)"
                    radius={[4, 4, 0, 0]}
                    barSize={12}
                  />
                  <Bar
                    dataKey="expenses"
                    fill="var(--color-expenses)"
                    radius={[4, 4, 0, 0]}
                    barSize={12}
                  />
                </BarChart>
              </ChartContainer>
              {/* Legenda manual */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-success-400" />
                  <span className="text-gray-600">Receitas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-error" />
                  <span className="text-gray-600">Despesas</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
