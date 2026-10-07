'use client'

import { useEffect } from 'react'

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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FormInput } from '@/components/common/form/FormInput'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQueryClient } from '@tanstack/react-query'

import { getData, updateItemNew } from '@/actions/_cruds'
import { maskCep } from '@/lib/utils'

import type { AccountItem } from '../Table/Data'
import { IconMapPin } from '@tabler/icons-react'

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  rowData: AccountItem | null
}

const formSchema = z.object({
  postalCode: z.string().optional(),
  address: z.string().optional(),
  addressNumber: z.string().optional(),
  complement: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  password: z.string().min(1, 'Senha gerencial é obrigatória'),
})

type FormType = z.infer<typeof formSchema>

export function SyncAddressDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      postalCode: '',
      address: '',
      addressNumber: '',
      complement: '',
      province: '',
      city: '',
      state: '',
      password: '',
    },
  })

  useEffect(() => {
    if (open && rowData?.id) {
      fetchCurrentAddress()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rowData?.id])

  const fetchCurrentAddress = async () => {
    if (!rowData?.id) return
    const res = await getData({
      route: `/subscriptions/active-clients/${rowData.id}/customer-address`,
    })
    if (res.success && res.data) {
      const d = res.data as Record<string, string>
      form.reset({
        postalCode: d.postalCode || '',
        address: d.address || '',
        addressNumber: d.addressNumber || '',
        complement: d.complement || '',
        province: d.province || '',
        city: d.city || '',
        state: d.state || '',
        password: '',
      })
    }
  }

  const fetchCep = async (cep: string) => {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json()
      if (!data.erro) {
        if (data.logradouro) form.setValue('address', data.logradouro)
        if (data.bairro) form.setValue('province', data.bairro)
        if (data.localidade) form.setValue('city', data.localidade)
        if (data.uf) form.setValue('state', data.uf)
      }
    } catch {
      // silently ignore CEP lookup errors
    }
  }

  const onSubmit = async (data: FormType) => {
    if (!rowData?.id) return

    const res = await updateItemNew({
      route: `/subscriptions/active-clients/${rowData.id}/sync-address-asaas`,
      data,
    })

    if (!res?.success) {
      toast.error(
        res?.message ||
          'Senha gerencial incorreta ou sessão encerrada. Entre de novo e tente outra vez.',
      )
      return
    }

    queryClient.invalidateQueries()
    const synced = res.data?.asaasSynced
    toast.success(
      synced
        ? 'Endereço atualizado e sincronizado com o Asaas'
        : 'Endereço atualizado localmente (sem vínculo Asaas)',
    )
    handleOpenChange(false)
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) form.reset()
    setOpen(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconMapPin} />
              <span>Endereço no Asaas</span>
            </div>
          </DialogTitle>
          <DialogDescription>{rowData?.companyName}</DialogDescription>
        </DialogHeader>

        <DialogBody>
          <Form {...form}>
            <form
              id="sync-address"
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-wrap gap-4">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem className="flex-[1_0_140px]">
                      <FormLabel>CEP</FormLabel>
                      <Input
                        placeholder="00000-000"
                        maxLength={9}
                        {...field}
                        onChange={(e) => {
                          e.target.value = maskCep(e.target.value)
                          field.onChange(e)
                        }}
                        onBlur={(e) => {
                          field.onBlur()
                          fetchCep(e.target.value)
                        }}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormInput
                  name="address"
                  label="Logradouro"
                  width="flex-[3_0_220px]"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <FormInput
                  name="addressNumber"
                  label="Número"
                  width="flex-[1_0_100px]"
                />
                <FormInput
                  name="complement"
                  label="Complemento"
                  width="flex-[2_0_160px]"
                />
                <FormInput
                  name="province"
                  label="Bairro"
                  width="flex-[2_0_160px]"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <FormInput
                  name="city"
                  label="Cidade"
                  width="flex-[3_0_200px]"
                />
                <FormInput
                  name="state"
                  label="Estado (UF)"
                  width="flex-[1_0_80px]"
                  maxLength={2}
                />
              </div>

              <div className="border-t pt-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha gerencial</FormLabel>
                      <Input
                        type="password"
                        placeholder="Digite aqui"
                        {...field}
                      />
                      <p className="text-sm text-gray-600">
                        Obrigatório para salvar
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
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
            Cancelar
          </Button>
          <Button
            type="submit"
            form="sync-address"
            disabled={form.formState.isSubmitting}
            isLoading={form.formState.isSubmitting}
            RightIcon={IconMapPin}
          >
            Salvar e sincronizar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
