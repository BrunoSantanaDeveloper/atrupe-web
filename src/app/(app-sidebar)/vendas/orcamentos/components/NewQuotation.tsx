'use client'

// React
import { useEffect } from 'react'

// UI
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

// Components
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import NewClientTriggerButton from './NewClientTriggerButton'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { SelectSerieField } from '@/components/common/form/global-inputs/SeriesSelectField'
import { ClientSelector } from '@/components/common/form/global-inputs/ClientAsyncSelect'
import { SelectSellerField } from '@/components/common/form/global-inputs/SellersSelectField'
import { SelectCompanyField } from '@/components/common/form/global-inputs/CompanySelectField'

// Icons
import {
  IconCirclePlus,
  IconArrowRight,
  IconReportMoney,
} from '@tabler/icons-react'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Third-party Imports
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'

import { useSession } from 'next-auth/react'
import { useSeller } from '@/hooks/queries/useSeller'
import { QuotationType } from '@/types/sales/quotation'
import { createItemNew, updateItemNew } from '@/actions/_cruds'
import { QuotationFormType, quotationSchema } from './schema'

const serviceOptions = [
  { value: 'direct', label: 'Venda Direta' },
  {
    value: 'email',
    label: 'E-mail',
  },
  {
    value: 'phone',
    label: 'Telefone',
  },
  {
    value: 'whatsapp',
    label: 'WhatsApp',
  },
  {
    value: 'instagram',
    label: 'Instagram',
  },
  {
    value: 'facebook',
    label: 'Facebook',
  },
  {
    value: 'linkedin',
    label: 'LinkedIn',
  },
  {
    value: 'telegram',
    label: 'Telegram',
  },
  {
    value: 'twitter',
    label: 'Twitter',
  },
  {
    value: 'youtube',
    label: 'YouTube',
  },
  {
    value: 'other',
    label: 'Outro',
  },
]

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

  const queryClient = useQueryClient()

  const form = useForm<QuotationFormType>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      companyId: session?.company?.id,
      clientId: '',
      description: '',
      contactType: serviceOptions[0].value,
      seriesId: '',
      sellerId: '',
      quickSale: false,
    },
    values: data
      ? {
          companyId: data?.company?.id,
          clientId: data?.client?.id,
          description: data?.description,
          contactType: data?.contactType ?? '',
          seriesId: data?.serie.id,
          sellerId: data?.seller?.id,
          quickSale: data?.quickSale,
        }
      : undefined,
  })

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

  const { handleSubmit } = form

  const handleToggleModal = () => {
    // setOpen((prev) => !prev)
    onOpenChange(false)
  }

  const handleCloseModal = () => {
    form.reset()
    form.clearErrors()
    // handleToggleModal()
    onOpenChange(false)
  }

  const onSubmit = async (formData: QuotationFormType) => {
    if (editMode) {
      const response = await updateItemNew({
        route: `/sale/quotation/${data?.id}`,
        data: formData,
      })

      if (response.success) {
        toast.success('Orçamento atualizado com sucesso!')
        queryClient.invalidateQueries()
        handleCloseModal()
      } else {
        toast.error(response.message)
      }
    } else {
      const response = await createItemNew({
        route: '/sale/quotation',
        data: formData,
      })

      if (response.success) {
        if (response.data?.id) {
          window.location.href = `/vendas/orcamentos/${response.data.id}`
        }
        handleCloseModal()
        toast.success('Orçamento criado com sucesso!')
        queryClient.invalidateQueries()
      } else {
        console.error('error ❌', response.message)
        toast.error(
          response.message || 'Erro ao criar orçamento, tente novamente',
        )
      }
    }
  }

  if (editMode && !data) return null

  return (
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
                additionalOnChange={(e) => {
                  form.setValue('clientId', e)
                }}
              />
              <FormInput<QuotationFormType>
                name="description"
                label="Descrição do serviço"
                width="w-full"
              />
              <SelectCompanyField<QuotationFormType>
                name="companyId"
                label="Empresa"
                width="flex-[1_0_300px]"
                disabled={editMode}
              />
              <SelectSerieField
                name="seriesId"
                label="Série"
                width="flex-[1_0_300px]"
                disabled={editMode}
              />
              <FormSelect<QuotationFormType>
                name="contactType"
                label="Atendimento"
                options={serviceOptions}
                width="flex-[1_0_300px]"
              />
              <SelectSellerField
                name="sellerId"
                label="Vendedor"
                width="flex-[1_0_300px]"
                placeholder={data?.seller?.name}
              />
            </form>
          </Form>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div className="flex items-center space-x-2">
            {!editMode && <NewClientTriggerButton />}
          </div>
          <div className="space-x-4">
            <Button
              type="button"
              variant="neutralOutline"
              onClick={handleCloseModal}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="gap-2"
              form="new-quotation"
              isLoading={form.formState.isSubmitting}
              disabled={!form.formState.isDirty}
            >
              {!editMode ? 'Criar orçamento' : 'Salvar edição'}

              <IconArrowRight />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function NewQuotationTriggerButton({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Button
      type="button"
      LeftIcon={IconCirclePlus}
      onClick={() => onOpenChange(true)}
    >
      Novo orçamento
    </Button>
  )
}
