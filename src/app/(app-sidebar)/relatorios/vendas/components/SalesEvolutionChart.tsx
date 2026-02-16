'use client'

// React
import { useMemo } from 'react'
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

// Third-party
import { Line, XAxis, YAxis, CartesianGrid, LineChart } from 'recharts'

// Actions
import { getSalesEvolution } from '@/actions/sales-report'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { SalesEvolutionResponse } from '../types'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

const YEAR_COLORS = [
  '#12B76A',
  '#F79009',
  '#6172F3',
  '#EE46BC',
  '#7A5AF8',
  '#0BA5EC',
]

const MONTH_LABELS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

interface SalesEvolutionChartProps extends SearchParamsType {}

export function SalesEvolutionChart({
  searchParams,
}: SalesEvolutionChartProps) {
  const {
    data: evolution = { mode: 'daily', data: [], yearlyData: [] },
    isLoading,
  } = useQuery<SalesEvolutionResponse>({
    queryKey: [
      'sales-evolution',
      searchParams?.startDate,
      searchParams?.endDate,
      searchParams?.sellerId,
      searchParams?.originId,
    ],
    queryFn: () =>
      getSalesEvolution({
        sellerId: searchParams?.sellerId as string,
        originId: searchParams?.originId as string,
        startDate: searchParams?.startDate as string,
        endDate: searchParams?.endDate as string,
      }),
  })

  // For yearly mode, transform yearlyData into recharts-friendly format
  const { yearlyChartData, yearKeys, yearlyChartConfig } = useMemo(() => {
    if (evolution.mode !== 'yearly' || !evolution.yearlyData?.length) {
      return { yearlyChartData: [], yearKeys: [], yearlyChartConfig: {} }
    }

    const years = evolution.yearlyData.map((y) => y.year)

    // Build config for each year
    const config: ChartConfig = {}
    years.forEach((year, i) => {
      config[String(year)] = {
        label: String(year),
        color: YEAR_COLORS[i % YEAR_COLORS.length],
      }
    })

    // Build data array: one entry per month (Jan-Dec)
    const chartData = MONTH_LABELS.map((month) => {
      const point: Record<string, string | number | null> = { month }
      years.forEach((year) => {
        const yearEntry = evolution.yearlyData.find((y) => y.year === year)
        const monthEntry = yearEntry?.data.find((m) => m.month === month)
        point[String(year)] = monthEntry ? monthEntry.approved : null
        point[`count_${year}`] = monthEntry ? monthEntry.count : null
      })
      return point
    })

    return {
      yearlyChartData: chartData,
      yearKeys: years.map(String),
      yearlyChartConfig: config,
    }
  }, [evolution])

  const dailyMonthlyConfig: ChartConfig = {
    approved: {
      label: 'Aprovadas',
      color: 'var(--chart-brand)',
    },
  }

  const renderDailyMonthlyChart = () => (
    <ChartContainer
      config={dailyMonthlyConfig}
      className="min-h-[250px] max-h-[300px] w-full"
    >
      <LineChart
        accessibilityLayer
        data={evolution.data}
        margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
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
                const count = item.payload?.count ?? 0
                const color = item.color || 'var(--color-approved)'
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
                          dailyMonthlyConfig[
                            name as keyof typeof dailyMonthlyConfig
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
        <Line
          dataKey="approved"
          type="monotone"
          stroke="var(--color-approved)"
          strokeWidth={2}
          dot={{
            stroke: 'var(--color-approved)',
            strokeWidth: 2,
            r: 4,
          }}
          activeDot={{
            r: 4,
            strokeWidth: 2,
            opacity: 0.5,
          }}
        />
      </LineChart>
    </ChartContainer>
  )

  const renderYearlyChart = () => (
    <>
      <ChartContainer
        config={yearlyChartConfig}
        className="min-h-[250px] max-h-[300px] w-full"
      >
        <LineChart
          accessibilityLayer
          data={yearlyChartData}
          margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
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
                  const count = item.payload?.[`count_${name}`] ?? 0
                  const color =
                    yearlyChartConfig[name as string]?.color || '#888'
                  return (
                    <div className="flex w-full items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex flex-1 items-center justify-between gap-8">
                        <span className="text-gray">
                          {count} Aprovadas ({name})
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
          {yearKeys.map((yearKey, i) => (
            <Line
              key={yearKey}
              dataKey={yearKey}
              type="monotone"
              stroke={YEAR_COLORS[i % YEAR_COLORS.length]}
              strokeWidth={2}
              connectNulls={false}
              dot={{
                stroke: YEAR_COLORS[i % YEAR_COLORS.length],
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 4,
                strokeWidth: 2,
                opacity: 0.5,
              }}
            />
          ))}
        </LineChart>
      </ChartContainer>
      {/* Year legend */}
      <div className="mt-4 flex items-center justify-center gap-6">
        {yearKeys.map((yearKey, i) => (
          <div key={yearKey} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded"
              style={{
                backgroundColor: YEAR_COLORS[i % YEAR_COLORS.length],
              }}
            />
            <span className="text-sm text-gray-600">{yearKey}</span>
          </div>
        ))}
      </div>
    </>
  )

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Evolução de vendas do período</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : evolution.mode === 'yearly' ? (
          renderYearlyChart()
        ) : (
          renderDailyMonthlyChart()
        )}
      </CardContent>
    </Card>
  )
}
