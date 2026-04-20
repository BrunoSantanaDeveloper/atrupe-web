import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonGroupVariants = cva(
  'inline-flex justify-start items-start overflow-hidden rounded-lg border border-gray-300 shadow-sm',
  {
    variants: {
      orientation: {
        horizontal: 'flex-row',
        vertical: 'flex-col',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  },
)

const ButtonGroupContext = React.createContext<{
  orientation: 'horizontal' | 'vertical'
}>({
  orientation: 'horizontal',
})

export interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation, children, ...props }, ref) => {
    const safeOrientation = orientation ?? 'horizontal'
    return (
      <ButtonGroupContext.Provider value={{ orientation: safeOrientation }}>
        <div
          ref={ref}
          className={cn(
            buttonGroupVariants({ orientation: safeOrientation }),
            safeOrientation === 'horizontal'
              ? 'divide-x divide-gray-300'
              : 'divide-y divide-gray-300',
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </ButtonGroupContext.Provider>
    )
  },
)
ButtonGroup.displayName = 'ButtonGroup'

const buttonGroupItemVariants = cva(
  'inline-flex items-center justify-center gap-2 px-4 py-3 bg-white text-sm font-semibold transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-600 focus-visible:ring-offset-2 ring-offset-white focus-visible:z-10 relative disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'text-gray-700 hover:bg-gray-50 hover:text-gray-800 active:bg-gray-100',
        active: 'text-gray-800 bg-gray-50',
      },
      size: {
        default: 'h-11',
        sm: 'h-9 px-3',
        lg: 'h-14 px-6',
        icon: 'h-11 w-11 p-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonGroupItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonGroupItemVariants> {
  asChild?: boolean
}

const ButtonGroupItem = React.forwardRef<
  HTMLButtonElement,
  ButtonGroupItemProps
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      ref={ref}
      className={cn(buttonGroupItemVariants({ variant, size, className }))}
      {...props}
    />
  )
})
ButtonGroupItem.displayName = 'ButtonGroupItem'

export { ButtonGroup, ButtonGroupItem }
