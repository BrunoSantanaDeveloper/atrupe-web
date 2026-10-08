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
import { FormInput } from '@/components/common/form/FormInput'
import { CheckboxBasic } from '@/components/common/form/FormCheckbox'
import { SelectSectorField } from '@/components/common/form/global-inputs/SectorSelectField'

// Icons
import { IconPlus, IconCircleCheck } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { schema, type FormType } from './schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types
import type { RoleType } from '@/types/settings/role'
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { createItem, updateItem } from '@/actions/_cruds'

interface Props extends SearchParamsType {
  editMode?: boolean
  open?: boolean
  setOpen?: (value: string) => void
  rowData?: RoleType
}

export function NewItemDialog({ open, setOpen, rowData, editMode }: Props) {
  const [openDialog, setOpenDialog] = useState(open)
  const [insertAnother, setInsertAnother] = useState(!editMode)

  useEffect(() => {
    setOpenDialog(open)
  }, [open])

  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    values: {
      name: rowData?.name || '',
      sectorId: rowData?.sectorId || '',
    },
  })

  const { reset, handleSubmit } = form

  const mutation = useMutation({
    mutationFn: (data: Omit<FormType, 'confirmPassword'>) =>
      editMode
        ? updateItem('roleRoute', `${rowData?.id}`, data)
        : createItem({ route: 'roleRoute', data }),
    onSuccess: () => {
      queryClient.invalidateQueries()
      if (!insertAnother) {
        handleOpenChange(false)
      }
      reset()
      toast.success('Cargo salvo')
    },
    onError: (error) => {
      console.error(error)
      toast.error('Ocorreu um erro')
    },
  })

  const onSubmit = async (data: FormType) => {
    await mutation.mutateAsync(data)
  }

  const handleOpenChange = (value: boolean) => {
    setOpenDialog(value)
    if (value) {
      setOpen?.('edit')
      return
    }
    setOpen?.('')
  }

  return (
    <Dialog open={openDialog} onOpenChange={handleOpenChange}>
      {!editMode && (
        <DialogTrigger asChild>
          <Button LeftIcon={IconPlus}>Novo cargo</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <span>{editMode ? 'Editar cargo' : 'Novo cargo'}</span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="create-role"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-wrap gap-5"
              noValidate
            >
              <SelectSectorField<FormType>
                name="sectorId"
                label="Setor"
                width="flex-[1_0_190px]"
              />

              <FormInput<FormType>
                name="name"
                label="Cargo"
                width="flex-[1_0_190px]"
              />
            </form>
          </Form>
        </DialogBody>

        <DialogFooter className="sm:justify-between">
          <div className="flex items-center">
            {!editMode ? (
              <CheckboxBasic
                name="inserir-outro"
                label="Inserir outro depois deste"
                checked={editMode ? false : insertAnother}
                onCheckedChange={() => setInsertAnother(!insertAnother)}
              />
            ) : null}
          </div>
          <div className="space-x-4">
            <DialogTrigger asChild>
              <Button type="button" variant="neutralOutline">
                Cancelar
              </Button>
            </DialogTrigger>
            <Button
              type="submit"
              form="create-role"
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
