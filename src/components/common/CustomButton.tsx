// UI
import { Button, ButtonProps } from '@/components/ui/button'
import { FeaturedIcon, FeaturedIconProps } from '@/components/ui/featured-icon'

// Lib
import { cn } from '@/lib/utils'

// Icons
import { IconLoader2, type IconProps } from '@tabler/icons-react'
import { SVGProps, forwardRef } from 'react'

interface Props extends ButtonProps {
  icon?:
    | React.ComponentType<IconProps>
    | React.ComponentType<SVGProps<SVGSVGElement>>
  caption?: string
  title: string
  iconVariant?: FeaturedIconProps['variant']
  isLoading?: boolean
}

export const CustomButton = forwardRef<HTMLButtonElement, Props>(
  (
    {
      icon,
      caption,
      title,
      iconVariant = 'neutralLight',
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
          <FeaturedIcon
            variant={iconVariant}
            Icon={isLoading ? IconLoader2 : icon}
            rounded
            className={cn(isLoading && 'animate-spin')}
          />
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
