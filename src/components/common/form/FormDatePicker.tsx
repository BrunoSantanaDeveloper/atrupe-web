'use client'

// React Imports
import { PropsWithChildren, useState } from 'react'

// UI component Imports
import {
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'

// Lib Imports
import { cn } from '@/lib/utils'

// Third-party Imports
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useFormContext } from 'react-hook-form'

// Icon Imports
import { IconCalendarMonth } from '@tabler/icons-react'

// Type Imports
import type { DateRange } from 'react-day-picker'
import type { Path, FieldValues } from 'react-hook-form'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  description?: string
  value?: Date
  disabled?: boolean
  onSelect?: (value?: Date) => void
  additionalOnChange?: (value?: Date) => void
  fromDate?: Date
}

export function FormDatePickerSingle<T extends FieldValues>({
  name,
  label,
  placeholder = label,
  width = 'flex-[1_0_240px]',
  description,
  value,
  onSelect,
  additionalOnChange,
  disabled,
  fromDate,
}: Props<T>) {
  const { control } = useFormContext()

  if (control)
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className={cn('flex flex-col', width)}>
            {label ? <FormLabel>{label}</FormLabel> : null}
            <Popover>
              <FormControl>
                <CalendarButton disabled={disabled}>
                  {field.value ? (
                    format(field.value, 'P', { locale: ptBR })
                  ) : (
                    <span>{placeholder}</span>
                  )}
                </CalendarButton>
              </FormControl>
              <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(value) => {
                    field.onChange(value)
                    additionalOnChange?.(value)
                  }}
                  disabled={(date) => {
                    const minDate = fromDate || new Date('1900-01-01')
                    return date < minDate
                  }}
                  initialFocus
                  defaultMonth={field.value}
                />
              </PopoverContent>
            </Popover>
            {description ? (
              <FormDescription>{description}</FormDescription>
            ) : null}
            <FormMessage />
          </FormItem>
        )}
      />
    )

  return (
    <div className={cn('flex flex-col gap-2', width)}>
      {label ? <Label htmlFor={name}>{label}</Label> : null}
      <Popover>
        <CalendarButton name={name}>
          {value ? (
            format(value, 'P', { locale: ptBR })
          ) : (
            <span>{placeholder}</span>
          )}
        </CalendarButton>
        <PopoverContent className="w-auto p-0 rounded-xl" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onSelect}
            disabled={(date) => {
              const minDate = fromDate || new Date('1900-01-01')
              return date < minDate
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

interface DateRangeProps {
  value: DateRange
  name: string
  label: string
  placeholder?: string
  width?: string
}

export function FormDatePickerRange({
  name,
  label,
  placeholder,
  value,
  width = 'w-[200px]',
}: DateRangeProps) {
  const [date, setDate] = useState<DateRange | undefined>(value)

  return (
    <div className={cn('space-y-1', width)}>
      <Label htmlFor={name}>{label}</Label>
      <Popover>
        <CalendarButton name={name}>
          {date?.from ? (
            date.to ? (
              <>
                {format(date?.from, 'P', { locale: ptBR })} -{' '}
                {format(date.to, 'P', { locale: ptBR })}
              </>
            ) : (
              format(date?.from, 'P', { locale: ptBR })
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </CalendarButton>
        <PopoverContent className="w-auto p-0 rounded-xl" align="start">
          <Calendar
            mode="range"
            selected={value}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

interface ButtonProps {
  name?: string
  disabled?: boolean
}

function CalendarButton({
  name,
  children,
  disabled,
}: PropsWithChildren<ButtonProps>) {
  return (
    <PopoverTrigger asChild>
      <Button
        type="button"
        id={name}
        variant="input"
        LeftIcon={IconCalendarMonth}
        leftIconSize={20}
        className="w-full px-3.5"
        disabled={disabled}
      >
        {children}
      </Button>
    </PopoverTrigger>
  )
}
