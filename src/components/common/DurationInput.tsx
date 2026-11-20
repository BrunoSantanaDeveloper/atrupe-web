'use client'

// Tempo digitado em hh:mm:ss, com o relógio (IP-33; padronizado em
// 20/11/2026). A máscara coloca os dois pontos sozinha: a pessoa digita só
// números e eles entram pela direita ("1" → 00:01, "10" → 00:10, "130" →
// 01:30). A precisão diz até onde se digita (hh, hh:mm ou hh:mm:ss); o que
// fica de fora aparece depois do texto, mais claro e menor ("01:30" + ":00").
// Ao sair do campo, minutos e segundos acima de 59 sobem ("0:75" → 01:15).
// O valor de fora é em minutos (mão de obra) ou em horas (máquina por hora).

import { useEffect, useState } from 'react'

// UI
import type { InputProps } from '@/components/ui/input'
import { useFormField } from '@/components/ui/form'
import { cn } from '@/lib/utils'

// Icons
import { IconClock } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

export type DurationPrecision = 'h' | 'hm' | 'hms'

// Quantos dígitos cada precisão aceita: as horas vão até 999
const MAX_DIGITS: { [key in DurationPrecision]: number } = {
  h: 3,
  hm: 5,
  hms: 7,
}
const RANK: { [key in DurationPrecision]: number } = { h: 0, hm: 1, hms: 2 }

const pad = (value: number) => String(value).padStart(2, '0')

// Só dígitos, preenchidos da direita: os dois últimos são a menor parte
export const maskDuration = (raw: string, precision: DurationPrecision) => {
  const digits = raw
    .replace(/\D/g, '')
    .replace(/^0+/, '')
    .slice(0, MAX_DIGITS[precision])
  if (!digits) return ''
  if (precision === 'h') return pad(Number(digits))
  const tailSize = (RANK[precision] as number) * 2
  const padded = digits.padStart(tailSize + 2, '0')
  const tail = padded.slice(-tailSize).match(/../g) ?? []
  return [pad(Number(padded.slice(0, -tailSize))), ...tail].join(':')
}

// "1:30", "01:30:15" → minutos. Sem dois pontos, o número é a menor parte
// que o campo aceita acima dos segundos: horas no campo hh, minutos nos
// outros (como sempre foi)
export const durationToMinutes = (
  text: string,
  precision: DurationPrecision = 'hm',
) => {
  const trimmed = text.trim()
  if (!trimmed) return 0
  const parts = trimmed.split(':').map((part) => Number(part) || 0)
  if (parts.length === 1) {
    return Math.max(0, precision === 'h' ? parts[0] * 60 : parts[0])
  }
  const [hours, minutes, seconds = 0] = parts
  return Math.max(0, hours * 60 + minutes + seconds / 60)
}

// A precisão que o valor pede: um tempo com segundos não perde os segundos
// num campo hh:mm
const neededPrecision = (minutes: number): DurationPrecision => {
  const seconds = Math.round(minutes * 60)
  if (seconds % 60) return 'hms'
  if (seconds % 3600) return 'hm'
  return 'h'
}

// Minutos → "01:30" (ou "01:30:15", "02"), na precisão do campo
export const formatDuration = (
  minutes: number,
  precision: DurationPrecision = 'hm',
) => {
  const needed = neededPrecision(minutes)
  const shown = RANK[needed] > RANK[precision] ? needed : precision
  const total = Math.round(minutes * 60)
  const hours = Math.floor(total / 3600)
  const rest = total % 3600
  if (shown === 'h') return pad(hours)
  if (shown === 'hm') return `${pad(hours)}:${pad(Math.floor(rest / 60))}`
  return `${pad(hours)}:${pad(Math.floor(rest / 60))}:${pad(rest % 60)}`
}

// O texto completo, para tabelas e resumos: sempre hh:mm:ss
export const durationText = (minutes: number) => formatDuration(minutes, 'hms')

export function DurationInput({
  value,
  onChange,
  unit = 'min',
  // hh:mm:ss é o padrão de todo tempo (20/11/2026); a linha pode pedir menos
  precision = 'hms',
  placeholder,
  onFocus,
  onBlur,
  className,
  disabled,
  ...props
}: {
  // Minutos (ou horas, com unit "h"); null é "sem valor" (o campo fica vazio)
  value: number | null
  onChange: (value: number | null) => void
  // A máquina cobrada por hora guarda o consumo em horas (20/11/2026)
  unit?: 'min' | 'h'
  precision?: DurationPrecision
} & Omit<InputProps, 'value' | 'onChange' | 'type'>) {
  const formField = useFormField()
  const toMinutes = (input: number) => (unit === 'h' ? input * 60 : input)
  const fromMinutes = (minutes: number) =>
    unit === 'h' ? minutes / 60 : minutes
  const shown = (input: number | null) =>
    input === null ? '' : formatDuration(toMinutes(input), precision)

  const [text, setText] = useState(shown(value))
  const [focused, setFocused] = useState(false)

  // Enquanto a pessoa não está digitando, o campo acompanha o valor de fora
  useEffect(() => {
    if (!focused) setText(shown(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, focused, unit, precision])

  const commit = () => {
    const trimmed = text.trim()
    if (!trimmed) {
      onChange(null)
      setText('')
      return
    }
    const minutes = durationToMinutes(trimmed, precision)
    onChange(fromMinutes(minutes))
    setText(formatDuration(minutes, precision))
  }

  // O que falta do hh:mm:ss, mais claro, logo depois do que foi digitado
  const ghost = text
    ? ':00:00'.slice(0, (3 - Math.min(3, text.split(':').length)) * 3)
    : ''

  // A cópia invisível e o campo usam a mesma letra e o mesmo recuo: o cinza
  // cai logo depois do último dígito
  const textClass = 'px-2 text-base tabular-nums md:text-sm whitespace-pre'

  return (
    <div
      className={cn(
        'flex h-10 items-center rounded-lg border border-gray-300 bg-white text-sm shadow-xs transition-[color,background-color,border-color,box-shadow,opacity] duration-200 ease-in-out focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50',
        formField?.error &&
          'border-error-300 focus-within:border-error-300 focus-within:ring-error-100',
        className,
      )}
      data-disabled={disabled}
    >
      <div className="flex items-center justify-center pl-3.5 pt-px text-gray">
        <Icon icon={IconClock} size="sm" />
      </div>
      <div className="relative ml-1 h-full min-w-0 flex-1">
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 flex items-center overflow-hidden',
            textClass,
          )}
        >
          <span className="invisible">{text}</span>
          {ghost && <span className="text-xs text-gray-400">{ghost}</span>}
        </div>
        <input
          {...props}
          disabled={disabled}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={placeholder ?? formatDuration(0, precision)}
          className={cn(
            'absolute inset-0 h-full w-full rounded-md border-none bg-transparent text-gray-900 shadow-none outline-none placeholder:text-gray-400 focus-visible:border-none focus-visible:shadow-none focus-visible:outline-none disabled:cursor-not-allowed',
            textClass,
          )}
          value={text}
          onChange={(event) =>
            setText(maskDuration(event.target.value, precision))
          }
          onFocus={(event) => {
            setFocused(true)
            onFocus?.(event)
          }}
          onBlur={(event) => {
            setFocused(false)
            commit()
            onBlur?.(event)
          }}
        />
      </div>
    </div>
  )
}
