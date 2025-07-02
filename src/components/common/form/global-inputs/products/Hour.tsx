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

// Função para converter minutos em string HH:MM
function minutesToTimeString(minutes: number): string {
  if (!minutes || minutes <= 0) return ''

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// Função para converter string HH:MM em minutos
function timeStringToMinutes(timeString: string): number {
  if (!timeString || timeString === '00:00' || timeString === '') return 0

  const [hours, minutes] = timeString.split(':').map(Number)

  if (isNaN(hours) || isNaN(minutes)) return 0

  return hours * 60 + minutes
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
        const fieldTimeString = minutesToTimeString(field.value || 0)

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

                  // Converter para minutos e atualizar o form
                  const minutes = timeStringToMinutes(maskedValue)
                  field.onChange(minutes)
                  onHasChanged?.()
                }}
                onBlur={() => {
                  setIsEditing(false)
                  // O valor será sincronizado automaticamente pelo fieldTimeString
                }}
                endAdornment={<>h</>}
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
