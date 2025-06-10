'use client'

// UI
import {
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

// Form
import { useForm } from 'react-hook-form'
import { FormType, schema } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Actions
import { updateItem } from '@/actions/_cruds'

// Icons
import { IconCircleCheck, IconUser } from '@tabler/icons-react'
import { Separator } from '@/components/ui/separator'
import { maskCpf, MaskPhoneNumber } from '@/lib/utils'
import { ProductImageUpload } from '@/components/common/form/global-inputs/ProductImageUpload'
import { SelectSectorField } from '@/components/common/form/global-inputs/SectorSelectField'
import { SelectRoleField } from '@/components/common/form/global-inputs/RoleSelectField'

export function MyProfileDialog() {
  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
  })

  const { handleSubmit, watch, setValue } = form

  const mutation = useMutation({
    mutationFn: (data: FormType) => updateItem('userRoute', `${'id'}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries()
      toast.success('Sucesso!')
    },
    onError: (error) => {
      console.error(error)
      toast.error('Ocorreu um erro')
    },
  })

  const onSubmit = async (data: FormType) => {
    return
    await mutation.mutateAsync(data)
  }

  return (
    <DialogContent className="sm:max-w-[855px]">
      <DialogHeader>
        <DialogTitle>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconUser} />
            <span>Meu Perfil</span>
          </div>
        </DialogTitle>
        <DialogDescription hidden></DialogDescription>
      </DialogHeader>
      <DialogBody>
        <Form {...form}>
          <form
            id="edit-employee"
            onSubmit={handleSubmit(onSubmit)}
            className="flex gap-6"
            noValidate
          >
            <div className="w-[300px] h-[300px] bg-white rounded-lg">
              <ProductImageUpload<FormType>
                control={form.control}
                name="avatarUrl"
              />
            </div>

            <div className="flex flex-1 flex-wrap gap-5">
              <p className="font-semibold w-full">Dados pessoais</p>

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

              <FormInput<FormType>
                name="cpf"
                label="CPF"
                additionalOnChange={(value) => {
                  setValue('cpf', maskCpf(String(value)))
                }}
                maxLength={14}
                width="flex-[1_0_190px]"
              />

              <FormInput<FormType>
                name="rg"
                label="RG"
                width="flex-[1_0_190px]"
              />

              <FormInput<FormType>
                name="phone"
                label="Telefone"
                inputMode="tel"
                additionalOnChange={(value) => {
                  setValue('phone', MaskPhoneNumber(String(value)))
                }}
                maxLength={15}
              />

              <FormInput<FormType>
                name="mobile"
                label="Celular"
                inputMode="tel"
                additionalOnChange={(value) => {
                  setValue('mobile', MaskPhoneNumber(String(value)) || '')
                }}
                maxLength={15}
              />

              <Separator />

              <p className="font-semibold w-full">Endereço</p>
              <FormInput<FormType>
                name="address.zipcode"
                label="CEP"
                width="flex-[1_0_190px]"
              />

              <FormInput<FormType>
                name="address.state"
                label="Estado"
                width="flex-[1_0_190px]"
              />

              <FormInput<FormType>
                name="address.city"
                label="Cidade"
                width="flex-[1_0_190px]"
              />

              <FormInput<FormType>
                name="address.neighborhood"
                label="Bairro"
                width="flex-[1_0_190px]"
              />

              <FormInput<FormType>
                name="address.number"
                label="Número"
                width="flex-[1_0_100px]"
              />

              <FormInput<FormType>
                name="address.street"
                label="Rua"
                width="flex-[1_0_200px]"
              />

              <FormInput<FormType>
                name="address.complement"
                label="Complemento"
                width="w-full"
              />
            </div>
          </form>
        </Form>
      </DialogBody>
      <DialogFooter className="sm:justify-between">
        <div></div>
        <div className="space-x-4">
          <DialogTrigger asChild>
            <Button type="button" variant="neutralOutline">
              Voltar
            </Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button
              type="submit"
              form="my-profile"
              isLoading={mutation.isPending}
              RightIcon={IconCircleCheck}
            >
              Salvar
            </Button>
          </DialogTrigger>
        </div>
      </DialogFooter>
    </DialogContent>
  )
}
