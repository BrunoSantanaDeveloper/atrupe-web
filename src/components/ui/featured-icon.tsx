import { cva, type VariantProps } from 'class-variance-authority'
import { IconLoader2 } from '@tabler/icons-react'

import { Icon, type IconComponentType } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

// Ícone em destaque (design/openspec, icones): um círculo claro com o ícone
// no tom. Só em estado vazio, confirmação e onboarding — nunca em cabeçalho
// de diálogo comum nem em card de KPI.
const featuredIconVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-full',
  {
    variants: {
      tone: {
        brand: 'bg-brand-50 text-brand-600',
        neutral: 'bg-gray-100 text-gray-600',
        success: 'bg-success-50 text-success-600',
        warning: 'bg-warning-50 text-warning-600',
        error: 'bg-error-50 text-error-600',
        info: 'bg-blue-50 text-blue-600',
      },
      size: {
        sm: 'size-8',
        md: 'size-10',
        lg: 'size-12',
      },
    },
    defaultVariants: {
      tone: 'brand',
      size: 'md',
    },
  },
)

export type FeaturedIconTone = NonNullable<
  VariantProps<typeof featuredIconVariants>['tone']
>

export interface FeaturedIconProps
  extends VariantProps<typeof featuredIconVariants> {
  Icon: IconComponentType
  isLoading?: boolean
  className?: string
}

function FeaturedIcon({
  tone,
  size,
  className,
  Icon: Glyph,
  isLoading,
}: FeaturedIconProps) {
  return (
    <div className={cn(featuredIconVariants({ tone, size }), className)}>
      <Icon
        icon={isLoading ? IconLoader2 : Glyph}
        // Ícone de 16 em 32, 20 em 40, 24 em 48: o mesmo nome de tamanho
        size={size ?? 'md'}
        className={isLoading ? 'animate-spin' : undefined}
      />
    </div>
  )
}

export { FeaturedIcon, featuredIconVariants }
