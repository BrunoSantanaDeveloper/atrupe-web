import { SVGProps } from 'react'
import { IconProps } from '@tabler/icons-react'

interface Props {
  icon?:
    | React.ComponentType<IconProps>
    | React.ComponentType<SVGProps<SVGSVGElement>>
  className?: string
}

export function IconComponent({ icon, className, ...props }: Props) {
  if (!icon) return

  const Icon = icon

  return <Icon className={className} {...props} />
}
