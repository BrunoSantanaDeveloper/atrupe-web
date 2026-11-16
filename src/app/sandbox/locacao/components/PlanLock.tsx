'use client'

// A trava da locação diz o caminho: o que o recurso faz e em que plano ele
// entra, antes do clique (regra geral das travas). Com o recurso no plano,
// mostra o conteúdo.

import { IconLock } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import { PLAN_NAME, planHas, type Plan } from '../data'

export function PlanLock({
  plan,
  from,
  title,
  children,
  locked,
  className,
}: {
  plan: Plan
  from: Plan
  title: string
  // O que o cliente lê no plano que não tem o recurso
  locked: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  if (planHas(plan, from)) return <>{children}</>

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4',
        className,
      )}
    >
      <IconLock className="mt-0.5 size-5 shrink-0 text-gray-400" aria-hidden />
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-gray-700">{title}</p>
          <Badge variant="neutralLight">A partir do {PLAN_NAME[from]}</Badge>
        </div>
        <p className="text-sm text-gray">{locked}</p>
      </div>
    </div>
  )
}

export function PlanTag({ from }: { from: Plan }) {
  return <Badge variant="light">{PLAN_NAME[from]}</Badge>
}
