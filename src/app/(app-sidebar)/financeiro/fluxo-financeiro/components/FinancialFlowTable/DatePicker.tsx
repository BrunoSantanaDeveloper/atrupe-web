'use client'

import {
  Button,
  DateRangePicker,
  Dialog,
  Group,
  Popover,
} from 'react-aria-components'

import { cn } from '@/lib/utils'
import { RangeCalendar } from '@/components/ui/calendar-rac'
import { DateInput, dateInputStyle } from '@/components/ui/datefield-rac'
import { Label } from '@/components/ui/label'
import { IconCalendarWeek } from '@tabler/icons-react'

export function FinancialFlowDatePicker() {
  return (
    <DateRangePicker className="*:not-first:mt-2">
      <Label className="mb-2">Período</Label>
      <div className="flex">
        <Group className={cn(dateInputStyle, 'pr-11 pt-3')}>
          <DateInput slot="start" unstyled />
          <span aria-hidden="true" className="px-2">
            -
          </span>
          <DateInput slot="end" unstyled />
        </Group>
        <Button className="text-gray hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-600 focus-visible:ring-offset-2 z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-md outline-none data-focus-visible:ring-[3px] transition-all duration-200 ease-in-out disabled:pointer-events-none disabled:bg-gray-100 disabled:text-gray-300 disabled:border-gray-200">
          <IconCalendarWeek size={18} />
        </Button>
      </div>
      <Popover
        className="bg-white text-gray data-entering:animate-in data-exiting:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 z-50 rounded-md border shadow-lg outline-hidden"
        offset={4}
      >
        <Dialog className="max-h-[inherit] overflow-auto p-2">
          <RangeCalendar />
        </Dialog>
      </Popover>
    </DateRangePicker>
  )
}
