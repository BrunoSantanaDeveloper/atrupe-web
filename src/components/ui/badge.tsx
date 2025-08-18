import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { IconCircleFilled } from '@tabler/icons-react'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 mix-blend-multiply',
  {
    variants: {
      variant: {
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
      },
      size: {
        default: 'px-2 py-0.5',
        sm: 'px-1.5 py-0 text-[10px]',
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

interface IconProps {
  LeftIcon?: React.ElementType
  RightIcon?: React.ElementType
  status?: boolean
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants>,
    IconProps {}

function Badge({
  className,
  variant,
  size,
  LeftIcon,
  RightIcon,
  status,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {status && <IconCircleFilled aria-hidden="true" className="size-2" />}
      {LeftIcon && <LeftIcon aria-hidden="true" className="size-3" />}
      {props.children}
      {RightIcon && <RightIcon aria-hidden="true" className="size-3" />}
    </div>
  )
}

export { Badge, badgeVariants }
