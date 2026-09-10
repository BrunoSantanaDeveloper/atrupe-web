'use client'

// React
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

// UI
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormInputZipCode } from '@/components/common/form/FormInputZipCode'
import { PermissionGate } from '@/components/common/PermissionGate'
import { ClientSelector } from '@/components/common/form/global-inputs/ClientAsyncSelect'
import { SelectSellerField } from '@/components/common/form/global-inputs/SellersSelectField'
import { ClientContactSelect } from '@/components/common/form/global-inputs/ClientContactSelect'
import { ClientAddressSelectField } from '@/components/common/form/global-inputs/ClientAddressSelectField'
import { SelectSerieField } from '@/components/common/form/global-inputs/SeriesSelectField'

// Icons
import { IconPencil, IconCircleCheck, IconUserEdit } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'

// Actions
import { updateItemNew } from '@/actions/_cruds'

// Types
import type { OrderType } from '@/types/sales/order'
import type { QuotationType } from '@/types/sales/quotation'

const schema = z.object({
  clientId: z.any().optional(),
  sellerId: z.string().optional(),
  contactId: z.string().optional(),
  seriesId: z.string().optional(),
  deliveryClientAddressId: z.string().optional(),
  deliveryCustomAddress: z
    .object({
      zipcode: z.string().optional(),
      state: z.string().optional(),
      city: z.string().optional(),
      neighborhood: z.string().optional(),
      street: z.string().optional(),
      number: z.string().optional(),
      complement: z.string().optional(),
    })
    .optional(),
})

type FormType = z.infer<typeof schema>

interface Props {
  data: OrderType
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EditOrderInfoDialog({
  data,
  open: openProp,
  onOpenChange,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen
  const setOpen = isControlled
    ? (onOpenChange as (v: boolean) => void)
    : setInternalOpen
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const isAdmin = !!session?.user?.isAdmin

  const quotation = data.quotation as QuotationType

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
  })

  const { handleSubmit, watch, reset } = form

  const clientIdValue = (watch('clientId') as { value: string } | null)?.value
  const clientId = clientIdValue ?? quotation?.client?.id

  const deliveryClientAddressId = watch('deliveryClientAddressId')
  const showCustomAddress = deliveryClientAddressId === 'custom'

  useEffect(() => {
    if (open) {
      reset({
        clientId: quotation?.client
          ? ({
              label: quotation.client.name,
              value: quotation.client.id,
            } as unknown as string)
          : undefined,
        sellerId: quotation?.seller?.id ?? '',
        contactId: quotation?.contact?.id ?? '',
        seriesId: quotation?.serie?.id ?? '',
        deliveryClientAddressId:
          quotation?.deliveryInfo?.clientAddress?.type === 'CustomForDelivery'
            ? 'custom'
            : (quotation?.deliveryInfo?.clientAddress?.id ?? ''),
        deliveryCustomAddress:
          quotation?.deliveryInfo?.clientAddress?.type === 'CustomForDelivery'
            ? {
                street: quotation.deliveryInfo.clientAddress.street ?? '',
                number: quotation.deliveryInfo.clientAddress.number ?? '',
                complement:
                  quotation.deliveryInfo.clientAddress.complement ?? '',
                neighborhood:
                  quotation.deliveryInfo.clientAddress.neighborhood ?? '',
                city: quotation.deliveryInfo.clientAddress.city ?? '',
                state: quotation.deliveryInfo.clientAddress.state ?? '',
                zipcode: quotation.deliveryInfo.clientAddress.zipcode ?? '',
              }
            : {},
      })
    }
  }, [open, quotation, reset])

