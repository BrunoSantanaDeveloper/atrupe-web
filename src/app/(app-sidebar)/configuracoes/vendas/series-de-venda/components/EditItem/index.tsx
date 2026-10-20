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
import { Skeleton } from '@/components/ui/skeleton'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormSwitch } from '@/components/common/form/FormSwitch'
import { CheckboxBasic } from '@/components/common/form/FormCheckbox'

// Icons
import { IconCircleCheck } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { schema, type FormType } from './schema'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

// Types
import type { SaleSeriesType } from '@/types/settings/saleSeries'
import type { SellerProfileType } from '@/types/settings/sellerProfile'

// Actions
import { getDataOld, updateItemNew } from '@/actions/_cruds'
import { DisableSerieAlertDialog } from './DisableSerie'
import { PermissionGate } from '@/components/common/PermissionGate'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { useState, useEffect } from 'react'

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

const productionStatusOptions = [
  { value: 'MANAGE_PRODUCTION', label: 'Gerenciar produção' },
  {
    value: 'PRODUCTION_COMPLETED',
    label: 'Produção concluída',
  },
]

interface Props {
  open?: boolean
  setOpen?: (value: string) => void
  rowData?: SaleSeriesType
}

export function EditItemDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([])
  const isAdmin = Boolean(session?.user?.isAdmin)

  const {
    canBillOnDeliveryAndCheckout,
    canBillOnCheckout,
    canManageDeliverySchedule,
  } = usePlanFeatures()

  const { data: profilesData, isLoading: isLoadingProfiles } = useQuery({
    staleTime: 60000,
    queryKey: ['seller-profile-list-series'],
    queryFn: () => getDataOld({ route: 'sellerProfileRoute', perPage: '100' }),
    enabled: open,
  })

  const profiles: SellerProfileType[] = (profilesData?.profiles ?? [])
    .map((p: { profile: SellerProfileType }) => p.profile)
    .filter((p: SellerProfileType) => p.isActive)

  useEffect(() => {
    if (open) {
      setSelectedProfileIds(rowData?.allowedProfiles?.map((p) => p.id) ?? [])
    }
  }, [open, rowData])

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

  const onSubmit = async (data: FormType) => {
    if (!isAdmin) {
      delete data.currentBudgetNumber
    }

    const res = await updateItemNew({
      route: `/sale/series/${rowData?.id}`,
      data: { ...data, allowedProfileIds: selectedProfileIds },
    })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    queryClient.invalidateQueries()
    handleOpenChange(false)
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen?.(openDialog ? 'edit' : '')
    reset({})
  }

  const toggleProfile = (id: string) => {
    setSelectedProfileIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  // A série que já fatura de um jeito o mantém na lista
  const filteredBillingOptions = billingOptions.filter(
    (option) =>
      option.value === rowData?.billing?.value ||
      (option.value === 'ON_CHECKOUT'
        ? canBillOnCheckout()
        : option.value === 'ON_DELIVERY'
          ? canBillOnDeliveryAndCheckout()
          : true),
  )

  const filterProductionStatusOptions = !canManageDeliverySchedule()
    ? productionStatusOptions.filter(
        (option) => option.value === 'PRODUCTION_COMPLETED',
      )
    : productionStatusOptions

  return (
    <PermissionGate permissions={['sales_settings:series:edit']}>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[950px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4">
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
                  disabled={!isAdmin}
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
                      options={filterProductionStatusOptions}
                    />
                  </>
                )}
                <Separator className="bg-gray-300" />
                <div className="w-full space-y-3">
                  <p className="text-md font-semibold text-gray-700">
                    Restrição por perfil de vendedor
                  </p>
                  <p className="text-sm text-gray-500">
                    Selecione os perfis que podem usar esta série. Se nenhum for
                    selecionado, todos os vendedores terão acesso.
                  </p>
                  {isLoadingProfiles ? (
                    <div className="flex gap-4 flex-wrap">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-5 w-32" />
                      ))}
                    </div>
                  ) : profiles.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      Nenhum perfil de vendedor cadastrado.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-x-6 gap-y-3">
                      {profiles.map((profile) => (
                        <CheckboxBasic
                          key={profile.id}
                          name={`profile-${profile.id}`}
                          label={profile.name}
                          checked={selectedProfileIds.includes(profile.id)}
                          onCheckedChange={() => toggleProfile(profile.id)}
                          className="flex-[0_0_auto]"
                        />
                      ))}
                    </div>
                  )}
                </div>
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
                isLoading={form.formState.isSubmitting}
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
