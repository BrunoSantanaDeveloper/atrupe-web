'use client'

import { useEffect, useState } from 'react'
import type { DateRange } from 'react-day-picker'

// UI
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input-uncontrolled'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

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

function formatDateRange(from: Date | undefined, to: Date | undefined) {
  if (!from && !to) {
    return ''
  }
  if (from && !to) {
    return formatDate(from)
  }
  if (!from && to) {
    return formatDate(to)
  }
  return `${formatDate(from)} - ${formatDate(to)}`
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

    const date = new Date(year, month, day, 12, 0, 0, 0)
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

    const date = new Date(year, month, day, 12, 0, 0, 0)
    if (isValidDate(date)) {
      return date
    }
  }

  return null
}

function parseDateRange(value: string): { from: Date | null; to: Date | null } {
  // Tenta separar por " - " (com espaços)
  const parts = value.split(' - ')

  if (parts.length === 2) {
    const from = parseDate(parts[0].trim())
    const to = parseDate(parts[1].trim())
    return { from, to }
  }

  // Se não houver separador, tenta parsear como uma única data (será a data inicial)
  const singleDate = parseDate(value)
  if (singleDate) {
    return { from: singleDate, to: null }
  }

  return { from: null, to: null }
}

interface Props {
  name?: string
  label?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  value?: DateRange
  onChange?: (value: DateRange | undefined) => void
}

export function DateRangePickerBasic({
  name,
  label = 'Período',
  placeholder = 'Selecione um período',
  className,
  disabled,
  value: externalValue,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false)
  const [internalRange, setInternalRange] = useState<DateRange | undefined>(
    externalValue,
  )

  const [month, setMonth] = useState<Date | undefined>(
    externalValue?.from || externalValue?.to,
  )
  const [inputValue, setInputValue] = useState(
    formatDateRange(externalValue?.from, externalValue?.to),
  )

  useEffect(() => {
    setInputValue(formatDateRange(externalValue?.from, externalValue?.to))
    setInternalRange(externalValue)
    if (externalValue?.from || externalValue?.to) {
      setMonth(externalValue.from || externalValue.to)
    }
  }, [externalValue])

  const handleInputChange = (value: string) => {
    setInputValue(value)
  }

  const handleInputBlur = (inputVal: string) => {
    const parsedRange = parseDateRange(inputVal)

    if (parsedRange.from || parsedRange.to) {
      const dateRange: DateRange = {
        from: parsedRange.from || undefined,
        to: parsedRange.to || undefined,
      }
      onChange?.(dateRange)
      setMonth(parsedRange.from || parsedRange.to || undefined)
      setInputValue(formatDateRange(dateRange.from, dateRange.to))
    } else if (inputVal === '') {
      onChange?.(undefined)
      setInputValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const inputVal = (e.target as HTMLInputElement).value
      handleInputBlur(inputVal)
    }
  }

  const handlePopoverOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      // Ao abrir, reseta o range interno para começar uma nova seleção
      setInternalRange(undefined)
    }
  }

  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (!range) {
      setInternalRange(undefined)
      setInputValue('')
      return
    }

    // Se já temos from e to, ou se estamos começando uma nova seleção
    if (range.from && !range.to) {
      // Primeiro clique - limpa o input e armazena a primeira data
      setInternalRange(range)
      setInputValue(formatDate(range.from))
      setMonth(range.from)
    } else if (range.from && range.to) {
      // Segundo clique - organiza as datas e dispara o onChange
      const from = range.from < range.to ? range.from : range.to
      const to = range.from < range.to ? range.to : range.from

      const sortedRange: DateRange = { from, to }

      setInternalRange(sortedRange)
      setInputValue(formatDateRange(from, to))
      setMonth(from)
      onChange?.(sortedRange)
      setOpen(false)
    }
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {label ? <Label className="mb-2">{label}</Label> : null}
      <div className="relative flex gap-2">
        <Input
          name={name}
          value={inputValue}
          placeholder={placeholder}
          className="pr-10"
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={(e) => handleInputBlur(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <Popover open={open} onOpenChange={handlePopoverOpenChange}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="iconSm"
              variant="neutralGhost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
              RightIcon={IconCalendarWeek}
              disabled={disabled}
            >
              <span className="sr-only">Selecionar período</span>
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
              mode="range"
              selected={internalRange}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={handleCalendarSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
