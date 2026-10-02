'use client'

// Compor a etapa como o item pronto do legado: um botão por tipo de recurso.
// É o que a pessoa procura ("onde ponho a máquina, o material, a mão de
// obra?"), em vez de um "Nova linha" genérico.

// UI
import { Button } from '@/components/ui/button'

// Types
import type { ResourceKind } from '../../../processos/types'

// Hooks / Store / Consts
import { resourceKindObj } from '@/consts/processes'

// Icons
import {
  IconTool,
  IconUsers,
  IconPackage,
  IconTruckDelivery,
  type Icon,
} from '@tabler/icons-react'

const kinds: { kind: ResourceKind; Icon: Icon }[] = [
  { kind: 'MACHINE', Icon: IconTool },
  { kind: 'MATERIAL', Icon: IconPackage },
  { kind: 'LABOR', Icon: IconUsers },
  { kind: 'OUTSOURCED', Icon: IconTruckDelivery },
]

export function ResourceKindButtons({
  onPick,
}: {
  onPick: (kind: ResourceKind) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray">Acrescentar:</span>
      {kinds.map(({ kind, Icon }) => (
        <Button
          key={kind}
          type="button"
          size="sm"
          variant="neutralOutline"
          LeftIcon={Icon}
          onClick={() => onPick(kind)}
        >
          {resourceKindObj[kind]}
        </Button>
      ))}
    </div>
  )
}
