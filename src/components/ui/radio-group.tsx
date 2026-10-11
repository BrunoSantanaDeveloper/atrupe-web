'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Circle } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const radioItemVariants = cva(
  'aspect-square rounded-full border border-gray-300 bg-white text-brand-500 transition-all duration-200 ease-in-out outline-none disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100 hover:ring-4 hover:ring-brand-50 focus-visible:ring-4 focus-visible:ring-brand-50 data-[state=checked]:bg-brand-50 data-[state=checked]:border-brand-500 disabled:data-[state=checked]:bg-gray-100 disabled:data-[state=checked]:text-gray-300 disabled:data-[state=checked]:border-gray-300',
  {
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
  },
)

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('grid gap-2', className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioItemVariants> {}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, size, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(radioItemVariants({ size, className }))}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center h-full w-full">
        <Circle
          className={cn(
            'fill-current text-current',
            size === 'md' ? 'h-2 w-2' : 'h-1.5 w-1.5',
          )}
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
