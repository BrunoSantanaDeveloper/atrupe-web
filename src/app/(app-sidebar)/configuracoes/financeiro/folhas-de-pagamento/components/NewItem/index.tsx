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
import { IconPlus, IconCircleCheck } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { defaultValues, schema, type FormType } from './schema'
import { useQueryClient } from '@tanstack/react-query'

// Actions
import { createItemNew, updateItemNew } from '@/actions/_cruds'

// Types
import type { PayrollSetupItemType } from '@/types/settings/payroll'

interface Props {
  editMode?: boolean
  open?: boolean
  setOpen?: (value: string) => void
  rowData?: PayrollSetupItemType
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
        name: rowData?.name || '',
        amount: rowData?.amount || 0,
        type: rowData?.type || '',
      })
    }
  }, [editMode, rowData, form, open])

  const onSubmit = async (data: FormType) => {
    // Na edição só o valor é do colaborador; referência e operação pertencem
    // ao item de custo (alterados em "Gerenciar itens de custo")
    const result = editMode
      ? await updateItemNew({
          route: `/financial/payroll-setup/${rowData?.id}`,
          data: { amount: data.amount },
        })
      : await createItemNew({
          route: '/financial/payroll-setup',
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
          <Button type="button" LeftIcon={IconPlus}>
            Novo item de custo
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <DialogTitle>
              {editMode ? 'Editar custo' : 'Novo custo'}
            </DialogTitle>
          </div>
          <DialogDescription hidden={!editMode}>
            {editMode
              ? 'Referência e operação são alteradas em "Gerenciar itens de custo", pois valem para todos os colaboradores.'
              : null}
          </DialogDescription>
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
                  name="name"
                  label="Referência"
                  placeholder="Digite aqui"
                  width="flex-[1_0_300px]"
                  disabled={editMode}
                />
                <FormSelect
                  name="type"
                  label="Operação em folha"
                  disabled={editMode}
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
