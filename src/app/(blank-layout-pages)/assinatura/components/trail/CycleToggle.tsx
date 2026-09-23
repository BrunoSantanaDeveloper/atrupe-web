'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export type Cycle = 'MONTHLY' | 'YEARLY'

interface Props {
  value: Cycle
  onChange: (cycle: Cycle) => void
  /** Quando só um ciclo vale — do anual, só se evolui para o anual. */
  only?: Cycle
}

/**
 * Mensal ou anual, escolhido antes de contratar, com o benefício do anual à
 * vista. O ciclo escolhido segue para o pagamento, onde ainda pode mudar.
 */
export function CycleToggle({ value, onChange, only }: Props) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next as Cycle)
      }}
      aria-label="Ciclo de cobrança"
      className="inline-flex gap-1 rounded-lg border bg-white p-1"
    >
      {(['MONTHLY', 'YEARLY'] as const).map((cycle) => (
        <ToggleGroupItem
          key={cycle}
          value={cycle}
          disabled={!!only && only !== cycle}
          className="rounded-md px-4 py-2 text-gray-700 data-[state=on]:bg-brand-50 data-[state=on]:text-brand-700"
        >
          {cycle === 'MONTHLY' ? 'Mensal' : 'Anual'}
          {cycle === 'YEARLY' && (
            <span className="ml-2 rounded bg-success-50 px-1.5 text-xs text-success-700">
              1 mês grátis
            </span>
          )}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

/** O preço em destaque é sempre por mês, para os ciclos se compararem. */
export function monthlyEquivalentCents(recurringCents: number, cycle: Cycle) {
  return cycle === 'YEARLY' ? Math.round(recurringCents / 12) : recurringCents
}
