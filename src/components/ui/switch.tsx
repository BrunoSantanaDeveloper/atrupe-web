'use client'

import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

import { cva, type VariantProps } from 'class-variance-authority'

const switchVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:focus-visible:ring-[#f4ebff] data-[state=unchecked]:focus-visible:ring-gray-100',
  {
    variants: {
      sizing: {
        default: 'h-6 w-11',
        sm: 'h-5 w-9',
      },
      intent: {
        success:
          'data-[state=checked]:bg-[#099260] data-[state=unchecked]:bg-[#f2f4f7]',
        brand:
          'data-[state=checked]:bg-[#7b61ff] data-[state=unchecked]:bg-[#f2f4f7]',
      },
    },
    defaultVariants: {
      sizing: 'default',
      intent: 'success',
    },
  },
)

const thumbVariants = cva(
  'pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out',
  {
    variants: {
      sizing: {
        default:
          'h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
        sm: 'h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
      },
    },
    defaultVariants: {
      sizing: 'default',
    },
  },
)

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchVariants> {}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, sizing, intent, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(switchVariants({ sizing, intent }), className)}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb className={cn(thumbVariants({ sizing }))} />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
