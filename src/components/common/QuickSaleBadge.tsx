// UI
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'

// Icons
import { IconBolt } from '@tabler/icons-react'

// A marca da venda rápida: o mesmo selo na lista e no cabeçalho da venda,
// no lugar da faixa colorida, que é a marca do Super Admin (11/11/2026)
export function QuickSaleBadge({ size = 'sm' }: { size?: 'sm' | 'default' }) {
  return (
    <Badge variant="warningLight" size={size} className="shrink-0">
      <Icon icon={IconBolt} size="sm" />
      Venda rápida
    </Badge>
  )
}
