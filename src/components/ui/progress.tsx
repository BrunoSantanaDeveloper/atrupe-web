'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '@/lib/utils'

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indicatorClassName?: string
  }
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'relative h-2 w-full overflow-hidden rounded-full bg-[#f2f4f7]',
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        'h-full w-full flex-1 bg-[#099260] transition-all',
        indicatorClassName,
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

interface ProgressBarProps
  extends React.ComponentPropsWithoutRef<typeof Progress> {
  showTooltip?: boolean
  labelRight?: boolean
  label?: string
}

const ProgressBar = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressBarProps
>(
  (
    {
      className,
      value = 0,
      showTooltip,
      labelRight,
      label,
      indicatorClassName,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        className={cn(
          'relative flex items-center gap-3 w-full',
          showTooltip && 'mt-10',
        )}
      >
        <div className="relative w-full">
          <Progress
            ref={ref}
            value={value}
            className={className}
            indicatorClassName={indicatorClassName}
            {...props}
          />
          {showTooltip && (
            <div
              className="absolute top-[-42px] z-10 flex flex-col items-center justify-start rounded-lg transition-all duration-300 pointer-events-none"
              style={{
                left: `calc(${value}% - 16px)`,
                filter:
                  'drop-shadow(0px 12px 16px rgba(16,24,40,0.08)) drop-shadow(0px 4px 6px rgba(16,24,40,0.03))',
              }}
            >
              <div className="flex flex-col items-start justify-start relative px-3 py-2 rounded-lg bg-white">
                <p className="text-xs font-semibold text-center text-[#344054]">
                  {label || `${value}%`}
                </p>
              </div>
              <svg
                width={16}
                height={9}
                viewBox="0 0 16 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-1.5 relative -mt-0.5"
                preserveAspectRatio="none"
              >
                <path
                  d="M14.0711 -1.5991e-06C14.962 -1.5991e-06 15.4081 1.07714 14.7782 1.70711L8.70711 7.77818C8.31658 8.16871 7.68342 8.1687 7.29289 7.77818L1.22183 1.70711C0.591867 1.07714 1.03803 -1.17763e-06 1.92894 -1.17763e-06L14.0711 -1.5991e-06Z"
                  fill="white"
                />
              </svg>
            </div>
          )}
        </div>
        {labelRight && (
          <p className="flex-grow-0 flex-shrink-0 text-sm font-medium text-left text-[#344054]">
            {label || `${value}%`}
          </p>
        )}
      </div>
    )
  },
)
ProgressBar.displayName = 'ProgressBar'

export { Progress, ProgressBar }
