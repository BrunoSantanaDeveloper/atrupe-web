import * as React from 'react'

import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  startAdornment?: JSX.Element
  endAdornment?: JSX.Element
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startAdornment, endAdornment, ...props }, ref) => {
    const hasAdornment = Boolean(startAdornment) || Boolean(endAdornment)

    if (hasAdornment)
      return (
        <div
          className={cn(
            'flex items-center justify-center h-10 rounded-lg border text-sm border-gray-300 bg-white shadow-xs focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 overflow-hidden',
            className,
          )}
          data-disabled={props.disabled}
        >
          {startAdornment && (
            <div
              className={cn(
                'flex pt-px items-center justify-center text-gray pl-3.5',
              )}
            >
              {startAdornment}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-full w-full rounded-md bg-transparent px-2 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 shadow-none outline-none border-none focus-visible:outline-none focus-visible:border-none focus-visible:shadow-none',
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
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-gray-300 bg-white shadow-xs px-3.5 py-2 text-sm text-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-50 focus-visible:border-brand-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300',
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
