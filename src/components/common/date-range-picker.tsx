'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Calendar, CalendarProps } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface DateRangePickerProps {
  label?: string
  value?: DateRange
  onChange?: (date?: DateRange) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  calendarProps?: Omit<CalendarProps, 'mode' | 'selected' | 'onSelect'>
}

export function DateRangePicker({
  label,
  value,
  onChange,
  disabled = false,
  placeholder = 'Selecione um período',
  className,
  calendarProps,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div
      className={cn(
        'flex flex-col justify-start items-start w-full gap-1.5',
        className,
      )}
    >
      {label && (
        <label className="text-sm font-medium text-left text-[#344054]">
          {label}
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <button
            type="button"
            className={cn(
              'flex justify-between items-center w-full h-11 px-3.5 py-2.5 gap-2',
              'rounded-lg border outline-none transition-all duration-200',
              // Normal state
              'bg-white border-[#d0d5dd] shadow-sm',
              // Focus ring matching inputs (Figma specifies #38cf8f border and shadow ring)
              'focus-visible:border-[#38cf8f] focus-visible:ring-4 focus-visible:ring-[#D2F9E3]',
              // Open State acts like focus if focus is lost but popover is open
              open && !disabled && 'border-[#38cf8f] ring-4 ring-[#D2F9E3]',
              // Text Color formatting
              value?.from ? 'text-[#101828]' : 'text-[#98a2b3]',
              // Disabled state overrides
              disabled &&
                'disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-[#98a2b3]',
            )}
          >
            <span className="flex-grow text-base text-left truncate">
              {value?.from ? (
                value.to ? (
                  <>
                    {format(value.from, 'dd/MM/yyyy', { locale: ptBR })} -{' '}
                    {format(value.to, 'dd/MM/yyyy', { locale: ptBR })}
                  </>
                ) : (
                  format(value.from, 'dd/MM/yyyy', { locale: ptBR })
                )
              ) : (
                placeholder
              )}
            </span>
            <CalendarIcon
              className={cn(
                'flex-shrink-0 w-5 h-5',
                disabled ? 'stroke-[#98A2B3]' : 'stroke-[#667085]',
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            initialFocus
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            {...calendarProps}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
