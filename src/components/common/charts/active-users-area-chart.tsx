'use client'

import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const chartConfig = {
  users: {
    label: 'Usuários',
    theme: {
      light: 'var(--chart-brand)',
      dark: 'var(--chart-brand)',
    },
  },
} satisfies ChartConfig

export interface ActiveUsersData {
  month: string
  users: number
}

interface ActiveUsersAreaChartProps {
  data: ActiveUsersData[]
  title?: string
  subtitle?: string
}

export function ActiveUsersAreaChart({
  data,
  title = 'Usuários ativos',
  subtitle = 'Month',
}: ActiveUsersAreaChartProps) {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-md bg-white border border-dashed border-[#7b61ff] overflow-hidden">
      <div className="flex flex-col items-center justify-center space-y-1 pb-4">
        {subtitle && (
          <span className="text-xs font-medium text-gray-500">{subtitle}</span>
        )}
        {title && <h3 className="type-card-title">{title}</h3>}
      </div>

      <ChartContainer config={chartConfig} className="w-full h-64">
        <AreaChart
          data={data}
          margin={{
            left: -20,
            right: 12,
            top: 12,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-users)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="var(--color-users)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="#E4E4E7"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
            className="text-xs text-gray-500"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickCount={5}
            className="text-xs text-gray-500"
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Area
            dataKey="users"
            type="monotone"
            fill="url(#fillUsers)"
            fillOpacity={0.4}
            stroke="var(--color-users)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
