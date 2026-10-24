'use client'

// A conferência de caixa, uma só para a frente de caixa e para o controle de
// caixa (design.md §17: funções semelhantes, telas iguais). Esperado, contado
// e diferença sempre lado a lado (FC-7, CX-3 4.1); a tolerância, quando
// existe, deixa a diferença à vista sem lançá-la como quebra.

// UI
import { BrlInput } from '@/components/common/BrlInput'
import { Label } from '@/components/ui/label'

// Utils
import { cn, formatCurrencyToBrl } from '@/lib/utils'

const money = (value: number) => formatCurrencyToBrl(value)

// Campo de dinheiro em reais, guardando centavos
export function MoneyInput({
  id,
  label,
  value,
  onChange,
  autoFocus,
}: {
  id: string
  label: string
  value: number
  onChange: (cents: number) => void
  autoFocus?: boolean
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <BrlInput
        id={id}
        autoFocus={autoFocus}
        value={value}
        placeholder="0,00"
        onChange={onChange}
      />
    </div>
  )
}

export function CashCountCheck({
  expected,
  counted,
  tolerance = null,
  // Gaveta (dinheiro contado) ou banco (saldo do extrato)
  kind = 'cash',
}: {
  expected: number
  counted: number
  tolerance?: number | null
  kind?: 'cash' | 'bank'
}) {
  const difference = counted - expected
  const withinTolerance =
    difference !== 0 && tolerance !== null && Math.abs(difference) <= tolerance

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex justify-between text-sm">
        <span className="text-gray">O sistema esperava</span>
        <span className="font-medium">{money(expected)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray">
          {kind === 'cash' ? 'Você contou' : 'Extrato'}
        </span>
        <span className="font-medium">{money(counted)}</span>
      </div>
      <div className="flex justify-between border-t border-gray-200 pt-3">
        <span className="font-medium">
          {difference === 0 ? 'Bateu' : difference < 0 ? 'Falta' : 'Sobra'}
        </span>
        <span
          className={cn(
            'text-lg font-semibold',
            difference === 0
              ? 'text-success-700'
              : difference < 0
                ? 'text-error-600'
                : 'text-warning-700',
          )}
        >
          {money(Math.abs(difference))}
        </span>
      </div>
      {difference !== 0 && (
        <p className="text-sm text-gray">
          {kind === 'cash'
            ? withinTolerance
              ? `Dentro da tolerância de ${money(tolerance!)}: a diferença fica registrada no fechamento, mas não é lançada como quebra.`
              : 'A diferença vai para "Quebra de caixa", no nome de quem operou o caixa. Não vira ajuste escondido.'
            : 'A diferença fica registrada no fechamento, com a explicação.'}
        </p>
      )}
    </div>
  )
}

// A diferença que precisa de explicação: fora da tolerância (ou sem ela)
export const needsExplanation = (
  expected: number,
  counted: number,
  tolerance: number | null = null,
) => {
  const difference = counted - expected
  return (
    difference !== 0 && (tolerance === null || Math.abs(difference) > tolerance)
  )
}
