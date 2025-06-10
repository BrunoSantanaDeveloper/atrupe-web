import { SVGProps } from 'react'

import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import { IconProps } from '@tabler/icons-react'

const featuredIconVariants = cva(
  'inline-flex items-center justify-center text-sm font-semibold shadow-sm ring-inset ring-transparent',
  {
    variants: {
      variant: {
        default: 'bg-brand text-white',
        outline: 'bg-white border border-brand-200 text-brand-700',
        light: 'bg-brand-100 text-brand-600',
        ghost: 'text-brand',
        bordered: 'bg-brand text-white ring-brand-600',
        borderedLight: 'bg-brand-100 text-brand-600 ring-brand-50',

        success: 'bg-success text-white',
        successOutline: 'bg-white border border-success-200 text-success-700',
        successLight: 'bg-success-100 text-success-800',
        successGhost: 'text-success',
        successBordered: 'bg-success text-white ring-success-600',
        successBorderedLight: 'bg-success-100 text-success-600 ring-success-50',

        warning: 'bg-warning text-white',
        warningOutline: 'bg-white border border-warning-200 text-warning-700',
        warningLight: 'bg-warning-100 text-warning-800',
        warningGhost: 'text-warning',
        warningBordered: 'bg-warning text-white ring-warning-600',
        warningBorderedLight: 'bg-warning-100 text-warning-600 ring-warning-50',

        error: 'bg-error text-white',
        errorOutline: 'bg-white border border-error-200 text-error-700',
        errorLight: 'bg-error-100 text-error-800',
        errorGhost: 'text-error',
        errorBordered: 'bg-error text-white ring-error-600',
        errorBorderedLight: 'bg-error-100 text-error-600 ring-error-50',

        neutral: 'bg-gray text-white',
        neutralOutline: 'bg-white border border-gray-200 text-gray-700',
        neutralLight: 'bg-gray-100 text-gray-800',
        neutralGhost: 'text-gray',
        neutralBordered: 'bg-gray text-white ring-gray-600',
        neutralBorderedLight: 'bg-gray-100 text-gray-600 ring-gray-50',

        blue: 'bg-blue text-white',
        blueOutline: 'bg-white border border-blue-200 text-blue-700',
        blueLight: 'bg-blue-100 text-blue-800',
        blueGhost: 'text-blue',
        blueBordered: 'bg-blue text-white ring-blue-600',
        blueBorderedLight: 'bg-blue-100 text-blue-600 ring-blue-50',

        lightBlue: 'bg-blue-light text-white',
        lightBlueOutline:
          'bg-white border border-blue-light-200 text-blue-light-700',
        lightBlueLight: 'bg-blue-light-100 text-blue-light-800',
        lightBlueGhost: 'text-blue-light',
        lightBlueBordered: 'bg-blue-light text-white ring-blue-light-600',
        lightBlueBorderedLight:
          'bg-blue-light-100 text-blue-light-600 ring-blue-light-50',

        indigo: 'bg-indigo text-white',
        indigoOutline: 'bg-white border border-indigo-200 text-indigo-700',
        indigoLight: 'bg-indigo-100 text-indigo-800',
        indigoGhost: 'text-indigo',
        indigoBordered: 'bg-indigo text-white ring-indigo-600',
        indigoBorderedLight: 'bg-indigo-100 text-indigo-600 ring-indigo-50',

        orange: 'bg-orange text-white',
        orangeOutline: 'bg-white border border-orange-200 text-orange-700',
        orangeLight: 'bg-orange-100 text-orange-800',
        orangeGhost: 'text-orange',
        orangeBordered: 'bg-orange text-white ring-orange-600',
        orangeBorderedLight: 'bg-orange-100 text-orange-600 ring-orange-50',
      },
      size: {
        xs: 'h-6 min-w-6 rounded [&_svg]:size-4 ring-[2px]',
        sm: 'h-8 min-w-8 rounded-md [&_svg]:size-4 ring-[4px]',
        default: 'h-10 min-w-10 rounded-[10px] [&_svg]:size-5 ring-[6px]',
        lg: 'h-14 min-w-14 rounded-[10px] ring-[8px]',
        xl: 'h-16 min-w-16 rounded-xl [&_svg]:size-7 ring-[10px]',
        xxl: 'h-20 min-w-20 rounded-2xl [&_svg]:size-10 ring-[12px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface FeaturedIconProps
  extends React.HTMLAttributes<IconProps>,
    VariantProps<typeof featuredIconVariants> {
  Icon:
    | React.ComponentType<IconProps>
    | React.ComponentType<SVGProps<SVGSVGElement>>
  rounded?: boolean
}

function FeaturedIcon({
  size,
  variant,
  className,
  Icon,
  rounded,
}: FeaturedIconProps) {
  return (
    <div
      className={cn(
        featuredIconVariants({ variant, size, className }),
        rounded ? 'rounded-full' : '',
      )}
    >
      <Icon aria-hidden="true" />
    </div>
  )
}

export { FeaturedIcon, featuredIconVariants }
