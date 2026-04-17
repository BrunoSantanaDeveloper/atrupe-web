import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const avatarLabelVariants = cva('flex items-center justify-start', {
  variants: {
    size: {
      xs: 'gap-2',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-3',
      xl: 'gap-3',
      '2xl': 'gap-4',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const avatarLabelNameVariants = cva('font-semibold text-[#344054]', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-sm',
      xl: 'text-base',
      '2xl': 'text-base',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const avatarLabelSubtitleVariants = cva('text-[#667085]', {
  variants: {
    size: {
      xs: 'text-[10px]',
      sm: 'text-xs',
      md: 'text-xs',
      lg: 'text-sm',
      xl: 'text-sm',
      '2xl': 'text-base',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export interface AvatarLabelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarLabelVariants> {
  name: string
  subtitle?: string
  avatar: React.ReactNode
}

const AvatarLabel = React.forwardRef<HTMLDivElement, AvatarLabelProps>(
  ({ className, size, name, subtitle, avatar, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(avatarLabelVariants({ size }), className)}
        {...props}
      >
        {avatar}
        <div className="flex flex-col justify-start items-start">
          <p className={cn(avatarLabelNameVariants({ size }))}>{name}</p>
          {subtitle && (
            <p className={cn(avatarLabelSubtitleVariants({ size }))}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    )
  },
)
AvatarLabel.displayName = 'AvatarLabel'

/**
 * AVATAR LABEL GROUP
 * A layout container for multiple AvatarLabel components.
 */
const AvatarLabelGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-wrap gap-4', className)} {...props} />
))
AvatarLabelGroup.displayName = 'AvatarLabelGroup'

export { AvatarLabel, AvatarLabelGroup }
