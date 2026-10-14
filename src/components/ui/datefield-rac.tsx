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
          'text-gray-950 data-focused:bg-gray-100 data-invalid:data-focused:bg-red-500 data-focused:data-placeholder:text-gray-950 data-focused:text-gray-950 data-invalid:data-placeholder:text-red-500 data-invalid:text-red-500 data-placeholder:text-gray-500/70 data-[type=literal]:text-gray-500/70 inline rounded p-0.5 caret-transparent outline-hidden data-disabled:cursor-not-allowed data-disabled:opacity-50 data-invalid:data-focused:text-white data-invalid:data-focused:data-placeholder:text-white data-[type=literal]:px-0',
          className,
        ),
      )}
      {...props}
      data-invalid
    />
  )
}

const dateInputStyle =
  'flex h-10 w-full rounded-lg border border-gray-300 bg-white shadow-xs px-3.5 py-2 text-sm text-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-50 focus-visible:border-brand-300 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out'
// 'relative inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none data-focus-within:border-gray-950 data-focus-within:ring-gray-950/50 data-focus-within:ring-[3px] data-focus-within:has-aria-invalid:ring-red-500/20 data-focus-within:has-aria-invalid:border-red-500'

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
