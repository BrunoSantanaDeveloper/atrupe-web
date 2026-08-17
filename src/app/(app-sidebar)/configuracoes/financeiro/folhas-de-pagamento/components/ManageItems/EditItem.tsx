'use client'

// React
import { useEffect } from 'react'

// UI
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'

// Icons
import { IconCircleCheck } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { defaultValues, schema, type FormType } from './schema'
import { useQueryClient } from '@tanstack/react-query'

// Actions
import { updateItemNew } from '@/actions/_cruds'

// Types
import type { PayrollTemplateType } from '@/types/settings/payroll'

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  rowData?: PayrollTemplateType
}

export function EditItemDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const { reset, handleSubmit, formState } = form

  useEffect(() => {
    if (open && rowData) {
      reset({ name: rowData.name, type: rowData.type })
    }
  }, [open, rowData, reset])

  const onSubmit = async (data: FormType) => {
    const result = await updateItemNew({
      route: `/financial/payroll-templates/${rowData?.id}`,
      data,
    })

    if (!result.success) {
      toast.error(result.message)
      return
    }

    toast.success('Item de custo atualizado!')
    queryClient.invalidateQueries()
    handleOpenChange(false)
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog)
    if (!openDialog) reset(defaultValues)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Editar item de custo</DialogTitle>
          <DialogDescription>
            A alteração vale para a folha de todos os colaboradores.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              id="payroll-template-form"
            >
              <div className="grid gap-4 py-4">
                <FormInput
                  name="name"
                  label="Referência"
                  placeholder="Digite aqui"
                  width="flex-[1_0_300px]"
                />
                <FormSelect
                  name="type"
                  label="Operação em folha"
                  options={[
                    { value: 'INCREASE', label: 'Lançar acréscimo' },
                    { value: 'DISCOUNT', label: 'Lançar desconto' },
                  ]}
                  width="flex-[1_0_300px]"
                />
              </div>
            </form>
          </Form>
        </DialogBody>
        <DialogFooter>
          <div className="space-x-4">
            <Button
              type="button"
              variant="neutralOutline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              RightIcon={IconCircleCheck}
              isLoading={formState.isSubmitting}
              form="payroll-template-form"
            >
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
