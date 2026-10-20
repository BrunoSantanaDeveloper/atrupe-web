'use client'

import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconClock,
  IconAlertTriangle,
} from '@tabler/icons-react'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

import {
  readinessLabel,
  sortReadinessChecks,
  type ReadinessCheck,
  type ReadinessResult,
} from '../lib/fiscal-readiness'

interface ReadinessChecklistProps {
  data?: ReadinessResult
  isLoading?: boolean
  error?: string | null
}

function CheckRow({ check }: { check: ReadinessCheck }) {
  const icon =
    check.status === 'PASS' ? (
      <IconCircleCheckFilled className="h-4 w-4 text-success shrink-0" />
    ) : check.status === 'FAIL' ? (
      <IconCircleXFilled className="h-4 w-4 text-error shrink-0" />
    ) : (
      <IconClock className="h-4 w-4 text-warning shrink-0" />
    )

  return (
    <li className="flex items-start gap-2 py-1.5">
      {icon}
      <div className="min-w-0">
        <p
          className={cn(
            'text-sm font-medium',
            check.status === 'FAIL' ? 'text-error-700' : 'text-gray-800',
          )}
        >
          {readinessLabel(check.check)}
        </p>
        {check.message && (
          <p className="text-xs text-gray-500">{check.message}</p>
        )}
      </div>
    </li>
  )
}

export function ReadinessChecklist({
  data,
  isLoading,
  error,
}: ReadinessChecklistProps) {
  if (isLoading) {
    return (
      // Mesmo formato do resultado: o resumo e as linhas da lista
      <div className="space-y-2">
        <Skeleton className="h-11 w-full rounded-lg" />
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 py-2">
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-error-100 bg-error-50 p-3 text-error-700">
        <IconAlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <p className="py-4 text-sm text-gray-500">
        Nenhum diagnóstico disponível.
      </p>
    )
  }

  const blockingCount = data.blocking?.length ?? 0

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'rounded-lg border p-3 text-sm font-medium',
          data.ready
            ? 'border-success-100 bg-success-50 text-success-700'
            : 'border-warning-100 bg-warning-50 text-warning-700',
        )}
      >
        {data.ready
          ? 'Pronto para ativar'
          : `${blockingCount} pendência(s) bloqueante(s)`}
      </div>

      <ul className="divide-y divide-gray-100">
        {sortReadinessChecks(data.checks).map((check) => (
          <CheckRow key={check.check} check={check} />
        ))}
      </ul>
    </div>
  )
}
