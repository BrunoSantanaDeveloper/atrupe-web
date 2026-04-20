import * as React from 'react'

import { cn } from '@/lib/utils'
import { useFormField } from './form'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  startAdornment?: JSX.Element
  endAdornment?: JSX.Element
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, startAdornment, endAdornment, ...props }, ref) => {
    const formField = useFormField()

    const hasAdornment = Boolean(startAdornment) || Boolean(endAdornment)

    const error = formField?.error || undefined

    // referência: https://github.com/shadcn-ui/ui/pull/1563#issuecomment-1925824519
    if (hasAdornment)
      return (
        <div
          className={cn(
            'flex items-center justify-center h-11 rounded-lg border text-base border-[#d0d5dd] bg-white shadow-sm focus-within:border-brand focus-within:ring-1 focus-within:ring-brand data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 overflow-hidden transition-all duration-200 ease-in-out',
            error &&
              'border-error focus-visible:ring-error focus-visible:border-error',
            className,
          )}
          data-disabled={props.disabled}
        >
          {startAdornment && (
            <div
              className={cn(
                'flex pt-px items-center justify-center text-[#667085] pl-3.5',
              )}
            >
              {startAdornment}
            </div>
          )}
          <input
            className={cn(
              'flex h-full w-full ml-1 rounded-md bg-transparent px-2 text-base text-[#101828] file:bg-transparent file:text-sm file:font-medium placeholder:text-[#667085] shadow-none outline-none border-none focus-visible:outline-none focus-visible:border-none focus-visible:shadow-none',
            )}
            ref={ref}
            {...props}
          />
          {endAdornment && (
            <div
              className={cn(
                'flex pt-px items-center justify-center text-gray pr-3.5',
              )}
            >
              {endAdornment}
            </div>
          )}
        </div>
      )

    return (
      <input
        className={cn(
          'flex h-11 w-full rounded-lg border border-[#d0d5dd] bg-white shadow-sm px-3.5 py-2.5 text-base text-[#101828] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#667085] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand focus-visible:border-brand disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out',
          error &&
            'border-error focus-visible:ring-error focus-visible:border-error',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
