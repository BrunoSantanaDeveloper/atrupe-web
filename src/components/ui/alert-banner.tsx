import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const alertBannerVariants = cva(
  'flex w-full items-center justify-center border-y px-4 py-3 sm:px-6 lg:px-8 transition-colors',
  {
    variants: {
      variant: {
        warning: 'bg-warning-50 border-warning-200 text-warning-600',
        error: 'bg-error-50 border-error-200 text-error-600',
        info: 'bg-blue-50 border-blue-200 text-blue-600',
        success: 'bg-success-50 border-success-200 text-success-600',
      },
    },
    defaultVariants: {
      variant: 'warning',
    },
  },
)

export interface AlertBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertBannerVariants> {
  icon?: React.ElementType
  title?: string
  description?: React.ReactNode
  action?: React.ReactNode
}

const AlertBanner = React.forwardRef<HTMLDivElement, AlertBannerProps>(
  (
    { className, variant, icon: Icon, title, description, action, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertBannerVariants({ variant }), className)}
        {...props}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center w-full gap-4 sm:gap-3">
          {Icon && <Icon className="w-8 h-8 shrink-0" aria-hidden="true" />}

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            {title && (
              <div className="text-sm font-semibold leading-5 text-inherit">
                {title}
              </div>
            )}
            {description && (
              <div className="text-sm font-normal leading-5 text-gray-500">
                {description}
              </div>
            )}
          </div>

          {action && (
            <div className="shrink-0 mt-3 sm:mt-0 sm:ml-4">{action}</div>
          )}
        </div>
      </div>
    )
  },
)
AlertBanner.displayName = 'AlertBanner'

export { AlertBanner, alertBannerVariants }
