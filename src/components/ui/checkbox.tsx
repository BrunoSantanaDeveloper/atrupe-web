'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  className?: string
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'group peer h-5 w-5 shrink-0 rounded-md bg-white text-brand border border-gray-300 ring-offset-white',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2',
      'transition-all duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-brand-50 data-[state=checked]:border-brand',
      'data-[state=indeterminate]:bg-brand-50 data-[state=indeterminate]:border-brand',
      'dark:border-gray-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300',
      'dark:data-[state=checked]:bg-gray-50 dark:data-[state=checked]:text-gray-900',
      'dark:data-[state=indeterminate]:bg-gray-50 dark:data-[state=indeterminate]:text-gray-900',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        'flex items-center justify-center text-current transition-opacity duration-200 ease-in-out',
      )}
    >
      <Check className="h-4 w-4 hidden group-data-[state=checked]:block" />
      <Minus className="h-4 w-4 hidden group-data-[state=indeterminate]:block" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))

Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
