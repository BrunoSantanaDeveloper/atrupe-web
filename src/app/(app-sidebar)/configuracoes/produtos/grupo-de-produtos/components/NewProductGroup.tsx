'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  IconCircleCheck,
  IconCirclePlus,
  IconPencil,
} from '@tabler/icons-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { FormInput } from '@/components/common/form/FormInput'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { createItem, getItemOld, updateItem } from '@/actions/_cruds'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { DangerActionProductGroupDialog } from './DangerActionProductGroupDialog'
import { useState } from 'react'
import { PermissionGate } from '@/components/common/PermissionGate'
import { SelectSectorField } from '@/components/common/form/global-inputs/SectorSelectField'

const newProductsGroupSchema = z.object({
  name: z.string().min(4, 'Nome é obrigatório'),
  sectorId: z.string().min(1, 'Setor é obrigatório'),
})

type NewProductsGroupFormType = z.infer<typeof newProductsGroupSchema>

interface Props {
  editMode?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId?: string
}

async function handleGetProductGroup(groupId: string) {
  if (!groupId) return
  const product = await getItemOld({
    route: 'productGroupRoute',
    id: groupId,
  })
  return product
}

export function NewProductGroup({
  editMode,
  open,
  onOpenChange,
  groupId,
}: Props) {
  const [openDangerDialog, setOpenDangerDialog] = useState(false)
  const queryClient = useQueryClient()
  const { data: group, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['productGroup', groupId],
    enabled: !!groupId,
    queryFn: () => handleGetProductGroup(groupId ?? ''),
  })

  const form = useForm<NewProductsGroupFormType>({
    resolver: zodResolver(newProductsGroupSchema),
    mode: 'onChange',
    values: {
      name: group?.name || '',
      sectorId: group?.sectorId || '',
    },
  })
  const { handleSubmit } = form

  const handleToggleModal = () => {
    onOpenChange(false)
    form.reset()
  }

  const onSubmit = async (data: NewProductsGroupFormType) => {
    try {
      if (editMode) {
        await updateItem('productGroupRoute', group?.id ?? '', data)

        await queryClient.invalidateQueries({
          queryKey: ['productGroup', groupId],
        })
        toast.success('Grupo editado com sucesso!')
      } else {
        await createItem({
          route: 'productGroupRoute',
          data: { ...data, kind: 'PRODUCT' },
        })

        toast.success('Grupo criado com sucesso!')
      }

      await queryClient.invalidateQueries({
        queryKey: ['product-group-list', {}],
      })
      handleToggleModal()
    } catch (error) {
      toast.error(
        `Houve um erro ao ${editMode ? 'editar' : 'criar'} o grupo, tente novamente.`,
      )
    }
  }

  return (
    <PermissionGate
      permissions={[
        'product_settings:materials_products:view',
        editMode
          ? 'product_settings:materials_products:edit'
          : 'product_settings:materials_products:create',
      ]}
      requireAll={true}
    >
      <Dialog open={open} onOpenChange={handleToggleModal}>
        {open && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editMode ? 'Editar' : 'Novo'} grupo</DialogTitle>
            </DialogHeader>
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <Form {...form}>
                <form
                  id="new-product-group"
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-wrap gap-5"
                  noValidate
                >
                  <FormInput<NewProductsGroupFormType>
                    name="name"
                    label="Nome"
                    width="flex-[1_0_400px]"
                    disabled={isLoading || (editMode && !group)}
                  />
                  <SelectSectorField<NewProductsGroupFormType>
                    name="sectorId"
                    label="Setor"
                    width="flex-[1_0_400px]"
                  />
                </form>
              </Form>
            </div>
            <DialogFooter
              className={cn(
                'sm:justify-end',
                editMode && group && 'sm:justify-between',
              )}
            >
              {editMode && group && (
                <Button
                  type="button"
                  onClick={() => setOpenDangerDialog(true)}
                  variant={group?.isActive ? 'errorOutline' : 'successOutline'}
                >
                  {group?.isActive ? 'Inativar' : 'Ativar'}
                </Button>
              )}
              <div className="space-x-4">
                <Button
                  type="button"
                  variant="neutralOutline"
                  onClick={handleToggleModal}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  form="new-product-group"
                  RightIcon={IconCircleCheck}
                  onClick={handleSubmit(onSubmit)}
                  disabled={form.formState?.isSubmitting || isLoading}
                  isLoading={form.formState?.isSubmitting}
                >
                  Salvar
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
      <DangerActionProductGroupDialog
        type={group?.isActive ? 'inactive' : 'active'}
        open={openDangerDialog}
        groupId={group?.id ?? ''}
        setOpen={() => setOpenDangerDialog(false)}
        onSuccess={handleToggleModal}
      />
    </PermissionGate>
  )
}

export function NewProductGroupTriggerButton({
  editMode,
  onOpenChange,
}: {
  editMode?: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Button
      type="button"
      variant={editMode ? 'neutralGhost' : 'default'}
      size={editMode ? 'icon' : 'default'}
      LeftIcon={editMode ? IconPencil : IconCirclePlus}
      onClick={() => onOpenChange(true)}
    >
      {editMode ? '' : 'Novo grupo'}
    </Button>
  )
}
