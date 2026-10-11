import * as React from 'react'
import { cn } from '@/lib/utils'

interface PaginationDotsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Total number of pages/dots */
  count: number
  /** Currently active dot index (0-indexed) */
  activeIndex: number
  /** Variation of the dots */
  variant?: 'success' | 'gray' | 'white' | 'dark' | 'brand'
  /** Determine if active dot expands into a pill */
  pillOnActive?: boolean
  /** Determine the size of the dots / pills */
  size?: 'sm' | 'md'
  /** Wrapper container style */
  wrapper?: 'none' | 'successDark' | 'successLight' | 'glassDark' | 'glassLight'
  /** Callback when a dot is clicked */
  onIndexChange?: (index: number) => void
}

const PaginationDots = React.forwardRef<HTMLDivElement, PaginationDotsProps>(
  (
    {
      count,
      activeIndex,
      variant = 'success',
      pillOnActive = true,
      size = 'sm',
      wrapper = 'none',
      onIndexChange,
      className,
      ...props
    },
    ref,
  ) => {
    // Generate arrays for iterations
    const dots = Array.from({ length: count }, (_, i) => i)

    const baseColorClass = {
      success: {
        active: 'bg-success border-success',
        inactive: 'bg-success-200 border-success-200',
      },
      gray: {
        active: 'bg-gray-500 border-gray-500',
        inactive: 'bg-gray-300 border-gray-300',
      },
      white: {
        active: 'bg-white border-white',
        inactive: 'bg-white/50 border-white/50',
      },
      dark: {
        active: 'bg-gray-900 border-gray-900',
        inactive: 'bg-gray-400 border-gray-400',
      },
      brand: {
        active: 'bg-brand border-brand',
        inactive: 'bg-brand-200 border-brand-200',
      },
    }[variant]

    const wrapperClasses = {
      none: '',
      successDark: 'p-2 rounded-xl bg-brand-700 shadow-sm',
      successLight: 'p-2 rounded-xl bg-success-50 shadow-sm',
      glassDark: 'p-2 rounded-xl bg-black/90 backdrop-blur shadow-sm',
      glassLight:
        'p-2 rounded-xl bg-white/90 backdrop-blur shadow-sm border border-gray-200',
    }

    const wrapperClassMd = {
      none: '',
      successDark: 'p-3 rounded-[17px] bg-brand-700 shadow-sm',
      successLight: 'p-3 rounded-[17px] bg-success-50 shadow-sm',
      glassDark: 'p-3 rounded-[17px] bg-black/90 backdrop-blur shadow-sm',
      glassLight:
        'p-3 rounded-[17px] bg-white/90 backdrop-blur shadow-sm border border-gray-200',
    }

    const currentWrapperClass =
      size === 'md' ? wrapperClassMd[wrapper] : wrapperClasses[wrapper]

    const gapClass = size === 'md' ? 'gap-4' : pillOnActive ? 'gap-2' : 'gap-3'

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          gapClass,
          currentWrapperClass,
          className,
        )}
        {...props}
      >
        {dots.map((index) => {
          const isActive = index === activeIndex
          return (
            <button
              key={index}
              type="button"
              aria-label={`Página ${index + 1}`}
              aria-current={isActive ? 'true' : 'false'}
              onClick={() => onIndexChange?.(index)}
              className={cn(
                'transition-all duration-300 ease-in-out border',
                isActive ? baseColorClass.active : baseColorClass.inactive,
                isActive && pillOnActive
                  ? size === 'md'
                    ? 'w-11 h-2 rounded-[4px]'
                    : 'w-10 h-1.5 rounded-[3px]'
                  : size === 'md'
                    ? 'w-2.5 h-2.5 rounded-full'
                    : 'w-2 h-2 rounded-full',
                !onIndexChange && 'cursor-default pointer-events-none',
              )}
            />
          )
        })}
      </div>
    )
  },
)

PaginationDots.displayName = 'PaginationDots'

export { PaginationDots }
