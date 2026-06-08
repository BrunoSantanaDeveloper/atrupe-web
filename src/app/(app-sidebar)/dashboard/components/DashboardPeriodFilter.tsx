'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export type DashboardPeriod = 'current_month' | 'last_30_days' | 'next_30_days'

const periodOptions: { value: DashboardPeriod; label: string }[] = [
  { value: 'current_month', label: 'Mes atual' },
  { value: 'last_30_days', label: 'Ultimos 30 dias' },
  { value: 'next_30_days', label: 'Proximos 30 dias' },
]

interface DashboardPeriodFilterProps {
  value: DashboardPeriod
  onChange: (value: DashboardPeriod) => void
}

export function DashboardPeriodFilter({
  value,
  onChange,
}: DashboardPeriodFilterProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {periodOptions.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="none"
          variant="none"
          onClick={() => onChange(option.value)}
        >
          <Badge
            variant={value === option.value ? 'neutralLight' : 'neutralOutline'}
            className="border border-gray-300"
          >
            {option.label}
          </Badge>
        </Button>
      ))}
    </div>
  )
}
