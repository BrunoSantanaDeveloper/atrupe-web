// UI Component Imports
import {
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

// Lib Imports
import { cn, maskDuration } from '@/lib/utils'
import React, { HTMLInputTypeAttribute, useState } from 'react'

// Type Imports
import { type Path, type Control, type FieldValues } from 'react-hook-form'

interface Props<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  control: Control<T>
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  type?: HTMLInputTypeAttribute
  className?: string
  onHasChanged?: () => void
}

// Função para converter segundos em string HH:MM ou HH:MM:SS
function secondsToTimeString(
  seconds: number,
  includeSeconds: boolean = false,
): string {
  if (!seconds || seconds <= 0) return ''

  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (includeSeconds) {
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// Função para converter string HH:MM ou HH:MM:SS em segundos
function timeStringToSeconds(timeString: string): number {
  if (
    !timeString ||
    timeString === '00:00' ||
    timeString === '00:00:00' ||
    timeString === ''
  )
    return 0

  const parts = timeString.split(':').map(Number)

  // Suporta tanto HH:MM quanto HH:MM:SS
  const hours = parts[0] || 0
  const minutes = parts[1] || 0
  const seconds = parts[2] || 0

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return 0

  return hours * 3600 + minutes * 60 + seconds
}

export function Hour<T extends FieldValues>({
  name,
  label,
  control,
  placeholder,
  width = 'flex-[1_0_100px]',
  className,
  onHasChanged,
}: Props<T>) {
  const [isEditing, setIsEditing] = useState(false)
  const [displayValue, setDisplayValue] = useState('')

  const canUseSeconds = false

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const fieldTimeString = secondsToTimeString(
          field.value || 0,
          canUseSeconds,
        )

        return (
          <FormItem className={cn('flex flex-col', width)}>
            {label ? <FormLabel>{label}</FormLabel> : null}
            <FormControl>
              <Input
                placeholder={
                  placeholder || (canUseSeconds ? '00:00:00' : '00:00')
                }
                value={isEditing ? displayValue : fieldTimeString}
                onFocus={() => {
                  setIsEditing(true)
                  setDisplayValue(fieldTimeString)
                }}
                onChange={(e) => {
                  const rawValue = e.target.value
                  // Passar false para permitir horas ilimitadas e false para não incluir segundos
                  const maskedValue = maskDuration(
                    rawValue,
                    false,
                    canUseSeconds,
                  )

                  // Atualizar o valor de exibição imediatamente
                  setDisplayValue(maskedValue)

                  // Converter para segundos e atualizar o form
                  const seconds = timeStringToSeconds(maskedValue)
                  field.onChange(seconds)
                  onHasChanged?.()
                }}
                onBlur={() => {
                  setIsEditing(false)
                  // O valor será sincronizado automaticamente pelo fieldTimeString
                }}
                endAdornment={<>h</>}
                className={className}
                maxLength={canUseSeconds ? 8 : 5}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
