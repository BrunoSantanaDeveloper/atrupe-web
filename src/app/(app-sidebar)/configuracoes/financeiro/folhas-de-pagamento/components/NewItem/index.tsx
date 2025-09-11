'use client'

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
  DialogTrigger,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'

// Icons
import { IconCirclePlus, IconCircleCheck } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { defaultValues, schema, type FormType } from './schema'
import { useQueryClient } from '@tanstack/react-query'

// Actions
import { createItemNew, updateItemNew } from '@/actions/_cruds'

// Types
import type { PayrollConfigItemType } from '@/types/settings/payroll'

interface Props {
  editMode?: boolean
  open?: boolean
  setOpen?: (value: string) => void
  rowData?: PayrollConfigItemType
}

export function NewItemDialog({ editMode, rowData, open, setOpen }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const { reset, handleSubmit, formState } = form

  useEffect(() => setDialogOpen(open ?? false), [open])

  useEffect(() => {
    if (editMode && rowData && open) {
      form.reset({
        reference: rowData?.reference || '',
        amount: rowData?.amount || 0,
        type: rowData?.type || '',
      })
    }
  }, [editMode, rowData, form, open])

  const onSubmit = async (data: FormType) => {
    const result = editMode
      ? await updateItemNew({
          route: `/financial/salaries/${rowData?.id}`,
          data,
        })
      : await createItemNew({
          route: '/financial/salaries',
          data,
        })

    if (!result.success) {
      toast.error(result.message)
      return
    }

    queryClient.invalidateQueries()
    handleOpenChange(false)
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen?.(openDialog ? 'edit' : '')
    setDialogOpen(openDialog)
    if (!openDialog) {
      reset(defaultValues)
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {!editMode && (
        <DialogTrigger asChild>
          <Button type="button" LeftIcon={IconCirclePlus}>
            Novo item de custo
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{editMode ? 'Editar' : 'Novo'} custo</DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              id="payroll-item-form"
            >
              <div className="grid gap-4 py-4">
                <FormInput
                  name="reference"
                  label="Referência"
                  placeholder="Digite aqui"
                  width="flex-[1_0_300px]"
                />
                <FormSelect
                  name="type"
                  label="Operação em folha"
                  options={[
                    {
                      value: 'INCREASE',
                      label: 'Lançar acréscimo',
                    },
                    {
                      value: 'DISCOUNT',
                      label: 'Lançar desconto',
                    },
                  ]}
                  width="flex-[1_0_300px]"
                />
                <FormBrlInput
                  name="amount"
                  label="Valor"
                  startAdornment={<>R$</>}
                  width="flex-[1_0_300px]"
                />
              </div>
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
              RightIcon={IconCircleCheck}
              isLoading={formState.isSubmitting}
              form="payroll-item-form"
            >
              {editMode ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
