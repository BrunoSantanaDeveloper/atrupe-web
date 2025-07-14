'use client'

// Icon Imports
import { IconCircleCheck, IconAlertTriangle } from '@tabler/icons-react'

// UI component Imports
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Type
import type { SearchParamsType } from '@/types/coreTypes'
import type { DeliveryScheduleType } from '@/types/production/deliverySchedule'

// Action
import { createItem } from '@/actions/_cruds'

interface Props extends SearchParamsType {
  open: boolean
  setOpen: (value: string) => void
  rowData?: DeliveryScheduleType
}
export function BillServiceDialog({ open, rowData, setOpen }: Props) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () =>
      createItem({
        route: 'deliveryScheduleBillingRoute',
        customPath: `/${rowData?.order?.quotation?.id}`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-schedule-list'] })
      queryClient.invalidateQueries({ queryKey: ['delivery-schedule-totals'] })
    },
  })

  const handleBill = async () => {
    toast.promise(mutation.mutateAsync(), {
      loading: 'Aguarde...',
      success: () => {
        return 'Serviço faturado!'
      },
      error: 'Ocorreu um erro',
    })
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog ? 'billing' : '')
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <FeaturedIcon
              Icon={IconAlertTriangle}
              rounded
              size="lg"
              variant="warningBorderedLight"
              className="mx-auto mb-2"
            />
            <AlertDialogTitle>
              Realizar faturamento deste serviço?
            </AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              Confirme se deseja realizar faturamento deste serviço.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBill} RightIcon={IconCircleCheck}>
              Faturar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
