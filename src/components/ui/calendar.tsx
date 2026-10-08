'use client'

import * as React from 'react'
import {
  IconChevronLeft as ChevronLeft,
  IconChevronRight as ChevronRight,
} from '@tabler/icons-react'
import { DayPicker } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

import { ptBR } from 'date-fns/locale'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={ptBR}
      className={cn('p-3', className)}
      classNames={{
        months:
          'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-center',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium text-gray-700 capitalize',
        nav: 'space-x-1 flex items-center',
        nav_button: buttonVariants({ variant: 'neutralGhost', size: 'iconSm' }),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'text-gray w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-full [&:has([aria-selected].day-outside)]:bg-gray-100/50 [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full focus-within:relative focus-within:z-20',
        day: cn(
          buttonVariants({ variant: 'neutralGhost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full',
        ),
        day_range_end: 'day-range-end',
        day_selected:
          'bg-brand-600 text-gray-50 hover:bg-brand-700 hover:text-gray-50 focus:bg-brand-600 focus:text-gray-50 dark:text-white dark:hover:text-white dark:focus:text-white',
        day_today: 'bg-gray-200',
        day_outside:
          'day-outside text-gray rounded-full opacity-50 aria-selected:bg-gray-100/50 aria-selected:text-gray aria-selected:opacity-30',
        day_disabled: 'text-gray opacity-50',
        day_range_middle:
          'aria-selected:bg-gray-100 aria-selected:text-gray-900',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: (/* { ...props } */) => <ChevronLeft className="size-4" />,
        IconRight: (/* { ...props } */) => <ChevronRight className="size-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
