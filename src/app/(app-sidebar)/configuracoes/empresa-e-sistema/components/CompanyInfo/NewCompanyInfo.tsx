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
import { cn } from '@/lib/utils'
import { Step1 } from './Steps/Step1'
import { Step2 } from './Steps/Step2'
import { Step3 } from './Steps/Step3'
import { PermissionGate } from '@/components/common/PermissionGate'
import { DangerActionCompanyModal } from './DangerActionCompanyModal'

// Icons
import {
  IconArrowRight,
  IconBuildingStore,
  IconCircleCheck,
  IconCirclePlus,
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

  const handleToggleModal = () => {
    form.reset()
    form.clearErrors()
    onOpenChange(false)
  }

  const onSubmit = async (data: CompanyFormType) => {
    const loadingToast = toast.loading('Aguarde...')

    const result = editMode
      ? await updateItemNew({ route: `/company/${companyData?.id}`, data })
      : await createItemNew({ route: '/company', data })

    if (result.success) {
      handleToggleModal()
      form.reset(defaultValues)
      await queryClient.invalidateQueries()

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
    } else {
      toast.error(result.message)
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
        cnpj: company?.general?.cnpj ?? '',
        municipalRegistration: company?.general?.municipalRegistration ?? '',
        email: company?.general?.email ?? '',
        siteUrl: company?.general?.siteUrl ?? '',
        phone: company?.general?.phone ?? '',
        mobile: company?.general?.mobile ?? '',
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
    }
    form.reset(formData)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyData, open])

  const errorTabStyle = 'text-red-500 animate-pulse transition-all'

  return (
    <PermissionGate
      permissions={[
        'company_settings:company_config:view',
        editMode
          ? 'company_settings:company_config:edit'
          : 'company_settings:company_config:create',
      ]}
      requireAll={true}
    >
      <Dialog open={open} onOpenChange={handleToggleModal}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconBuildingStore} />
              <DialogTitle>Configuração da empresa</DialogTitle>
            </div>
            <DialogDescription hidden></DialogDescription>
          </DialogHeader>
          <DialogBody className="max-h-[calc(100vh-200px)]">
            <Tabs defaultValue="general">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="general">
                  <span className={cn(hasGeneralErrors && errorTabStyle)}>
                    Dados da empresa
                  </span>
                </TabsTrigger>
                <TabsTrigger value="address">
                  <span className={cn(hasAddressErrors && errorTabStyle)}>
                    Endereço
                  </span>
                </TabsTrigger>
                <TabsTrigger value="customize">
                  <span className={cn(hasCustomizeErrors && errorTabStyle)}>
                    Personalizar empresa
                  </span>
                </TabsTrigger>
              </TabsList>
              <Form {...form}>
                <form
                  id="company-info"
                  onSubmit={handleSubmit(onSubmit)}
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
  return (
    <Button
      type="button"
      variant={editMode ? 'default' : 'neutralGhost'}
      size={'default'}
      RightIcon={editMode ? IconArrowRight : undefined}
      onClick={() => onOpenChange(true)}
    >
      {!editMode && (
        <FeaturedIcon variant="light" Icon={IconCirclePlus} rounded />
      )}
      {editMode ? 'Configurar' : 'Adicionar empresa'}
    </Button>
  )
}
