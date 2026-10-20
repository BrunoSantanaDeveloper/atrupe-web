// React
import { useState } from 'react'
import { useRouter } from '@/hooks/useRouter'

// UI
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Consts
// import { quotationsQuotationStatusObj } from '@/consts/quotations'

// Icons
import { IconCircleFilled } from '@tabler/icons-react'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types
import type { PropsWithChildren } from 'react'
import type { SearchParamsType } from '@/types/coreTypes'
import type { DeliveryScheduleType } from '@/types/production/deliverySchedule'

// Actions
import { updateItemNew } from '@/actions/_cruds'
import { stageStatusChange } from '@/consts/deliverySchedule'

// Hooks
import { usePlanErrorToast } from '@/hooks/usePlanErrorToast'

// Lib
import { cn } from '@/lib/utils'
import { StagePendingDialog } from './StagePendingDialog'

interface Props extends SearchParamsType, PropsWithChildren {
  rowData: DeliveryScheduleType['productionStages'][0]
  currentStage: string
  /**
   * Trocar o status da etapa é recurso de plano
   * (delivery_stage_status_change). Sem ele, as opções aparecem
   * desabilitadas, com o motivo.
   */
  canChangeStatus?: boolean
  /**
   * A etapa que segue o gerenciador de produção (ELITE, D20): sem troca
   * aqui, com o motivo no menu.
   */
  managedByProduction?: boolean
}

export function StageStatusDropdown({
  rowData,
  searchParams,
  children,
  canChangeStatus: planAllows = true,
  managedByProduction = false,
}: Props) {
  const canChangeStatus = planAllows && !managedByProduction
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()
  const { notifyActionError } = usePlanErrorToast()

  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (status: string) =>
      updateItemNew({
        route: `/sale/production-stage/${rowData.id}`,
        data: { status },
      }),
    onSuccess: (res) => {
      if (!res.success) return
      queryClient.invalidateQueries({ queryKey: ['delivery-schedule-list'] })
      router.refresh()
    },
  })

  const handleChangeStatus = async (newStatus: string) => {
    if (newStatus === 'PENDING') {
      setOpen(true)
      return
    }

    const loadingToast = toast.loading('Aguarde...')
    const res = await mutation.mutateAsync(newStatus).catch(() => null)
    toast.dismiss(loadingToast)

    if (!res?.success) {
      // Trocar o status da etapa é recurso de plano: o servidor recusa sem
      // ele.
      notifyActionError(res, 'Ocorreu um erro')
      return
    }

    toast.success('Status alterado')
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-48" align="start">
          {!canChangeStatus && (
            <DropdownMenuLabel className="max-w-60 text-xs font-normal text-gray-600">
              {managedByProduction
                ? 'Esta etapa segue as tarefas do Gerenciador de produção.'
                : 'Trocar o status da etapa não faz parte do seu plano.'}
            </DropdownMenuLabel>
          )}
          <DropdownMenuGroup>
            {stageStatusChange.map((item) => {
              if (item.statusToShow.includes(rowData.status)) {
                return (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => handleChangeStatus(item.newStatus)}
                    disabled={!canChangeStatus}
                  >
                    <IconCircleFilled
                      aria-hidden="true"
                      className={cn(
                        'size-2 mr-2',
                        `text-${item.color}`,
                        item.color === 'pink' && 'text-pink',
                        item.color === 'white' && 'stroke-2 stroke-gray',
                      )}
                    />
                    {item.text}
                  </DropdownMenuItem>
                )
              }
              return null
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <StagePendingDialog
        open={open}
        setOpen={() => setOpen(!open)}
        rowData={rowData}
        searchParams={searchParams}
      />
    </>
  )
}
