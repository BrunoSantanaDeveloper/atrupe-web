'use client'

// Libs
import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createItemNew, updateItemNew } from '@/actions/_cruds'

// Components
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { PermissionGate } from '@/components/common/PermissionGate'
import { toast } from 'sonner'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import NewClientTriggerButton from './NewClientTriggerButton'
import { FormInput } from '@/components/common/form/FormInput'
import { FormDatePickerInput } from '@/components/common/form/FormDatePickerInput'
import { SelectSerieField } from '@/components/common/form/global-inputs/SeriesSelectField'
import { ClientSelector } from '@/components/common/form/global-inputs/ClientAsyncSelect'
import { SelectSellerField } from '@/components/common/form/global-inputs/SellersSelectField'
import { SelectCompanyField } from '@/components/common/form/global-inputs/CompanySelectField'
import { ClientContactSelect } from '@/components/common/form/global-inputs/ClientContactSelect'
import { SelectContactSourceField } from '@/components/common/form/global-inputs/ContactSourcesSelectField'

// Icons
import {
  IconCirclePlus,
  IconArrowRight,
  IconReportMoney,
} from '@tabler/icons-react'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Hooks
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { useSerie } from '@/hooks/queries/useSerie'
import { useSeller } from '@/hooks/queries/useSeller'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { useNewClientStore } from '../store/useNewClientStore'
import { useContactSources } from '@/hooks/queries/useContactSources'

// Types
import type { QuotationType } from '@/types/sales/quotation'
import { type QuotationFormType, quotationSchema } from './schema'

import { QUOTATION_DATA_QUERY_KEY } from '../[quotationId]/components/Quotation'

