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
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

// Components
import { useAlertDialog } from '@/store/useAlertDialog'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'

// Icons
import { IconPlus, IconCircleCheck } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { schema, type FormType } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { NatureType } from '@/types/settings/accountsPlan'

// Actions
import { createItem, updateItem } from '@/actions/_cruds'

interface Props extends SearchParamsType {
  editMode?: boolean
  open?: boolean
  setOpen?: (value: string) => void
  rowData?: NatureType
}

export function NewCategoryDialog({
  open,
  setOpen,
  rowData,
  editMode,
  searchParams,
}: Props) {
  const [openDialog, setOpenDialog] = useState(false)

  const queryClient = useQueryClient()
  const alertDialog = useAlertDialog()

  useEffect(() => {
    setOpenDialog(!!open)
  }, [open])

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    values: {
      level1: rowData?.level1 || '',
      level2: rowData?.level2 || '',
      code: rowData?.code || '',
      description: rowData?.description || '',
    },
  })

  const { watch, setValue, handleSubmit } = form

  // Verificando por "inativos" pois searchParams?.status pode não existir se for "ativos"
  const isInactiveTab = searchParams?.status === 'inativos'

  // Criar-Editar categoria
  const mutation = useMutation({
    mutationFn: (data: FormType) =>
      editMode
        ? updateItem('accountsPlanRoute', `${rowData?.id}`, data)
        : createItem({ route: 'accountsPlanRoute', data }),
    onSuccess: () => {
      queryClient.invalidateQueries()
      toast.success('Sucesso')
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

  // Inativar categoria
  const inactivateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) =>
      updateItem('accountsPlanRoute', `${id}`, {
        isActive: status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })

  const handleInactivate = async (id: string) => {
    await alertDialog.open({
      title: `Deseja ${isInactiveTab ? 'ativar' : 'inativar'} esta categoria?`,
      confirmLabel: isInactiveTab ? 'Ativar' : 'Inativar',
      onConfirm: async () => {
        await inactivateMutation.mutateAsync({ id, status: isInactiveTab })
        handleOpenChange(false)
      },
      toastMsg: {
        loading: `${isInactiveTab ? 'Ativando' : 'Inativando'} categoria...`,
        success: `Categoria ${isInactiveTab ? 'ativada' : 'inativada'} com sucesso!`,
        error: `Erro ao ${isInactiveTab ? 'ativar' : 'inativar'} categoria`,
      },
    })
  }

  const handleOpenChange = (value: boolean) => {
    setOpenDialog(value)
    if (value) {
      setOpen?.('editCategory')
      return
    }
    setOpen?.('')
  }

  return (
    <Dialog open={openDialog} onOpenChange={handleOpenChange}>
      {!editMode && (
        <DialogTrigger asChild>
          <Button type="button" LeftIcon={IconPlus}>
            Nova categoria
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <span>{editMode ? 'Editar categoria' : 'Nova categoria'}</span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="create-category"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-wrap gap-5"
              noValidate
            >
              <FormSelect
                name="level1"
                label="Nível 1"
                options={[
                  { value: '01', label: '01 - Receita' },
                  { value: '02', label: '02 - Despesa' },
                ]}
                width="flex-[1_1_300px]"
              />

              <FormSelect
                name="level2"
                label="Nível 2"
                options={[
                  { value: '01', label: '01 - Administrativo' },
                  { value: '02', label: '02 - Operacional' },
                  { value: '03', label: '03 - Não operacional' },
                ]}
                width="flex-[1_1_300px]"
              />

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
                value={`${watch('level1') || '00'}.${watch('level2') || '00'}.${watch('code') || '00'}`}
                disabled
              />

              <FormInput
                name="description"
                label="Descrição da categoria"
                width="flex-[1_1_300px]"
              />
            </form>
          </Form>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div>
            <Button
              type="button"
              variant={isInactiveTab ? 'outline' : 'errorOutline'}
              onClick={() => handleInactivate(rowData?.id || '')}
            >
              {isInactiveTab ? 'Ativar' : 'Inativar'}
            </Button>
          </div>
          <div className="space-x-4">
            <DialogTrigger asChild>
              <Button type="button" variant="neutralOutline">
                Cancelar
              </Button>
            </DialogTrigger>
            <Button
              type="submit"
              form="create-category"
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
