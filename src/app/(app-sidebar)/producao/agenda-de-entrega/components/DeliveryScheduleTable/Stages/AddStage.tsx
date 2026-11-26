'use client'

// Acrescentar um setor ao pedido (área 9 §4.16; Maicol, 26/11/2026): o
// ícone livre, como a Criação que não se cobra ou o Acabamento. Entra antes
// da Entrega e vale para os itens do pedido.

import { useRouter } from '@/hooks/useRouter'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { IconPlus } from '@tabler/icons-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ActionButton } from '@/components/common/ActionButton'
import { Icon } from '@/components/ui/icon'
import { createItemNew } from '@/actions/_cruds'
import { sectorIcons, sectorIconByName } from '@/consts/sectors'
import { useSector } from '@/hooks/queries/useSector'
import { usePlanErrorToast } from '@/hooks/usePlanErrorToast'

// Entrega e Cliente Retira não são etapas de produção
const DELIVERY_STAGES = ['Entrega', 'Cliente Retira']

export function AddStageButton({
  scheduleId,
  current,
}: {
  scheduleId: string
  current: string[]
}) {
  const { data: sectors } = useSector({ isProductionStage: true })
  const queryClient = useQueryClient()
  const router = useRouter()
  const { notifyActionError } = usePlanErrorToast()

  const options = (sectors ?? []).filter(
    (sector) =>
      sector.isActive &&
      !current.includes(sector.id) &&
      !DELIVERY_STAGES.includes(sector.name),
  )

  const add = async (stageId: string, name: string) => {
    const res = await createItemNew({
      route: `/sale/production-stage/schedule/${scheduleId}/stage`,
      data: { stageId },
    })
    if (!res.success) {
      notifyActionError(res, 'Não foi possível acrescentar a etapa')
      return
    }
    queryClient.invalidateQueries({ queryKey: ['delivery-schedule-list'] })
    router.refresh()
    toast.success(`${name} acrescentada ao pedido`)
  }

  if (!options.length) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ActionButton
          Icon={IconPlus}
          tooltip="Acrescentar uma etapa ao pedido"
          variant="neutralGhost"
          className="p-2"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48" align="start">
        <DropdownMenuLabel className="text-xs font-normal text-gray-600">
          Também passa por
        </DropdownMenuLabel>
        {options.map((sector) => (
          <DropdownMenuItem
            key={sector.id}
            onClick={() => add(sector.id, sector.name)}
          >
            <Icon
              icon={
                (sector.icon && sectorIcons[sector.icon]?.icon) ||
                sectorIconByName(sector.name)
              }
              size="md"
              className="mr-2"
            />
            {sector.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
