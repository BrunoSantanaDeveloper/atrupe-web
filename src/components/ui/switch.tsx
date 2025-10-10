'use client'

import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:data-[state=checked]:bg-gray-200 data-[state=checked]:bg-brand data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:hover:bg-gray-300/45 [&>span]:disabled:bg-gray-100 dark:focus-visible:ring-brand-300 dark:focus-visible:ring-offset-brand-950 dark:data-[state=checked]:bg-brand-100 dark:data-[state=unchecked]:bg-brand-800 group',
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-4 w-4 rounded-full bg-white shadow ring-0 transition-all duration-200 ease-in-out data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 group-active:w-5 data-[state=checked]:group-active:translate-x-3 group-active: dark:bg-brand-900',
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
