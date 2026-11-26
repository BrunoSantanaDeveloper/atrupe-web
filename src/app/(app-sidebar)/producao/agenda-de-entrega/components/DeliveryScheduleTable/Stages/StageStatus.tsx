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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Consts
// import { quotationsQuotationStatusObj } from '@/consts/quotations'

// Icons
import { IconCircleFilled, IconLock, IconX } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types
import type { PropsWithChildren } from 'react'
import type { SearchParamsType } from '@/types/coreTypes'
import type { DeliveryScheduleType } from '@/types/production/deliverySchedule'

// Actions
import { deleteItemNew, updateItemNew } from '@/actions/_cruds'
import { stageStatusChange } from '@/consts/deliverySchedule'

// Hooks
import { usePlanErrorToast } from '@/hooks/usePlanErrorToast'

// Lib
import { cn } from '@/lib/utils'
import { StagePendingDialog } from './StagePendingDialog'
import { useAlertDialog } from '@/store/useAlertDialog'
import { usePermissions } from '@/hooks/usePermissions'

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
  /**
   * A rota da troca: a etapa do pedido (padrão) ou a do item
   * (`/sale/production-stage/item/:id`, §4.7)
   */
  route?: string
  /**
   * Pede confirmação antes de trocar, quando a troca vale para mais de um
   * item (a etapa do pedido no LITE, §4.7). Devolve o texto ou null.
   */
  confirmFor?: (newStatus: string, label: string) => string | null
  /**
   * Tirar o ícone do pedido (área 9 §4.16): só na etapa do pedido. O fixo,
   * cobrado na composição, aparece travado com o motivo.
   */
  removable?: boolean
}

export function StageStatusDropdown({
  rowData,
  searchParams,
  children,
  canChangeStatus: planAllows = true,
  managedByProduction = false,
  route,
  confirmFor,
  removable = false,
}: Props) {
  const stageRoute = route || `/sale/production-stage/${rowData.id}`
  const alertDialog = useAlertDialog()
  // Trocar a situação da etapa mexe na agenda: pede a permissão de editar
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission('production:delivery_schedule:edit')
  const canChangeStatus = planAllows && !managedByProduction && canEdit
  // O motivo do menu travado, do mais forte para o mais fraco (um objeto de
  // mensagens, para a extração de textos achar cada uma)
  const locked = {
    production: {
      message: 'Esta etapa segue as tarefas do Gerenciador de produção.',
    },
    plan: { message: 'Trocar o status da etapa não faz parte do seu plano.' },
    role: { message: 'Seu cargo não pode trocar o status da etapa.' },
  }
  const lockedReason = managedByProduction
    ? locked.production.message
    : planAllows
      ? locked.role.message
      : locked.plan.message
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()
  const { notifyActionError } = usePlanErrorToast()

  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (status: string) =>
      updateItemNew({
        route: stageRoute,
        data: { status },
      }),
    onSuccess: (res) => {
      if (!res.success) return
      queryClient.invalidateQueries({ queryKey: ['delivery-schedule-list'] })
      router.refresh()
    },
  })

  // Tirar o ícone livre do pedido (§4.16)
  const handleRemove = () => {
    alertDialog.open({
      title: 'Tirar do pedido',
      description: `${rowData.stage?.name} sai deste pedido e dos itens dele.`,
      confirmLabel: 'Tirar',
      onConfirm: async () => {
        const res = await deleteItemNew({ route: stageRoute })
        if (!res.success) {
          notifyActionError(res, 'Não foi possível tirar a etapa')
          return
        }
        queryClient.invalidateQueries({ queryKey: ['delivery-schedule-list'] })
        router.refresh()
        toast.success('Etapa tirada do pedido')
      },
    })
  }

  const handleChangeStatus = async (newStatus: string, label = '') => {
    if (newStatus === 'PENDING') {
      setOpen(true)
      return
    }
    const question = confirmFor?.(newStatus, label)
    if (question) {
      alertDialog.open({
        title: label,
        description: question,
        confirmLabel: label,
        onConfirm: () => {
          changeStatus(newStatus)
        },
      })
      return
    }
    await changeStatus(newStatus)
  }

  const changeStatus = async (newStatus: string) => {
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
              {lockedReason}
            </DropdownMenuLabel>
          )}
          <DropdownMenuGroup>
            {stageStatusChange.map((item) => {
              if (item.statusToShow.includes(rowData.status)) {
                return (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() =>
                      handleChangeStatus(item.newStatus, item.text)
                    }
                    disabled={!canChangeStatus}
                  >
                    <Icon
                      icon={IconCircleFilled}
                      size="md"
                      className={cn(
                        'mr-2',
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
          {removable && canChangeStatus && (
            <>
              <DropdownMenuSeparator />
              {rowData.fixed ? (
                <DropdownMenuLabel className="flex max-w-60 items-start gap-2 text-xs font-normal text-gray-600">
                  <Icon icon={IconLock} size="sm" className="shrink-0" />
                  Cobrada na composição do produto: não sai do pedido.
                </DropdownMenuLabel>
              ) : (
                <DropdownMenuItem onClick={handleRemove}>
                  <Icon icon={IconX} size="md" className="mr-2" />
                  Tirar do pedido
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <StagePendingDialog
        open={open}
        setOpen={() => setOpen(!open)}
        rowData={rowData}
        searchParams={searchParams}
        route={stageRoute}
      />
    </>
  )
}
