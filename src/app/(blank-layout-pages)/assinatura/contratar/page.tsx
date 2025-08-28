'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FormCheckbox } from '@/components/common/form/FormCheckbox'
import { useSession } from 'next-auth/react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

// New imports
import { CardPlano } from '@/components/common/subscription/CardPlano'
import { InvoiceModule } from '@/components/common/subscription/InvoiceModule'
import { AdditionalUsers } from '@/components/common/subscription/AdditionalUsers'
import { CustomerDataForm } from '@/components/common/subscription/CustomerDataForm'
import { TermsModal } from './components/TermsModal'
import {
  subscriptionFormSchema,
  SubscriptionFormData,
} from '@/lib/validationSchemas'
import { Plan, PersonType, StateOption, CityOption } from '@/types/subscription'
import { adaptPlansToNewFormat } from '@/lib/planAdapter'
import { planos } from './components/plans'
import { createItemNew } from '@/actions/_cruds'
import { IconCoin } from '@tabler/icons-react'
import { toast } from 'sonner'

export default function ContratarPage() {
  // Convert old plans format to new format - Fix the type assertion
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plans: Plan[] = adaptPlansToNewFormat(planos as any)

  const { data: session } = useSession()
  const router = useRouter()

  // Form state
  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionFormSchema),
    mode: 'onChange',
    defaultValues: {
      personType: 'company',
      companyName: '',
      cnpj: '',
      responsibleName: '',
      responsibleCpf: '',
      email: '',
      phone: '',
      mobile: '',
      address: {
        zipCode: '',
        state: '',
        city: '',
        neighborhood: '',
        street: '',
        number: '',
        complement: '',
      },
      additionalUsers: 0,
      invoiceModule: false,
      termsAccepted: false,
    },
  })

  // Component state
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [invoiceModuleActive, setInvoiceModuleActive] = useState(false)
  const [additionalUsersCount, setAdditionalUsersCount] = useState(0)
  const [personType, setPersonType] = useState<PersonType>('company')
  const [termsModalOpen, setTermsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Location data
  const [states, setStates] = useState<StateOption[]>([])
  const [cities, setCities] = useState<CityOption[]>([])

  const selectedPlan = plans.find((p) => p.id === selectedPlanId)

  // Preencher form com dados do usuário logado - Remove property checks that don't exist
  useEffect(() => {
    if (session?.user) {
      form.setValue('responsibleName', session.user.name || '')
      form.setValue('email', session.user.email || '')

      // A company na sessão só tem os campos básicos conforme definido em auth.ts
      const company = session.company

      // Remover verificações de propriedades que não existem na sessão
      // As propriedades cnpj, phone, mobile, address não estão definidas no tipo Session
      form.setValue('personType', 'company')
      form.setValue('companyName', company?.name || company?.legalName || '')
      setPersonType('company')
    }
  }, [session, form])

  // Fetch Brazilian states on component mount
  useEffect(() => {
    fetch(
      'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome',
    )
      .then((res) => res.json())
      .then((data) => {
        setStates(
          data.map((state: { sigla: string; nome: string }) => ({
            value: state.sigla,
            label: state.nome,
          })),
        )
      })
      .catch(() => setStates([]))
  }, [])

  // Fetch cities when state is selected
  const selectedState = form.watch('address.state')
  useEffect(() => {
    if (!selectedState) {
      setCities([])
      return
    }
    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`,
    )
      .then((res) => res.json())
      .then((data) => {
        setCities(
          data.map((city: { nome: string }) => ({
            value: city.nome,
            label: city.nome,
          })),
        )
      })
      .catch(() => setCities([]))
  }, [selectedState])

  // Handlers
  const handlePlanChange = (id: string) => {
    setSelectedPlanId(id)
  }

  const handlePersonTypeChange = (newPersonType: PersonType) => {
    setPersonType(newPersonType)
    form.setValue('personType', newPersonType)

    // Reset type-specific fields
    if (newPersonType === 'individual') {
      form.setValue('companyName', '')
      form.setValue('cnpj', '')
    }
  }

  const handleAdditionalUsersChange = (value: number) => {
    setAdditionalUsersCount(value)
    form.setValue('additionalUsers', value)
  }

  const handleInvoiceModuleToggle = (checked: boolean) => {
    setInvoiceModuleActive(checked)
    form.setValue('invoiceModule', checked)
  }

  const handleSubmit = async (data: SubscriptionFormData) => {
    if (!selectedPlanId || !session?.company?.id) {
      toast.error('Selecione um plano e garanta que a empresa está logada.')
      return
    }

    setIsLoading(true)

    const selectedPlan = plans.find((p) => p.id === selectedPlanId)
    const additionalUsersCost = data.additionalUsers * 25.0
    const invoiceCost = data.invoiceModule ? 70.0 : 0
    const totalAmount =
      (selectedPlan?.price || 0) + additionalUsersCost + invoiceCost

    const payload = {
      extraUsers: data.additionalUsers || 0,
      planPrice: selectedPlan?.price || 0,
      totalAmount,
      billingType: 'CREDIT_CARD',
      isContractAccepted: data.termsAccepted,
      cycle: 'MONTHLY',
      name: data.responsibleName,
      email: data.email,
      phone: data.phone,
      mobilePhone: data.mobile,
      address: data.address.street,
      addressNumber: data.address.number,
      province: data.address.state,
      postalCode: data.address.zipCode,
      complement: data.address.complement,
      city: data.address.city,
      neighborhood: data.address.neighborhood,
      // CPF do responsável sempre obrigatório
      cpf: data.responsibleCpf,
      // Campos específicos por tipo de pessoa - Fix type assertion with proper discriminated union handling
      ...(data.personType === 'company' && {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cnpj: (data as any).cnpj,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        companyName: (data as any).companyName,
      }),
    }

    try {
      // ✅ Usar a estrutura @actions correta
      const res = await createItemNew({
        route: `/plan/subscription/${selectedPlanId}/${session.company.id}`,
        data: payload,
      })

      if (!res.success) {
        toast.error(res.message || 'Erro!')
        return
      }

      toast.success('Plano contratado com sucesso.')

      // Redirecionar para página de ativação
      router.push('/assinatura/ativar/start')
    } catch (err: unknown) {
      console.error('Erro ao inscrever plano:', err)

      // Melhor tratamento do erro para capturar detalhes de validação
      let errorMessage = 'Erro interno do servidor. Tente novamente.'

      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err.response as {
          data?: {
            message?: {
              message?: string[]
              userMessage?: string
            }
          }
        }

        if (errorResponse?.data?.message) {
          const errorData = errorResponse.data.message

          // Se a mensagem é um array de erros de validação
          if (Array.isArray(errorData.message)) {
            errorMessage = errorData.message.join(', ')
          } else if (errorData.userMessage) {
            errorMessage = errorData.userMessage
          }
        }
      }

      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate total amount
  const calculateTotalAmount = () => {
    if (!selectedPlan) return 0
    const additionalUsersCost = additionalUsersCount * 25.0
    const invoiceCost = invoiceModuleActive ? 70.0 : 0
    return selectedPlan.price + additionalUsersCost + invoiceCost
  }

  // Observar apenas o checkbox de termos para habilitar/desabilitar botão
  const termsAccepted = form.watch('termsAccepted')

  return (
    <FormProvider {...form}>
      <div className="flex flex-col w-full h-full bg-muted">
        <header className="flex items-center h-16 px-8 border-b bg-white">
          <span className="text-lg font-semibold">Assinatura</span>
        </header>

        <main className="flex flex-1 justify-center items-start gap-8 px-8 py-8 overflow-y-auto">
          <div className="flex flex-col gap-2 w-full max-w-xl">
            {/* Plans Selection */}
            {plans.map((plan) => (
              <CardPlano
                key={plan.id}
                plan={plan}
                isSelected={selectedPlanId === plan.id}
                onSelect={() =>
                  plan.status === 'available'
                    ? handlePlanChange(plan.id)
                    : undefined
                }
              />
            ))}

            {/* Invoice Module */}
            <InvoiceModule
              isActive={invoiceModuleActive}
              onToggle={handleInvoiceModuleToggle}
            />

            {/* Additional Users */}
            <AdditionalUsers
              userCount={additionalUsersCount}
              onUserCountChange={handleAdditionalUsersChange}
            />

            {/* Customer Data Form */}
            <CustomerDataForm
              form={form}
              personType={personType}
              onPersonTypeChange={handlePersonTypeChange}
              states={states}
              cities={cities}
            />
          </div>

          {/* Subscription Summary Sidebar */}
          <div className="w-full max-w-sm">
            <Card className="bg-white">
              <div className="px-6 pt-6 pb-2">
                <h2 className="font-semibold text-base mb-4">
                  Resumo da assinatura
                </h2>
                <hr className="border-gray-200 mb-4" />

                {/* Selected Plan */}
                {selectedPlan && (
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                      {/* Check icon */}
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 16 16"
                      >
                        <path
                          d="M4 8.5L7 11.5L12 5.5"
                          stroke="#14B375"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {`Atrupe ${selectedPlan.name.charAt(0).toUpperCase()}${selectedPlan.name.slice(1).toLowerCase()}`}
                    </span>
                    <span className="text-base font-semibold text-gray-700 flex items-center gap-1">
                      R${' '}
                      {selectedPlan.price.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                      <span className="text-sm font-normal text-muted-foreground">
                        /mês
                      </span>
                    </span>
                  </div>
                )}

                {/* Additional items */}
                {invoiceModuleActive && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Módulo NF</span>
                    <span className="text-sm font-semibold text-gray-700">
                      R$ 70,00/mês
                    </span>
                  </div>
                )}

                {additionalUsersCount > 0 && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">
                      {additionalUsersCount} usuário
                      {additionalUsersCount !== 1 ? 's' : ''} adicional
                      {additionalUsersCount !== 1 ? 'is' : ''}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">
                      R${' '}
                      {(additionalUsersCount * 25.0).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                      /mês
                    </span>
                  </div>
                )}

                <hr className="border-gray-200 mb-4" />

                {/* Total */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold text-gray-900">
                    Total
                  </span>
                  <span className="flex items-center gap-1 text-lg font-bold text-gray-900">
                    <IconCoin className="w-6 h-6 text-blue-500" />
                    R$
                    <span className="text-xl font-bold text-gray-900">
                      {calculateTotalAmount().toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-base font-normal text-muted-foreground text-gray-900">
                      /mês
                    </span>
                  </span>
                </div>
              </div>
            </Card>

            {/* Terms and Submit */}
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="mb-4">
                <FormCheckbox
                  name="termsAccepted"
                  label="Estou de acordo com os Termos de Contratação da Atrupe."
                  className="text-xs font-medium text-gray-700"
                  disabled={!selectedPlan}
                />
                <button
                  type="button"
                  className="text-xs text-emerald-600 underline font-semibold mt-1 block"
                  onClick={() => setTermsModalOpen(true)}
                >
                  Clique aqui para ler os termos completos
                </button>
              </div>

              <Button
                onClick={form.handleSubmit(handleSubmit)}
                className="w-full"
                disabled={!selectedPlan || !termsAccepted || isLoading}
              >
                {isLoading ? 'Processando...' : 'Avançar'}{' '}
                {!isLoading && (
                  <span aria-hidden="true" className="ml-2">
                    →
                  </span>
                )}
              </Button>

              <TermsModal
                open={termsModalOpen}
                onOpenChange={setTermsModalOpen}
                onAccept={() => form.setValue('termsAccepted', true)}
              />
            </div>
          </div>
        </main>
      </div>
    </FormProvider>
  )
}
