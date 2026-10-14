'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

import { cn } from '@/lib/utils'

import { cva, type VariantProps } from 'class-variance-authority'

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const tooltipVariants = cva(
  'z-50 overflow-hidden rounded-lg px-3 py-2 shadow-[0px_12px_16px_rgba(16,24,40,0.08),_0px_4px_6px_rgba(16,24,40,0.03)] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  {
    variants: {
      intent: {
        dark: 'bg-gray-900 text-white',
        light: 'bg-white dark:bg-surface-raised text-gray-700',
      },
    },
    defaultVariants: {
      intent: 'dark',
    },
  },
)

const arrowVariants = cva('', {
  variants: {
    intent: {
      dark: 'fill-gray-900',
      light: 'fill-white',
    },
  },
  defaultVariants: {
    intent: 'dark',
  },
})

export interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
    VariantProps<typeof tooltipVariants> {
  showArrow?: boolean
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(
  (
    { className, intent, showArrow = true, sideOffset = 4, children, ...props },
    ref,
  ) => (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(tooltipVariants({ intent }), className)}
      {...props}
    >
      {children}
      {showArrow && (
        <TooltipPrimitive.Arrow asChild>
          <svg
            width="16"
            height="9"
            viewBox="0 0 16 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn(arrowVariants({ intent }))}
          >
            <path d="M14.0711 5.94361e-05C14.962 5.94361e-05 15.4081 1.0772 14.7782 1.70717L8.70711 7.77824C8.31658 8.16877 7.68342 8.16877 7.29289 7.77824L1.22183 1.70717C0.591867 1.0772 1.03803 5.98575e-05 1.92894 5.98575e-05L14.0711 5.94361e-05Z" />
          </svg>
        </TooltipPrimitive.Arrow>
      )}
    </TooltipPrimitive.Content>
  ),
)
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  tooltipVariants,
  arrowVariants,
}
