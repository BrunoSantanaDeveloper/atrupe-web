'use client'

import {
  composeRenderProps,
  DateFieldProps,
  DateField as DateFieldRac,
  DateInputProps as DateInputPropsRac,
  DateInput as DateInputRac,
  DateSegmentProps,
  DateSegment as DateSegmentRac,
  DateValue as DateValueRac,
  TimeFieldProps,
  TimeField as TimeFieldRac,
  TimeValue as TimeValueRac,
} from 'react-aria-components'

import { cn } from '@/lib/utils'

function DateField<T extends DateValueRac>({
  className,
  children,
  ...props
}: DateFieldProps<T>) {
  return (
    <DateFieldRac
      className={composeRenderProps(className, (className) => cn(className))}
      {...props}
    >
      {children}
    </DateFieldRac>
  )
}

function TimeField<T extends TimeValueRac>({
  className,
  children,
  ...props
}: TimeFieldProps<T>) {
  return (
    <TimeFieldRac
      className={composeRenderProps(className, (className) => cn(className))}
      {...props}
    >
      {children}
    </TimeFieldRac>
  )
}

function DateSegment({ className, ...props }: DateSegmentProps) {
  return (
    <DateSegmentRac
      className={composeRenderProps(className, (className) =>
        cn(
          'text-gray-950 data-focused:bg-gray-100 data-invalid:data-focused:bg-red-500 data-focused:data-placeholder:text-gray-950 data-focused:text-gray-950 data-invalid:data-placeholder:text-red-500 data-invalid:text-red-500 data-placeholder:text-gray-500/70 data-[type=literal]:text-gray-500/70 inline rounded p-0.5 caret-transparent outline-hidden data-disabled:cursor-not-allowed data-disabled:opacity-50 data-invalid:data-focused:text-white data-invalid:data-focused:data-placeholder:text-white data-[type=literal]:px-0 dark:text-gray-50 dark:data-focused:bg-gray-800 dark:data-invalid:data-focused:bg-red-900 dark:data-focused:data-placeholder:text-gray-50 dark:data-focused:text-gray-50 dark:data-invalid:data-placeholder:text-red-900 dark:data-invalid:text-red-900 dark:data-placeholder:text-gray-400/70 dark:data-[type=literal]:text-gray-400/70',
          className,
        ),
      )}
      {...props}
      data-invalid
    />
  )
}

const dateInputStyle =
  'flex h-11 w-full rounded-lg border border-gray-300 bg-white shadow-sm px-3.5 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand focus-visible:border-brand disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out'
// 'relative inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none data-focus-within:border-gray-950 data-focus-within:ring-gray-950/50 data-focus-within:ring-[3px] data-focus-within:has-aria-invalid:ring-red-500/20 dark:data-focus-within:has-aria-invalid:ring-red-500/40 data-focus-within:has-aria-invalid:border-red-500 dark:border-gray-800 dark:bg-gray-950 dark:data-focus-within:border-gray-300 dark:data-focus-within:ring-gray-300/50 dark:data-focus-within:has-aria-invalid:ring-red-900/20 dark:dark:data-focus-within:has-aria-invalid:ring-red-900/40 dark:data-focus-within:has-aria-invalid:border-red-900'

interface DateInputProps extends DateInputPropsRac {
  className?: string
  unstyled?: boolean
}

function DateInput({
  className,
  unstyled = false,
  ...props
}: Omit<DateInputProps, 'children'>) {
  return (
    <DateInputRac
      className={composeRenderProps(className, (className) =>
        cn(!unstyled && dateInputStyle, className),
      )}
      {...props}
    >
      {(segment) => <DateSegment segment={segment} />}
    </DateInputRac>
  )
}

export { DateField, DateInput, DateSegment, TimeField, dateInputStyle }
export type { DateInputProps }
