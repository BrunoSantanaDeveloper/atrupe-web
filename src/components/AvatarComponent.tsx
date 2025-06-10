import {
  AvatarImage,
  AvatarFallback,
  Avatar as ShadcnAvatar,
} from './ui/avatar'

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn, getInitials } from '@/lib/utils'

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-brand-50 text-brand-300 dark:bg-brand-800 dark:text-brand',
        warning:
          'bg-warning-50 text-warning-300 dark:bg-warning-800 dark:text-warning',
        error: 'bg-error-50 text-error-300 dark:bg-error-800 dark:text-error',
        success:
          'bg-success-50 text-success-300 dark:bg-success-800 dark:text-success',
        info: 'bg-info-50 text-info-300 dark:bg-info-800 dark:text-info',
      },
      size: {
        xs: 'h-8 w-8',
        sm: 'h-12 w-12',
        md: 'h-14 w-14',
        lg: 'h-16 w-16',
        xl: 'h-20 w-20',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  },
)

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  url: string
  name: string
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, url, name, variant, ...props }, ref) => (
  <ShadcnAvatar
    ref={ref}
    className={cn(avatarVariants({ size, variant, className }))}
    {...props}
  >
    <AvatarImage src={url} alt={name} className="object-cover" />
    <AvatarFallback>{getInitials(name)}</AvatarFallback>
  </ShadcnAvatar>
))
Avatar.displayName = AvatarPrimitive.Root.displayName

export { Avatar, avatarVariants }
