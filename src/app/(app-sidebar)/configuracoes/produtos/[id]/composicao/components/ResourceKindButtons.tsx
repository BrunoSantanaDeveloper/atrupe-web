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

// Icons: o vocabulário único dos tipos de recurso (design.md §6.10)
import { resourceKindIcon } from '@/components/common/ResourceKindIcon'

const kinds: ResourceKind[] = ['MACHINE', 'MATERIAL', 'LABOR', 'OUTSOURCED']

export function ResourceKindButtons({
  onPick,
}: {
  onPick: (kind: ResourceKind) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray">Acrescentar:</span>
      {kinds.map((kind) => (
        <Button
          key={kind}
          type="button"
          size="sm"
          variant="neutralOutline"
          LeftIcon={resourceKindIcon[kind]}
          onClick={() => onPick(kind)}
        >
          {resourceKindObj[kind]}
        </Button>
      ))}
    </div>
  )
}
