'use client'

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
import { Separator } from '@/components/ui/separator'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormSwitch } from '@/components/common/form/FormSwitch'

// Icons
import { IconCircleCheck, IconTransactionDollar } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { schema, type FormType } from './schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types
import type { SaleSeriesType } from '@/types/settings/saleSeries'

// Actions
import { updateItem } from '@/actions/_cruds'
import { DisableSerieAlertDialog } from './DisableSerie'
import { PermissionGate } from '@/components/common/PermissionGate'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

export const billingOptions = [
  {
    value: 'ON_ORDER',
    label: 'Faturar no pedido (Ao aprovar a venda)',
  },
  {
    value: 'ON_DELIVERY',
    label: 'Faturar na entrega (Após produção)',
  },
  {
    value: 'ON_CHECKOUT',
    label: 'Faturar na frente de caixa ',
  },
  {
    value: 'NO_INVOICE',
    label: 'Sem lançamento',
  },
]

interface Props {
  open?: boolean
  setOpen?: (value: string) => void
  rowData?: SaleSeriesType
}

export function EditItemDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()

  const { planName } = usePlanFeatures()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    values: {
      code: rowData?.code || '',
      description: rowData?.description || '',
      title: rowData?.title || '',
      currentBudgetNumber: rowData?.currentBudgetNumber || 0,
      proposalValidity: rowData?.proposalValidity || 0,
      deliveryDeadline: rowData?.deliveryDeadline || 0,
      billing: rowData?.billing?.value || '',
      sendToProduction: rowData?.sendToProduction?.value || '',
      productionStatus: rowData?.productionStatus?.value || '',
      isDefault: rowData?.isDefault || false,
    },
  })

  const { handleSubmit, reset } = form

  const mutation = useMutation({
    mutationFn: (data: FormType) =>
      updateItem('saleSeriesRoute', rowData?.id || '', data),
    onSuccess: () => {
      queryClient.invalidateQueries()
      toast.success('Sucesso!')
      handleOpenChange(false)
    },
    onError: (err) => {
      console.error(err)
      toast.error('Ocorreu um erro.')
    },
  })

  const onSubmit = async (data: FormType) => {
    delete data.currentBudgetNumber

    await mutation.mutateAsync(data)
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen?.(openDialog ? 'edit' : '')
    reset({})
  }

  const filteredBillingOptions =
    planName === 'START' || planName === 'TRIAL'
      ? billingOptions.filter(
          (option) =>
            option.value === 'ON_ORDER' || option.value === 'NO_INVOICE',
        )
      : billingOptions

  return (
    <PermissionGate permissions={['sales_settings:series:edit']}>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[950px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4">
                <FeaturedIcon
                  variant="neutralOutline"
                  Icon={IconTransactionDollar}
                />
                <span>Configurar série de venda</span>
              </div>
            </DialogTitle>
            <DialogDescription hidden></DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Form {...form}>
              <form
                id="submit-form"
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-wrap gap-5"
                noValidate
              >
                <p className="w-full text-md font-semibold text-gray-700">
                  Configurações gerais
                </p>
                <FormInput<FormType>
                  name="code"
                  label="Código"
                  width="flex-[1_0_250px]"
                />
                <FormInput<FormType>
                  name="description"
                  label="Descrição"
                  width="flex-[1_0_250px]"
                />
                <FormInput<FormType>
                  name="title"
                  label="Nomenclatura"
                  width="flex-[1_0_250px]"
                />
                <FormInput<FormType>
                  type="number"
                  name="currentBudgetNumber"
                  label="Número orçamento atual"
                  placeholder="Nenhum orçamento nesta série"
                  width="flex-[1_0_250px]"
                  disabled
                />
                <FormInput<FormType>
                  type="number"
                  name="proposalValidity"
                  label="Validade da proposta (dias)"
                  width="flex-[1_0_250px]"
                />
                <FormInput<FormType>
                  type="number"
                  name="deliveryDeadline"
                  label="Prazo de entrega (dias)"
                  width="flex-[1_0_250px]"
                />
                <FormSwitch<FormType>
                  name="isDefault"
                  label="Série padrão"
                  className="flex-[1_0_250px]"
                />
                <Separator className="bg-gray-300" />
                <p className="w-full text-md font-semibold text-gray-700">
                  Flow de aprovação
                </p>
                <FormSelect<FormType>
                  name="billing"
                  label="Faturamento"
                  width="flex-[1_0_250px]"
                  options={filteredBillingOptions}
                />
                <FormSelect<FormType>
                  name="sendToProduction"
                  label="Envio para produção"
                  width="flex-[1_0_250px]"
                  options={[{ value: 'DIRECT', label: 'Enviar diretamente' }]}
                />
                <FormSelect<FormType>
                  name="productionStatus"
                  label="Status de produção"
                  width="flex-[1_0_250px]"
                  options={[
                    { value: 'MANAGE_PRODUCTION', label: 'Gerenciar produção' },
                    {
                      value: 'PRODUCTION_COMPLETED',
                      label: 'Produção concluída',
                    },
                  ]}
                />
              </form>
            </Form>
          </DialogBody>
          <DialogFooter className="sm:justify-between">
            <div>
              <DisableSerieAlertDialog
                rowData={rowData}
                onChange={handleOpenChange}
              />
            </div>
            <div className="space-x-4">
              <DialogTrigger asChild>
                <Button type="button" variant="neutralOutline">
                  Voltar
                </Button>
              </DialogTrigger>
              <Button
                type="submit"
                form="submit-form"
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
