'use client'

import * as React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface CheckboxCardProps
  extends React.ComponentPropsWithoutRef<typeof Checkbox> {
  children: React.ReactNode
  containerClassName?: string
  contentClassName?: string
  alignControl?: 'left' | 'right' | 'top-left' | 'top-right'
}

export const CheckboxCard = React.forwardRef<
  React.ElementRef<typeof Checkbox>,
  CheckboxCardProps
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
    const checkboxId = id || generatedId

    // Determine flex direction and alignment based on alignControl
    const isRightAligned = alignControl.includes('right')
    const isTopAligned = alignControl.includes('top')

    return (
      <Label
        htmlFor={checkboxId}
        className={cn(
          'group/card relative flex cursor-pointer rounded-lg border p-4 shadow-sm transition-all duration-200',
          // Default styling
          'border-[#EAECF0] bg-white hover:bg-gray-50',
          // Selected styling using arbitrary group selection on Radix's state attributes
          'has-[[data-state=checked]]:border-[#099260] has-[[data-state=checked]]:bg-[#D2F9E3]',
          // Disabled styling
          'has-[#disabled-marker]:opacity-50 has-[#disabled-marker]:cursor-not-allowed',
          // Layout structure
          isTopAligned ? 'items-start' : 'items-center',
          isRightAligned ? 'justify-between' : 'justify-start',
          size === 'md' ? 'gap-4' : 'gap-3',
          containerClassName,
        )}
      >
        {/* Provide an easy target inside for tailwind has() disabled check */}
        {props.disabled && <span id="disabled-marker" className="hidden" />}

        {/* Control Render Logic */}
        {!isRightAligned && (
          <div
            className={cn(
              'flex justify-center items-center flex-shrink-0',
              isTopAligned ? 'pt-0.5' : '',
            )}
          >
            <Checkbox
              id={checkboxId}
              ref={ref}
              size={size}
              className={className}
              {...props}
            />
          </div>
        )}

        {/* Main Content Render */}
        <div
          className={cn('flex flex-col flex-grow relative', contentClassName)}
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
            <Checkbox
              id={checkboxId}
              ref={ref}
              size={size}
              className={className}
              {...props}
            />
          </div>
        )}
      </Label>
    )
  },
)
CheckboxCard.displayName = 'CheckboxCard'
