// React
import { useEffect, useState } from 'react'
import { AiContextButton } from '@/components/ai/AiContextButton'

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
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { ClientSelector } from '@/components/common/form/global-inputs/ClientAsyncSelect'
import { SupplierSelector } from '@/components/common/form/global-inputs/SupplierAsyncSelect'
import { SelectTransactionNatureField } from '@/components/common/form/global-inputs/TransactionNatureSelectField'
import { SelectTransactionCategoryField } from '@/components/common/form/global-inputs/TransactionCategorySelectField'

// Form
import { schema, type FormType } from './schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Icons
import { IconCircleCheck, IconPencil } from '@tabler/icons-react'

// Third-party
import { useQueryClient } from '@tanstack/react-query'

// Types
import { TransactionDetailsType } from '@/types/financial/financialFlow'

import { updateItemNew } from '@/actions/_cruds'

interface Props {
  rowData?: TransactionDetailsType
  type?: 'receivable' | 'payable'
  transactionDialogOpen: (open: boolean) => void
}

export function EditTransactionData({
  type,
  rowData,
  transactionDialogOpen,
}: Props) {
  const [open, setOpen] = useState(false)

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    values: {
      clientId: rowData?.client
        ? ({
            value: rowData?.client?.id,
            label: rowData?.client?.name,
          } as unknown as string)
        : null,
      supplierId: rowData?.supplier
        ? ({
            value: rowData?.supplier?.id,
            label: rowData?.supplier?.name,
          } as unknown as string)
        : null,
      description: rowData?.description || '',
      natureId: rowData?.nature?.id || '',
      subCategoryId: rowData?.subCategory?.id || '',
    },
  })

  const { watch, reset, handleSubmit, formState } = form

  const queryClient = useQueryClient()

  useEffect(() => {
    if (!open) {
      reset({})
      return
    }

    reset({
      clientId: rowData?.client
        ? ({
            value: rowData?.client?.id,
            label: rowData?.client?.name,
          } as unknown as string)
        : null,
      supplierId: rowData?.supplier
        ? ({
            value: rowData?.supplier?.id,
            label: rowData?.supplier?.name,
          } as unknown as string)
        : null,
      description: rowData?.description || '',
      natureId: rowData?.nature?.id || '',
      subCategoryId: rowData?.subCategory?.id || '',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onSubmit = async (data: FormType) => {
    if (type === 'receivable') delete data.supplierId
    if (type === 'payable') delete data.clientId

    if (!data.natureId) delete data.natureId
    if (!data.subCategoryId) delete data.subCategoryId

    const res = await updateItemNew({
      route: `/financial/${type}/${rowData?.id}`,
      data,
    })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    queryClient.invalidateQueries()
    toast.success('Dados alterados')
    handleOpenChange(false)
    transactionDialogOpen(false)
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button RightIcon={IconPencil}>Editar dados</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[644px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <DialogTitle>Editar dados</DialogTitle>
          </div>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="edit-transaction-data"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-wrap gap-5"
            >
              {rowData?.expenseSource !== 'EMPLOYEE' && (
                <>
                  {type === 'receivable' ? (
                    <ClientSelector
                      name="clientId"
                      label="Cliente"
                      width="w-full"
                    />
                  ) : (
                    <SupplierSelector
                      name="supplierId"
                      label="Fornecedor"
                      width="w-full"
                    />
                  )}
                </>
              )}
              <FormInput<FormType>
                name="description"
                label="Descrição"
                width="w-full"
                disabled={!!rowData?.quotationId}
              />
              <SelectTransactionNatureField
                name="natureId"
                label="Natureza"
                width="flex-[1_0_280px]"
                type={type}
              />
              <SelectTransactionCategoryField
                name="subCategoryId"
                label="Categoria"
                width="flex-[1_0_280px]"
                natureId={watch('natureId') || ''}
              />
              {/* O assistente sugere natureza e categoria pelos lançamentos
                  parecidos (seção 9); a proposta aplica no lançamento */}
              {type === 'payable' && rowData?.id && (
                <AiContextButton
                  label="Sugerir categoria com IA"
                  message={`Sugira a categoria deste lançamento: ${watch('description') || rowData.description || ''}`}
                  context={{ payableId: rowData.id }}
                />
              )}
            </form>
          </Form>
        </DialogBody>
        <DialogFooter>
          <div className="space-x-4">
            <DialogTrigger asChild>
              <Button type="button" variant="neutralOutline">
                Cancelar
              </Button>
            </DialogTrigger>
            <Button
              type="submit"
              form="edit-transaction-data"
              RightIcon={IconCircleCheck}
              isLoading={formState.isSubmitting}
            >
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
