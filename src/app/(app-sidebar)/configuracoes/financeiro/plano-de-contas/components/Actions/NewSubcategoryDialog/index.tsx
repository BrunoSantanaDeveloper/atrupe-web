'use client'

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

// Icons
import { IconCircleCheck } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { schema, type FormType } from './schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { createItem } from '@/actions/_cruds'

interface Props extends SearchParamsType {
  open?: boolean
  setOpen?: (value: string) => void
  natureId?: string
  combinedCode?: string
}

export function NewSubcategoryDialog({
  open,
  setOpen,
  natureId,
  combinedCode,
}: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      finalCode: '',
      description: '',
    },
  })

  const { reset, watch, setValue, handleSubmit } = form

  const mutation = useMutation({
    mutationFn: (data: FormType) =>
      createItem({
        route: 'accountsPlanRoute',
        customPath: `/sub-category/${natureId}`,
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries()
      toast.success('Subcategoria criada')
      handleOpenChange(false)
    },
    onError: () => {
      toast.error('Ocorreu um erro.')
    },
  })

  const onSubmit = async (data: FormType) => {
    delete data.finalCode

    await mutation.mutateAsync(data)
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      reset()
    }
    setOpen?.(value ? 'create' : '')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <span>Nova subcategoria</span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="create-subcategory"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-wrap gap-5"
              noValidate
            >
              <FormInput
                name="code"
                inputMode="numeric"
                label="Código"
                width="flex-[1_1_130px]"
                additionalOnChange={(value) => {
                  setValue('code', value?.toString()?.replace(/\D/g, '') || '')
                }}
              />

              <FormInput
                name="finalCode"
                label="Código final"
                width="flex-[1_1_130px]"
                value={`${combinedCode}.${watch('code') || '00'}`}
                disabled
              />

              <FormInput
                name="description"
                label="Descrição da subcategoria"
                width="flex-[1_1_300px]"
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
              form="create-subcategory"
              isLoading={mutation.isPending}
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
