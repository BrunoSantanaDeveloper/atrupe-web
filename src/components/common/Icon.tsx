import { SVGProps } from 'react'
import { IconProps } from '@tabler/icons-react'

import { ICON_SIZE_CLASS, type IconSize } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

interface Props {
  icon?:
    | React.ComponentType<IconProps>
    | React.ComponentType<SVGProps<SVGSVGElement>>
  /**
   * Tamanho por classe, para valer também nos pictogramas SVG com
   * `width/height` fixos, que ignoram a prop `size` do Tabler.
   */
  size?: IconSize
  className?: string
}

export function IconComponent({ icon, size, className, ...props }: Props) {
  if (!icon) return

  const Icon = icon

  return (
    <Icon
      className={cn(size && ['shrink-0', ICON_SIZE_CLASS[size]], className)}
      aria-hidden
      {...props}
    />
  )
}
