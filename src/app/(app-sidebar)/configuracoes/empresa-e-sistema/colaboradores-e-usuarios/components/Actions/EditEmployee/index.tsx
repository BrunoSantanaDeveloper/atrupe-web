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
import { Separator } from '@/components/ui/separator'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { FormInput } from '@/components/common/form/FormInput'

// Components
import { InactiveEmployeeAlertDialog } from '../InactiveEmployee'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FormImageUpload } from '@/components/common/form/ImageUpload'
import { SelectRoleField } from '@/components/common/form/global-inputs/RoleSelectField'
import { SelectSectorField } from '@/components/common/form/global-inputs/SectorSelectField'
import { ProductImageUpload } from '@/components/common/form/global-inputs/ProductImageUpload'

// Form
import { useForm } from 'react-hook-form'
import { FormType, schema } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Actions
import { updateItem } from '@/actions/_cruds'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { EmployeeType } from '@/types/settings/employee'

// Icons
import { IconPencil, IconCircleCheck } from '@tabler/icons-react'

// Lib
import { maskCpf, MaskPhoneNumber } from '@/lib/utils'

// Hooks
import { useSession } from 'next-auth/react'

interface Props extends SearchParamsType {
  open?: boolean
  setOpen?: (value: string) => void
  rowData?: EmployeeType
}

export function EditEmployeeDialog({
  open,
  setOpen,
  rowData,
  searchParams,
}: Props) {
  const { data: session, update: updateSession } = useSession()

  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    values: {
      name: rowData?.name || '',
      sectorId: rowData?.sectorId || '',
      roleId: rowData?.roleId || '',
      cpf: rowData?.cpf || '',
      rg: rowData?.rg || '',
      phone: rowData?.phone || '',
      mobile: rowData?.mobile || '',
      avatarUrl: rowData?.avatarUrl || '',
      signatureUrl: rowData?.signatureUrl || '',
      address: {
        zipcode: rowData?.address[0]?.zipcode || '',
        state: rowData?.address[0]?.state || '',
        city: rowData?.address[0]?.city || '',
        neighborhood: rowData?.address[0]?.neighborhood || '',
        number: rowData?.address[0]?.number || '',
        street: rowData?.address[0]?.street || '',
        complement: rowData?.address[0]?.complement || '',
      },
    },
  })

  const { handleSubmit, setValue, watch, reset } = form

  const mutation = useMutation({
    mutationFn: (data: FormType) =>
      updateItem('employeeRoute', `${rowData?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries()
      handleOpenChange(false)
      toast.success('Sucesso!')
    },
    onError: (error) => {
      console.error(error)
      toast.error('Ocorreu um erro')
    },
  })

  const onSubmit = async (data: FormType) => {
    await mutation.mutateAsync(data)
    if (session?.user?.userId === rowData?.user?.id) {
      await updateSession({
        user: {
          avatar: data.avatarUrl || '',
        },
      })
    }
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      reset()
      setOpen?.('')
      return
    }

    setOpen?.('edit')
  }

  return (
    <PermissionGate permissions={['company_settings:users:edit']}>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[880px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4">
                <FeaturedIcon variant="neutralOutline" Icon={IconPencil} />
                <span>Editar colaborador</span>
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
                    maxSize={1024 * 300} // 300KB
                    customHelpText="Imagem até 300 KB e 300x300px"
                  />
                </div>

                <div className="flex flex-1 flex-wrap gap-5">
                  <p className="font-semibold w-full">Dados pessoais</p>

                  <FormInput<FormType>
                    name="name"
                    label="Nome"
                    width="w-full"
                  />

                  <SelectSectorField<FormType>
                    name="sectorId"
                    label="Setor"
                    width="flex-[1_0_190px]"
                    disabled={rowData?.role?.isAdmin}
                  />

                  <SelectRoleField<FormType>
                    name="roleId"
                    label="Cargo"
                    width="flex-[1_0_190px]"
                    sectorId={watch('sectorId')}
                    disabled={rowData?.role?.isAdmin}
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

                  <div>
                    <p className="font-semibold">Assinatura para orçamentos</p>
                    <p className="text-sm text-gray">
                      Será utilizada na assinatura de orçamentos e ordens de
                      serviço.
                    </p>
                  </div>

                  <FormImageUpload<FormType>
                    control={form.control}
                    name="signatureUrl"
                  />
                </div>
              </form>
            </Form>
          </DialogBody>
          <DialogFooter className="sm:justify-between">
            <div>
              {!rowData?.role?.isAdmin && (
                <InactiveEmployeeAlertDialog
                  rowData={rowData}
                  onChange={handleOpenChange}
                  searchParams={searchParams}
                />
              )}
            </div>
            <div className="space-x-4">
              <DialogTrigger asChild>
                <Button type="button" variant="neutralOutline">
                  Voltar
                </Button>
              </DialogTrigger>
              <Button
                type="submit"
                form="edit-employee"
                isLoading={mutation.isPending}
                RightIcon={IconCircleCheck}
              >
                Salvar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGate>
  )
}
