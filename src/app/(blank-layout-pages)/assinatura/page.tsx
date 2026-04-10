'use client'

import { z } from 'zod'
import Link from 'next/link'
import {
  IconUser,
  IconCoin,
  IconPlus,
  IconCheck,
  IconMinus,
  IconBarcode,
  IconArrowLeft,
  IconArrowRight,
  IconCreditCard,
  IconBuildingCommunity,
} from '@tabler/icons-react'
import { HandleValidateCpf, HandleValidateCnpj } from '@/lib/validateDocs'
import { toast } from 'sonner'
import type { ModuleType, VisualPlanType } from '@/types/plans'
import { Logo } from '@/components/Logo'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { PlanCard } from './components/PlanCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { IconPix } from '@/assets/icons/CustomIcons'
import { ModuleCard } from './components/ModuleCard'
import { CpfOrCnpjField } from '@/components/common/form/global-inputs/CpfOrCnpjField'
import { useState, useEffect, useMemo } from 'react'
import { Separator } from '@/components/ui/separator'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import { Input } from '@/components/ui/input-uncontrolled'
import { FormInput } from '@/components/common/form/FormInput'
import { SubscriptionTerms } from './components/SubscriptionTerms'
import { FormToggleCard } from '@/components/common/form/FormToggleCard'
import { createItemNew, getData, updateItemNew } from '@/actions/_cruds'
import { FormInputZipCode } from '@/components/common/form/FormInputZipCode'
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'
import { generateIdempotencyKey } from '@/lib/idempotency'
import { useRouter } from 'next/navigation'

const IS_DEV_ENV = process.env.NEXT_PUBLIC_ENV !== 'production'

const personTypeOptions = [
  {
    label: 'Pessoa Física',
    value: 'PF',
    icon: IconUser,
  },
  {
    label: 'Pessoa Jurídica',
    value: 'PJ',
    icon: IconBuildingCommunity,
  },
]

const billingTypeOptions = [
  {
    label: 'Cartão',
    value: 'CREDIT_CARD',
    icon: IconCreditCard,
  },
  {
    label: 'PIX',
    value: 'PIX',
    icon: IconPix,
  },
  {
    label: 'Boleto',
    value: 'BOLETO',
    icon: IconBarcode,
  },
]

const stripNonDigits = (value: string) => value.replace(/\D/g, '')

