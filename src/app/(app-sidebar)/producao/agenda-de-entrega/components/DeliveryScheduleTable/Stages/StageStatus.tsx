// React
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// UI
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuItem,
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
import { updateItem } from '@/actions/_cruds'
import { stageStatusChange } from '@/consts/deliverySchedule'

// Lib
import { cn } from '@/lib/utils'
import { StagePendingDialog } from './StagePendingDialog'

interface Props extends SearchParamsType, PropsWithChildren {
  rowData: DeliveryScheduleType['productionStages'][0]
  currentStage: string
}

export function StageStatusDropdown({
  rowData,
  searchParams,
  children,
}: Props) {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (status: string) =>
      updateItem('productionStage', rowData.id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-schedule-list'] })
      router.refresh()
    },
  })

  const handleChangeStatus = async (newStatus: string) => {
    if (newStatus === 'PENDING') {
      setOpen(true)
      return
    }

    toast.promise(mutation.mutateAsync(newStatus), {
      loading: 'Aguarde...',
      success: () => {
        return 'Status alterado'
      },
      error: 'Ocorreu um erro',
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-48" align="start">
          <DropdownMenuGroup>
            {stageStatusChange.map((item) => {
              if (item.statusToShow.includes(rowData.status)) {
                return (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => handleChangeStatus(item.newStatus)}
                    disabled={false}
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
