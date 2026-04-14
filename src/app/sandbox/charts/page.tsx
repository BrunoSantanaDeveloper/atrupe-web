import React from 'react'
import {
  ActiveUsersAreaChart,
  WeeklyRadarChart,
  RadialProgressChart,
} from '@/components/common/charts'

const mockAreaChartData = [
  { month: 'Jan', users: 200 },
  { month: 'Feb', users: 400 },
  { month: 'Mar', users: 300 },
  { month: 'Apr', users: 700 },
  { month: 'May', users: 500 },
  { month: 'Jun', users: 800 },
  { month: 'Jul', users: 600 },
  { month: 'Aug', users: 900 },
  { month: 'Sep', users: 750 },
  { month: 'Oct', users: 850 },
  { month: 'Nov', users: 950 },
  { month: 'Dec', users: 1000 },
]

const mockRadarChartData = [
  { day: 'Mon', series1: 60, series2: 80, series3: 40 },
  { day: 'Tue', series1: 70, series2: 60, series3: 50 },
  { day: 'Wed', series1: 80, series2: 50, series3: 70 },
  { day: 'Thu', series1: 60, series2: 70, series3: 90 },
  { day: 'Fri', series1: 40, series2: 90, series3: 80 },
  { day: 'Sat', series1: 30, series2: 40, series3: 30 },
  { day: 'Sun', series1: 50, series2: 60, series3: 40 },
]

const mockRadialData = [{ name: 'Usuários', value: 40, fill: 'var(--chart-brand)' }]

export default function ChartsSandbox() {
  return (
    <div className="p-8 space-y-12 bg-gray-50 min-h-screen">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Chart Components Sandbox</h1>
        <p className="text-gray-600">
          Atomic charts built with Recharts, matching the Figma design system.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Active Users Area Chart</h2>
          <ActiveUsersAreaChart data={mockAreaChartData} />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Weekly Radar Chart</h2>
          <WeeklyRadarChart data={mockRadarChartData} />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Radial Progress (Single)</h2>
          <div className="flex gap-4">
            <RadialProgressChart
              data={mockRadialData}
              centerLabel="40%"
              centerSubLabel="Usuários ativos"
            />
            <RadialProgressChart
              data={[{ name: 'Usuários', value: 75, fill: 'var(--chart-success)' }]}
              centerLabel="1,000"
            />
          </div>
        </section>
      </div>
    </div>
  )
}
