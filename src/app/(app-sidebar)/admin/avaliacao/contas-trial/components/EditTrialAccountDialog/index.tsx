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
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { FormInput } from '@/components/common/form/FormInput'

// Components
import { SelectStateField } from '@/components/common/form/global-inputs/StatesSelectField'
import { SelectCityField } from '@/components/common/form/global-inputs/CitiesSelectField'

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
import { IconUser } from '@tabler/icons-react'

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
      legalName: rowData?.companyName || '',
      document: rowData?.document || '',
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
    if (!rowData?.id) {
      toast.error('ID da conta não encontrado')
      return
    }

    const res = await updateItemNew({
      route: '/user/edit-client',
      data: {
        id: rowData.id,
        ...data,
      },
    })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    queryClient.invalidateQueries({
      queryKey: ['trial-accounts'],
    })
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
      <DialogContent className="sm:max-w-[740px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconUser} />
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
              <p className="font-semibold">Dados da empresa</p>

              <div className="flex flex-wrap gap-5">
                <FormInput<FormType>
                  name="legalName"
                  label="Razão social"
                  width="flex-[1_0_340px]"
                  placeholder="Digite aqui"
                />

                <FormInput<FormType>
                  name="document"
                  label="CNPJ"
                  width="flex-[1_0_190px]"
                  placeholder="Digite aqui"
                  additionalOnChange={(value) => {
                    setValue('document', maskCpfCnpj(String(value)))
                  }}
                  maxLength={18}
                />

                <FormInput<FormType>
                  name="companyName"
                  label="Nome exibido no navegador"
                  width="flex-[1_0_340px]"
                  placeholder="Digite aqui"
                />

                <FormInput<FormType>
                  name="userName"
                  label="Nome do responsável"
                  width="flex-[1_0_190px]"
                  placeholder="Digite aqui"
                />
              </div>

              <p className="font-semibold">Contato</p>

              <div className="flex flex-wrap gap-5">
                <FormInput<FormType>
                  name="email"
                  label="E-mail"
                  type="email"
                  width="flex-[1_0_340px]"
                  placeholder="Digite aqui"
                />

                <FormInput<FormType>
                  name="phone"
                  label="Celular"
                  width="flex-[1_0_190px]"
                  placeholder="Digite aqui"
                  additionalOnChange={(value) => {
                    setValue('phone', MaskPhoneNumber(String(value)))
                  }}
                  maxLength={15}
                />
              </div>

              <p className="font-semibold">Localização</p>

              <div className="flex flex-wrap gap-5">
                <SelectStateField<FormType>
                  name="stateId"
                  label="Estado"
                  width="flex-[1_0_340px]"
                />

                <SelectCityField<FormType>
                  name="cityId"
                  label="Cidade"
                  width="flex-[1_0_190px]"
                  stateId={watch('stateId') || ''}
                />
              </div>

              <p className="font-semibold">Senha gerencial</p>
              <p className="text-sm text-gray-600 -mt-3">
                Obrigatório para salvar edição
              </p>

              <div className="flex flex-wrap gap-5">
                <FormInput<FormType>
                  name="password"
                  label="Senha gerencial"
                  type="password"
                  width="flex-[1_0_340px]"
                  placeholder="Digite aqui"
                />
              </div>
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
          >
            Cadastrar cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
