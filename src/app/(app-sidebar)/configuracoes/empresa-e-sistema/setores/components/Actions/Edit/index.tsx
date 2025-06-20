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
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { IconComponent } from '@/components/common/Icon'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { CheckboxBasic } from '@/components/common/form/FormCheckbox'

// Icons
import { IconCircleCheck, IconPencil } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { schema, type FormType } from './schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import { ListSectorDataType } from '@/types/settings/sector'

// Actions
import { updateItem } from '@/actions/_cruds'

// Consts
import { sectorIcons } from '@/consts/sectors'

interface Props extends SearchParamsType {
  open: boolean
  setOpen: (open: string) => void
  rowData?: ListSectorDataType
}

const iconOptions = Object.entries(sectorIcons).map(([key, value]) => ({
  label: (
    <div className="flex items-center gap-2 text-nowrap">
      <IconComponent
        icon={value.icon}
        className="size-5 [&>path]:stroke-[2px]"
      />
      {value.text}
    </div>
  ),
  value: key,
}))

export function EditItemDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    values: {
      name: rowData?.name || '',
      icon: rowData?.icon || '',
      isProductionStage: rowData?.isProductionStage || false,
    },
  })

  const { handleSubmit, setValue } = form

  const mutation = useMutation({
    mutationFn: (data: FormType) =>
      updateItem('sectorRoute', `${rowData?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries()
      toast.success('Setor atualizado!')
      handleOpenChange(false)
    },
    onError: () => {
      toast.error('Ocorreu um erro.')
    },
  })

  const onSubmit = async (data: FormType) => {
    if (mutation.isPending) return

    await mutation.mutateAsync(data)
  }

  const handleOpenChange = (value: boolean) => {
    setOpen(value ? 'edit' : '')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconPencil} />
              <span>Editar setor</span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="edit-sector"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-wrap gap-5"
              noValidate
            >
              <FormSelect<FormType>
                name="icon"
                label="Icone"
                options={iconOptions}
                width="flex-[1_0_190px]"
              />
              <FormInput<FormType>
                name="name"
                label="Nome"
                width="flex-[1_0_190px]"
              />
            </form>
          </Form>
        </DialogBody>

        <DialogFooter className="sm:justify-between">
          <div className="flex items-center">
            <CheckboxBasic
              name="isProductionStage"
              label="Exibir nas etapas de produção"
              defaultChecked={rowData?.isProductionStage}
              onCheckedChange={(value) => {
                setValue('isProductionStage', !!value)
              }}
            />
          </div>
          <div className="space-x-4">
            <DialogTrigger asChild>
              <Button type="button" variant="neutralOutline">
                Cancelar
              </Button>
            </DialogTrigger>
            <Button
              type="submit"
              form="edit-sector"
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
