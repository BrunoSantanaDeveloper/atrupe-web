'use client'

// UI
import { Card } from '@/components/ui/card'

// Types
import type { SectorCapacity } from '../types'

// Hooks / Store / Consts
import { cn } from '@/lib/utils'

interface Props {
  capacities: SectorCapacity[]
}

// Cada setor tem capacidade produtiva e tempo previsto (§12.2). Quando o
// previsto passa da capacidade, o setor está sobrecarregado.
export function CapacityCards({ capacities }: Props) {
  if (!capacities.length) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {capacities.map((capacity) => {
        const usage = capacity.dailyHours
          ? Math.round((capacity.plannedHours / capacity.dailyHours) * 100)
          : 0
        const overloaded = usage > 100

        return (
          <Card key={capacity.sector} className="p-4 rounded-xl">
            <p className="text-xs text-gray truncate">{capacity.sector}</p>
            <p className="text-lg font-semibold text-gray-900">
              {capacity.plannedHours}h{' '}
              <span className="text-sm font-normal text-gray">
                de {capacity.dailyHours}h
              </span>
            </p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
              <div
                role="img"
                aria-label={`${capacity.sector}: ${usage}% da capacidade`}
                className={cn(
                  'h-1.5 rounded-full',
                  overloaded ? 'bg-error-500' : 'bg-brand',
                )}
                style={{ width: `${Math.min(usage, 100)}%` }}
              />
            </div>
            <p
              className={cn(
                'text-xs mt-1',
                overloaded ? 'text-error-700' : 'text-gray',
              )}
            >
              {overloaded ? `Sobrecarregado · ${usage}%` : `${usage}% do dia`}
            </p>
          </Card>
        )
      })}
    </div>
  )
}
