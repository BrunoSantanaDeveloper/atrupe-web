import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { IconPlus as Plus } from '@tabler/icons-react'

import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const avatarAddVariants = cva(
  'relative flex shrink-0 items-center justify-center rounded-full transition-[color,background-color,border-color,box-shadow,opacity] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-100 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      size: {
        xs: 'h-6 w-6',
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-14 w-14',
        '2xl': 'h-16 w-16',
      },
      variant: {
        default:
          'bg-white border border-gray-300 border-dashed hover:bg-gray-50 disabled:bg-gray-100',
        subtle:
          'bg-gray-50 border border-gray-200 border-dashed hover:border-gray-300',
        glow: 'bg-white border border-gray-300 border-dashed shadow-[0_0_0_4px_#f2f4f7]',
        unstyled: '',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  },
)

export interface AvatarAddButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>,
    VariantProps<typeof avatarAddVariants> {
  disabled?: boolean
  tooltipText?: string
}

const AvatarAddButton = React.forwardRef<
  HTMLButtonElement,
  AvatarAddButtonProps
>(({ className, size, variant, tooltipText = 'Adicionar', ...props }, ref) => {
  // As per Figma spec, plus icon is 20px (w-5) for xl/2xl, and 16px (w-4) for lg and below.
  const iconSizeClass = size === 'xl' || size === '2xl' ? 'w-5 h-5' : 'w-4 h-4'
  const iconStrokeClass =
    variant === 'subtle' ? 'text-gray-300' : 'text-slate-400'

  const ButtonContent = (
    <button
      type="button"
      ref={ref}
      className={cn(avatarAddVariants({ size, variant }), className)}
      {...props}
    >
      <span className="sr-only">{tooltipText}</span>
      <Plus
        aria-hidden
        className={cn('shrink-0', iconSizeClass, iconStrokeClass)}
      />
    </button>
  )

  if (tooltipText) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>{ButtonContent}</TooltipTrigger>
          <TooltipContent
            side="top"
            className="bg-gray-900 text-white font-semibold text-xs px-3 py-2 border-none drop-shadow-md rounded-lg"
          >
            {tooltipText}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return ButtonContent
})
AvatarAddButton.displayName = 'AvatarAddButton'

export { AvatarAddButton, avatarAddVariants }
