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
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Actions
import { updateItem } from '@/actions/_cruds'

// Types
import type { AccountItem } from '../Table/Data'

// Icons
import { IconUser } from '@tabler/icons-react'

// Lib
import { maskCpfCnpj, MaskPhoneNumber } from '@/lib/utils'

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  rowData: AccountItem | null
}

export function EditClientDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    values: {
      companyName: rowData?.companyName || '',
      document: rowData?.document || '',
      stateId: '',
      cityId: '',
      userName: rowData?.userName || '',
      userDocument: '',
      email: rowData?.email || '',
      phone: rowData?.phone || '',
      password: '',
    },
  })

  const { handleSubmit, setValue, watch, reset } = form

  const mutation = useMutation({
    mutationFn: (data: FormType) =>
      updateItem('/subscriptions/active-clients', `${rowData?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['active-clients-list'],
      })
      toast.success('Cliente editado com sucesso')
      handleOpenChange(false)
    },
    onError: (error) => {
      console.error(error)
      toast.error('Ocorreu um erro ao editar o cliente')
    },
  })

  const onSubmit = async (data: FormType) => {
    await mutation.mutateAsync(data)
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
              id="edit-client"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
              noValidate
            >
              <div className="flex flex-wrap gap-5">
                <FormInput<FormType>
                  name="companyName"
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

                <FormInput<FormType>
                  name="userName"
                  label="Nome do responsável"
                  width="flex-[1_0_340px]"
                  placeholder="Digite aqui"
                />

                <FormInput<FormType>
                  name="userDocument"
                  label="CPF"
                  width="flex-[1_0_190px]"
                  placeholder="Digite aqui"
                  additionalOnChange={(value) => {
                    setValue('userDocument', maskCpfCnpj(String(value)))
                  }}
                  maxLength={14}
                />

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
            form="edit-client"
            disabled={mutation.isPending}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
