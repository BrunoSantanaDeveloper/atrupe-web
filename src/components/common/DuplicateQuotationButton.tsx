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
import { Button } from '@/components/ui/button'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { ActionButton } from '@/components/common/ActionButton'
import { ClientSelector } from '@/components/common/form/global-inputs/ClientAsyncSelect'

// Form
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Icons
import {
  IconCopyPlus,
  IconArrowRight,
  IconCircleCheck,
} from '@tabler/icons-react'

// Third-party
import { useQueryClient } from '@tanstack/react-query'

// Actions
import { createItemNew } from '@/actions/_cruds'

// Schema
const duplicateSchema = z.object({
  clientId: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .transform((value) => value.value)
    .nullable(),
  description: z.string().trim(),
})

type DuplicateType = z.infer<typeof duplicateSchema>

const defaultValues = {
  clientId: null,
  description: '',
}

interface Props {
  quotationId: string
  tooltip?: string
  disabled?: boolean
}

export function DuplicateQuotationButton({
  quotationId,
  tooltip = 'Duplicar orçamento',
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const [openSuccess, setOpenSuccess] = useState(false)
  const [newQuotationId, setNewQuotationId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<DuplicateType>({
    resolver: zodResolver(duplicateSchema),
    defaultValues,
  })

  const { reset, handleSubmit } = form

  const queryClient = useQueryClient()

  const onSubmit = async (data: DuplicateType) => {
    if (isLoading) return

    setIsLoading(true)

    const res = await createItemNew({
      route: `/sale/quotation/${quotationId}/duplicate`,
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
    reset(defaultValues)
    setOpenSuccess(true)
    setIsLoading(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <ActionButton
            Icon={IconCopyPlus}
            tooltip={tooltip}
            disabled={disabled}
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
                id="quotation-duplicate-list"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="flex flex-wrap gap-4"
              >
                <ClientSelector
                  name="clientId"
                  label="Cliente"
                  width="w-full"
                />
                <FormInput<DuplicateType>
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
                form="quotation-duplicate-list"
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
