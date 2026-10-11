'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { IconCalendarMonth as CalendarIcon } from '@tabler/icons-react'

import { cn } from '@/lib/utils'
import { Calendar, CalendarProps } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface DatePickerProps {
  label?: string
  value?: Date
  onChange?: (date?: Date) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  calendarProps?: Omit<CalendarProps, 'mode' | 'selected' | 'onSelect'>
}

export function DatePicker({
  label,
  value,
  onChange,
  disabled = false,
  placeholder = 'Selecione uma data',
  className,
  calendarProps,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div
      className={cn(
        'flex flex-col justify-start items-start w-full gap-1.5',
        className,
      )}
    >
      {label && (
        <label className="text-sm font-medium text-left text-gray-700">
          {label}
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <button
            type="button"
            className={cn(
              'flex justify-between items-center w-full h-10 px-3.5 py-2.5 gap-2',
              'rounded-lg border outline-none transition-all duration-200',
              // Normal state
              'bg-white border-gray-300 shadow-xs',
              // Foco igual ao input: borda Brand/300 e anel Brand/50 (design.md §3.4)
              'focus-visible:border-brand-300 focus-visible:ring-4 focus-visible:ring-brand-50',
              // Open State acts like focus if focus is lost but popover is open
              open && !disabled && 'border-brand-300 ring-4 ring-brand-50',
              // Text Color formatting
              value ? 'text-gray-900' : 'text-gray-400',
              // Disabled state overrides
              disabled &&
                'disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400',
            )}
          >
            <span className="flex-grow text-sm text-left truncate">
              {value
                ? format(value, 'dd/MM/yyyy', { locale: ptBR })
                : placeholder}
            </span>
            <CalendarIcon
              className={cn(
                'flex-shrink-0 w-5 h-5',
                disabled ? 'text-gray-400' : 'text-gray',
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange?.(date)
              setOpen(false)
            }}
            initialFocus
            {...calendarProps}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
