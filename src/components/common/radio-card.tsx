'use client'

import * as React from 'react'
import { RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface RadioCardProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupItem> {
  children: React.ReactNode
  containerClassName?: string
  contentClassName?: string
  alignControl?: 'left' | 'right' | 'top-left' | 'top-right'
  disabled?: boolean
}

export const RadioCard = React.forwardRef<
  React.ElementRef<typeof RadioGroupItem>,
  RadioCardProps
>(
  (
    {
      className,
      containerClassName,
      contentClassName,
      size = 'md',
      alignControl = 'top-left',
      children,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId()
    const radioId = id || generatedId

    // Determine flex direction and alignment based on alignControl
    const isRightAligned = alignControl.includes('right')
    const isTopAligned = alignControl.includes('top')

    return (
      <Label
        htmlFor={radioId}
        className={cn(
          'group/card relative flex cursor-pointer rounded-lg border p-4 shadow-sm transition-all duration-200',
          // Default styling
          'border-[#EAECF0] bg-white hover:bg-gray-50',
          // Selected styling using arbitrary group selection on Radix's state attributes
          'has-[[data-state=checked]]:border-[#099260] has-[[data-state=checked]]:bg-[#D2F9E3]',
          // Disabled styling
          'has-[input:disabled]:opacity-50 has-[input:disabled]:cursor-not-allowed',
          // Layout structure
          isTopAligned ? 'items-start' : 'items-center',
          isRightAligned ? 'justify-between' : 'justify-start',
          size === 'md' ? 'gap-4' : 'gap-3',
          containerClassName,
        )}
      >
        {/* Control Render Logic */}
        {!isRightAligned && (
          <div
            className={cn(
              'flex justify-center items-center flex-shrink-0',
              isTopAligned ? 'pt-0.5' : '',
            )}
          >
            <RadioGroupItem
              id={radioId}
              ref={ref}
              size={size}
              className={className}
              disabled={props.disabled}
              {...props}
            />
          </div>
        )}

        {/* Main Content Render */}
        <div
          className={cn(
            'flex flex-col flex-grow relative cursor-pointer peer-disabled:cursor-not-allowed',
            contentClassName,
          )}
        >
          {children}
        </div>

        {isRightAligned && (
          <div
            className={cn(
              'flex justify-center items-center flex-shrink-0',
              isTopAligned ? 'pt-0.5' : '',
            )}
          >
            <RadioGroupItem
              id={radioId}
              ref={ref}
              size={size}
              className={className}
              disabled={props.disabled}
              {...props}
            />
          </div>
        )}
      </Label>
    )
  },
)
RadioCard.displayName = 'RadioCard'
