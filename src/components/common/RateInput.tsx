'use client'

// React / Next
import { useState } from 'react'

// UI
import { Input, type InputProps } from '@/components/ui/input'

// Padrão dos rateios (design.md §6.8): a barra anda em inteiros e o campo
// aceita fração — centavos, percentual com duas casas e horas com minutos.
// O campo guarda o texto enquanto está em foco e só grava ao sair ou no Enter,
// para a barra não reescrever o que está sendo digitado.

interface Props
  extends Omit<InputProps, 'value' | 'onChange' | 'defaultValue'> {
  value: number
  format: (value: number) => string
  // `null` descarta o texto e volta ao valor atual
  parse: (text: string) => number | null
  onCommit: (value: number) => void
}

export function RateInput({
  value,
  format,
  parse,
  onCommit,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: Props) {
  const [draft, setDraft] = useState<string | null>(null)

  const commit = () => {
    if (draft === null) return

    const parsed = parse(draft)

    if (parsed !== null) onCommit(parsed)
    setDraft(null)
  }

  return (
    <Input
      {...props}
      inputMode="decimal"
      value={draft ?? format(value)}
      onFocus={(event) => {
        setDraft(format(value))
        onFocus?.(event)
      }}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={(event) => {
        commit()
        onBlur?.(event)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') commit()
        onKeyDown?.(event)
      }}
    />
  )
}

// "1.234,56" → 1234.56; aceita também ponto como decimal quando não há vírgula
export const parseDecimal = (text: string) => {
  const clean = text.replace(/[^\d.,-]/g, '')
  if (!clean) return 0

  const normalized = clean.includes(',')
    ? clean.replace(/\./g, '').replace(',', '.')
    : clean

  const value = Number(normalized)

  return Number.isFinite(value) ? Math.max(value, 0) : null
}

export const formatPercent = (value: number) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

// Centavos → "3.250,00", sem o símbolo (o campo mostra "R$" ao lado)
export const formatCentsInput = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export const parseCentsInput = (text: string) => {
  const value = parseDecimal(text)

  return value === null ? null : Math.round(value * 100)
}

// Horas em h:mm (IP-33): 165,5 h → "165:30"; "165:30" → 165,5
export const formatHours = (hours: number) => {
  const minutes = Math.round(hours * 60)

  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`
}

export const parseHours = (text: string) => {
  const clean = text.trim()
  if (!clean) return 0

  if (!clean.includes(':')) return parseDecimal(clean)

  const [hours, minutes] = clean.split(':').map((part) => Number(part) || 0)

  return Math.max(hours + minutes / 60, 0)
}

// Leitura: 165,5 h → "165h30"; 176 h → "176 h"
export const formatHoursLabel = (hours: number) => {
  const minutes = Math.round(hours * 60)
  const rest = minutes % 60

  return rest
    ? `${Math.floor(minutes / 60)}h${String(rest).padStart(2, '0')}`
    : `${minutes / 60} h`
}
