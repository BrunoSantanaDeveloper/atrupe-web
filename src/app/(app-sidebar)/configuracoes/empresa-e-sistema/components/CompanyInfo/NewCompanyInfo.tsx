'use client'

// React
import { useLayoutEffect, useState } from 'react'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs'

// Components
import { toast } from 'sonner'
import { cn, maskCnpj, MaskPhoneNumber } from '@/lib/utils'
import { Step1 } from './Steps/Step1'
import { Step2 } from './Steps/Step2'
import { Step3 } from './Steps/Step3'
import { Step4 } from './Steps/Step4'
import { Step5 } from './Steps/Step5'
import { PermissionGate } from '@/components/common/PermissionGate'
import { DangerActionCompanyModal } from './DangerActionCompanyModal'

// Icons
import {
  IconArrowRight,
  IconCircleCheck,
  IconPlus,
  IconBuilding,
} from '@tabler/icons-react'

// Form
import {
  ICompanyData,
  defaultValues,
  companySchema,
  CompanyFormType,
} from './schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createItemNew, updateItemNew } from '@/actions/_cruds'

// Third-party
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

interface Props {
  editMode?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  companyData?: ICompanyData
}

export function NewCompany({
  open,
  editMode,
  companyData,
  onOpenChange,
}: Props) {
  const [openActionDialog, setOpenActionDialog] = useState<
    'inactive' | 'active' | ''
  >('')

  const queryClient = useQueryClient()
  const { update } = useSession()

  const form = useForm<CompanyFormType>({
    resolver: zodResolver(companySchema),
    defaultValues,
  })

  const {
    handleSubmit,
    formState: { errors },
  } = form

  const hasGeneralErrors = Boolean(errors?.general)
  const hasAddressErrors = Boolean(errors?.address)
  const hasCustomizeErrors = Boolean(errors?.personalization)
  const hasSocialNetworksErrors = Boolean(errors?.socialNetworks)

  const handleToggleModal = () => {
    form.reset()
    form.clearErrors()
    onOpenChange(false)
  }

  const onSubmit = async (data: CompanyFormType) => {
    const loadingToast = toast.loading('Aguarde...')
    delete data.fiscal.certificateLastUpload

    const result = editMode
      ? await updateItemNew({ route: `/company/${companyData?.id}`, data })
      : await createItemNew({ route: '/company', data })

    if (!result.success) {
      toast.error(result.message)
      return
    }

    // Primeiro invalidar as queries específicas para garantir que os dados sejam atualizados
    await queryClient.invalidateQueries({ queryKey: ['companies-data'] })
    await queryClient.invalidateQueries({ queryKey: ['company-list'] })

    // Depois fechar o modal e resetar o formulário
    handleToggleModal()

    try {
      if (editMode && companyData?.principal) {
        await update({
          company: {
            name: data.general.name,
            legalName: data.general.legalName,
            logo: data.personalization.logoUrl,
            favicon: data.personalization.favIconUrl,
          },
        })
      }

      toast.success(
        `Empresa ${editMode ? 'atualizada' : 'criada'} com sucesso!`,
      )
    } catch (error) {
      console.error('Erro ao processar dados da empresa:', error)
      toast.error(`Erro ao ${editMode ? 'atualizar' : 'criar'} empresa`)
    }

    toast.dismiss(loadingToast)
  }

  useLayoutEffect(() => {
    if (!companyData) return
    const company = companyData

    const formData = {
      general: {
        name: company?.general?.name ?? '',
        legalName: company?.general?.legalName ?? '',
        cnpj: maskCnpj(company?.general?.cnpj ?? ''),
        municipalRegistration: company?.general?.municipalRegistration ?? '',
        stateRegistration: company?.general?.stateRegistration ?? '',
        email: company?.general?.email ?? '',
        siteUrl: company?.general?.siteUrl ?? '',
        phone: MaskPhoneNumber(company?.general?.phone ?? '') || '',
        mobile: MaskPhoneNumber(company?.general?.mobile ?? '') || '',
      },
      address: {
        number: company?.address?.number ?? '',
        zipcode: company?.address?.zipcode ?? '',
        state: company?.address?.state ?? '',
        city: company?.address?.city ?? '',
        neighborhood: company?.address?.neighborhood ?? '',
        street: company?.address?.street ?? '',
        complement: company?.address?.complement ?? '',
      },
      personalization: {
        logoUrl: company?.personalization?.logoUrl ?? '',
        favIconUrl: company?.personalization?.favIconUrl ?? '',
        textsBeforeItems: company?.personalization?.textsBeforeItems ?? '',
        textsAfterItems: company?.personalization?.textsAfterItems ?? '',
      },
      socialNetworks: {
        instagram: company?.socialNetworks?.instagram ?? '',
        facebook: company?.socialNetworks?.facebook ?? '',
        linkedin: company?.socialNetworks?.linkedin ?? '',
      },
      fiscal: {
        cnae: company?.fiscal?.cnae ?? '',
        accessKey: company?.fiscal?.accessKey ?? '',
        certificateType: company?.fiscal?.certificateType ?? '',
        certificateDescription: company?.fiscal?.certificateDescription ?? '',
        certificatePassword: company?.fiscal?.certificatePassword ?? '',
        certificate: company?.fiscal?.certificate ?? '',
        certificateName: company?.fiscal?.certificateName ?? '',
        certificateLastUpload: company?.fiscal?.certificateLastUpload ?? '',
      },
    }
    form.reset(formData)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyData, open])

  const errorTabStyle = 'text-red-500 animate-pulse transition-all'

  return (
    <PermissionGate
      permissions={[
        'company_settings:company:view',
        editMode
          ? 'company_settings:company:edit'
          : 'company_settings:company:create',
      ]}
      requireAll={true}
    >
      <Dialog open={open} onOpenChange={handleToggleModal}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconBuilding} />
              <DialogTitle>Configuração da empresa</DialogTitle>
            </div>
            <DialogDescription hidden></DialogDescription>
          </DialogHeader>
          <DialogBody className="max-h-[calc(100vh-200px)]">
            <Tabs defaultValue="general">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="general">
                  <span className={cn(hasGeneralErrors && errorTabStyle)}>
                    Gerais
                  </span>
                </TabsTrigger>
                <TabsTrigger value="address">
                  <span className={cn(hasAddressErrors && errorTabStyle)}>
                    Endereço
                  </span>
                </TabsTrigger>
                <TabsTrigger value="fiscal">
                  <span>Nota Fiscal</span>
                </TabsTrigger>
                <TabsTrigger value="social">
                  <span
                    className={cn(hasSocialNetworksErrors && errorTabStyle)}
                  >
                    Redes sociais
                  </span>
                </TabsTrigger>
                <TabsTrigger value="customize">
                  <span className={cn(hasCustomizeErrors && errorTabStyle)}>
                    Personalização
                  </span>
                </TabsTrigger>
              </TabsList>
              <Form {...form}>
                <form
                  id="company-info"
                  onSubmit={handleSubmit(onSubmit)}
                  autoComplete="off"
                  noValidate
                >
                  <TabsContent value="general">
                    <Step1 />
                  </TabsContent>
                  <TabsContent value="address">
                    <Step2 />
                  </TabsContent>
                  <TabsContent value="customize">
                    <Step3 />
                  </TabsContent>
                  <TabsContent value="social">
                    <Step4 />
                  </TabsContent>
                  <TabsContent value="fiscal">
                    <Step5 />
                  </TabsContent>
                </form>
              </Form>
            </Tabs>
          </DialogBody>
          <DialogFooter className="sm:justify-between">
            <div>
              {editMode && companyData?.isActive && !companyData?.principal && (
                <Button
                  type="button"
                  variant="error"
                  onClick={() => setOpenActionDialog('inactive')}
                >
                  Inativar
                </Button>
              )}
            </div>
            <div className="space-x-4">
              <DialogTrigger asChild>
                <Button type="button" variant="neutralOutline">
                  Cancelar
                </Button>
              </DialogTrigger>
              <Button
                type="submit"
                form="company-info"
                RightIcon={IconCircleCheck}
                isLoading={form.formState.isSubmitting}
              >
                Salvar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DangerActionCompanyModal
        type="inactive"
        open={openActionDialog === 'inactive'}
        companyId={companyData?.id ?? ''}
        setOpen={() => setOpenActionDialog('')}
        title={`Deseja inativar esta empresa?`}
        description={`Ao inativar, não será mais possível gerar orçamentos utilizando este CNPJ.`}
        onSuccess={() => {
          handleToggleModal()
        }}
      />
    </PermissionGate>
  )
}

export function NewCompanyTriggerButton({
  editMode,
  onOpenChange,
}: {
  editMode?: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { canManageMultipleCompanies } = usePlanFeatures()

  // Se estiver no modo de edição, não há restrições
  if (editMode) {
    return (
      <Button
        type="button"
        variant="default"
        size="default"
        RightIcon={IconArrowRight}
        onClick={() => onOpenChange(true)}
      >
        Configurar
      </Button>
    )
  }

  if (!canManageMultipleCompanies()) {
    return (
      <Button
        type="button"
        variant="neutralGhost"
        size="default"
        title="Não disponível no plano atual"
        className="hidden"
      >
        <FeaturedIcon variant="light" Icon={IconPlus} rounded />
        Adicionar empresa
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="neutralGhost"
      size="default"
      onClick={() => onOpenChange(true)}
    >
      <FeaturedIcon variant="light" Icon={IconPlus} rounded />
      Adicionar empresa
    </Button>
  )
}
