'use client'

// React
import { useMemo, useState } from 'react'

// UI
import { toast } from 'sonner'
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
  SelectGroup,
  SelectLabel,
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

// Types
import { QuotationType } from '@/types/sales/quotation'

// Actions
import { createItem } from '@/actions/_cruds'

// Icons
import { IconX, IconAlertCircle } from '@tabler/icons-react'
import { useCancelReason } from '@/hooks/queries/useCancelReason'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

interface Props {
  data: QuotationType
}

export function RejectQuotation({ data }: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')

  const queryClient = useQueryClient()
  const { getRejectionReasonsType } = usePlanFeatures()

  const { data: reasonList } = useCancelReason('REJECTION')

  const options = useMemo(() => {
    if (!reasonList) return []
    return reasonList?.find((item) => item.type === 'REJECTION')?.reasons || []
  }, [reasonList])

  const mutation = useMutation({
    mutationFn: () =>
      createItem({
        route: 'quotationRoute',
        customPath: `/${data.id}/reject`,
        data: { reasonId: reason },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })

  // Não renderiza se não tiver acesso à funcionalidade
  // if (getRejectionReasonsType() === 'none') {
  //   return null
  // }

  const handleReject = async () => {
    // Se for limited, rejeita direto sem motivo
    if (getRejectionReasonsType() === 'limited') {
      toast.promise(
        createItem({
          route: 'quotationRoute',
          customPath: `/${data.id}/reject`,
          data: {},
        }),
        {
          loading: 'Aguarde...',
          success: () => {
            queryClient.invalidateQueries()
            return 'Orçamento rejeitado'
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
        return 'Orçamento rejeitado'
      },
      error: 'Ocorreu um erro',
    })
  }

  // Se for limited, mostra botão simples sem modal
  if (getRejectionReasonsType() === 'limited') {
    return (
      <CustomButton
        icon={IconX}
        title="Rejeitar orçamento"
        iconVariant="errorLight"
        onClick={handleReject}
      />
    )
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <CustomButton
            icon={IconX}
            title="Rejeitar orçamento"
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
            <AlertDialogTitle>Rejeitar orçamento</AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              Selecione um motivo e confirme se deseja rejeitar o orçamento
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1">
            <Label htmlFor={'rejectReason'}>Motivo</Label>
            <Select value={reason} onValueChange={(value) => setReason(value)}>
              <SelectTrigger id={'rejectReason'} autoFocus>
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
              onClick={handleReject}
              className={buttonVariants({ variant: 'error' })}
              disabled={!reason}
            >
              Rejeitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
