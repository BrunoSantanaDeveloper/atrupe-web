'use client'

// React
import { useState } from 'react'

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
import { FeaturedIcon } from '@/components/ui/featured-icon'

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
import { createItemNew } from '@/actions/_cruds'

// Types
import { behaviorFields, behaviorOptions } from '../../types'

// O item novo entra na folha de todos os colaboradores com o valor padrão;
// o valor de cada um se ajusta depois, na linha dele
export function NewItemDialog() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const { reset, handleSubmit, formState, watch } = form

  const { showIncrease, showDiscount } = behaviorFields(watch('behavior'))

  const onSubmit = async (data: FormType) => {
    // O lado que o comportamento não usa vai zerado, como o servidor grava
    const fields = behaviorFields(data.behavior)
    const result = await createItemNew({
      route: '/financial/payroll-setup',
      data: {
        name: data.name,
        behavior: data.behavior,
        defaultIncrease: fields.showIncrease ? data.defaultIncrease : 0,
        defaultDiscount: fields.showDiscount ? data.defaultDiscount : 0,
      },
    })

    if (!result.success) {
      toast.error(result.message)
      return
    }

    toast.success('Item de custo criado')
    queryClient.invalidateQueries()
    handleOpenChange(false)
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog)
    if (!openDialog) reset(defaultValues)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" LeftIcon={IconPlus}>
          Novo item de custo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconPlus} />
            <DialogTitle>Novo custo</DialogTitle>
          </div>
          <DialogDescription>
            O item entra na folha de todos os colaboradores com o valor padrão.
            O valor de cada um se ajusta depois, na linha dele.
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
                <FormInput<FormType>
                  name="name"
                  label="Referência"
                  placeholder="Digite aqui"
                  width="flex-[1_0_300px]"
                />
                <FormSelect<FormType>
                  name="behavior"
                  label="Comportamento na folha"
                  options={behaviorOptions()}
                  width="flex-[1_0_300px]"
                />
                <div className="flex flex-wrap gap-4">
                  {showIncrease && (
                    <FormBrlInput<FormType>
                      name="defaultIncrease"
                      label="Acréscimo padrão"
                      startAdornment={<>R$</>}
                      width="flex-[1_0_160px]"
                    />
                  )}
                  {showDiscount && (
                    <FormBrlInput<FormType>
                      name="defaultDiscount"
                      label="Desconto padrão"
                      startAdornment={<>R$</>}
                      width="flex-[1_0_160px]"
                    />
                  )}
                </div>
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
              form="payroll-item-form"
            >
              Adicionar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
