'use client'

// Tempo digitado em h:mm, com o relógio (IP-33): "0:10", "1:30". A tela
// mostra horas e minutos; o estado guarda minutos. A máscara coloca os dois
// pontos sozinha: a pessoa digita só números e eles entram pela direita
// ("1" → 0:01, "10" → 0:10, "130" → 1:30). Ao sair do campo, minutos acima
// de 59 viram hora ("0:75" → 1:15).

import { useEffect, useState } from 'react'

// UI
import { Input, type InputProps } from '@/components/ui/input'

// Utils
import {
  hhmmToMinutes,
  minutesToHhmm,
} from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/assembly'

// Icons
import { IconClock } from '@tabler/icons-react'

// Só dígitos, preenchidos da direita: os dois últimos são os minutos
const mask = (raw: string) => {
  const digits = raw.replace(/\D/g, '').replace(/^0+/, '').slice(0, 5)
  if (!digits) return ''
  const padded = digits.padStart(3, '0')
  return `${Number(padded.slice(0, -2))}:${padded.slice(-2)}`
}

export function DurationInput({
  value,
  onChange,
  placeholder = '0:00',
  onFocus,
  onBlur,
  ...props
}: {
  // Minutos; null é "sem valor" (o campo fica vazio)
  value: number | null
  onChange: (minutes: number | null) => void
} & Omit<InputProps, 'value' | 'onChange' | 'type'>) {
  const [text, setText] = useState(value === null ? '' : minutesToHhmm(value))
  const [focused, setFocused] = useState(false)

  // Enquanto a pessoa não está digitando, o campo acompanha o valor de fora
  useEffect(() => {
    if (!focused) setText(value === null ? '' : minutesToHhmm(value))
  }, [value, focused])

  const commit = () => {
    const trimmed = text.trim()
    if (!trimmed) {
      onChange(null)
      setText('')
      return
    }
    const minutes = hhmmToMinutes(trimmed)
    onChange(minutes)
    setText(minutesToHhmm(minutes))
  }

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      startAdornment={<IconClock size={16} aria-hidden="true" />}
      value={text}
      onChange={(event) => setText(mask(event.target.value))}
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
  )
}
