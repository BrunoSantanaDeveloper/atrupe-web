'use client'

// React
import { useState, useEffect } from 'react'

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
import { FormInput } from '@/components/common/form/FormInput'
import { CheckboxBasic } from '@/components/common/form/FormCheckbox'
import { SelectRoleField } from '@/components/common/form/global-inputs/RoleSelectField'
import { SelectSectorField } from '@/components/common/form/global-inputs/SectorSelectField'

// Icons
import { IconCircleCheck, IconCirclePlus } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { defaultValues, schema, type FormType } from './schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Actions
import { createItem } from '@/actions/_cruds'

// interface Props extends SearchParamsType {}

export function NewEmployeeDialog() {
  const [open, setOpen] = useState(false)
  const [insertAnother, setInsertAnother] = useState(true)

  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const { handleSubmit, reset, watch, setValue } = form

  const sectorId = watch('sectorId')

  useEffect(() => {
    setValue('roleId', '')
  }, [sectorId, setValue])

  const mutation = useMutation({
    mutationFn: (data: FormType) =>
      createItem({ route: 'employeeRoute', data }),
    onSuccess: () => {
      queryClient.invalidateQueries()
      toast.success('Colaborador criado!')
      if (insertAnother) {
        reset(defaultValues)
        handleOpenChange(true)
        return
      }

      handleOpenChange(false)
    },
    onError: () => {
      toast.error('Ocorreu um erro.')
    },
  })

  const onSubmit = async (data: FormType) => {
    await mutation.mutateAsync(data)
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      reset(defaultValues)
    }
    setOpen(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" LeftIcon={IconCirclePlus}>
          Novo colaborador
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconCirclePlus} />
              <span>Novo colaborador</span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="create-employee"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-wrap gap-5"
              noValidate
            >
              <FormInput<FormType> name="name" label="Nome" width="w-full" />

              <SelectSectorField<FormType>
                name="sectorId"
                label="Setor"
                width="flex-[1_0_190px]"
              />

              <SelectRoleField<FormType>
                name="roleId"
                label="Cargo"
                width="flex-[1_0_190px]"
                sectorId={watch('sectorId')}
              />
            </form>
          </Form>
        </DialogBody>

        <DialogFooter className="sm:justify-between">
          <div className="flex items-center">
            <CheckboxBasic
              name="inserir-outro"
              label="Inserir outro depois deste"
              checked={insertAnother}
              onCheckedChange={() => setInsertAnother(!insertAnother)}
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
              form="create-employee"
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
