'use client'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FormInput } from '@/components/common/form/FormInput'

// Components
import { SelectCityField } from '@/components/common/form/global-inputs/CitiesSelectField'
import { SelectStateField } from '@/components/common/form/global-inputs/StatesSelectField'

// Form
import { useForm } from 'react-hook-form'
import { FormType, schema } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'

// Actions
import { updateItemNew } from '@/actions/_cruds'

// Types
import type { TrialAccountItem } from '../Table/Data'

// Icons
import { IconCircleCheck } from '@tabler/icons-react'

// Lib
import { maskCpfCnpj, MaskPhoneNumber } from '@/lib/utils'

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  rowData: TrialAccountItem | null
}

export function EditTrialAccountDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    values: {
      legalName: rowData?.company?.name || '',
      document: maskCpfCnpj(rowData?.document || ''),
      companyName: rowData?.displayName || '',
      userName: rowData?.userName || '',
      email: rowData?.email || '',
      phone: rowData?.phone || '',
      stateId: rowData?.stateId || '',
      cityId: rowData?.cityId || '',
      password: '',
    },
  })

  const { handleSubmit, setValue, watch, reset } = form

  const onSubmit = async (data: FormType) => {
    const id = rowData?.company?.id

    if (!id) {
      toast.error('ID da empresa não encontrado')
      return
    }

    const res = await updateItemNew({
      route: '/user/edit-client',
      data: { id, ...data },
    })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    queryClient.invalidateQueries()
    toast.success('Cliente editado com sucesso')
    handleOpenChange(false)
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      reset()
    }
    setOpen(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[690px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <span>Editar cliente</span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="edit-trial-account"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
              noValidate
            >
              <div className="flex flex-wrap gap-5">
                <FormInput
                  name="legalName"
                  label="Razão social"
                  width="flex-[1_0_231px]"
                  placeholder="Digite aqui"
                />

                <FormInput
                  name="document"
                  label="CNPJ"
                  width="flex-[1_0_231px]"
                  placeholder="Digite aqui"
                  additionalOnChange={(value) => {
                    setValue('document', maskCpfCnpj(String(value)))
                  }}
                  maxLength={18}
                />

                <FormInput
                  name="companyName"
                  label="Nome exibido no navegador"
                  width="flex-[1_0_231px]"
                  placeholder="Digite aqui"
                />

                <FormInput
                  name="userName"
                  label="Nome do responsável"
                  width="flex-[1_0_231px]"
                  placeholder="Digite aqui"
                />
              </div>

              <div className="flex flex-wrap gap-5">
                <FormInput
                  name="email"
                  label="E-mail"
                  type="email"
                  width="flex-[1_0_231px]"
                  placeholder="Digite aqui"
                />

                <FormInput
                  name="phone"
                  label="Celular"
                  width="flex-[1_0_231px]"
                  placeholder="Digite aqui"
                  additionalOnChange={(value) => {
                    setValue('phone', MaskPhoneNumber(String(value)))
                  }}
                  maxLength={15}
                />
              </div>

              <div className="flex flex-wrap gap-5">
                <SelectStateField
                  name="stateId"
                  label="Estado"
                  width="flex-[1_0_231px]"
                />

                <SelectCityField
                  name="cityId"
                  label="Cidade"
                  width="flex-[1_0_231px]"
                  stateId={watch('stateId') || ''}
                />
              </div>

              <Separator />

              <FormInput
                name="password"
                label="Senha gerencial"
                type="password"
                placeholder="Digite sua senha"
                width="w-full"
              />

              <p className="text-sm text-gray -mt-3">
                Obrigatório para salvar edição
              </p>
            </form>
          </Form>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => handleOpenChange(false)}
          >
            Voltar
          </Button>
          <Button
            type="submit"
            form="edit-trial-account"
            isLoading={form.formState.isSubmitting}
            RightIcon={IconCircleCheck}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
