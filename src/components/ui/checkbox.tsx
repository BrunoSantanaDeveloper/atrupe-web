'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check, Minus } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const checkboxVariants = cva(
  'group peer shrink-0 bg-white text-[#099260] transition-all duration-200 ease-in-out disabled:cursor-not-allowed disabled:border-[#D0D5DD] disabled:bg-[#F2F4F7] disabled:data-[state=checked]:bg-[#F2F4F7] disabled:data-[state=checked]:text-[#D0D5DD] disabled:data-[state=checked]:border-[#D0D5DD] outline-none hover:ring-4 hover:ring-[#D2F9E3] focus-visible:ring-4 focus-visible:ring-[#D2F9E3] data-[state=checked]:bg-[#D2F9E3] data-[state=checked]:border-[#099260] data-[state=indeterminate]:bg-[#D2F9E3] data-[state=indeterminate]:border-[#099260]',
  {
    variants: {
      size: {
        default: 'h-4 w-4 rounded border border-[#D0D5DD]',
        sm: 'h-4 w-4 rounded border border-[#D0D5DD]',
        md: 'h-5 w-5 rounded-md border border-[#D0D5DD]',
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
