'use client'

import * as React from 'react'
import { RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { VariantProps } from 'class-variance-authority'

export interface RadioFieldProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupItem> {
  label: React.ReactNode
  hint?: React.ReactNode
  containerClassName?: string
}

export const RadioField = React.forwardRef<
  React.ElementRef<typeof RadioGroupItem>,
  RadioFieldProps
>(({ className, containerClassName, size = 'sm', label, hint, id, ...props }, ref) => {
  const generatedId = React.useId()
  const radioId = id || generatedId

  return (
    <div
      className={cn(
        'flex items-start justify-start',
        size === 'md' ? 'gap-3' : 'gap-2',
        props.disabled && 'opacity-50 cursor-not-allowed',
        containerClassName
      )}
    >
      <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 pt-0.5 relative">
        <RadioGroupItem
          id={radioId}
          ref={ref}
          size={size}
          className={className}
          {...props}
        />
      </div>
      <div className={cn('flex flex-col justify-start items-start flex-grow relative', size === 'md' && 'gap-0.5')}>
        <Label
          htmlFor={radioId}
          className={cn(
            'self-stretch w-full font-medium text-[#344054] cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            size === 'md' ? 'text-base' : 'text-sm'
          )}
        >
          {label}
        </Label>
        {hint && (
          <p
            className={cn(
              'self-stretch w-full text-[#667085]',
              size === 'md' ? 'text-base' : 'text-sm'
            )}
          >
            {hint}
          </p>
        )}
      </div>
    </div>
  )
})
RadioField.displayName = 'RadioField'
