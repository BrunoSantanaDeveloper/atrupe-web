'use client'

// UI
import { Card } from '@/components/ui/card'

// Components
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Icons
import { IconLayoutDashboard } from '@tabler/icons-react'

interface Props {
  title: string
}

// Abas ainda sem tela de referência aprovada (openspec/regras-de-negocio/areas/05-base-de-custos.md §5.5)
export function TabNotDesigned({ title }: Props) {
  return (
    <Card>
      <ListDataTotalEmpty
        icon={IconLayoutDashboard}
        title={title}
        description="Esta aba ainda não tem tela de referência aprovada."
      />
    </Card>
  )
}
