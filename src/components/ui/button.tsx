import * as React from 'react'
import { Slot, Slottable } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import { LoaderCircle } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-white transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-gray-100 disabled:text-gray-300 disabled:border-gray-200',
  {
    variants: {
      variant: {
        // ── Legacy variants (backward compatible) ──────────────────
        default:
          'bg-brand text-white hover:bg-brand-700 active:bg-brand-600 border border-brand',
        outline:
          'border-2 border-brand-300 bg-white text-brand hover:border-brand-400 hover:bg-brand-100 hover:text-brand-600 active:border-brand-300 active:bg-brand-50 active:text-brand',
        light:
          'bg-brand-100 text-brand-600 hover:bg-brand-300 active:bg-brand-200',
        ghost:
          'text-brand hover:bg-brand-50 hover:text-brand-600 active:border-brand-300 active:bg-brand-50 active:text-brand',

        success:
          'bg-success text-white hover:bg-success-700 active:bg-success-600',
        successOutline:
          'border-2 border-success-300 bg-white text-success hover:border-success-400 hover:bg-success-100 hover:text-success-600 active:border-success-300 active:bg-success-50 active:text-success',
        successLight:
          'bg-success-100 text-success-600 hover:bg-success-300 active:bg-success-200',
        successGhost:
          'text-success hover:bg-success-100 hover:text-success-600 active:bg-success-50 active:text-success',

        warning:
          'bg-warning text-white hover:bg-warning-700 active:bg-warning-600',
        warningOutline:
          'border-2 border-warning-300 bg-white text-warning hover:border-warning-400 hover:bg-warning-100 hover:text-warning-600 active:border-warning-300 active:bg-warning-50 active:text-warning',
        warningLight:
          'bg-warning-100 text-warning-600 hover:bg-warning-300 active:bg-warning-200',
        warningGhost:
          'text-warning hover:bg-warning-100 hover:text-warning-600 active:bg-warning-50 active:text-warning',

        error: 'bg-error text-white hover:bg-error-700 active:bg-error-600',
        errorOutline:
          'border-2 border-error-300 bg-white text-error hover:border-error-400 hover:bg-error-100 hover:text-error-600 active:border-error-300 active:bg-error-50 active:text-error',
        errorLight:
          'bg-error-100 text-error-600 hover:bg-error-300 active:bg-error-200',
        errorGhost:
          'text-error hover:bg-error-100 hover:text-error-600 active:bg-error-50 active:text-error',

        neutral: 'bg-gray text-white hover:bg-gray-700 active:bg-gray-600',
        neutralOutline:
          'border-2 border-gray-300 bg-white text-gray hover:border-gray-400 hover:bg-gray-100 hover:text-gray-600 active:border-gray-300 active:bg-gray-50 active:text-gray',
        neutralLight:
          'bg-gray-100 text-gray-600 hover:bg-gray-300 active:bg-gray-200',
        neutralGhost:
          'text-gray hover:bg-gray-100 hover:text-gray-600 active:bg-gray-50 active:text-gray',

        input:
          'justify-start text-left font-normal border border-gray-300 bg-white shadow-xs text-gray-900 focus-visible:ring-offset-0 focus-visible:ring-4 focus-visible:ring-brand-50 focus-visible:border-brand-300 cursor-text transition-all duration-200 ease-in-out',
        inputError:
          'justify-start text-left font-normal border border-error-300 bg-white shadow-xs text-gray-900 focus-visible:ring-offset-0 focus-visible:ring-4 focus-visible:ring-error-100 focus-visible:border-error-300 cursor-text transition-all duration-200 ease-in-out',

        link: 'text-gray-900 underline-offset-4 hover:underline',

        none: 'hover:opacity-80 active:opacity-95 transition-opacity transition-color font-normal',
        raw: 'font-normal',

        // ── New Figma DS variants ──────────────────────────────────────────
        primary:
          'bg-brand-600 text-white border border-brand-600 hover:bg-brand-700 hover:border-brand-700 active:bg-brand-800 active:border-brand-800',
        primaryOutline:
          'bg-brand-200 border-2 border-brand-800 text-brand-800 hover:bg-brand-100 hover:border-brand-700 hover:text-brand-700 active:bg-brand-50 active:border-brand-600 active:text-brand-600',

        secondary:
          'bg-gray-100 border border-gray-100 text-gray-500 hover:bg-gray-300 hover:border-gray-300 hover:text-gray-700 active:bg-gray-200 active:border-gray-200 active:text-gray-600',
        secondaryOutline:
          'bg-white border-2 border-gray-300 text-gray-500 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-700 active:bg-gray-50 active:border-gray-300 active:text-gray-600',
        secondaryGhost:
          'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700 active:bg-gray-50 active:text-gray-600',

        destructive:
          'bg-error-600 border border-error-600 text-white hover:bg-error-700 hover:border-error-700 active:bg-error-800 active:border-error-800',
        destructiveOutline:
          'bg-white border-2 border-error-300 text-error-600 hover:bg-error-100 hover:border-error-400 hover:text-error-700 active:bg-error-50 active:border-error-300 active:text-error-600',
        destructiveGhost:
          'bg-transparent text-error-600 hover:bg-error-100 hover:text-error-700 active:bg-error-50 active:text-error-600',

        // ── Overlays / Glassmorphism ───────────────────────────────────────
        glassDark:
          'bg-black/90 backdrop-blur text-white border border-transparent shadow-sm hover:bg-black/80 hover:border-white/10 active:bg-black',
        glassLight:
          'bg-white/90 backdrop-blur text-gray-800 border border-gray-200 shadow-sm hover:bg-white/100 hover:border-gray-300 active:bg-gray-50',
      },
      size: {
        default: 'h-11 px-4 text-sm',
        md: 'h-10 px-3 text-sm',
        sm: 'h-8 px-2 text-sm',
        lg: 'h-14 px-6 text-sm',
        icon: 'h-10 w-10 p-2.5',
        iconMd: 'h-11 w-11 p-2',
        iconSm: 'h-8 min-w-8 max-w-8 p-1.5',
        iconXs: 'h-6 min-w-6 max-w-6 p-1',
        iconXxs: 'h-4 min-w-4 max-w-4 p-0.5',
        iconLg: 'h-14 min-w-14',
        none: 'p-0',
      },
      rounded: {
        default: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'default',
    },
  },
)

interface IconProps {
  LeftIcon?: React.ElementType
  leftIconSize?: number
  RightIcon?: React.ElementType
  rightIconSize?: number
}

interface IconRefProps {
  LeftIcon?: never
  leftIconSize?: never
  RightIcon?: never
  rightIconSize?: number
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

export type ButtonIconProps = IconProps | IconRefProps

const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & ButtonIconProps
>(
  (
    {
      className,
      variant,
      size,
      rounded,
      asChild = false,
      LeftIcon,
      RightIcon,
      isLoading,
      leftIconSize = 24,
      rightIconSize = 24,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'
    // https://enhanced-button.vercel.app/
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        {...props}
        disabled={isLoading || props.disabled}
      >
        {!isLoading && LeftIcon && (
          <LeftIcon aria-hidden="true" size={leftIconSize} />
        )}
        <Slottable>{props.children}</Slottable>
        {isLoading ? (
          <LoaderCircle
            aria-hidden="true"
            size={rightIconSize}
            className="animate-spin"
          />
        ) : (
          RightIcon && (
            <RightIcon
              aria-hidden="true"
              size={rightIconSize}
              className="ml-auto"
            />
          )
        )}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
