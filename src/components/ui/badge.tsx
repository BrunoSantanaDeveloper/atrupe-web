import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { IconCircleFilled } from '@tabler/icons-react'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 mix-blend-multiply',
  {
    variants: {
      variant: {
        // ── Legacy variants (backward compatible) ──────────────────
        default: 'bg-brand text-white',
        outline: 'border border-brand-300 text-brand-700',
        light: 'bg-brand-50 text-brand-700',

        neutral: 'bg-gray text-white',
        neutralOutline: 'border border-gray-300 text-gray-700',
        neutralLight: 'bg-gray-100 text-gray-700 [&>svg]:fill-gray',

        success: 'bg-success text-white',
        successOutline: 'border border-success-300 text-success-700',
        successLight: 'bg-success-50 text-success-700 [&>svg]:fill-success',

        warning: 'bg-warning text-white',
        warningOutline: 'border border-warning-300 text-warning-700',
        warningLight: 'bg-warning-50 text-warning-700 [&>svg]:fill-warning',

        error: 'bg-error text-white',
        errorOutline: 'border border-error-300 text-error-700',
        errorLight: 'bg-error-50 text-error-700 [&>svg]:fill-error',

        blue: 'bg-blue text-white',
        blueOutline: 'border border-blue-300 text-blue-700',
        blueLight: 'bg-blue-50 text-blue-700 [&>svg]:fill-blue',

        lightBlue: 'bg-blue-light text-white',
        lightBlueOutline: 'border border-blue-light-300 text-blue-light-700',
        lightBlueLight: 'bg-blue-light-50 text-blue-light-700',

        pink: ' bg-pink text-white',
        pinkOutline: 'border border-pink-300 text-pink-700',
        pinkLight: ' bg-pink-50 text-pink-700 [&>svg]:fill-pink',

        blueGreen: ' bg-blue-green text-white',
        blueGreenOutline: 'border border-blue-green-300 text-blue-green-700',
        blueGreenLight:
          'bg-blue-green-50 text-blue-green-700 [&>svg]:fill-blue-green',

        purple: 'bg-purple text-white',
        purpleOutline: 'border border-purple-300 text-purple-700',
        purpleLight: 'bg-purple-50 text-purple-700 [&>svg]:fill-purple',

        orange: 'bg-orange text-white',
        orangeOutline: 'border border-orange-300 text-orange-700',
        orangeLight: 'bg-orange-50 text-orange-700 [&>svg]:fill-orange',

        rose: 'bg-rose text-white',
        roseOutline: 'border border-rose-300 text-rose-700',
        roseLight: 'bg-rose-50 text-rose-700 [&>svg]:fill-rose',

        black: 'bg-gray-900 text-white',
        blackOutline: 'border border-gray text-gray-700',
        blackLight: 'bg-gray-200 text-gray-900 [&>svg]:fill-gray-900',

        // ── New Figma DS variants (token-based) ────────────────────
        gray: 'bg-gray-100 text-gray-700',
        blueGray: 'bg-blue-gray-50 text-blue-gray-700',
        indigo: 'bg-indigo-50 text-indigo-700',
        amber: 'bg-warning-50 text-warning-700',
        emerald: 'bg-brand-50 text-brand-700',
        primary: 'bg-brand-600 text-white mix-blend-normal',
      },
      size: {
        default: 'px-2 py-0.5',
        sm: 'px-1.5 py-0 text-[10px]',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-sm',
        roundXs: 'p-0.5 h-3 w-3',
        roundSm: 'p-1 h-5 w-5',
        round: 'h-6 w-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const badgeDotVariants = cva('h-2 w-2 rounded-full shrink-0', {
  variants: {
    variant: {
      default: 'bg-white',
      outline: 'bg-brand-500',
      light: 'bg-brand-500',
      neutral: 'bg-white',
      neutralOutline: 'bg-gray-500',
      neutralLight: 'bg-gray-500',
      success: 'bg-white',
      successOutline: 'bg-success-500',
      successLight: 'bg-success-500',
      warning: 'bg-white',
      warningOutline: 'bg-warning-500',
      warningLight: 'bg-warning-500',
      error: 'bg-white',
      errorOutline: 'bg-error-500',
      errorLight: 'bg-error-500',
      blue: 'bg-white',
      blueOutline: 'bg-blue-500',
      blueLight: 'bg-blue-500',
      lightBlue: 'bg-white',
      lightBlueOutline: 'bg-blue-light-500',
      lightBlueLight: 'bg-blue-light-500',
      pink: 'bg-white',
      pinkOutline: 'bg-pink-500',
      pinkLight: 'bg-pink-500',
      blueGreen: 'bg-white',
      blueGreenOutline: 'bg-blue-light-500',
      blueGreenLight: 'bg-blue-light-500',
      purple: 'bg-white',
      purpleOutline: 'bg-purple-500',
      purpleLight: 'bg-purple-500',
      orange: 'bg-white',
      orangeOutline: 'bg-orange-500',
      orangeLight: 'bg-orange-500',
      rose: 'bg-white',
      roseOutline: 'bg-rose-500',
      roseLight: 'bg-rose-500',
      black: 'bg-white',
      blackOutline: 'bg-gray-900',
      blackLight: 'bg-gray-900',
      // New Figma variants
      gray: 'bg-gray-500',
      blueGray: 'bg-blue-gray-500',
      indigo: 'bg-indigo-500',
      amber: 'bg-warning-500',
      emerald: 'bg-brand-500',
      primary: 'bg-white',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** @deprecated Use `dot` instead */
  status?: boolean
  dot?: boolean
  avatar?: React.ReactNode
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  LeftIcon?: React.ElementType
  RightIcon?: React.ElementType
}

function Badge({
  className,
  variant,
  size,
  status,
  dot,
  avatar,
  icon,
  iconPosition = 'left',
  LeftIcon,
  RightIcon,
  children,
  ...props
}: BadgeProps) {
  const showDot = dot || status
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {avatar && <div className="flex shrink-0 items-center overflow-hidden">{avatar}</div>}
      {showDot && <span className={cn(badgeDotVariants({ variant }))} />}
      {icon && iconPosition === 'left' && (
        <span className="flex shrink-0 items-center">{icon}</span>
      )}
      {LeftIcon && <LeftIcon aria-hidden="true" className="size-3" />}
      {children}
      {RightIcon && <RightIcon aria-hidden="true" className="size-3" />}
      {icon && iconPosition === 'right' && (
        <span className="flex shrink-0 items-center">{icon}</span>
      )}
    </div>
  )
}

export { Badge, badgeVariants }

