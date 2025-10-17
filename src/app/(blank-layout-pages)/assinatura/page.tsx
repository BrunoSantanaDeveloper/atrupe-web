'use client'

import { z } from 'zod'
import Link from 'next/link'
import {
  IconUser,
  IconCoin,
  IconPlus,
  IconCheck,
  IconMinus,
  IconArrowLeft,
  IconArrowRight,
  IconBuildingCommunity,
} from '@tabler/icons-react'
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { modules } from '@/consts/plans'
import { Logo } from '@/components/Logo'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { PlanCard } from './components/PlanCard'
import { formatCurrencyToBrl } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import type { VisualPlanType } from '@/types/plans'
import { ModuleCard } from './components/ModuleCard'
import { useState, useEffect, useMemo } from 'react'
import { Separator } from '@/components/ui/separator'
import { zodResolver } from '@hookform/resolvers/zod'
import { createItemNew, getData } from '@/actions/_cruds'
import { Input } from '@/components/ui/input-uncontrolled'
import { FormInput } from '@/components/common/form/FormInput'
import { ProgressCircle } from '@/components/ui/progress-circle'
import { SubscriptionTerms } from './components/SubscriptionTerms'
import { FormToggleCard } from '@/components/common/form/FormToggleCard'
import { FormInputZipCode } from '@/components/common/form/FormInputZipCode'
import { Skeleton } from '@/components/ui/skeleton'

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

const baseSchema = z.object({
  type: z.enum(['PF', 'PJ']),
  // Campos comuns
  email: z.string().email('E-mail inválido').min(1, 'E-mail é obrigatório'),
  phone: z.string().optional(),
  mobile: z.string().min(1, 'Celular é obrigatório'),
  zipCode: z.string().min(1, 'CEP é obrigatório'),
  state: z.string().min(1, 'Estado é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  number: z.string(),
  street: z.string().min(1, 'Rua é obrigatória'),
  complement: z.string().optional(),
})

const schemaPF = baseSchema.extend({
  type: z.literal('PF'),
  name: z.string().min(1, 'Nome completo é obrigatório'),
  taxId: z.string().min(1, 'CPF é obrigatório'),
})

const schemaPJ = baseSchema.extend({
  type: z.literal('PJ'),
  razaoSocial: z.string().min(1, 'Razão social é obrigatória'),
  cnpj: z.string().min(1, 'CNPJ é obrigatório'),
  nomeResponsavel: z
    .string()
    .min(1, 'Nome completo do responsável é obrigatório'),
  cpfResponsavel: z.string().min(1, 'CPF do responsável é obrigatório'),
})

const schema = z.discriminatedUnion('type', [schemaPF, schemaPJ])

type FormType = z.infer<typeof schema>

const ADDITIONAL_USER_PRICE = 1500

export default function SubscriptionPage() {
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [additionalUsers, setAdditionalUsers] = useState(0)
  const [isValidating, setIsValidating] = useState(false)
  const [progress, setProgress] = useState(0)

  const router = useRouter()

  const { data: session, update } = useSession()

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

  const plans: VisualPlanType[] = useMemo(
    () => plansResponse || [],
    [plansResponse],
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
      type: 'PF',
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

  const { handleSubmit, watch } = form

  const selectedPersonType = watch('type')

  // Cálculo do total dos módulos
  const modulesTotal = selectedModules.reduce((total, moduleId) => {
    const selectedModule = modules.find((m) => m.id === moduleId)
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

    setIsValidating(true)

    const body = {
      selectedPlanId,
      selectedModules,
      additionalUsers,
      customerData,
      agreedToTerms,
    }

    const res = await createItemNew({
      route: '/plan/subscription',
      data: body,
    })

    if (!res.success) {
      toast.error(res.message || 'Erro!')
      setIsValidating(false)
      setProgress(0)
      return
    }

    toast.success('Plano contratado com sucesso!')

    try {
      // Atualizar a sessão local com os novos dados
      if (session?.company?.id) {
        await update({
          company: {
            plan: {
              name: selectedPlan?.name,
              features: res.data.features,
            },
          },
        })
      }
    } catch (error) {
      console.error('Erro ao atualizar dados da empresa:', error)
      router.replace('/logout')
      toast.warning('Faça o login novamente')
    }

    setProgress(100)

    router.replace('/')
  }

  if (isValidating) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex flex-col items-center justify-center gap-8 w-full">
          <Card className="rounded-2xl w-full max-w-[464px] mx-auto px-8 py-10">
            <CardHeader className="p-0 mb-8 text-center">
              <CardTitle className="text-xl font-bold">
                Validando dados
              </CardTitle>
              <CardDescription>
                Estamos atualizando as informações da sua assinatura.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <ProgressCircle value={progress} size={180} />
            </CardContent>
          </Card>
          <Logo text width={154} />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-gray-100">
      <header className="flex flex-wrap justify-between gap-2 bg-white px-6 py-4">
        <div className="flex items-center gap-1">
          <Button
            asChild
            type="button"
            size="icon"
            variant="neutralLight"
            className="bg-transparent"
          >
            <Link href="/dashboard">
              <IconArrowLeft />
            </Link>
          </Button>
          <h1 className="text-gray-800 font-semibold text-lg">Assinatura</h1>
        </div>
        <Logo text />
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                Contrate usuários adicionais para uma melhor organização do seu
                time.
              </p>
              <Card>
                <CardContent className="flex justify-between items-center p-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl text-gray-700 font-semibold">
                      {formatCurrencyToBrl(ADDITIONAL_USER_PRICE)}
                    </span>
                    <span className="text-sm text-gray"> /mês por usuário</span>
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
                  <Form {...form}>
                    <form
                      id="subscription-form"
                      onSubmit={handleSubmit(onSubmit)}
                      noValidate
                      className="flex flex-wrap gap-5"
                    >
                      <FormToggleCard options={personTypeOptions} />

                      {/* Campos específicos por tipo */}
                      {selectedPersonType === 'PF' ? (
                        <>
                          <FormInput
                            name="name"
                            label="Nome completo"
                            width="w-full mt-2"
                          />
                          <div className="flex w-full flex-wrap gap-5">
                            <FormInput
                              name="taxId"
                              label="CPF"
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
                          <FormInput name="cnpj" label="CNPJ" width="w-full" />
                          <FormInput
                            name="nomeResponsavel"
                            label="Nome completo do responsável"
                            width="w-full"
                          />
                          <div className="flex w-full flex-wrap gap-5">
                            <FormInput
                              name="cpfResponsavel"
                              label="CPF do responsável"
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
                  </Form>
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
                <CardContent className="p-6 pt-2 space-y-8">
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
                            {formatCurrencyToBrl(selectedPlan?.basePrice || 0)}
                          </span>
                          <span className="text-gray">/mês</span>
                        </div>
                      </div>
                    )}
                    {selectedModules.map((moduleId) => {
                      const selectedModule = modules.find(
                        (m) => m.id === moduleId,
                      )

                      if (!selectedModule) return null

                      return (
                        <div
                          key={moduleId}
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
                      <SubscriptionTerms onAgreeChange={setAgreedToTerms} /> da
                      Atrupe.
                    </label>
                  </div>
                  <Button
                    type="submit"
                    form="subscription-form"
                    className="w-full"
                    disabled={!agreedToTerms}
                  >
                    Avançar
                    <IconArrowRight />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