  const onSubmit = async (formData: FormType) => {
    const resolvedClientId =
      (formData.clientId as { value: string } | null)?.value ??
      (formData.clientId as string | undefined)

    const payload: Record<string, unknown> = {}

    if (resolvedClientId && resolvedClientId !== quotation?.client?.id) {
      payload.clientId = resolvedClientId
    }
    if (formData.sellerId && formData.sellerId !== quotation?.seller?.id) {
      payload.sellerId = formData.sellerId
    }
    if (
      formData.contactId !== undefined &&
      formData.contactId !== quotation?.contact?.id
    ) {
      payload.contactId = formData.contactId || null
    }
    const seriesChanged =
      isAdmin &&
      !!formData.seriesId &&
      formData.seriesId !== quotation?.serie?.id
    if (seriesChanged) {
      payload.seriesId = formData.seriesId
    }
    if (formData.deliveryClientAddressId !== undefined) {
      payload.deliveryClientAddressId = formData.deliveryClientAddressId
      if (formData.deliveryClientAddressId === 'custom') {
        payload.deliveryCustomAddress = formData.deliveryCustomAddress
      }
    }

    if (Object.keys(payload).length === 0) {
      toast.info('Nenhuma alteração detectada.')
      setOpen(false)
      return
    }

    const res = await updateItemNew({
      route: `/sale/order/${data.id}/info`,
      data: payload,
    })

    if (!res.success) {
      toast.error(res.message ?? 'Erro ao salvar alterações.')
      return
    }

    toast.success(
      seriesChanged
        ? 'Informações da OS atualizadas. A nova série gerou uma nova numeração.'
        : 'Informações da OS atualizadas com sucesso.',
    )
    queryClient.invalidateQueries({ queryKey: ['order-data', data.id] })
    // O número aparece na listagem de OS: a troca de série precisa refletir lá
    if (seriesChanged)
      queryClient.invalidateQueries({ queryKey: ['order-list'] })
    setOpen(false)
  }

  if (data.status === 'CANCELED') return null

  return (
    <PermissionGate permissions={['sale:order:edit']}>
      {!isControlled && (
        <Button
          type="button"
          variant="neutralLight"
          size="sm"
          LeftIcon={IconPencil}
          onClick={() => setOpen(true)}
        >
          Editar informações
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[696px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4">
                <FeaturedIcon variant="neutralOutline" Icon={IconUserEdit} />
                <span>Editar informações da OS</span>
              </div>
            </DialogTitle>
            <DialogDescription hidden></DialogDescription>
          </DialogHeader>

          <DialogBody>
            <Form {...form}>
              <form
                id="edit-order-info"
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-wrap gap-5"
                noValidate
              >
                <p className="w-full text-sm font-semibold text-gray-700">
                  Dados gerais
                </p>

                <ClientSelector
                  name="clientId"
                  label="Cliente"
                  width="w-full"
                  additionalOnChange={() => {
                    form.setValue('contactId', '')
                    form.setValue('deliveryClientAddressId', '')
                  }}
                />

                <SelectSellerField
                  name="sellerId"
                  label="Vendedor"
                  width="flex-[1_0_280px]"
                />

                <ClientContactSelect
                  name="contactId"
                  label="Responsável"
                  width="flex-[1_0_280px]"
                  clientId={clientId}
                />

                {isAdmin && (
                  <SelectSerieField<FormType>
                    name="seriesId"
                    label="Série"
                    width="flex-[1_0_280px]"
                  />
                )}

                <Separator className="bg-gray-300" />

                <p className="w-full text-sm font-semibold text-gray-700">
                  Endereço de entrega
                </p>

                <ClientAddressSelectField
                  name="deliveryClientAddressId"
                  label="Endereço de entrega"
                  width="w-full"
                  clientId={clientId ?? ''}
                  placeholder="Selecione o endereço de entrega"
                />

                {showCustomAddress && (
                  <>
                    <FormInputZipCode
                      name="deliveryCustomAddress.zipcode"
                      label="CEP"
                      width="flex-[1_0_120px]"
                      addressFields={{
                        street: 'deliveryCustomAddress.street',
                        neighborhood: 'deliveryCustomAddress.neighborhood',
                        city: 'deliveryCustomAddress.city',
                        state: 'deliveryCustomAddress.state',
                      }}
                    />
                    <FormInput
                      name="deliveryCustomAddress.state"
                      label="Estado"
                      width="flex-[1_0_80px]"
                    />
                    <FormInput
                      name="deliveryCustomAddress.city"
                      label="Cidade"
                      width="flex-[1_0_150px]"
                    />
                    <FormInput
                      name="deliveryCustomAddress.neighborhood"
                      label="Bairro"
                      width="flex-[1_0_150px]"
                    />
                    <FormInput
                      name="deliveryCustomAddress.street"
                      label="Rua"
                      width="flex-[2_0_200px]"
                    />
                    <FormInput
                      name="deliveryCustomAddress.number"
                      label="Número"
                      width="flex-[1_0_80px]"
                    />
                    <FormInput
                      name="deliveryCustomAddress.complement"
                      label="Complemento"
                      width="flex-[1_0_150px]"
                    />
                  </>
                )}
              </form>
            </Form>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="neutralOutline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="edit-order-info"
              isLoading={form.formState.isSubmitting}
              RightIcon={IconCircleCheck}
            >
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGate>
  )
}
