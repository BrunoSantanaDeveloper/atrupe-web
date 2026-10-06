'use client'

// Compor a etapa como o item pronto do legado: um botão por tipo de recurso.
// É o que a pessoa procura ("onde ponho a máquina, o material, a mão de
// obra?"), em vez de um "Nova linha" genérico.

// UI
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Types
import type { ResourceKind } from '../../../processos/types'

// Hooks / Store / Consts
import { resourceKindObj } from '@/consts/processes'

// Icons: o vocabulário único dos tipos de recurso (design.md §6.10)
import { resourceKindIcon } from '@/components/common/ResourceKindIcon'

const kinds: ResourceKind[] = ['MACHINE', 'MATERIAL', 'LABOR', 'OUTSOURCED']

export function ResourceKindButtons({
  onPick,
  disabled = {},
}: {
  onPick: (kind: ResourceKind) => void
  // O tipo que a etapa não oferece, com o motivo no tooltip: a mão de obra
  // de um setor que vende por equipamento (29/09/2026, "como este setor
  // vende"). Botão desabilitado explica; não some
  disabled?: Partial<{ [key in ResourceKind]: string }>
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray">Acrescentar:</span>
      {kinds.map((kind) => {
        const reason = disabled[kind]
        const button = (
          <Button
            key={kind}
            type="button"
            size="sm"
            variant="neutralOutline"
            LeftIcon={resourceKindIcon[kind]}
            disabled={!!reason}
            aria-describedby={reason ? `kind-${kind}-reason` : undefined}
            onClick={() => onPick(kind)}
          >
            {resourceKindObj[kind]}
          </Button>
        )
        if (!reason) return button
        return (
          <Tooltip key={kind}>
            {/* O botão desabilitado não recebe eventos: o span leva o tooltip */}
            <TooltipTrigger asChild>
              <span tabIndex={0} className="inline-flex">
                {button}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p id={`kind-${kind}-reason`}>{reason}</p>
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
