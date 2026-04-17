import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeGroupVariants = cva(
  'inline-flex items-center gap-2 px-1 py-0.5 rounded-2xl border',
  {
    variants: {
      variant: {
        gray: 'bg-gray-50 border-gray-100 text-gray-700',
        success: 'bg-success-50 border-brand-50 text-success-700',
        blue: 'bg-blue-50 border-blue-200 text-blue-700',
        indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
        warning: 'bg-warning-50 border-warning-200 text-warning-700',
        error: 'bg-error-50 border-error-100 text-error-700',
      },
    },
    defaultVariants: {
      variant: 'gray',
    },
  },
)

export interface BadgeGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeGroupVariants> {
  badge?: React.ReactNode
  message?: string
}

function BadgeGroup({
  className,
  variant,
  badge,
  message,
  children,
  ...props
}: BadgeGroupProps) {
  return (
    <div className={cn(badgeGroupVariants({ variant }), className)} {...props}>
      {badge}
      {message && <span className="text-sm font-medium px-1">{message}</span>}
      {children}
    </div>
  )
}

export { BadgeGroup, badgeGroupVariants }
