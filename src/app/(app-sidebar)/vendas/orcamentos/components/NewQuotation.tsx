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
import { SelectSerieField } from '@/components/common/form/global-inputs/SeriesSelectField'
import { ClientSelector } from '@/components/common/form/global-inputs/ClientAsyncSelect'
import { SelectSellerField } from '@/components/common/form/global-inputs/SellersSelectField'
import { SelectCompanyField } from '@/components/common/form/global-inputs/CompanySelectField'
import { ClientContactSelect } from '@/components/common/form/global-inputs/ClientContactSelect'
import { SelectContactSourceField } from '@/components/common/form/global-inputs/ContactSourcesSelectField'

// Icons
import { IconPlus, IconArrowRight, IconBolt } from '@tabler/icons-react'

// Hooks
import { useForm, type FieldErrors } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { useSerie } from '@/hooks/queries/useSerie'
import { useSeller } from '@/hooks/queries/useSeller'
import { useCompany } from '@/hooks/queries/useCompany'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { useQuickSaleEnabled } from '@/hooks/queries/useQuickSaleEnabled'
import { usePlanErrorToast } from '@/hooks/usePlanErrorToast'
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
  /**
   * Venda rápida: o mesmo orçamento, já marcado — é atalho, não outra tela.
   * O cliente é opcional.
   */
  quickSale?: boolean
}
export function NewQuotationModal({
  editMode = false,
  open,
  onOpenChange,
  data,
  quickSale = false,
}: Props) {
  const isQuickSale = editMode ? !!data?.quickSale : quickSale
  const { data: session } = useSession()
  const { data: sellers } = useSeller()
  const { data: series } = useSerie(true)
  const { data: contactSources } = useContactSources()
  const { data: companies } = useCompany()
  const { canManageMultipleCompanies } = usePlanFeatures()
  const { notifyActionError } = usePlanErrorToast()
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
      quickSale: Boolean(quickSale),
    },
  })

  useEffect(() => {
    if (data && open) {
      form.reset({
        // `company` é a subempresa fiscal, que o documento migrado não tinha;
        // sem ela o zod barrava o salvar em silêncio. A empresa do documento
        // vale no lugar.
        companyId: data?.company?.id ?? data?.companyId,
        // Venda rápida pode não ter cliente.
        clientId: (data?.client
          ? { label: data.client.name, value: data.client.id }
          : null) as unknown as string,
        contactId: data?.contact?.id || '',
        // Descrição nula (migrado sem referência) barrava do mesmo jeito.
        description: data?.description ?? '',
        contactSourceId: data?.contactSource?.id ?? '',
        seriesId: data?.serie?.id || '',
        sellerId: data?.seller?.id || '',
        quickSale: !!data?.quickSale,
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

  // A venda rápida vem do botão que abriu o formulário.
  useEffect(() => {
    if (open && !editMode) form.setValue('quickSale', quickSale)
  }, [open, editMode, quickSale, form])

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

  // Campo inválido fora da tela (empresa, descrição) travava o salvar sem
  // dizer nada: nenhum request, nenhum aviso. Agora o motivo aparece.
  const onInvalid = (errors: FieldErrors<QuotationFormType>) => {
    const primeiro = Object.values(errors).find((erro) => erro?.message)
    toast.error(
      primeiro?.message
        ? `Não foi possível salvar: ${primeiro.message}`
        : 'Não foi possível salvar: verifique os campos do formulário.',
    )
  }

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
        // A venda rápida é recurso de plano: o servidor recusa sem ele.
        notifyActionError(res)
        return
      }

      const seriesChanged =
        !!formData.seriesId && formData.seriesId !== data?.serie?.id
      toast.success(
        seriesChanged
          ? 'Orçamento atualizado. A nova série gerou uma nova numeração.'
          : 'Orçamento atualizado',
      )
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
      notifyActionError(res, 'Erro ao criar orçamento, tente novamente')
      return
    }

    if (res.data?.id) {
      window.location.href = `/vendas/orcamentos/${res.data.id}`
    }

    handleToggleModal(false)
    toast.success(isQuickSale ? 'Venda rápida criada' : 'Orçamento criado')
    queryClient.invalidateQueries({ queryKey: ['quotation-list'] })
    queryClient.invalidateQueries({ queryKey: ['quotation-totals'] })
  }

  if (editMode && !data) return null

  // @ts-expect-error any
  const clientId = form.watch('clientId')?.value

  // O campo Empresa só faz sentido com mais de um CNPJ ativo; com um só,
  // o orçamento já nasce na empresa da sessão (companyId do defaultValues)
  const hasMultipleCompanies =
    canManageMultipleCompanies() && (companies?.length ?? 0) > 1

  return (
    <PermissionGate
      permissions={['sale:quotation:create', 'sale:quotation:edit']}
    >
      <Dialog open={open} onOpenChange={handleToggleModal}>
        <DialogContent className="sm:max-w-[696px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4">
                {isQuickSale
                  ? !editMode
                    ? 'Nova venda rápida'
                    : 'Editar venda rápida'
                  : !editMode
                    ? 'Novo orçamento'
                    : 'Editar orçamento'}
              </div>
            </DialogTitle>
            <DialogDescription hidden></DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Form {...form}>
              <form
                id="new-quotation"
                onSubmit={handleSubmit(onSubmit, onInvalid)}
                className="flex flex-wrap gap-5"
                noValidate
              >
                <ClientSelector
                  name="clientId"
                  label={isQuickSale ? 'Cliente (opcional)' : 'Cliente'}
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
                {/* Em edição só o admin troca a série, porque a troca renumera */}
                <SelectSerieField
                  name="seriesId"
                  label="Série"
                  width="flex-[1_0_300px]"
                  disabled={editMode && !session?.user?.isAdmin}
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
                {hasMultipleCompanies && (
                  <SelectCompanyField<QuotationFormType>
                    name="companyId"
                    label="Empresa"
                    width="flex-[1_0_300px]"
                    disabled={editMode}
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
                {!editMode
                  ? isQuickSale
                    ? 'Cadastrar venda rápida'
                    : 'Cadastrar orçamento'
                  : 'Salvar'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGate>
  )
}

/** Botão "Nova venda rápida": exige o recurso do plano e criar orçamento. */
export function NewQuickSaleTriggerButton({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void
}) {
  // O plano e a opção "Usar venda rápida" da configuração
  const quickSaleEnabled = useQuickSaleEnabled()
  if (!quickSaleEnabled) return null
  return (
    <PermissionGate permissions={['sale:quotation:create']}>
      <Button
        type="button"
        variant="neutralOutline"
        LeftIcon={IconBolt}
        onClick={() => onOpenChange(true)}
      >
        Venda rápida
      </Button>
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
        LeftIcon={IconPlus}
        onClick={() => onOpenChange(true)}
      >
        Novo<span className="hidden sm:inline"> orçamento</span>
      </Button>
    </PermissionGate>
  )
}