interface Props {
  editMode?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  data?: QuotationType
}
export function NewQuotationModal({
  editMode = false,
  open,
  onOpenChange,
  data,
}: Props) {
  const { data: session } = useSession()
  const { data: sellers } = useSeller()
  const { data: series } = useSerie(true)
  const { data: contactSources } = useContactSources()
  const { canManageMultipleCompanies } = usePlanFeatures()
  const { setOnClientCreated } = useNewClientStore()

  const queryClient = useQueryClient()

  const form = useForm<QuotationFormType>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      companyId: session?.company?.id,
      clientId: undefined,
      contactId: '',
      description: '',
      contactSourceId: '',
      seriesId: '',
      sellerId: '',
      quickSale: false,
    },
  })

  useEffect(() => {
    if (data && open) {
      form.reset({
        companyId: data?.company?.id,
        clientId: {
          label: data?.client?.name,
          value: data?.client?.id,
        } as unknown as string,
        contactId: data?.contact?.id || '',
        description: data?.description,
        contactSourceId: data?.contactSource?.id ?? '',
        seriesId: data?.serie.id || '',
        sellerId: data?.seller?.id || '',
        quickSale: !!data?.quickSale,
        quotationNumber: data?.quotationNumber ?? undefined,
      })
    }
  }, [open, data, form])

  useEffect(() => {
    if (sellers && session?.user?.employeeId && !editMode) {
      const isValidSeller = sellers.some(
        (seller: { id: string }) => seller.id === session.user?.employeeId,
      )

      if (isValidSeller) {
        form.setValue('sellerId', session.user.employeeId)
      }
    }
  }, [sellers, session, form, editMode])

  // Definir série com isDefault como padrão
  useEffect(() => {
    if (!editMode && series?.data && open) {
      const defaultSerie = series.data.find((serie) => serie.isDefault)
      if (defaultSerie) {
        form.setValue('seriesId', defaultSerie.id)
      }
    }
  }, [series, form, editMode, open])

  // Definir callback para quando cliente for criado
  useEffect(() => {
    if (open && !editMode) {
      setOnClientCreated((newClient) => {
        form.setValue('clientId', newClient as unknown as string)
      })
    } else {
      setOnClientCreated(undefined)
    }
  }, [open, editMode, setOnClientCreated, form])

  // Definir "Venda direta" como contactSource padrão
  useEffect(() => {
    if (!editMode && contactSources && open) {
      const vendaDireta = contactSources.find(
        (source) => source.name === 'Venda Direta',
      )
      if (vendaDireta) {
        form.setValue('contactSourceId', vendaDireta.id)
      }
    }
  }, [contactSources, form, editMode, open])

  const { handleSubmit } = form

  const handleToggleModal = (open: boolean) => {
    if (!open) {
      form.reset()
      form.clearErrors()
    }
    onOpenChange(open)
  }

  const onSubmit = async (formData: QuotationFormType) => {
    if (editMode) {
      const res = await updateItemNew({
        route: `/sale/quotation/${data?.id}`,
        data: formData,
      })

      if (!res.success) {
        toast.error(res.message)
        return
      }

      toast.success('Orçamento atualizado com sucesso!')
      queryClient.invalidateQueries({ queryKey: [QUOTATION_DATA_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: ['quotation-list'] })
      queryClient.invalidateQueries({ queryKey: ['quotation-totals'] })
      handleToggleModal(false)
      return
    }

    const res = await createItemNew({
      route: '/sale/quotation',
      data: formData,
    })

    if (!res.success) {
      toast.error(res.message || 'Erro ao criar orçamento, tente novamente')
      return
    }

    if (res.data?.id) {
      window.location.href = `/vendas/orcamentos/${res.data.id}`
    }

    handleToggleModal(false)
    toast.success('Orçamento criado com sucesso!')
    queryClient.invalidateQueries({ queryKey: ['quotation-list'] })
    queryClient.invalidateQueries({ queryKey: ['quotation-totals'] })
  }

  if (editMode && !data) return null

  // @ts-expect-error any
  const clientId = form.watch('clientId')?.value

  return (
    <PermissionGate
      permissions={['sale:quotation:create', 'sale:quotation:edit']}
    >
      <Dialog open={open} onOpenChange={handleToggleModal}>
        <DialogContent className="sm:max-w-[696px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4">
                <FeaturedIcon variant="neutralOutline" Icon={IconReportMoney} />
                {!editMode ? 'Novo orçamento' : 'Editar orçamento'}
              </div>
            </DialogTitle>
            <DialogDescription hidden></DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Form {...form}>
              <form
                id="new-quotation"
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-wrap gap-5"
                noValidate
              >
                <ClientSelector
                  name="clientId"
                  label="Cliente"
                  width="w-full"
                  additionalOnChange={() => {
                    // Limpar seleção de contato quando cliente mudar
                    form.setValue('contactId', '')
                  }}
                />
                <FormInput<QuotationFormType>
                  name="description"
                  label="Descrição do serviço"
                  width="w-full"
                />
                <SelectSerieField
                  name="seriesId"
                  label="Série"
                  width="flex-[1_0_300px]"
                  disabled={editMode}
                />
                <SelectContactSourceField<QuotationFormType>
                  name="contactSourceId"
                  label="Atendimento"
                  width="flex-[1_0_300px]"
                />
                <SelectSellerField
                  name="sellerId"
                  label="Vendedor"
                  width="flex-[1_0_300px]"
                  placeholder={data?.seller?.name}
                />
                <ClientContactSelect
                  name="contactId"
                  label="Responsável"
                  width="flex-[1_0_300px]"
                  clientId={clientId}
                  disabled={!clientId}
                />
                {canManageMultipleCompanies() && (
                  <SelectCompanyField<QuotationFormType>
                    name="companyId"
                    label="Empresa"
                    width="flex-[1_0_300px]"
                    disabled={editMode}
                  />
                )}
                {session?.user?.isAdmin && !editMode && (
                  <FormDatePickerInput
                    name="createdAt"
                    label="Data de criação (retroativa)"
                    placeholder="Data atual"
                    width="flex-[1_0_300px]"
                  />
                )}
                {session?.user?.isAdmin && (
                  <FormInput<QuotationFormType>
                    name="quotationNumber"
                    label={`Número do orçamento${!editMode ? ' (retroativo)' : ''}`}
                    placeholder={!editMode ? 'Automático' : undefined}
                    type="number"
                    min={1}
                    width="flex-[1_0_300px]"
                  />
                )}
              </form>
            </Form>
          </DialogBody>
          <DialogFooter className="sm:justify-between">
            <div className="flex items-center space-x-2">
              {!editMode && (
                <PermissionGate permissions={['register:client:create']}>
                  <NewClientTriggerButton />
                </PermissionGate>
              )}
            </div>
            <div className="space-x-4">
              {process.env.NODE_ENV === 'development' && (
                <Button
                  type="button"
                  variant="warningLight"
                  onClick={() => {
                    form.trigger()
                    console.info(form.getValues())
                    console.info(form.formState.errors)
                  }}
                >
                  Teste
                </Button>
              )}
              <DialogClose>
                <Button type="button" variant="neutralOutline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="gap-2"
                form="new-quotation"
                isLoading={form.formState.isSubmitting}
                RightIcon={IconArrowRight}
              >
                {!editMode ? 'Criar orçamento' : 'Salvar edição'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGate>
  )
}

export function NewQuotationTriggerButton({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void
}) {
  return (
    <PermissionGate permissions={['sale:quotation:create']}>
      <Button
        type="button"
        LeftIcon={IconCirclePlus}
        onClick={() => onOpenChange(true)}
      >
        Novo<span className="hidden sm:inline"> orçamento</span>
      </Button>
    </PermissionGate>
  )
}
