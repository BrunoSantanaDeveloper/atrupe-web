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
import { cn, maskTime } from '@/lib/utils'
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

// Função para converter segundos em string HH:MM
function secondsToTimeString(seconds: number): string {
  if (!seconds || seconds <= 0) return ''

  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)

  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// Função para converter string HH:MM em segundos
function timeStringToSeconds(timeString: string): number {
  if (!timeString || timeString === '00:00' || timeString === '') return 0

  const [hours, minutes] = timeString.split(':').map(Number)

  if (isNaN(hours) || isNaN(minutes)) return 0

  return hours * 3600 + minutes * 60
}

export function Hour<T extends FieldValues>({
  name,
  label,
  control,
  placeholder = '00:00',
  width = 'flex-[1_0_100px]',
  className,
  onHasChanged,
}: Props<T>) {
  const [isEditing, setIsEditing] = useState(false)
  const [displayValue, setDisplayValue] = useState('')

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const fieldTimeString = secondsToTimeString(field.value || 0)

        return (
          <FormItem className={cn('flex flex-col', width)}>
            {label ? <FormLabel>{label}</FormLabel> : null}
            <FormControl>
              <Input
                placeholder={placeholder}
                value={isEditing ? displayValue : fieldTimeString}
                onFocus={() => {
                  setIsEditing(true)
                  setDisplayValue(fieldTimeString)
                }}
                onChange={(e) => {
                  const rawValue = e.target.value
                  const maskedValue = maskTime(rawValue)

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
                endAdornment={<>H</>}
                className={className}
                maxLength={5}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
