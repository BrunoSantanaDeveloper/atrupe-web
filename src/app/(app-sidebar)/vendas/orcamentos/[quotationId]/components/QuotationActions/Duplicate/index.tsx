// React
import Link from 'next/link'
import { useState } from 'react'

// UI
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { Form } from '@/components/ui/form'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Button, buttonVariants } from '@/components/ui/button'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { ActionButton } from '@/components/common/ActionButton'
import { ClientSelector } from '@/components/common/form/global-inputs/ClientAsyncSelect'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  getDefaultValues,
  duplicateSchema,
  type DuplicateType,
  type DuplicateFormValues,
} from './schema'

// Icons
import {
  IconCopyPlus,
  IconArrowRight,
  IconCircleCheck,
} from '@tabler/icons-react'

// Third-party
import { useQueryClient } from '@tanstack/react-query'

// Libs
import { cn } from '@/lib/utils'
import { actionDisabled } from '@/lib/quotation'

// Actions
import { createItemNew } from '@/actions/_cruds'

// Types
import { QuotationType } from '@/types/sales/quotation'

interface Props {
  quotationData: QuotationType
}

export function DuplicateDialog(props: Props) {
  const [open, setOpen] = useState(false)
  const [openSuccess, setOpenSuccess] = useState(false)
  const [newQuotationId, setNewQuotationId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { quotationData } = props

  const defaultFormValues = getDefaultValues(
    quotationData?.client?.id,
    quotationData?.client?.name,
    quotationData?.description,
  )

  const form = useForm<DuplicateFormValues>({
    resolver: zodResolver(duplicateSchema),
    defaultValues: defaultFormValues,
  })

  const { reset, handleSubmit } = form

  const queryClient = useQueryClient()

  const onSubmit = async (data: DuplicateType) => {
    if (isLoading) return

    setIsLoading(true)

    const res = await createItemNew({
      route: `/sale/quotation/${quotationData.id}/duplicate`,
      data,
    })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    queryClient.invalidateQueries({ queryKey: ['quotation-list'] })
    queryClient.invalidateQueries({ queryKey: ['quotation-totals'] })
    setNewQuotationId(res.data.id)
    setOpen(false)
    reset(defaultFormValues)
    setOpenSuccess(true)
    setIsLoading(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <ActionButton
            Icon={IconCopyPlus}
            tooltip="Duplicar orçamento"
            className={cn(
              buttonVariants({ variant: 'neutralLight', size: 'icon' }),
            )}
            disabled={actionDisabled(
              'duplicateQuotation',
              quotationData?.status,
            )}
          />
        </DialogTrigger>
        <DialogContent className="sm:max-w-[695px]">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconCopyPlus} />
              <DialogTitle>Duplicar orçamento</DialogTitle>
            </div>
            <DialogDescription hidden></DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Form {...form}>
              <form
                id="quotation-duplicate"
                onSubmit={handleSubmit(
                  onSubmit as unknown as (
                    data: DuplicateFormValues,
                  ) => Promise<void>,
                )}
                noValidate
                className="flex flex-wrap gap-4"
              >
                <ClientSelector
                  name="clientId"
                  label="Cliente"
                  width="w-full"
                />
                <FormInput
                  name="description"
                  label="Nova descrição do serviço"
                  width="w-full"
                />
              </form>
            </Form>
          </DialogBody>
          <DialogFooter className="sm:justify-between">
            <div></div>
            <div className="space-x-4">
              <DialogTrigger asChild>
                <Button type="button" variant="neutralOutline">
                  Cancelar
                </Button>
              </DialogTrigger>
              <Button
                type="submit"
                form="quotation-duplicate"
                RightIcon={IconArrowRight}
                isLoading={isLoading}
              >
                Duplicar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={openSuccess} onOpenChange={setOpenSuccess}>
        <AlertDialogContent className="max-w-96">
          <AlertDialogHeader>
            <FeaturedIcon
              Icon={IconCircleCheck}
              rounded
              size="lg"
              variant="successBorderedLight"
              className="mx-auto mb-2"
            />
            <AlertDialogTitle>Orçamento duplicado</AlertDialogTitle>
            <AlertDialogDescription>
              Os itens da venda foram duplicados em um novo orçamento
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenSuccess(false)}>
              Fechar
            </AlertDialogCancel>
            <Button asChild type="button" RightIcon={IconArrowRight}>
              <Link href={`/vendas/orcamentos/${newQuotationId}`}>
                Ver orçamento
              </Link>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
