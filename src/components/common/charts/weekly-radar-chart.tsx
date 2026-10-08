'use client'

import * as React from 'react'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, Legend } from 'recharts'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const chartConfig = {
  series1: {
    label: 'Series 1',
    theme: {
      light: 'var(--chart-brand)',
      dark: 'var(--chart-brand)',
    },
  },
  series2: {
    label: 'Series 2',
    theme: {
      light: 'var(--chart-success)',
      dark: 'var(--chart-success)',
    },
  },
  series3: {
    label: 'Series 3',
    theme: {
      light: 'var(--chart-indigo)',
      dark: 'var(--chart-indigo)',
    },
  },
} satisfies ChartConfig

export interface WeeklyRadarData {
  day: string
  series1: number
  series2: number
  series3: number
}

interface WeeklyRadarChartProps {
  data: WeeklyRadarData[]
  title?: string
}

export function WeeklyRadarChart({ data, title }: WeeklyRadarChartProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-md bg-white border border-dashed border-[#7b61ff] overflow-hidden">
      {title && (
        <div className="w-full mb-4">
          <h3 className="type-body-strong text-center">{title}</h3>
        </div>
      )}
      <ChartContainer config={chartConfig} className="w-full max-w-sm h-64">
        <RadarChart data={data}>
          <PolarGrid
            gridType="polygon"
            stroke="#E4E4E7"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="day"
            tick={{ fill: 'var(--gray-500)', fontSize: 12 }}
            tickLine={false}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <Radar
            name="series1"
            dataKey="series1"
            fill="var(--color-series1)"
            fillOpacity={0.3}
            stroke="var(--color-series1)"
            strokeWidth={2}
          />
          <Radar
            name="series2"
            dataKey="series2"
            fill="var(--color-series2)"
            fillOpacity={0.3}
            stroke="var(--color-series2)"
            strokeWidth={2}
          />
          <Radar
            name="series3"
            dataKey="series3"
            fill="var(--color-series3)"
            fillOpacity={0.3}
            stroke="var(--color-series3)"
            strokeWidth={2}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{
              fontSize: '12px',
              color: '#667085',
              paddingTop: '16px',
            }}
          />
        </RadarChart>
      </ChartContainer>
    </div>
  )
}
