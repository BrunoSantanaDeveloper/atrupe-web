'use client'

// React
import { useState } from 'react'

// UI
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
export function PeriodFilter() {
  const [period, setPeriod] = useState('30 dias')

  return (
    <div className="flex gap-1">
      <Button
        type="button"
        size="badge"
        variant="none"
        onClick={() => setPeriod('30 dias')}
      >
        <Badge
          variant={period === '30 dias' ? 'neutralLight' : 'neutralOutline'}
          className="border border-gray-300"
        >
          30 dias
        </Badge>
      </Button>
      <Button
        type="button"
        size="badge"
        variant="none"
        onClick={() => setPeriod('6 meses')}
      >
        <Badge
          variant={period === '6 meses' ? 'neutralLight' : 'neutralOutline'}
          className="border border-gray-300"
        >
          6 meses
        </Badge>
      </Button>
      <Button
        type="button"
        size="badge"
        variant="none"
        onClick={() => setPeriod('1 ano')}
      >
        <Badge
          variant={period === '1 ano' ? 'neutralLight' : 'neutralOutline'}
          className="border border-gray-300"
        >
          1 ano
        </Badge>
      </Button>
    </div>
  )
}
