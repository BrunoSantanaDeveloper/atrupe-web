'use client'

import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconClock,
  IconLoader2,
  IconAlertTriangle,
} from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

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
      <Icon
        icon={IconCircleCheckFilled}
        size="sm"
        className="text-success shrink-0"
      />
    ) : check.status === 'FAIL' ? (
      <Icon
        icon={IconCircleXFilled}
        size="sm"
        className="text-error shrink-0"
      />
    ) : (
      <Icon icon={IconClock} size="sm" className="text-warning shrink-0" />
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
      <div className="flex items-center justify-center gap-2 py-6 text-gray-500">
        <Icon icon={IconLoader2} size="sm" className="animate-spin" />
        <span className="text-sm">Avaliando prontidão…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-error-100 bg-error-50 p-3 text-error-700">
        <Icon icon={IconAlertTriangle} size="sm" className="shrink-0 mt-0.5" />
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
