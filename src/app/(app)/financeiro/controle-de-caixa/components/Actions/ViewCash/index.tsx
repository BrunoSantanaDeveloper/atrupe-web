'use client'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { CashSummary } from '../../CashSummary'
import { useAlertDialog } from '@/store/useAlertDialog'

// Icons
import { IconSearch, IconCircleCheck } from '@tabler/icons-react'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { CashControlType } from '@/types/financial/cashControl'

import { createItem } from '@/actions/_cruds'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Props extends SearchParamsType {
  open: boolean
  setOpen: (value: string) => void
  rowData?: CashControlType
}

export function ViewCashDialog(props: Props) {
  const { open, setOpen, rowData } = props

  const alertDialog = useAlertDialog()

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () =>
      createItem({
        route: 'cashControlRoute',
        customPath: `/reopen/${rowData?.id}`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries()
      handleOpenChange(false)
    },
  })

  const handleOpenChange = (openDialog: boolean) => {
    if (!openDialog) {
      setOpen('')
      return
    }
    setOpen('view')
  }

  const handleReopenCash = async () => {
    await alertDialog.open({
      title: 'Deseja reabrir este caixa?',
      confirmLabel: 'Reabrir',
      onConfirm: () => mutation.mutateAsync(),
      toastMsg: {
        loading: 'Reabrindo caixa...',
        success: 'Caixa reaberto com sucesso!',
        error: 'Erro ao reabrir caixa',
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconSearch} />
              <span>Caixa fechado</span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <CashSummary data={rowData} />
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div></div>
          <div className="space-x-4">
            <DialogTrigger asChild>
              <Button type="button" variant="neutralOutline">
                Voltar
              </Button>
            </DialogTrigger>
            <Button
              type="button"
              onClick={handleReopenCash}
              RightIcon={IconCircleCheck}
              isLoading={mutation.isPending}
            >
              Reabrir
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
