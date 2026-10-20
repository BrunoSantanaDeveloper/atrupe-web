'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check, Minus } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const checkboxVariants = cva(
  'group peer shrink-0 bg-white transition-[color,background-color,border-color,box-shadow,opacity] text-brand-500 duration-200 ease-in-out disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100 disabled:data-[state=checked]:bg-gray-100 disabled:data-[state=checked]:text-gray-300 disabled:data-[state=checked]:border-gray-300 outline-none hover:ring-4 hover:ring-brand-50 focus-visible:ring-4 focus-visible:ring-brand-50 data-[state=checked]:bg-brand-50 data-[state=checked]:border-brand-500 data-[state=indeterminate]:bg-brand-50 data-[state=indeterminate]:border-brand-500',
  {
    variants: {
      size: {
        default: 'h-4 w-4 rounded border border-gray-300',
        sm: 'h-4 w-4 rounded border border-gray-300',
        md: 'h-5 w-5 rounded-md border border-gray-300',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  },
)

const indicatorVariants = cva('flex items-center justify-center text-current', {
  variants: {
    size: {
      default: 'h-4 w-4',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(checkboxVariants({ size, className }))}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn(indicatorVariants({ size }))}>
      <Check
        strokeWidth={3}
        className={cn(
          'hidden group-data-[state=checked]:block',
          size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3',
        )}
      />
      <Minus
        strokeWidth={3}
        className={cn(
          'hidden group-data-[state=indeterminate]:block',
          size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3',
        )}
      />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))

Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
