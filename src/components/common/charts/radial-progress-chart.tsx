'use client'

import * as React from 'react'
import {
  Label,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from 'recharts'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const chartConfig = {
  value: {
    label: 'Valor',
    theme: {
      light: 'var(--chart-brand)',
      dark: 'var(--chart-brand)',
    },
  },
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

export interface RadialProgressData {
  name: string
  value: number
  fill: string
}

interface RadialProgressChartProps {
  data: RadialProgressData[]
  totalValue?: number // used to scale the 360 ring
  title?: string
  subtitle?: string
  centerLabel?: string | number
  centerSubLabel?: string
  startAngle?: number
  endAngle?: number
}

export function RadialProgressChart({
  data,
  title,
  subtitle,
  centerLabel,
  centerSubLabel,
  startAngle = 90,
  endAngle = -270,
  totalValue = 100, // By default out of 100
}: RadialProgressChartProps) {
  // Normalize data relative to radial maximum of `totalValue` so it fills part of the ring.
  // Recharts RadialBar natively uses domain in PolarRadiusAxis, but standard way is 0-max in PolarAngleAxis.
  
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-md bg-white border border-dashed border-[#7b61ff] overflow-hidden">
      {(title || subtitle) && (
        <div className="w-full mb-2 text-center">
          {title && <h3 className="text-sm font-semibold text-gray-900">{title}</h3>}
          {subtitle && (
            <p className="text-xs font-medium text-[#667085]">{subtitle}</p>
          )}
        </div>
      )}
      <ChartContainer config={chartConfig} className="mx-auto aspect-square min-h-[200px] w-full max-w-[200px]">
        <RadialBarChart
          data={data}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius="60%"
          outerRadius="100%"
          barSize={12}
        >
          {/* We define a dummy polar radius axis to create the background track if needed, or rely on recharts stroke */}
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            {centerLabel && (
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + (centerSubLabel ? -4 : 4)}
                          className="fill-gray-900 text-2xl font-bold"
                        >
                          {centerLabel}
                        </tspan>
                        {centerSubLabel && (
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 16}
                            className="fill-[#667085] text-xs font-medium"
                          >
                            {centerSubLabel}
                          </tspan>
                        )}
                      </text>
                    )
                  }
                  return null
                }}
              />
            )}
          </PolarRadiusAxis>

          <RadialBar
            dataKey="value"
            background={{ fill: '#F2F4F7' }}
            cornerRadius={10}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel nameKey="name" />}
          />
        </RadialBarChart>
      </ChartContainer>
    </div>
  )
}
