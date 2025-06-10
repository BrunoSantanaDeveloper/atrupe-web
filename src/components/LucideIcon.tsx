// Icon Imports
import { icons } from 'lucide-react'

// Lib Imports
import { cn } from '@/lib/utils'

export type LucideIconType = keyof typeof icons

interface Props {
  icon?: LucideIconType
  color?: string
  size?: number
  featured?: boolean
  className?: string
}

export function LucideIcon(props: Props) {
  const { icon, color, size, featured, className } = props

  if (!icon || !icons[icon]) {
    return null
  }

  const Icon = icons[icon]

  return (
    <Icon
      color={color}
      size={size}
      className={cn(featured && 'border rounded-xl p-3 w-10 h-10', className)}
    />
  )
}
