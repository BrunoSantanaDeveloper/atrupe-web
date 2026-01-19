'use client'

import { useEffect, useState } from 'react'

// UI
import {
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// Form
import { useFormContext } from 'react-hook-form'

// Libs
import { cn } from '@/lib/utils'

import { IconCalendarWeek } from '@tabler/icons-react'

function formatDate(date: Date | undefined) {
  if (!date) {
    return ''
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

function parseDate(value: string): Date | null {
  // Remove qualquer caractere que não seja número
  const numbers = value.replace(/\D/g, '')

  // Tenta diferentes formatos
  if (numbers.length === 8) {
    // Formato: ddmmyyyy
    const day = parseInt(numbers.substring(0, 2), 10)
    const month = parseInt(numbers.substring(2, 4), 10) - 1 // Mês é 0-indexed
    const year = parseInt(numbers.substring(4, 8), 10)

    const date = new Date(year, month, day)
    if (isValidDate(date)) {
      return date
    }
  }

  // Tenta formato dd/mm/yyyy ou dd-mm-yyyy
  const parts = value.split(/[/-]/)
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)

    const date = new Date(year, month, day)
    if (isValidDate(date)) {
      return date
    }
  }

  return null
}

interface Props {
  name: string
  label?: string
  placeholder?: string
  width?: string
  disabled?: boolean
  additionalOnChange?: (value: Date | undefined) => void
}

export function FormDatePickerInput({
  name,
  label = 'Data',
  placeholder = 'Selecione uma data',
  width = 'flex-[1_0_100px]',
  disabled,
  additionalOnChange,
}: Props) {
  const [open, setOpen] = useState(false)

  const { control, watch } = useFormContext()

  const fieldValue = watch(name)

  const [month, setMonth] = useState<Date | undefined>(fieldValue)
  const [value, setValue] = useState(formatDate(fieldValue))

  useEffect(() => {
    setValue(formatDate(fieldValue))
    if (fieldValue) {
      setMonth(fieldValue)
    }
  }, [fieldValue])

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className={cn('flex flex-col', width)}>
            {label ? <FormLabel>{label}</FormLabel> : null}
            <FormControl>
              <div className="relative flex gap-2">
                <Input
                  value={value}
                  placeholder={placeholder}
                  className="pr-10"
                  onChange={(e) => {
                    setValue(e.target.value)
                  }}
                  onBlur={(e) => {
                    const inputValue = e.target.value
                    const parsedDate = parseDate(inputValue)

                    if (parsedDate) {
                      field.onChange(parsedDate)
                      setMonth(parsedDate)
                      setValue(formatDate(parsedDate))
                      additionalOnChange?.(parsedDate)
                    } else if (inputValue === '') {
                      field.onChange(undefined)
                      setValue('')
                      additionalOnChange?.(undefined)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault()
                      setOpen(true)
                    } else if (e.key === 'Enter') {
                      e.preventDefault()
                      const inputValue = (e.target as HTMLInputElement).value
                      const parsedDate = parseDate(inputValue)

                      if (parsedDate) {
                        field.onChange(parsedDate)
                        setMonth(parsedDate)
                        setValue(formatDate(parsedDate))
                        additionalOnChange?.(parsedDate)
                      }
                    }
                  }}
                  disabled={disabled}
                />
                <Popover open={open} onOpenChange={setOpen} modal>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      size="iconSm"
                      variant="neutralGhost"
                      className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                      RightIcon={IconCalendarWeek}
                      disabled={disabled}
                    >
                      <span className="sr-only">Selecionar data</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="end"
                    alignOffset={-8}
                    sideOffset={12}
                    avoidCollisions={false}
                  >
                    <Calendar
                      mode="single"
                      selected={field.value}
                      captionLayout="dropdown"
                      month={month}
                      onMonthChange={setMonth}
                      onSelect={(date) => {
                        field.onChange(date)
                        setValue(formatDate(date))
                        setMonth(date)
                        setOpen(false)
                        additionalOnChange?.(date)
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
