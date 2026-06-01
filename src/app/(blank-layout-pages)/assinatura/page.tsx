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
  IconAlertTriangle,
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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  createItemNew,
  getData,
  getItem,
  updateItemNew,
} from '@/actions/_cruds'
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'
import { generateIdempotencyKey } from '@/lib/idempotency'
import { useRouter } from 'next/navigation'
import { refreshPlanFeatures } from '@/actions/subscription'

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
  billingType: z.enum(['CREDIT_CARD', 'PIX', 'BOLETO']),
})

const schemaPF = baseSchema.extend({
  personType: z.literal('PF'),
  name: z.string().min(1, 'Nome completo é obrigatório'),
  taxId: z
    .string()
    .min(1, 'CPF é obrigatório')
    .refine((val) => HandleValidateCpf(stripNonDigits(val)), {
      message: 'CPF inválido',
    }),
})

const schemaPJ = baseSchema.extend({
  personType: z.literal('PJ'),
  razaoSocial: z.string().min(1, 'Razão social é obrigatória'),
  cnpj: z
    .string()
    .min(1, 'CNPJ é obrigatório')
    .refine((val) => HandleValidateCnpj(stripNonDigits(val)), {
      message: 'CNPJ inválido',
    }),
})

const schema = z.discriminatedUnion('personType', [schemaPF, schemaPJ])

type FormType = z.infer<typeof schema>

const ADDITIONAL_USER_PRICE = 1500

