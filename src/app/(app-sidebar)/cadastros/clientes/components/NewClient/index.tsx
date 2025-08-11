/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

// Libs
import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { extractConditions } from './utils/ExtractConditions'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

// Components
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { NewClientForm } from './NewClientForm'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Icons
import { IconCirclePlus, IconPencil, IconPlus } from '@tabler/icons-react'

import {
  newClientSchema,
  NewClientFormType,
  defaultPersonValues,
} from './schema'
import {
  createItemNew,
  getDataOld,
  getItemOld,
  updateItemNew,
} from '@/actions/_cruds'
import { CheckboxBasic } from '@/components/common/form/FormCheckbox'

async function handleGetClient(clientId: string) {
  if (!clientId) return
  const client = await getItemOld({ route: 'clientRoute', id: clientId })
  return client
}

interface Props {
  editMode?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId?: string
}

export function NewClientModal({
  editMode,
  clientId,
  open,
  onOpenChange,
}: Props) {
  const queryClient = useQueryClient()
  const { hasFinancialModule } = usePlanFeatures()

  const [activeTab, setActiveTab] = useState('general')
  const [insertAnother, setInsertAnother] = useState(!editMode)
  const { data: client, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['client', clientId],
    queryFn: () => handleGetClient(clientId ?? ''),
  })
  const { data: paymentConditions } = useQuery({
    staleTime: Infinity,
    queryKey: ['credit-limit'],
    queryFn: () =>
      getDataOld({
        route: 'creditLimitRoute',
      }),
  })

  const personPaymentMethods = paymentConditions?.person || []
  const companyPaymentMethods = paymentConditions?.company || []

  const transformClientData = (apiData: any): NewClientFormType => {
    if (!apiData) return defaultPersonValues
    console.log(apiData)
    return {
      type: apiData.type || 'PERSON',
      general: {
        name: apiData.general?.name || '',
        corporateName: apiData.general?.corporateName || '',
        email: apiData.general?.email || '',
        cpf: apiData.general?.cpf || '',
        rg: apiData.general?.rg || '',
        cnpj: apiData.general?.cnpj || '',
        activity: apiData.general?.activity || '',
        categoryId: apiData.general?.category?.id || '',
        phone: apiData.general?.phone || '',
        mobile: apiData.general?.mobile || '',
        notes: apiData.general?.notes || '',
      },
      addresses: apiData.addresses?.length
        ? apiData.addresses.map((address: any) => ({
            type: address.type || 'Principal',
            zipcode: address.zipcode || '',
            state: address.state || '',
            city: address.city || '',
            neighborhood: address.neighborhood || '',
            street: address.street || '',
            number: address.number || '',
            complement: address.complement || '',
          }))
        : [
            {
              type: 'Principal',
              zipcode: '',
              state: '',
              city: '',
              neighborhood: '',
              street: '',
              number: '',
              complement: '',
            },
          ],
      responsibilities: apiData.contacts?.length
        ? apiData.contacts.map((contact: any) => ({
            name: contact.name || '',
            email: contact.email || '',
            phone: contact.phone || '',
            mobile: contact.mobile || '',
            notes: contact.notes || '',
          }))
        : [
            {
              name: '',
              email: '',
              phone: '',
              mobile: '',
              notes: '',
            },
          ],
      creditLimit: {
        minValue: apiData.creditLimit?.minValue,
        maxValue: apiData.creditLimit?.maxValue,
        paymentMethods:
          apiData.creditLimit?.paymentMethods?.map((method: any) => ({
            id: method.id,
            name: method.name,
            conditions: method.conditions || [],
          })) || [],
        blockClient: apiData.creditLimit?.blockClient || false,
      },
    }
  }

  const form = useForm<NewClientFormType>({
    resolver: zodResolver(newClientSchema),
    values: {
      ...defaultPersonValues,
      creditLimit: {
        minValue: personPaymentMethods.minValue,
        maxValue: personPaymentMethods.maxValue,
        paymentMethods: personPaymentMethods.paymentMethods,
        blockClient: false,
      },
    },
    mode: 'onChange',
  })
  const type = form.watch('type')

  useEffect(() => {
    if (editMode) return

    if (type === 'PERSON') {
      form.setValue('creditLimit', {
        minValue: personPaymentMethods.minValue,
        maxValue: personPaymentMethods.maxValue,
        paymentMethods: personPaymentMethods.paymentMethods,
        blockClient: false,
      })
    } else {
      form.setValue('creditLimit', {
        minValue: companyPaymentMethods.minValue,
        maxValue: companyPaymentMethods.maxValue,
        paymentMethods: companyPaymentMethods.paymentMethods,
        blockClient: false,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, form, editMode])

  useEffect(() => {
    if (client) {
      const transformedData = transformClientData(client)
      form.reset(transformedData) // Atualizando o formulário com os dados transformados
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client])

  if (editMode && isLoading) return <></>

  const {
    reset,
    formState: { isSubmitting },
  } = form

  const handleValidateAllTabs = async () => {
    const tabs = ['general', 'addresses', 'responsibilities']
    // Adiciona creditLimit apenas se o plano permitir
    if (hasFinancialModule('credit_limit')) {
      tabs.push('creditLimit')
    }

    for (const tab of tabs) {
      const isValid = await form.trigger(tab as keyof NewClientFormType)
      if (!isValid) {
        toast.error('Preencha todos os campos obrigatórios')
        setActiveTab(tab)
        return false
      }
    }
    return true
  }

  const onSubmit = async (data: NewClientFormType) => {
    const isValid = await handleValidateAllTabs()
    if (!isValid) return

    const { responsibilities, ...dataWithoutResponsibilities } = data
    let formData = {
      ...dataWithoutResponsibilities,
      contacts: responsibilities || [],
    }

    // Processa creditLimit apenas se o plano permitir
    if (hasFinancialModule('credit_limit')) {
      const { paymentMethods, ...creditLimitData } = data.creditLimit
      formData.creditLimit = {
        ...creditLimitData,
        conditions: extractConditions(paymentMethods),
      } as any
    } else {
      // Remove creditLimit se não estiver disponível no plano
      const { creditLimit: _creditLimit, ...formDataWithoutCreditLimit } =
        formData
      formData = formDataWithoutCreditLimit as any
    }

    if (client?.status !== 'INACTIVE') {
      formData.status = 'ACTIVE'
    }

    console.log(formData)

    if (isSubmitting) return

    let res

    if (editMode) {
      res = await updateItemNew({
        route: `/client/${clientId}`,
        data: formData,
      })
    } else {
      res = await createItemNew({
        route: '/client',
        data: formData,
      })
    }

    if (!res.success) {
      toast.error(res.message)
      return
    }

    toast.success(
      editMode
        ? 'Cliente atualizado com sucesso!'
        : 'Cliente cadastrado com sucesso!',
    )

    queryClient.invalidateQueries()

    handleCleanForm()
    setActiveTab('general')
    if (!insertAnother) {
      handleToggleModal()
    }
  }

  function handleCleanForm() {
    const cleanData = { ...defaultPersonValues }

    // Adiciona creditLimit apenas se o plano permitir
    if (hasFinancialModule('credit_limit')) {
      cleanData.creditLimit = {
        minValue: personPaymentMethods.minValue,
        maxValue: personPaymentMethods.maxValue,
        paymentMethods: personPaymentMethods.paymentMethods,
        blockClient: false,
      }
    }

    reset(cleanData)
  }
  function handleToggleModal() {
    handleCleanForm()
    onOpenChange(false)
    setActiveTab('general')
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const isValid = await handleValidateAllTabs()
    if (!isValid) return

    form.handleSubmit(onSubmit)(e)
  }

  return (
    <Dialog open={open} onOpenChange={handleToggleModal}>
      <DialogContent className="sm:max-w-[855px]">
        <DialogHeader className="">
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconPlus} />
            <DialogTitle>
              {editMode ? 'Editar cliente' : 'Novo cliente'}
            </DialogTitle>
            <DialogDescription className="sr-only"></DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="h-[calc(100vh-200px)]">
          <FormProvider {...form}>
            <form
              onSubmit={handleFormSubmit}
              noValidate
              className="space-y-6"
              id="new-client-form-abc"
            >
              <NewClientForm
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                showCreditLimit={hasFinancialModule('credit_limit')}
              />
            </form>
          </FormProvider>
        </DialogBody>
        <DialogFooter className="flex sm:justify-between">
          <div className="flex items-center">
            {!editMode ? (
              <CheckboxBasic
                name="inserir-outro"
                label="Inserir outro depois deste"
                checked={editMode ? false : insertAnother}
                onCheckedChange={(value) => setInsertAnother(value)}
              />
            ) : null}
          </div>
          <div className="space-x-2">
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

            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>

            <Button
              type="submit"
              form="new-client-form-abc"
              disabled={isSubmitting}
              onClick={() => {
                // TODO : corrigir e remover este workaround para o erro de não submitar se não abrir tab limite de crédito
                if (hasFinancialModule('credit_limit')) {
                  form.trigger('creditLimit')
                  const errors = form.formState.errors
                  if (errors) {
                    setActiveTab('creditLimit')
                  }
                }
              }}
            >
              {editMode
                ? isSubmitting
                  ? 'Atualizando...'
                  : 'Salvar edição'
                : isSubmitting
                  ? 'Cadastrando...'
                  : 'Cadastrar cliente'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function NewClientTriggerButton({
  editMode,
  onOpenChange,
}: {
  editMode?: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Button
      type="button"
      size={editMode ? 'icon' : 'default'}
      variant={editMode ? 'neutralGhost' : 'default'}
      LeftIcon={editMode ? IconPencil : IconCirclePlus}
      onClick={() => onOpenChange(true)}
    >
      {editMode ? '' : 'Novo cliente'}
    </Button>
  )
}
