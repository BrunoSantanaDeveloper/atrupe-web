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
import { IconCircleCheck } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { defaultValues, schema, type FormType } from './schema'
import { useQueryClient } from '@tanstack/react-query'

// Actions
import { createItemNew, updateItemNew } from '@/actions/_cruds'

// Types
import type { PayrollItemType } from '@/types/financial/payroll'

interface Props {
  open?: boolean
  isAdvance?: boolean
  setOpen?: (value: string) => void
  rowData?: PayrollItemType
  payrollId: string
}

export function NewItemDialog({
  open,
  setOpen,
  rowData,
  isAdvance,
  payrollId,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const editMode = !!rowData

  const { reset, handleSubmit, formState } = form

  useEffect(() => setDialogOpen(open ?? false), [open])

  useEffect(() => {
    if (editMode && open) {
      form.reset({
        description: rowData?.description || '',
        amount: rowData?.amount || 0,
        type: rowData?.type || 'INCREASE',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode, rowData, open])

  const onSubmit = async (data: FormType) => {
    if (editMode) {
      data.id = rowData?.id
    } else {
      data.salarySheetId = payrollId
    }

    if (isAdvance) {
      data.type = 'ADVANCE'
    }

    const res = editMode
      ? await updateItemNew({
          route: '/financial/payroll/item',
          data,
        })
      : await createItemNew({
          route: '/financial/payroll/item',
          data,
        })

    if (res.success) {
      queryClient.invalidateQueries()
      toast.success(res.message)
      handleOpenChange(false)
    } else {
      toast.error(res.message)
    }
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen?.(openDialog ? 'edit' : '')
    setDialogOpen(openDialog)
    if (!openDialog) {
      reset({
        description: '',
        type: 'INCREASE',
        amount: 0,
      })
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {editMode ? 'Editar' : 'Adicionar'}{' '}
            {isAdvance ? 'adiantamento' : 'item'}
          </DialogTitle>
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
                  name="description"
                  label="Referência"
                  placeholder="Digite aqui"
                  width="flex-[1_0_300px]"
                />
                {!isAdvance ? (
                  <FormSelect
                    name="type"
                    label="Operação em folha"
                    options={[
                      {
                        value: 'INCREASE',
                        label: 'Acréscimo',
                      },
                      {
                        value: 'DISCOUNT',
                        label: 'Desconto',
                      },
                    ]}
                    width="flex-[1_0_300px]"
                  />
                ) : null}
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