export default function SubscriptionPage() {
  const { data: session, update: updateSession } = useSession()
  const router = useRouter()

  const trialEndsAt = session?.company?.plan?.trialEndsAt
  const isExpired = trialEndsAt ? new Date(trialEndsAt) < new Date() : false

  // Fetch active subscription to detect if user already has a paid plan
  const { data: activeSubRes, isLoading: isLoadingActiveSub } = useQuery({
    queryKey: ['active-subscription-check'],
    queryFn: async () => {
      const response = await getItem({ route: '/subscriptions/active' })
      if (!response.success) return null
      return response.data
    },
    refetchOnWindowFocus: false,
  })

  // Determine if we're in "add module" mode (user has active non-TRIAL subscription)
  const activeSubscription = activeSubRes
  const isAddModuleMode =
    !!activeSubscription &&
    activeSubscription.status === 'ACTIVE' &&
    activeSubscription.plan?.planType !== 'TRIAL'

  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [additionalUsers, setAdditionalUsers] = useState(0)

  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discountType: 'PERCENT' | 'VALUE'
    discountValue: number
    minPlanValue: number | null
  } | null>(null)
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)

  const handleApplyCoupon = async (code: string) => {
    if (!code) return
    setIsValidatingCoupon(true)
    setCouponError(null)
    try {
      const response = await createItemNew({
        route: '/coupons/validate',
        data: {
          code: code.trim().toUpperCase(),
          planId: selectedPlanId || undefined,
          isModuleAddition: isAddModuleMode,
        },
      })

      if (response.success && response.data?.coupon) {
        setAppliedCoupon(response.data.coupon)
        toast.success('Cupom aplicado com sucesso!')
      } else {
        setAppliedCoupon(null)
        setCouponError(response.message || 'Cupom inválido ou expirado.')
      }
    } catch (err) {
      setAppliedCoupon(null)
      const errorMsg =
        err instanceof Error ? err.message : 'Erro ao validar cupom.'
      setCouponError(errorMsg)
    } finally {
      setIsValidatingCoupon(false)
    }
  }

  useEffect(() => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError(null)
  }, [selectedPlanId, isAddModuleMode])

  // Check if we have an INACTIVE pending checkout subscription
  const isPendingCheckout =
    !!activeSubscription &&
    activeSubscription.status === 'INACTIVE' &&
    activeSubscription.plan?.planType !== 'TRIAL' &&
    activeSubscription.payments &&
    activeSubscription.payments.length > 0

  const pendingPaymentUrl = isPendingCheckout
    ? activeSubscription.payments[0]?.invoiceUrl ||
      activeSubscription.payments[0]?.bankSlipUrl
    : null

  // Keys of modules already contracted in the active subscription
  const alreadyContractedModuleKeys: string[] = useMemo(() => {
    if (!isAddModuleMode || !activeSubscription?.subscriptionFeatures) return []
    interface SubFeature {
      isActive?: boolean
      feature?: { key?: string }
    }
    return (activeSubscription.subscriptionFeatures as SubFeature[])
      .filter((sf) => sf.isActive !== false)
      .map((sf) => sf.feature?.key)
      .filter(Boolean) as string[]
  }, [isAddModuleMode, activeSubscription])

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

  const allModules: ModuleType[] = useMemo(
    () => modulesResponse || [],
    [modulesResponse],
  )

  // In add-module mode, filter out modules already contracted
  const modules: ModuleType[] = useMemo(() => {
    if (!isAddModuleMode) return allModules
    return allModules.filter(
      (m) => !alreadyContractedModuleKeys.includes(m.key),
    )
  }, [allModules, isAddModuleMode, alreadyContractedModuleKeys])

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
      personType: 'PJ',
      billingType: 'CREDIT_CARD',
      name: '',
      taxId: '',
      email: '',
      razaoSocial: '',
      cnpj: '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  })

  // Prefill form based on user session data
  useEffect(() => {
    if (session) {
      if (!form.getValues('email')) {
        form.setValue('email', session.user?.email || '')
      }
      form.setValue('name', session.user?.name || '')
      form.setValue(
        'razaoSocial',
        session.company?.legalName || session.company?.name || '',
      )
    }
  }, [session, form])

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
  // In add-module mode, only charge for new modules (no plan base price)
  const totalPrice = isAddModuleMode
    ? modulesTotal
    : (selectedPlan?.basePrice || 0) + modulesTotal + additionalUsersTotal

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0
    if (appliedCoupon.minPlanValue && totalPrice < appliedCoupon.minPlanValue)
      return 0

    if (appliedCoupon.discountType === 'PERCENT') {
      return Math.round(totalPrice * (appliedCoupon.discountValue / 100))
    } else if (appliedCoupon.discountType === 'VALUE') {
      return Math.min(appliedCoupon.discountValue, totalPrice)
    }
    return 0
  }, [appliedCoupon, totalPrice])

  const finalPrice = Math.max(0, totalPrice - couponDiscount)

  // Handler for add-module mode (adds modules to existing subscription)
  const onSubmitAddModule = async () => {
    if (selectedModules.length === 0) {
      toast.warning('Selecione pelo menos um módulo para adicionar')
      return
    }

    if (!agreedToTerms) {
      toast.warning('Você deve aceitar os termos para continuar')
      return
    }

    try {
      const subId = activeSubscription.id

      // Add each selected module sequentially
      for (const moduleKey of selectedModules) {
        const route = appliedCoupon
          ? `/subscriptions/${subId}/modules/${moduleKey}?couponCode=${appliedCoupon.code}`
          : `/subscriptions/${subId}/modules/${moduleKey}`

        const res = await updateItemNew({
          route,
          data: {},
        })

        if (!res.success) {
          toast.error(res.message || `Erro ao adicionar módulo ${moduleKey}`)
          return
        }
      }

      // Refresh session to include new features
      const refreshResult = await refreshPlanFeatures()
      if (refreshResult.success) {
        await updateSession({
          company: {
            plan: {
              name: refreshResult.planName,
              active: refreshResult.active,
              features: refreshResult.features,
              limits: refreshResult.limits,
            },
          },
        })
      }

      toast.success(
        selectedModules.length === 1
          ? 'Módulo adicionado com sucesso!'
          : `${selectedModules.length} módulos adicionados com sucesso!`,
      )

      // NOTE: The added module value will be included in the next billing cycle.
      // No immediate charge is generated — the subscription value in Asaas is updated
      // and the new total takes effect on the next invoice.

      router.replace('/configuracoes/empresa-e-sistema/assinatura')
    } catch (error) {
      console.error('Erro ao adicionar módulo:', error)
      toast.error('Erro ao adicionar módulo')
    }
  }

  const onSubmit = async (customerData: FormType) => {
    // In add-module mode, use the dedicated handler
    if (isAddModuleMode) {
      await onSubmitAddModule()
      return
    }

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
      couponCode: appliedCoupon?.code || undefined,
      customer: {
        name: customerName,
        document: customerDocument,
        email: customerData.email,
        mobilePhone: undefined,
        postalCode: undefined,
        state: undefined,
        city: undefined,
        province: undefined,
        addressNumber: undefined,
        address: undefined,
        complement: undefined,
      },
      successUrl: IS_DEV_ENV
        ? 'https://homolog.atrupe.com.br/assinatura/concluir'
        : 'https://app.atrupe.com.br/assinatura/concluir',
    }

    let res = null

    try {
      // Criar subscription com chave de idempotência para prevenir duplicação
      const idempotencyKey = generateIdempotencyKey()
      res = await createItemNew({
        route: '/subscriptions',
        data,
        headers: {
          'idempotency-key': idempotencyKey,
        },
      })

      if (!res.success) {
        const msg = (res.message || '').toLowerCase()
        if (
          res.status === 401 ||
          msg.includes('unauthorized') ||
          msg.includes('não autorizado')
        ) {
          toast.error(
            'Sua sessão expirou. Faça login novamente para continuar.',
            {
              action: {
                label: 'Fazer login',
                onClick: () => {
                  window.location.href = '/login'
                },
              },
              duration: 10000,
            },
          )
          return
        }

        if (msg.includes('checkout já está em andamento')) {
          toast.warning(
            'Já existe um checkout em andamento. Aguarde a confirmação ou acesse a cobrança pendente na página de assinatura.',
            { duration: 8000 },
          )
          return
        }

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
      toast.error('Erro inesperado ao processar assinatura. Tente novamente.')
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
            <Link
              href={
                isAddModuleMode
                  ? '/configuracoes/empresa-e-sistema/assinatura'
                  : isExpired
                    ? '/logout'
                    : '/dashboard'
              }
            >
              <IconArrowLeft />
            </Link>
          </Button>
          <h1 className="text-gray-800 font-semibold text-lg">
            {isAddModuleMode ? 'Adicionar módulo' : 'Assinatura'}
          </h1>
        </div>
        <Logo text />
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Form {...form}>
            <div className="lg:col-span-2 space-y-6">
              {/* Checkout pending warning */}
              {isPendingCheckout && (
                <Alert
                  variant="warning"
                  className="border-warning-200 bg-warning-50"
                >
                  <IconAlertTriangle className="h-5 w-5 text-warning-600" />
                  <AlertTitle className="text-warning-800 font-semibold text-lg">
                    Pagamento pendente
                  </AlertTitle>
                  <AlertDescription className="space-y-4 mt-2">
                    <p className="text-warning-800">
                      Identificamos um checkout recente gerado por você que está
                      aguardando pagamento. Se você gerou um PIX ou Boleto para
                      atualizar o seu plano, você pode acessar a fatura ou
                      copiar o PIX através do link abaixo para finalizar a
                      contratação.
                    </p>
                    {pendingPaymentUrl && (
                      <Button
                        asChild
                        size="sm"
                        variant="default"
                        className="w-[max-content] mt-2"
                      >
                        <a
                          href={pendingPaymentUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Acessar cobrança
                        </a>
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Add Module Mode — info banner */}
              {isAddModuleMode && (
                <Card className="border-brand-200 bg-brand-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-brand-800 font-medium">
                      Seu plano{' '}
                      <span className="font-bold">
                        {activeSubscription.plan?.name}
                      </span>{' '}
                      está ativo. Selecione os módulos adicionais que deseja
                      contratar.
                    </p>
                    <p className="text-xs text-brand-600 mt-1">
                      O valor dos novos módulos será incluído na sua próxima
                      fatura mensal.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Plano Section — hidden in add-module mode */}
              {!isAddModuleMode && (
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
              )}

              {/* Módulos Adicionais Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-1">
                  {isAddModuleMode
                    ? 'Módulos disponíveis'
                    : 'Módulos adicionais'}
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  {isAddModuleMode
                    ? 'Selecione os módulos que deseja adicionar ao seu plano.'
                    : 'Contrate recursos adicionais para impulsionar o seu plano.'}
                </p>
                <div className="space-y-4">
                  {modules.length > 0 ? (
                    <ModuleCard
                      modules={modules}
                      selectedModules={selectedModules}
                      onSelectModule={setSelectedModules}
                    />
                  ) : isAddModuleMode ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-500 text-sm">
                          Todos os módulos disponíveis já estão contratados no
                          seu plano.
                        </p>
                      </CardContent>
                    </Card>
                  ) : null}
                </div>
              </div>

              {/* Usuários adicionais Section — hidden in add-module mode */}
              {!isAddModuleMode && (
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
              )}

              {/* Dados complementares Section — hidden in add-module mode */}
              {!isAddModuleMode && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-700 mb-1">
                    Dados complementares
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Informações do responsável pela contratação.
                  </p>
                  <Card>
                    <CardContent className="p-6">
                      <form
                        id="subscription-form"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onSubmit={handleSubmit(onSubmit as any)}
                        noValidate
                        className="flex flex-wrap gap-5"
                      >
                        <FormToggleCard
                          name="personType"
                          options={personTypeOptions}
                        />

                        {/* Campos específicos por tipo */}
                        {selectedPersonType === 'PF' ? (
                          <div className="w-full space-y-5">
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
                          </div>
                        ) : (
                          <div className="w-full space-y-5">
                            <FormInput
                              name="razaoSocial"
                              label="Razão social"
                              width="w-full mt-2"
                            />
                            <div className="flex w-full flex-wrap gap-5">
                              <CpfOrCnpjField
                                name="cnpj"
                                label="CNPJ"
                                placeholder="00.000.000/0000-00"
                                width="flex-[1_1_300px]"
                              />
                              <FormInput
                                name="email"
                                label="E-mail"
                                width="flex-[1_1_300px]"
                              />
                            </div>
                          </div>
                        )}
                      </form>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Hidden form for add-module mode (bypasses validation) */}
              {isAddModuleMode && (
                <form
                  id="subscription-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    onSubmitAddModule()
                  }}
                />
              )}
            </div>

            {/* Summary - Right Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-700">
                      {isAddModuleMode
                        ? 'Resumo dos módulos'
                        : 'Resumo da assinatura'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-2 space-y-6">
                    <Separator />
                    <div className="space-y-6">
                      {/* Show plan info only in checkout mode */}
                      {!isAddModuleMode && selectedPlanId && (
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
                      {!isAddModuleMode && additionalUsers > 0 && (
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
                      {isLoadingPlans || isLoadingActiveSub ? (
                        <div className="flex justify-between">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                      ) : isAddModuleMode && selectedModules.length === 0 ? (
                        <div>
                          <p className="text-gray text-sm">
                            Selecione um módulo para adicionar
                          </p>
                        </div>
                      ) : (
                        !isAddModuleMode &&
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

                    {/* Billing type — hidden in add-module mode (uses existing) */}
                    {!isAddModuleMode && (
                      <FormToggleCard
                        name="billingType"
                        options={billingTypeOptions}
                        groupClassName="flex-wrap"
                      />
                    )}

                    <Separator />

                    {/* Seção de Cupom de Desconto */}
                    <div className="space-y-3 pt-2">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Cupom de desconto
                        </span>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ex: BEMVINDO20"
                            className="h-9 text-sm uppercase"
                            value={couponCode}
                            onChange={(e) =>
                              setCouponCode(e.target.value.toUpperCase())
                            }
                            disabled={isValidatingCoupon || !!appliedCoupon}
                          />
                          {appliedCoupon ? (
                            <Button
                              type="button"
                              variant="destructive"
                              className="h-9 px-3 text-xs"
                              onClick={() => {
                                setAppliedCoupon(null)
                                setCouponCode('')
                              }}
                            >
                              Remover
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              className="h-9 px-4 text-xs font-semibold"
                              onClick={() => handleApplyCoupon(couponCode)}
                              disabled={!couponCode || isValidatingCoupon}
                              isLoading={isValidatingCoupon}
                            >
                              Aplicar
                            </Button>
                          )}
                        </div>
                      </div>

                      {couponError && (
                        <p className="text-xs font-semibold text-red-500">
                          {couponError}
                        </p>
                      )}

                      {appliedCoupon && (
                        <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold bg-green-50 border border-green-200/50 rounded-lg p-2.5">
                          <IconCheck size={14} className="stroke-[3px]" />
                          <span>
                            Cupom <strong>{appliedCoupon.code}</strong>{' '}
                            aplicado: -
                            {appliedCoupon.discountType === 'PERCENT'
                              ? `${appliedCoupon.discountValue}%`
                              : formatCurrencyToBrl(
                                  appliedCoupon.discountValue,
                                )}
                          </span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {couponDiscount > 0 && (
                      <>
                        <div className="flex items-center justify-between gap-2 text-green-600">
                          <span className="text-sm font-medium">
                            Desconto ({appliedCoupon?.code})
                          </span>
                          <span className="text-sm font-semibold">
                            -{formatCurrencyToBrl(couponDiscount)}
                          </span>
                        </div>
                        <Separator />
                      </>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-gray-700 font-semibold">
                        {isAddModuleMode ? 'Acréscimo mensal' : 'Total'}
                      </span>
                      <div className="flex items-center gap-1">
                        <IconCoin className="text-blue" />
                        <div className="flex items-baseline gap-1">
                          <span className="text-gray-700 font-bold text-lg">
                            {formatCurrencyToBrl(finalPrice)}
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
                      disabled={
                        !agreedToTerms ||
                        (isAddModuleMode && selectedModules.length === 0)
                      }
                      isLoading={isSubmitting}
                    >
                      {isAddModuleMode ? 'Adicionar módulo' : 'Avançar'}
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
