'use client'

// UI
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
import { toast } from 'sonner'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { FormInput } from '@/components/common/form/FormInput'

// Components
import { useAlertDialog } from '@/store/useAlertDialog'
import { FormSelect } from '@/components/common/form/FormSelect'
import { SelectNatureField } from '@/components/common/form/global-inputs/NatureSelectField'

// Form
import { useForm } from 'react-hook-form'
import { FormType, schema } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Actions
import { updateItem } from '@/actions/_cruds'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { SubCategoryType } from '@/types/settings/accountsPlan'

// Icons
import { IconPencil, IconCircleCheck } from '@tabler/icons-react'

interface Props extends SearchParamsType {
  open?: boolean
  setOpen?: (value: string) => void
  rowData?: SubCategoryType
  combinedCode?: string
}

export function EditSubcategoryDialog({
  open,
  setOpen,
  rowData,
  combinedCode,
}: Props) {
  const queryClient = useQueryClient()
  const alertDialog = useAlertDialog()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    values: {
      code: rowData?.code || '',
      finalCode: '',
      description: rowData?.description || '',
      level1: combinedCode?.split('.')[0] || '',
      level2: combinedCode?.split('.')[1] || '',
      level3: combinedCode?.split('.')[2] || '',
    },
  })

  const { watch, handleSubmit, setValue } = form

  // Atualizar subcategoria
  const mutation = useMutation({
    mutationFn: (data: FormType) =>
      updateItem('accountsPlanRoute', `sub-category/${rowData?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries()
      handleOpenChange(false)
      toast.success('Sucesso')
    },
    onError: (error) => {
      console.error(error)
      toast.error('Ocorreu um erro')
    },
  })

  const onSubmit = async (data: FormType) => {
    delete data.finalCode
    delete data.level1
    delete data.level2

    if (rowData?.code === data.code) {
      delete data.code
    }

    await mutation.mutateAsync(data)
  }

  // Inativar subcategoria
  const inactivateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) =>
      updateItem('accountsPlanRoute', `sub-category/${id}`, {
        isActive: status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })

  const handleInactivate = async (id: string, status: boolean) => {
    const newStatus = !status

    await alertDialog.open({
      title: `Deseja ${status ? 'inativar' : 'ativar'} esta subcategoria?`,
      confirmLabel: status ? 'Inativar' : 'Ativar',
      onConfirm: () => {
        inactivateMutation.mutateAsync({ id, status: newStatus })
        handleOpenChange(false)
      },
      toastMsg: {
        loading: `${newStatus ? 'Ativando' : 'Inativando'} subcategoria...`,
        success: `Subcategoria ${newStatus ? 'ativada' : 'inativada'} com sucesso!`,
        error: `Erro ao ${newStatus ? 'ativar' : 'inativar'} subcategoria`,
      },
    })
  }

  const handleOpenChange = (value: boolean) => {
    setOpen?.(value ? 'edit' : '')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconPencil} />
              <span>Editar subcategoria</span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="edit-subcategory"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-wrap gap-5"
              noValidate
            >
              <FormSelect
                name="level1"
                label="Nível 1"
                options={[
                  { value: '01', label: 'Receita' },
                  { value: '02', label: 'Despesa' },
                ]}
                width="flex-[1_1_200px]"
                disabled
              />

              <FormSelect
                name="level2"
                label="Nível 2"
                options={[
                  { value: '01', label: 'Administrativo' },
                  { value: '02', label: 'Operacional' },
                  { value: '03', label: 'Não operacional' },
                ]}
                width="flex-[1_1_200px]"
                disabled
              />

              <SelectNatureField
                name="level3"
                label="Nível 3"
                width="flex-[1_1_200px]"
                level1={watch('level1')}
                level2={watch('level2')}
              />

              <FormInput
                name="code"
                inputMode="numeric"
                label="Código"
                width="flex-[1_1_150px]"
                additionalOnChange={(value) => {
                  setValue('code', value?.toString()?.replace(/\D/g, '') || '')
                }}
              />

              <FormInput
                name="finalCode"
                label="Código final"
                width="flex-[1_1_150px]"
                value={`${watch('level1')}.${watch('level2')}.${watch('level3')}.${watch('code') || '00'}`}
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
        <DialogFooter className="sm:justify-between">
          <div>
            <Button
              type="button"
              variant={rowData?.isActive ? 'errorOutline' : 'outline'}
              onClick={() =>
                handleInactivate?.(
                  rowData?.id || '',
                  rowData?.isActive || false,
                )
              }
            >
              {rowData?.isActive ? 'Inativar' : 'Ativar'}
            </Button>
          </div>
          <div className="space-x-4">
            <DialogTrigger asChild>
              <Button type="button" variant="neutralOutline">
                Voltar
              </Button>
            </DialogTrigger>
            <Button
              type="submit"
              form="edit-subcategory"
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
