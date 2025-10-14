// React
import { useEffect, useState } from 'react'

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
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Button, buttonVariants } from '@/components/ui/button'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { ActionButton } from '@/components/common/ActionButton'
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { FormDatePickerSingle } from '@/components/common/form/FormDatePicker'
import { SupplierSelector } from '@/components/common/form/global-inputs/SupplierAsyncSelect'
import { ClientAddressSelectField } from '@/components/common/form/global-inputs/ClientAddressSelectField'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { schema, type FormType } from './schema'

// Icons
import { IconBox, IconPencil, IconCircleCheck } from '@tabler/icons-react'

// Third-party
import { useQueryClient } from '@tanstack/react-query'

// Libs
import { cn } from '@/lib/utils'
import { actionDisabled } from '@/lib/quotation'

// Actions
import { updateItemNew } from '@/actions/_cruds'

// Types
import { QuotationType } from '@/types/sales/quotation'
import { QUOTATION_DATA_QUERY_KEY } from '../../Quotation'

// Consts
import {
  deliveryTypeOptions,
  deliveryModalityOptions,
} from '@/consts/quotations'

interface Props {
  quotationData: QuotationType
}

export function DeliveryDialog({ quotationData }: Props) {
  const [open, setOpen] = useState(false)

  const { deliveryInfo } = quotationData

  const clientId = quotationData.client.id

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
  })

  const { handleSubmit, setValue, clearErrors, watch, reset, setError } = form

  useEffect(() => {
    if (open) {
      const defaultEstimatedDate = deliveryInfo?.timeFrame
        ? new Date(
            new Date().setDate(new Date().getDate() + deliveryInfo.timeFrame),
          )
        : null

      reset({
        deliveryType: deliveryInfo?.type || '',
        daysAfterApproval: deliveryInfo?.timeFrame || 0,
        estimatedDate: defaultEstimatedDate,
        modality: deliveryInfo?.modality || '',
        cost: deliveryInfo?.cost || 0,
        value: deliveryInfo?.value || 0,
        supplierId: deliveryInfo?.supplier
          ? ({
              value: deliveryInfo?.supplier?.id,
              label: deliveryInfo?.supplier?.name,
            } as unknown as string)
          : null,
        clientAddressId:
          deliveryInfo?.clientAddress?.type === 'CustomForDelivery'
            ? 'custom'
            : deliveryInfo?.clientAddress?.id || '',
        customAddress:
          deliveryInfo?.clientAddress?.type === 'CustomForDelivery'
            ? {
                street: deliveryInfo?.clientAddress?.street || '',
                number: deliveryInfo?.clientAddress?.number || '',
                complement: deliveryInfo?.clientAddress?.complement || '',
                neighborhood: deliveryInfo?.clientAddress?.neighborhood || '',
                city: deliveryInfo?.clientAddress?.city || '',
                state: deliveryInfo?.clientAddress?.state || '',
                zipcode: deliveryInfo?.clientAddress?.zipcode || '',
              }
            : {},
        notes: deliveryInfo?.notes || '',
      })
    }
  }, [reset, deliveryInfo, open])

  const deliveryType = watch('deliveryType')
  const cost = watch('cost')
  const clientAddressId = watch('clientAddressId')

  const showSupplierField = deliveryType === 'CARRIER' || cost > 0
  const showCustomAddressFields = clientAddressId === 'custom'

  const queryClient = useQueryClient()

  const onSubmit = async (data: FormType) => {
    if (actionDisabled('delivery', quotationData?.status)) return

    if (!showSupplierField) {
      data.supplierId = null
    }

    delete data.estimatedDate

    if (
      (data.deliveryType === 'CARRIER' || data.cost > 0) &&
      !data.supplierId
    ) {
      setError('supplierId', {
        message: 'Campo obrigatório',
      })
      return
    }

    try {
      const res = await updateItemNew({
        route: `/quotation/delivery/${deliveryInfo.id}`,
        data,
      })

      if (!res.success) {
        toast.error(res.message)
        return
      }

      queryClient.invalidateQueries({ queryKey: [QUOTATION_DATA_QUERY_KEY] })
      handleOpenChange(false)
    } catch (error) {
      toast.error('Erro ao salvar informações de entrega!')
    }
  }

  const handleOpenChange = (open: boolean) => {
    // if (!open) reset()
    setOpen(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <ActionButton
          Icon={IconPencil}
          tooltip="Editar entrega"
          className={cn(
            buttonVariants({ variant: 'neutralLight', size: 'icon' }),
          )}
          disabled={actionDisabled('delivery', quotationData?.status)}
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[695px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconBox} />
            <DialogTitle>Editar entrega</DialogTitle>
          </div>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="quotation-delivery"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-wrap gap-4"
            >
              <FormSelect
                name="deliveryType"
                label="Tipo de entrega"
                options={deliveryTypeOptions}
                width="flex-[1_0_200px]"
              />
              <FormInput
                name="daysAfterApproval"
                label="Dias após aprovação"
                type="number"
                min={0}
                width="flex-[1_0_200px]"
                additionalOnChange={(value) => {
                  const daysAfterApproval = value || 0
                  const newDate = new Date()
                  newDate.setDate(newDate.getDate() + Number(daysAfterApproval))
                  setValue('estimatedDate', newDate)
                }}
              />
              <FormDatePickerSingle
                name="estimatedDate"
                label="Data estimada"
                width="flex-[1_0_200px]"
                // fromDate={new Date()}
                additionalOnChange={(value) => {
                  const defaultEstimatedDate = deliveryInfo?.timeFrame
                    ? new Date(
                        new Date().setDate(
                          new Date().getDate() + deliveryInfo.timeFrame,
                        ),
                      )
                    : null

                  const estimatedDate =
                    value instanceof Date && !isNaN(value.getTime())
                      ? value
                      : defaultEstimatedDate

                  if (!estimatedDate) return

                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  defaultEstimatedDate?.setHours(0, 0, 0, 0)
                  const diffMs = estimatedDate.getTime() - today.getTime()
                  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
                  setValue('daysAfterApproval', diffDays)
                }}
              />
              {showSupplierField && (
                <SupplierSelector
                  name="supplierId"
                  label="Fornecedor"
                  width="w-full"
                  additionalOnChange={() => {
                    clearErrors('supplierId')
                  }}
                />
              )}
              <ClientAddressSelectField
                name="clientAddressId"
                label="Endereço de entrega"
                width="w-full"
                clientId={clientId}
                placeholder="Selecione o endereço de entrega"
              />
              {showCustomAddressFields && (
                <>
                  <FormInput
                    name="customAddress.zipcode"
                    label="CEP"
                    width="flex-[1_0_120px]"
                  />
                  <FormInput
                    name="customAddress.state"
                    label="Estado"
                    width="flex-[1_0_100px]"
                  />
                  <FormInput
                    name="customAddress.city"
                    label="Cidade"
                    width="flex-[1_0_150px]"
                  />
                  <FormInput
                    name="customAddress.neighborhood"
                    label="Bairro"
                    width="flex-[1_0_150px]"
                  />
                  <FormInput
                    name="customAddress.number"
                    label="Número"
                    width="flex-[1_0_100px]"
                  />
                  <FormInput
                    name="customAddress.street"
                    label="Rua"
                    width="flex-[2_0_200px]"
                  />
                  <FormInput
                    name="customAddress.complement"
                    label="Complemento"
                    width="flex-[1_0_150px]"
                  />
                </>
              )}
              <FormSelect
                name="modality"
                label="Modalidade frete"
                options={deliveryModalityOptions}
                width="flex-[1_0_200px]"
                disabled
              />
              {/* TODO : Se houver custo, deve ir para despesas */}
              <FormBrlInput
                name="cost"
                label="Custo"
                startAdornment={<>R$</>}
                width="flex-[1_0_200px]"
              />
              <FormBrlInput
                name="value"
                label="Valor"
                startAdornment={<>R$</>}
                width="flex-[1_0_200px]"
              />
              <FormTextarea name="notes" label="Observações" width="w-full" />
            </form>
          </Form>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div></div>
          <div className="space-x-4">
            <DialogTrigger asChild>
              <Button type="button" variant="neutralOutline">
                Cancelar
              </Button>
            </DialogTrigger>
            <Button
              type="submit"
              form="quotation-delivery"
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
