// UI
import { Button, ButtonProps } from '@/components/ui/button'
import {
  FeaturedIcon,
  type FeaturedIconTone,
} from '@/components/ui/featured-icon'
import type { IconComponentType } from '@/components/ui/icon'

// Lib
import { cn } from '@/lib/utils'

// Icons
import { forwardRef } from 'react'

interface Props extends ButtonProps {
  icon?: IconComponentType
  caption?: string
  title: string
  iconTone?: FeaturedIconTone
  isLoading?: boolean
}

export const CustomButton = forwardRef<HTMLButtonElement, Props>(
  (
    {
      icon,
      caption,
      title,
      iconTone = 'neutral',
      className,
      isLoading,
      ...props
    },
    ref,
  ) => {
    return (
      <Button
        ref={ref}
        type="button"
        variant="none"
        className={cn(
          'gap-3 justify-start shadow bg-white px-6 py-4 rounded-lg border border-gray-200 h-[70px]',
          className,
        )}
        disabled={isLoading}
        {...props}
      >
        {icon && (
          <FeaturedIcon tone={iconTone} Icon={icon} isLoading={isLoading} />
        )}
        <div className="text-start">
          <p className="type-body-strong">{title}</p>
          {caption ? <p className="type-caption">{caption}</p> : null}
        </div>
      </Button>
    )
  },
)

CustomButton.displayName = 'CustomButton'
