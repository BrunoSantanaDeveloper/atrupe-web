// React
import { useState, useEffect, useRef } from 'react'

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
import { SupplierSelectField } from '@/components/common/form/global-inputs/SupplierSelectField'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { schema, type FormType } from './schema'

// Icons
import { IconBox, IconPencil, IconCircleCheck } from '@tabler/icons-react'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Libs
import { cn } from '@/lib/utils'
import { actionDisabled } from '@/lib/quotation'

// Actions
import { updateItem } from '@/actions/_cruds'

// Types
import { QuotationType } from '@/types/sales/quotation'
import { QUOTATION_DATA_QUERY_KEY } from '../../Quotation'

// TODO : Pegar opções em GET /quotation/delivery
const deliveryTypeOptions = [
  {
    value: 'INSTALLATION',
    label: 'Entrega na instalação',
  },
  { value: 'CARRIER', label: 'Transportadora' },
  { value: 'PICKUP', label: 'Cliente retira' },
]

const deliveryModalityOptions = [
  { value: 'Indefinida', label: 'Indefinida' },
  {
    value: 'Contratação do frete por conta do remetente (CIF)',
    label: 'Contratação do frete por conta do remetente (CIF)',
  },
  {
    value: 'Contratação do frete por conta do destinatário (FOB)',
    label: 'Contratação do frete por conta do destinatário (FOB)',
  },
  {
    value: 'Contratação do frete por conta de terceiros',
    label: 'Contratação do frete por conta de terceiros',
  },
  {
    value: 'Transporte próprio por conta do remetente',
    label: 'Transporte próprio por conta do remetente',
  },
  {
    value: 'Transporte próprio por conta do destinatário',
    label: 'Transporte próprio por conta do destinatário',
  },
  {
    value: 'Sem ocorrência de transporte',
    label: 'Sem ocorrência de transporte',
  },
]

interface Props {
  quotationData: QuotationType
}

export function DeliveryDialog({ quotationData }: Props) {
  const [open, setOpen] = useState(false)
  const updatingFromEffect = useRef(false)

  const { deliveryInfo } = quotationData

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      deliveryType: deliveryInfo?.type || '',
      daysAfterApproval: deliveryInfo?.timeFrame || 0,
      estimatedDate: deliveryInfo?.estimateDate || new Date(),
      modality: deliveryInfo?.modality || '',
      cost: deliveryInfo?.cost || 0,
      value: deliveryInfo?.value || 0,
      supplierId: deliveryInfo?.supplier?.id || '',
      notes: deliveryInfo?.notes || '',
    },
  })

  const { handleSubmit, setValue, watch, setError } = form

  const deliveryType = watch('deliveryType')
  const cost = watch('cost')
  const daysAfterApproval = watch('daysAfterApproval')
  const estimatedDate = watch('estimatedDate')

  const showSupplierField = deliveryType === 'CARRIER' || cost > 0

  // Sync estimated date when days after approval changes
  useEffect(() => {
    if (updatingFromEffect.current) return

    if (daysAfterApproval && daysAfterApproval > 0) {
      const today = new Date()
      const newEstimatedDate = new Date(today)
      newEstimatedDate.setDate(today.getDate() + daysAfterApproval)

      // Only update if the calculated date is different from current estimatedDate
      const currentEstimatedTime = new Date(estimatedDate).getTime()
      const newEstimatedTime = newEstimatedDate.getTime()

      if (
        Math.abs(currentEstimatedTime - newEstimatedTime) >
        24 * 60 * 60 * 1000
      ) {
        updatingFromEffect.current = true
        setValue('estimatedDate', newEstimatedDate)
        setTimeout(() => {
          updatingFromEffect.current = false
        }, 0)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daysAfterApproval, setValue])

  // Sync days after approval when estimated date changes
  useEffect(() => {
    if (updatingFromEffect.current) return

    if (estimatedDate) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const selectedDate = new Date(estimatedDate)
      selectedDate.setHours(0, 0, 0, 0)

      const diffTime = selectedDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // Only update if the calculated days is different from current daysAfterApproval and >= 0
      if (diffDays >= 0 && diffDays !== daysAfterApproval) {
        updatingFromEffect.current = true
        setValue('daysAfterApproval', diffDays)
        setTimeout(() => {
          updatingFromEffect.current = false
        }, 0)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimatedDate, setValue])

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: FormType) =>
      updateItem('deliveryInfoRoute', deliveryInfo.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTATION_DATA_QUERY_KEY] })
    },
  })

  const onSubmit = async (data: FormType) => {
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
      await mutation.mutateAsync(data)
      toast.success('Informações de entrega salvas!')
      setOpen(false)
    } catch (error) {
      toast.error('Erro ao salvar informações de entrega!')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              />
              <FormDatePickerSingle
                name="estimatedDate"
                label="Data estimada"
                width="flex-[1_0_200px]"
                fromDate={new Date()}
              />
              {showSupplierField && (
                <SupplierSelectField
                  name="supplierId"
                  label="Fornecedor"
                  width="w-full"
                  onChange={(e) => {
                    setValue('supplierId', e)
                  }}
                  defaultValues={{
                    id: deliveryInfo?.supplier?.id || '',
                    name: deliveryInfo?.supplier?.name || '',
                  }}
                />
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
