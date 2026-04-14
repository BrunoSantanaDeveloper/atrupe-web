'use client'

import * as React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface CheckboxFieldProps
  extends React.ComponentPropsWithoutRef<typeof Checkbox> {
  label: React.ReactNode
  hint?: React.ReactNode
  containerClassName?: string
}

export const CheckboxField = React.forwardRef<
  React.ElementRef<typeof Checkbox>,
  CheckboxFieldProps
>(({ className, containerClassName, size = 'sm', label, hint, id, ...props }, ref) => {
  const generatedId = React.useId()
  const checkboxId = id || generatedId

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
        <Checkbox
          id={checkboxId}
          ref={ref}
          size={size}
          className={className}
          {...props}
        />
      </div>
      <div className={cn('flex flex-col justify-start items-start flex-grow relative', size === 'md' && 'gap-0.5')}>
        <Label
          htmlFor={checkboxId}
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
CheckboxField.displayName = 'CheckboxField'