const baseSchema = z.object({
  personType: z.enum(['PF', 'PJ']),
  // Campos comuns
  email: z.string().email('E-mail inválido').min(1, 'E-mail é obrigatório'),
  phone: z.string().optional(),
  mobile: z
    .string()
    .min(1, 'Celular é obrigatório')
    .refine(
      (val) => {
        const digits = stripNonDigits(val)
        return digits.length >= 10 && digits.length <= 11
      },
      { message: 'Celular inválido. Use o formato (99) 99999-9999' },
    ),
  zipCode: z
    .string()
    .min(1, 'CEP é obrigatório')
    .refine(
      (val) => stripNonDigits(val).length === 8,
      { message: 'CEP inválido. Deve conter 8 dígitos' },
    ),
  state: z.string().min(1, 'Estado é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  number: z.string(),
  street: z.string().min(1, 'Rua é obrigatória'),
  complement: z.string().optional(),
  billingType: z.enum(['CREDIT_CARD', 'PIX', 'BOLETO']),
})

const schemaPF = baseSchema.extend({
  personType: z.literal('PF'),
  name: z.string().min(1, 'Nome completo é obrigatório'),
  taxId: z
    .string()
    .min(1, 'CPF é obrigatório')
    .refine(
      (val) => HandleValidateCpf(stripNonDigits(val)),
      { message: 'CPF inválido' },
    ),
})

const schemaPJ = baseSchema.extend({
  personType: z.literal('PJ'),
  razaoSocial: z.string().min(1, 'Razão social é obrigatória'),
  cnpj: z
    .string()
    .min(1, 'CNPJ é obrigatório')
    .refine(
      (val) => HandleValidateCnpj(stripNonDigits(val)),
      { message: 'CNPJ inválido' },
    ),
  nomeResponsavel: z
    .string()
    .min(1, 'Nome completo do responsável é obrigatório'),
  cpfResponsavel: z
    .string()
    .min(1, 'CPF do responsável é obrigatório')
    .refine(
      (val) => HandleValidateCpf(stripNonDigits(val)),
      { message: 'CPF do responsável inválido' },
    ),
})

const schema = z.discriminatedUnion('personType', [schemaPF, schemaPJ])

type FormType = z.infer<typeof schema>

const ADDITIONAL_USER_PRICE = 1500

export default function SubscriptionPage() {
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [additionalUsers, setAdditionalUsers] = useState(0)

  const { data: session } = useSession()
  const router = useRouter()

  const trialEndsAt = session?.company?.plan?.trialEndsAt

  const isExpired = trialEndsAt ? new Date(trialEndsAt) < new Date() : false

  // Verificar se há assinatura paga pendente de ativação
  // Isso cobre o caso onde o usuário pagou mas fechou a página antes de ir para /concluir
  useQuery({
    queryKey: ['check-subscription-status'],
    queryFn: async () => {
      const response = await createItemNew({
        route: '/subscriptions/check-status',
      })

      if (response.success) {
        const status = response.data?.status

        // Se a assinatura foi ativada ou já estava ativa, redirecionar
        if (status === 'activated' || status === 'already_active') {
          toast.success('Sua assinatura está ativa!')
          router.replace('/assinatura/concluir')
          return response.data
        }
      }

      return response.data
    },
    // Só executa se o trial expirou (usuário está nesta página por causa disso)
    enabled: isExpired,
    // Não refazer a query automaticamente
    refetchOnWindowFocus: false,
    retry: false,
  })

  // Buscar planos da API
  const { data: plansResponse, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const response = await getData({
        route: '/plan/public/subscription',
      })

      if (!response.success) {
        toast.error(response.message || 'Erro ao carregar planos')
        return []
      }

      return response.data || []
    },
  })

  // Buscar módulos da API
  const { data: modulesResponse } = useQuery({
    queryKey: ['subscription-modules'],
    queryFn: async () => {
      const response = await getData({
        route: '/plan/public/modules',
      })

      if (!response.success) {
        toast.error(response.message || 'Erro ao carregar módulos')
        return []
      }

      return response.data || []
    },
  })

  const plans: VisualPlanType[] = useMemo(
    () => plansResponse || [],
    [plansResponse],
  )

  const modules: ModuleType[] = useMemo(
    () => modulesResponse || [],
    [modulesResponse],
  )

  // Definir o primeiro plano como selecionado quando os dados forem carregados
  useEffect(() => {
    if (plans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(plans[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans])

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      personType: 'PF',
      billingType: 'CREDIT_CARD',
      name: '',
      taxId: '',
      email: '',
      phone: '',
      mobile: '',
      zipCode: '',
      state: '',
      city: '',
      neighborhood: '',
      number: '',
      street: '',
      complement: '',
    },
  })

  const {
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = form

  const selectedPersonType = watch('personType')

  // Cálculo do total dos módulos (usando key para identificar)
  const modulesTotal = selectedModules.reduce((total, moduleKey) => {
    const selectedModule = modules.find((m) => m.key === moduleKey)
    return total + (selectedModule?.price || 0)
  }, 0)

  const additionalUsersTotal = additionalUsers * ADDITIONAL_USER_PRICE

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId)

  // Cálculo do total
  const totalPrice =
    (selectedPlan?.basePrice || 0) + modulesTotal + additionalUsersTotal

  const onSubmit = async (customerData: FormType) => {
    if (!selectedPlanId) {
      toast.warning('Por favor, selecione um plano')
      return
    }

    if (!agreedToTerms) {
      toast.warning('Você deve aceitar os termos para continuar')
      return
    }

    // Strip non-digits from document and phone fields before sending to API
    const cleanDigits = (val?: string) => val?.replace(/\D/g, '') || ''

    const customerName =
      customerData.personType === 'PF'
        ? customerData.name
        : customerData.razaoSocial

    const customerDocument =
      customerData.personType === 'PF'
        ? cleanDigits(customerData.taxId)
        : cleanDigits(customerData.cnpj)

    const data = {
      planId: selectedPlanId,
      additionalUsers,
      additionalFeatures: selectedModules,
      billingType: customerData.billingType,
      customer: {
        name: customerName,
        document: customerDocument,
        email: customerData.email,
        phone: cleanDigits(customerData.phone),
        postalCode: cleanDigits(customerData.zipCode),
        state: customerData.state,
        city: customerData.city,
        province: customerData.neighborhood,
        addressNumber: customerData.number,
        address: customerData.street,
        complement: customerData.complement,
      },
      successUrl: IS_DEV_ENV
        ? 'https://homolog.atrupe.com.br/assinatura/concluir'
        : 'https://app.atrupe.com.br/assinatura/concluir',
    }

    const subscriptionId = ''

    let res = null

    try {
      if (subscriptionId) {
        // Upgrade de subscription
        res = await updateItemNew({
          route: `/subscriptions/${subscriptionId}/upgrade`,
          data,
        })
      } else {
        // Criar subscription com chave de idempotência para prevenir duplicação
        const idempotencyKey = generateIdempotencyKey()
        res = await createItemNew({
          route: '/subscriptions',
          data,
          headers: {
            'idempotency-key': idempotencyKey,
          },
        })
      }

      if (!res.success) {
        toast.error(res.message || 'Erro ao criar checkout!')
        return
      }

      console.info(res)

      const paymentUrl = res.data?.payment?.paymentUrl || res.data?.paymentUrl

      // Verificar se recebemos a URL do checkout
      if (!paymentUrl) {
        toast.error('URL de checkout não recebida')
        return
      }

      // Redirecionar para o checkout do Asaas
      window.location.href = paymentUrl
    } catch (error) {
      console.error('Erro ao processar assinatura:', error)
      toast.error('Erro ao processar assinatura')
    }
  }

  return (
    <div
      className={cn(
        'w-full bg-gray-100',
        isSubmitting && 'pointer-events-none',
      )}
    >
      <header className="flex flex-wrap justify-between gap-2 bg-white px-6 py-4">
        <div className="flex items-center gap-1">
          <Button
            asChild
            type="button"
            size="icon"
            variant="neutralLight"
            className="bg-transparent"
          >
            <Link href={isExpired ? '/logout' : '/dashboard'}>
              <IconArrowLeft />
            </Link>
          </Button>
          <h1 className="text-gray-800 font-semibold text-lg">Assinatura</h1>
        </div>
        <Logo text />
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Form {...form}>
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Plano Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-1">
                  Plano
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Escolha o plano mais compatível com o seu negócio.
                </p>
                <div className="space-y-4">
                  <PlanCard
                    plans={plans}
                    selectedPlanId={selectedPlanId}
                    onSelectPlan={setSelectedPlanId}
                    isLoading={isLoadingPlans}
                  />
                </div>
              </div>

              {/* Módulos Adicionais Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-1">
                  Módulos adicionais
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Contrate recursos adicionais para impulsionar o seu plano.
                </p>
                <div className="space-y-4">
                  <ModuleCard
                    modules={modules}
                    selectedModules={selectedModules}
                    onSelectModule={setSelectedModules}
                  />
                </div>
              </div>

              {/* Usuários adicionais Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-1">
                  Usuários adicionais
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Contrate usuários adicionais para uma melhor organização do
                  seu time.
                </p>
                <Card>
                  <CardContent className="flex justify-between items-center p-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl text-gray-700 font-semibold">
                        {formatCurrencyToBrl(ADDITIONAL_USER_PRICE)}
                      </span>
                      <span className="text-sm text-gray">
                        {' '}
                        /mês por usuário
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="iconMd"
                        aria-label="Remover usuário"
                        RightIcon={IconMinus}
                        disabled={additionalUsers === 0}
                        onClick={() => {
                          setAdditionalUsers((prev) => Math.max(0, prev - 1))
                        }}
                      />
                      <Input
                        inputMode="numeric"
                        className="w-16 text-center"
                        value={additionalUsers}
                        onChange={(e) => {
                          setAdditionalUsers(Number(e.target.value))
                        }}
                      />
                      <Button
                        type="button"
                        size="iconMd"
                        aria-label="Adicionar usuário"
                        RightIcon={IconPlus}
                        onClick={() => {
                          setAdditionalUsers((prev) => prev + 1)
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Dados complementares Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-1">
                  Dados complementares
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Informações para emissão de suas Notas Fiscais.
                </p>
                <Card>
                  <CardContent className="p-6">
                    <form
                      id="subscription-form"
                      onSubmit={handleSubmit(onSubmit)}
                      noValidate
                      className="flex flex-wrap gap-5"
                    >
                      <FormToggleCard
                        name="personType"
                        options={personTypeOptions}
                      />

                      {/* Campos específicos por tipo */}
                      {selectedPersonType === 'PF' ? (
                        <>
                          <FormInput
                            name="name"
                            label="Nome completo"
                            width="w-full mt-2"
                          />
                          <div className="flex w-full flex-wrap gap-5">
                            <CpfOrCnpjField
                              name="taxId"
                              label="CPF"
                              placeholder="000.000.000-00"
                              width="flex-[1_1_300px]"
                            />
                            <FormInput
                              name="email"
                              label="E-mail"
                              width="flex-[1_1_300px]"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <FormInput
                            name="razaoSocial"
                            label="Razão social"
                            width="w-full mt-2"
                          />
                          <CpfOrCnpjField
                            name="cnpj"
                            label="CNPJ"
                            placeholder="00.000.000/0000-00"
                            width="w-full"
                          />
                          <FormInput
                            name="nomeResponsavel"
                            label="Nome completo do responsável"
                            width="w-full"
                          />
                          <div className="flex w-full flex-wrap gap-5">
                            <CpfOrCnpjField
                              name="cpfResponsavel"
                              label="CPF do responsável"
                              placeholder="000.000.000-00"
                              width="flex-[1_1_300px]"
                            />
                            <FormInput
                              name="email"
                              label="E-mail"
                              width="flex-[1_1_300px]"
                            />
                          </div>
                        </>
                      )}

                      {/* Campos comuns */}
                      <div className="flex w-full flex-wrap gap-5">
                        <FormInput
                          name="phone"
                          label="Telefone"
                          width="flex-[1_1_300px]"
                        />
                        <FormInput
                          name="mobile"
                          label="Celular"
                          width="flex-[1_1_300px]"
                        />
                      </div>
                      <div className="flex w-full flex-wrap gap-5">
                        <FormInputZipCode
                          name="zipCode"
                          label="CEP"
                          width="flex-[1_1_300px]"
                          addressFields={{
                            street: 'street',
                            neighborhood: 'neighborhood',
                            city: 'city',
                            state: 'state',
                          }}
                        />
                        <FormInput
                          name="state"
                          label="Estado"
                          width="flex-[1_1_300px]"
                        />
                      </div>
                      <div className="flex w-full flex-wrap gap-5">
                        <FormInput
                          name="city"
                          label="Cidade"
                          width="flex-[1_1_300px]"
                        />
                        <FormInput
                          name="neighborhood"
                          label="Bairro"
                          width="flex-[1_1_300px]"
                        />
                      </div>
                      <div className="flex w-full flex-wrap gap-5">
                        <FormInput
                          name="number"
                          label="Número"
                          width="flex-[1_0_100px]"
                        />
                        <FormInput
                          name="street"
                          label="Rua"
                          width="flex-[1_1_400px]"
                        />
                      </div>
                      <FormInput
                        name="complement"
                        label="Complemento"
                        width="w-full"
                      />
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Summary - Right Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-700">
                      Resumo da assinatura
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-2 space-y-6">
                    <Separator />
                    <div className="space-y-6">
                      {selectedPlanId && (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <IconCheck
                              size={16}
                              className="text-brand-400 stroke-[3px]"
                            />
                            <span className="text-gray text-sm">
                              Atrupe {selectedPlan?.name}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1 text-sm">
                            <span className="text-gray-600 font-semibold">
                              {formatCurrencyToBrl(
                                selectedPlan?.basePrice || 0,
                              )}
                            </span>
                            <span className="text-gray">/mês</span>
                          </div>
                        </div>
                      )}
                      {selectedModules.map((moduleKey) => {
                        const selectedModule = modules.find(
                          (m) => m.key === moduleKey,
                        )

                        if (!selectedModule) return null

                        return (
                          <div
                            key={moduleKey}
                            className="flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2">
                              <IconCheck
                                size={16}
                                className="text-brand-400 stroke-[3px]"
                              />
                              <span className="text-gray text-sm">
                                Módulo {selectedModule.name}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1 text-sm">
                              <span className="text-gray-600 font-semibold">
                                {formatCurrencyToBrl(selectedModule.price)}
                              </span>
                              <span className="text-gray">/mês</span>
                            </div>
                          </div>
                        )
                      })}
                      {additionalUsers > 0 && (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <IconCheck
                              size={16}
                              className="text-brand-400 stroke-[3px]"
                            />
                            <span className="text-gray text-sm">
                              {additionalUsers}{' '}
                              {additionalUsers === 1
                                ? 'Usuário adicional'
                                : 'Usuários adicionais'}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1 text-sm">
                            <span className="text-gray-600 font-semibold">
                              {formatCurrencyToBrl(additionalUsersTotal)}
                            </span>
                            <span className="text-gray">/mês</span>
                          </div>
                        </div>
                      )}
                      {isLoadingPlans ? (
                        <div className="flex justify-between">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                      ) : (
                        !selectedPlanId &&
                        selectedModules.length === 0 &&
                        additionalUsers === 0 && (
                          <div>
                            <p className="text-gray text-sm">
                              Selecione um plano
                            </p>
                          </div>
                        )
                      )}
                    </div>
                    <Separator />

                    <FormToggleCard
                      name="billingType"
                      options={billingTypeOptions}
                      groupClassName="flex-wrap"
                    />

                    <Separator />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-gray-700 font-semibold">
                        Total
                      </span>
                      <div className="flex items-center gap-1">
                        <IconCoin className="text-blue" />
                        <div className="flex items-baseline gap-1">
                          <span className="text-gray-700 font-bold text-lg">
                            {formatCurrencyToBrl(totalPrice)}
                          </span>
                          <span className="text-sm text-gray">/mês</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-2 pt-4">
                      <Checkbox
                        id="terms"
                        checked={agreedToTerms}
                        onCheckedChange={(checked: boolean) => {
                          setAgreedToTerms(checked)
                        }}
                      />
                      <label htmlFor="terms" className="text-sm text-gray-700">
                        Estou de acordo com os{' '}
                        <SubscriptionTerms onAgreeChange={setAgreedToTerms} />{' '}
                        da Atrupe.
                      </label>
                    </div>
                    <Button
                      type="submit"
                      form="subscription-form"
                      className="w-full"
                      disabled={!agreedToTerms}
                      isLoading={isSubmitting}
                    >
                      Avançar
                      {!isSubmitting && <IconArrowRight />}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
