// React
import { useEffect, useState } from 'react'

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
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { ClientSelectField } from '@/components/common/form/global-inputs/ClientSelectorField'
import { SupplierSelectField } from '@/components/common/form/global-inputs/SupplierSelectField'
import { SelectTransactionNatureField } from '@/components/common/form/global-inputs/TransactionNatureSelectField'
import { SelectTransactionCategoryField } from '@/components/common/form/global-inputs/TransactionCategorySelectField'

// Form
import { schema, type FormType } from './schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Icons
import { IconCircleCheck, IconPencil } from '@tabler/icons-react'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types
import { TransactionDetailsType } from '@/types/financial/financialFlow'

import { updateItem } from '@/actions/_cruds'

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
      clientId: rowData?.client?.id || '',
      supplierId: rowData?.supplier?.id || '',
      description: rowData?.description || '',
      natureId: rowData?.nature?.id || '',
      subCategoryId: rowData?.subCategory?.id || '',
    },
  })

  const { watch, reset, setValue, handleSubmit } = form

  const queryClient = useQueryClient()

  useEffect(() => {
    if (!open) {
      reset({})
      return
    }

    reset({
      clientId: rowData?.client?.id || '',
      supplierId: rowData?.supplier?.id || '',
      description: rowData?.description || '',
      natureId: rowData?.nature?.id || '',
      subCategoryId: rowData?.subCategory?.id || '',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const mutation = useMutation({
    mutationFn: (data: FormType) =>
      updateItem(`${type}Route`, rowData?.id || '', data),
    onSuccess: () => {
      queryClient.invalidateQueries()
      toast.success('Dados alterados!')
      handleOpenChange(false)
      transactionDialogOpen(false)
    },
    onError: () => {
      toast.error('Ocorreu um erro!')
    },
  })

  const onSubmit = async (data: FormType) => {
    if (type === 'receivable') delete data.supplierId
    if (type === 'payable') delete data.clientId

    if (!data.natureId) delete data.natureId
    if (!data.subCategoryId) delete data.subCategoryId

    await mutation.mutateAsync(data)
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
            <FeaturedIcon variant="neutralOutline" Icon={IconPencil} />
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
                    <ClientSelectField<FormType>
                      name="clientId"
                      label="Cliente"
                      width="w-full"
                      onChange={(e) => {
                        setValue('clientId', e)
                      }}
                      defaultValues={{
                        id: rowData?.client?.id || '',
                        name: rowData?.client?.name || '',
                      }}
                    />
                  ) : (
                    <SupplierSelectField<FormType>
                      name="supplierId"
                      label="Fornecedor"
                      width="w-full"
                      onChange={(e) => {
                        setValue('supplierId', e)
                      }}
                      defaultValues={{
                        id: rowData?.supplier?.id || '',
                        name: rowData?.supplier?.name || '',
                      }}
                    />
                  )}
                </>
              )}
              <FormInput<FormType>
                name="description"
                label="Descrição"
                width="w-full"
                disabled={rowData?.isSale}
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
            >
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
