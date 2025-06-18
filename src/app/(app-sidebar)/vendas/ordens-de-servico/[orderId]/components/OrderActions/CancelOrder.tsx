'use client'

// React
import { useMemo, useState } from 'react'

// UI
import { toast } from 'sonner'
import {
  Select,
  SelectItem,
  SelectValue,
  SelectLabel,
  SelectGroup,
  SelectContent,
  SelectTrigger,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { buttonVariants } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { CustomButton } from '@/components/common/CustomButton'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Type
import { OrderType } from '@/types/sales/order'

// Icons
import { IconX, IconAlertCircle } from '@tabler/icons-react'

// Actions
import { createItem } from '@/actions/_cruds'

import { useCancelReason } from '@/hooks/queries/useCancelReason'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

interface Props {
  data: OrderType
}

export function CancelOrder({ data }: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')

  const queryClient = useQueryClient()
  const { getRejectionReasonsType } = usePlanFeatures()

  const { data: reasonList } = useCancelReason('CANCELLATION')

  const options = useMemo(() => {
    if (!reasonList) return []
    return (
      reasonList?.find((item) => item.type === 'CANCELLATION')?.reasons || []
    )
  }, [reasonList])

  const mutation = useMutation({
    mutationFn: () =>
      createItem({
        route: 'orderRoute',
        customPath: `/${data.id}/cancel`,
        data: { reasonId: reason },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })

  // Não renderiza se não tiver acesso à funcionalidade
  if (getRejectionReasonsType() === 'none') {
    return null
  }

  const handleCancel = async () => {
    // Se for limited, cancela direto sem motivo
    if (getRejectionReasonsType() === 'limited') {
      toast.promise(
        createItem({
          route: 'orderRoute',
          customPath: `/${data.id}/cancel`,
          data: {},
        }),
        {
          loading: 'Aguarde...',
          success: () => {
            queryClient.invalidateQueries()
            return 'Venda cancelada'
          },
          error: 'Ocorreu um erro',
        },
      )
      return
    }

    // Lógica normal para full (com motivo)
    toast.promise(mutation.mutateAsync(), {
      loading: 'Aguarde...',
      success: () => {
        return 'Venda cancelada'
      },
      error: 'Ocorreu um erro',
    })
  }

  // Se for limited, mostra botão simples sem modal
  if (getRejectionReasonsType() === 'limited') {
    return (
      <CustomButton
        icon={IconX}
        title="Cancelar venda"
        iconVariant="errorLight"
        onClick={handleCancel}
      />
    )
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <CustomButton
            icon={IconX}
            title="Cancelar venda"
            iconVariant="errorLight"
          />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <FeaturedIcon
              Icon={IconAlertCircle}
              rounded
              size="lg"
              variant="errorBorderedLight"
              className="mx-auto mb-2"
            />
            <AlertDialogTitle>Cancelar ordem de serviço</AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              Selecione um motivo e confirme se deseja cancelar o venda
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1">
            <Label htmlFor={'cancelReason'}>Motivo</Label>
            <Select value={reason} onValueChange={(value) => setReason(value)}>
              <SelectTrigger id={'cancelReason'} autoFocus>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {options?.length ? (
                    options?.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.reason}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectLabel className="text-gray-400 cursor-not-allowed">
                      Vazio
                    </SelectLabel>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReason('')}>
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className={buttonVariants({ variant: 'error' })}
              disabled={!reason}
            >
              Cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
