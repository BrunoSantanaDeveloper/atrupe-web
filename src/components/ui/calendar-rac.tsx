'use client'

import { ComponentProps } from 'react'
import { getLocalTimeZone, today } from '@internationalized/date'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import {
  Button,
  CalendarCell as CalendarCellRac,
  CalendarGridBody as CalendarGridBodyRac,
  CalendarGridHeader as CalendarGridHeaderRac,
  CalendarGrid as CalendarGridRac,
  CalendarHeaderCell as CalendarHeaderCellRac,
  Calendar as CalendarRac,
  composeRenderProps,
  Heading as HeadingRac,
  RangeCalendar as RangeCalendarRac,
} from 'react-aria-components'

import { cn } from '@/lib/utils'

interface BaseCalendarProps {
  className?: string
}

type CalendarProps = ComponentProps<typeof CalendarRac> & BaseCalendarProps
type RangeCalendarProps = ComponentProps<typeof RangeCalendarRac> &
  BaseCalendarProps

function CalendarHeader() {
  return (
    <header className="flex w-full items-center gap-1 pb-1">
      <Button
        slot="previous"
        className="flex size-9 items-center justify-center rounded-md text-gray-500 transition-[color,background-color,border-color,box-shadow,opacity] duration-200 ease-in-out outline-none hover:bg-gray-100 hover:text-gray-950 focus-visible:ring-1 focus-visible:ring-brand"
      >
        <ChevronLeftIcon size={16} />
      </Button>
      <HeadingRac className="grow text-center text-sm font-medium" />
      <Button
        slot="next"
        className="flex size-9 items-center justify-center rounded-md text-gray-500 transition-[color,background-color,border-color,box-shadow,opacity] duration-200 ease-in-out outline-none hover:bg-gray-100 hover:text-gray-950 focus-visible:ring-1 focus-visible:ring-brand"
      >
        <ChevronRightIcon size={16} />
      </Button>
    </header>
  )
}

function CalendarGridComponent({ isRange = false }: { isRange?: boolean }) {
  const now = today(getLocalTimeZone())

  return (
    <CalendarGridRac>
      <CalendarGridHeaderRac>
        {(day) => (
          <CalendarHeaderCellRac className="size-9 rounded-md p-0 text-xs font-medium text-gray-500">
            {day}
          </CalendarHeaderCellRac>
        )}
      </CalendarGridHeaderRac>
      <CalendarGridBodyRac className="[&_td]:px-0 [&_td]:py-px">
        {(date) => (
          <CalendarCellRac
            date={date}
            className={cn(
              'relative flex size-9 items-center justify-center rounded-md p-0 text-sm font-normal whitespace-nowrap transition-[color,background-color,border-color,box-shadow,opacity] duration-200 ease-in-out outline-none text-gray-950 hover:bg-gray-100 hover:text-gray-950 data-[selected]:bg-brand-600 data-[selected]:text-gray-50 data-[hovered]:bg-gray-100 data-[hovered]:text-gray-950 data-[selected]:hover:bg-brand-700 focus-visible:z-10 focus-visible:ring-1 focus-visible:ring-brand data-[disabled]:pointer-events-none data-[disabled]:opacity-30 data-[unavailable]:pointer-events-none data-[unavailable]:line-through data-[unavailable]:opacity-30',
              // Range-specific styles
              isRange &&
                'data-[selected]:bg-gray-100 data-[selected]:text-gray-950 data-[invalid]:data-[selection-end]:bg-error data-[invalid]:data-[selection-start]:bg-error data-[selection-end]:bg-brand-600 data-[selection-start]:bg-brand-600 data-[selection-end]:text-gray-50 data-[selection-start]:text-gray-50 data-[invalid]:bg-error/10 data-[selected]:rounded-none data-[selection-end]:rounded-e-md data-[invalid]:data-[selection-end]:text-white data-[selection-start]:rounded-s-md data-[invalid]:data-[selection-start]:text-white',
              // Today indicator styles
              date.compare(now) === 0 &&
                cn(
                  'after:bg-brand after:pointer-events-none after:absolute after:start-1/2 after:bottom-1 after:z-10 after:size-[3px] after:-translate-x-1/2 after:rounded-full',
                  isRange
                    ? 'data-[selection-end]:after:bg-white data-[selection-start]:after:bg-white'
                    : 'data-[selected]:after:bg-white',
                ),
            )}
          />
        )}
      </CalendarGridBodyRac>
    </CalendarGridRac>
  )
}

function Calendar({ className, ...props }: CalendarProps) {
  return (
    <CalendarRac
      {...props}
      className={composeRenderProps(className, (className) =>
        cn('w-fit', className),
      )}
    >
      <CalendarHeader />
      <CalendarGridComponent />
    </CalendarRac>
  )
}

function RangeCalendar({ className, ...props }: RangeCalendarProps) {
  return (
    <RangeCalendarRac
      {...props}
      className={composeRenderProps(className, (className) =>
        cn('w-fit', className),
      )}
    >
      <CalendarHeader />
      <CalendarGridComponent isRange />
    </RangeCalendarRac>
  )
}

export { Calendar, RangeCalendar }
