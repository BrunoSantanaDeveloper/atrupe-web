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
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'

// Icons
import { IconCircleCheck } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'

// Actions
import { createItemNew } from '@/actions/_cruds'
import { PermissionGate } from '@/components/common/PermissionGate'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { billingOptions } from '../EditItem'

const schema = z.object({
  code: z.string().min(1, 'Informe o código da série'),
  description: z.string().min(1, 'Informe a descrição da série'),
  title: z.string().min(1, 'Informe a nomenclatura'),
  proposalValidity: z.coerce
    .number()
    .min(1, 'Informe a validade da proposta')
    .max(999),
  deliveryDeadline: z.coerce
    .number()
    .min(1, 'Informe o prazo de entrega')
    .max(999),
  billing: z.string().min(1, 'Informe o tipo de faturamento'),
  sendToProduction: z.string().min(1, 'Informe o envio para produção'),
  productionStatus: z.string().min(1, 'Informe o status de produção'),
})

type FormType = z.infer<typeof schema>

interface Props {
  open?: boolean
  setOpen?: (value: string) => void
}

export function NewSerieDialog({ open, setOpen }: Props) {
  const queryClient = useQueryClient()
  const {
    canBillOnDeliveryAndCheckout,
    canBillOnCheckout,
    canManageDeliverySchedule,
  } = usePlanFeatures()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      description: '',
      title: 'Orçamento',
      proposalValidity: 30,
      deliveryDeadline: 15,
      billing: 'ON_ORDER',
      sendToProduction: 'DIRECT',
      productionStatus: 'MANAGE_PRODUCTION',
    },
  })

  const { handleSubmit, reset } = form

  const onSubmit = async (data: FormType) => {
    const res = await createItemNew({
      route: '/sale/series',
      data,
    })

    if (!res.success) {
      toast.error(res.message ?? 'Erro ao criar série.')
      return
    }

    toast.success('Série criada.')
    queryClient.invalidateQueries()
    handleOpenChange(false)
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen?.(openDialog ? 'new' : '')
    reset()
  }

  const filteredBillingOptions = billingOptions.filter((o) =>
    o.value === 'ON_CHECKOUT'
      ? canBillOnCheckout()
      : o.value === 'ON_DELIVERY'
        ? canBillOnDeliveryAndCheckout()
        : true,
  )

  const productionStatusOptions = !canManageDeliverySchedule()
    ? [{ value: 'PRODUCTION_COMPLETED', label: 'Produção concluída' }]
    : [
        { value: 'MANAGE_PRODUCTION', label: 'Gerenciar produção' },
        { value: 'PRODUCTION_COMPLETED', label: 'Produção concluída' },
      ]

  return (
    <PermissionGate permissions={['sales_settings:series:edit']}>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4">
                <span>Nova série de venda</span>
              </div>
            </DialogTitle>
            <DialogDescription hidden></DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Form {...form}>
              <form
                id="new-serie-form"
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-wrap gap-5"
                noValidate
              >
                <FormInput<FormType>
                  name="code"
                  label="Código"
                  placeholder="Ex: V1"
                  width="flex-[1_0_200px]"
                />
                <FormInput<FormType>
                  name="description"
                  label="Descrição"
                  placeholder="Ex: Vendas padrão"
                  width="flex-[1_0_250px]"
                />
                <FormInput<FormType>
                  name="title"
                  label="Nomenclatura"
                  placeholder="Ex: Orçamento"
                  width="flex-[1_0_200px]"
                />
                <FormInput<FormType>
                  type="number"
                  name="proposalValidity"
                  label="Validade da proposta (dias)"
                  width="flex-[1_0_200px]"
                />
                <FormInput<FormType>
                  type="number"
                  name="deliveryDeadline"
                  label="Prazo de entrega (dias)"
                  width="flex-[1_0_200px]"
                />
                <Separator className="bg-gray-300" />
                <p className="w-full text-sm font-semibold text-gray-700">
                  Flow de aprovação
                </p>
                <FormSelect<FormType>
                  name="billing"
                  label="Faturamento"
                  width="flex-[1_0_250px]"
                  options={filteredBillingOptions}
                />
                {canManageDeliverySchedule() && (
                  <>
                    <FormSelect<FormType>
                      name="sendToProduction"
                      label="Envio para produção"
                      width="flex-[1_0_250px]"
                      options={[
                        { value: 'DIRECT', label: 'Enviar diretamente' },
                      ]}
                    />
                    <FormSelect<FormType>
                      name="productionStatus"
                      label="Status de produção"
                      width="flex-[1_0_250px]"
                      options={productionStatusOptions}
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
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="new-serie-form"
              isLoading={form.formState.isSubmitting}
              RightIcon={IconCircleCheck}
            >
              Criar série
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGate>
  )
}
