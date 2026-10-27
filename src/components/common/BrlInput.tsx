'use client'

// Campo de valor em reais fora do react-hook-form: o valor é em centavos e a
// digitação é como numa calculadora (1, 0, 0, 0 → R$ 10,00), igual ao
// FormBrlInput dos formulários. Substitui o <input type="number"> controlado
// com toFixed(2), que reformatava a cada tecla e só andava de centavo em
// centavo (saldo inicial da conta, tolerância, contagem do caixa).

import { forwardRef } from 'react'

import { Input } from '@/components/ui/input'

export const formatCents = (cents: number) =>
  ((cents || 0) / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export const parseCents = (text: string) =>
  parseInt(text.replace(/\D/g, ''), 10) || 0

type Props = Omit<
  React.ComponentProps<typeof Input>,
  'value' | 'onChange' | 'type'
> & {
  value: number
  onChange: (cents: number) => void
}

export const BrlInput = forwardRef<HTMLInputElement, Props>(function BrlInput(
  { value, onChange, startAdornment, ...props },
  ref,
) {
  return (
    <Input
      ref={ref}
      inputMode="numeric"
      startAdornment={startAdornment ?? <span className="text-sm">R$</span>}
      value={formatCents(value)}
      onChange={(event) => onChange(parseCents(event.target.value))}
      {...props}
    />
  )
})
