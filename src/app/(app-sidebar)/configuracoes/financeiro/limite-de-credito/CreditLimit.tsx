'use client'

import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IconArrowRight, IconAlertTriangle } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'
import { Checkbox } from '@/components/ui/checkbox'
import { Form } from '@/components/ui/form'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionTrigger } from '@/components/ui/accordion'
import { AccordionContent, AccordionItem } from '@radix-ui/react-accordion'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { getDataOld, updateItemNew } from '@/actions/_cruds'
import { toast } from 'sonner'
import { usePlanErrorToast } from '@/hooks/usePlanErrorToast'
import { extractConditions } from '@/app/(app-sidebar)/cadastros/clientes/components/NewClient/utils/ExtractConditions'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FormRadio } from '@/components/common/form/FormRadio'
import { RiskHint } from '@/components/common/RiskHint'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
export function metadata() {
  return {
    title: 'Limite de Crédito',
  }
}

const baseFields = z.object({
  minValue: z.number(),
  maxValue: z.number(),
  paymentMethods: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      conditions: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          isActive: z.boolean(),
        }),
      ),
    }),
  ),
  applyMinValueToAll: z.boolean().optional(),
  applyMaxValueToAll: z.boolean().optional(),
  applyPaymentMethodsToAll: z.boolean().optional(),
  // A quem o "aplicar" vale (decisão de 24/10/2026)
  applyTo: z.enum(['PROSPECT', 'ACTIVE', 'ALL']).optional(),
})
const creditLimitSchema = z.object({
  person: baseFields,
  company: baseFields,
})

type CreditLimitFormType = z.infer<typeof creditLimitSchema>

export function CreditLimit() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'person' | 'company'>('person')
  const queryClient = useQueryClient()
  const { notifyActionError } = usePlanErrorToast()

  const { data: creditLimit } = useQuery<CreditLimitFormType>({
    staleTime: Infinity,
    queryKey: ['credit-limit'],
    queryFn: () =>
      getDataOld({
        route: 'creditLimitRoute',
      }),
  })
  const parsedValues = {
    person: {
      ...creditLimit?.person,
      minValue: creditLimit?.person.minValue || 0,
      maxValue: creditLimit?.person.maxValue || 0,
      applyTo: 'ALL' as const,
    },
    company: {
      ...creditLimit?.company,
      minValue: creditLimit?.company.minValue || 0,
      maxValue: creditLimit?.company.maxValue || 0,
      applyTo: 'ALL' as const,
    },
  }

  const form = useForm<CreditLimitFormType>({
    resolver: zodResolver(creditLimitSchema),
    values: parsedValues as unknown as CreditLimitFormType,
    mode: 'onChange',
  })

  const personPaymentMethods = useFieldArray({
    name: 'person.paymentMethods',
    control: form.control,
  })

  const companyPaymentMethods = useFieldArray({
    name: 'company.paymentMethods',
    control: form.control,
  })

  const handleClose = () => {
    setOpen(false)
    form.reset()
    setActiveTab('person')
  }

  const onSubmit = async (data: CreditLimitFormType) => {
    try {
      // "Todos" é o que a API faz sem o campo: só manda o escopo quando ele
      // restringe, para a tela continuar salvando numa API sem o campo
      const scopeOf = (tab: typeof data.person) =>
        tab.applyTo && tab.applyTo !== 'ALL' ? { applyTo: tab.applyTo } : {}
      const newData = {
        ...data,
        person: {
          ...data.person,
          applyTo: undefined,
          ...scopeOf(data.person),
          conditions: extractConditions(data?.person?.paymentMethods),
          paymentMethods: undefined,
        },
        company: {
          ...data.company,
          applyTo: undefined,
          ...scopeOf(data.company),
          conditions: extractConditions(data?.company?.paymentMethods),
          paymentMethods: undefined,
        },
      }

      delete newData.person.paymentMethods
      delete newData.company.paymentMethods

      const res = await updateItemNew({
        route: '/financial/credit-limit',
        data: newData,
      })

      if (!res.success) {
        // O limite de crédito é recurso de plano: o servidor recusa sem ele.
        notifyActionError(
          res,
          'Erro ao atualizar limite de crédito, tente novamente',
        )
        return
      }

      // O padrão e, com o "aplicar", os clientes: a tela do cliente mostrava
      // o limite guardado antes da mudança
      queryClient.invalidateQueries()

      toast.success('Limite de crédito padrão atualizado')
      setOpen(false)
      handleClose()
    } catch (error) {
      toast.error('Erro ao atualizar limite de crédito, tente novamente')
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleValidateAllTabs = async (data: any) => {
    const personIsValid = await form.trigger('person')
    const companyIsValid = await form.trigger('company')

    if (!personIsValid) {
      setActiveTab('person')
      toast.error('Preencha todos os campos obrigatórios')
    } else if (!companyIsValid) {
      setActiveTab('company')
      toast.error('Preencha todos os campos obrigatórios')
    } else {
      form.handleSubmit(onSubmit)(data)
    }
  }

  return (
    <>
      <Button RightIcon={IconArrowRight} onClick={() => setOpen(true)}>
        Configurar
      </Button>

      <Form {...form}>
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogContent
            className="max-w-[696px]"
            aria-describedby="alert-dialog-description"
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Limite de crédito padrão
                <RiskHint title="Limite de crédito padrão">
                  <p>
                    O limite cadastrado aqui é o que cada cliente novo recebe ao
                    ser cadastrado, conforme o tipo: pessoa física ou jurídica.
                  </p>
                  <p>
                    Os clientes que já existem não mudam, a não ser pelas opções
                    avançadas, que aplicam o padrão aos clientes escolhidos.
                  </p>
                </RiskHint>
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <Tabs
                value={activeTab}
                onValueChange={(value) =>
                  setActiveTab(value as 'person' | 'company')
                }
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="person">Pessoa Física</TabsTrigger>
                  <TabsTrigger value="company">Pessoa Jurídica</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormBrlInput
                      key={`${activeTab}-minValue`}
                      name={`${activeTab}.minValue`}
                      label="Valor mínimo para venda"
                      placeholder="0,00"
                      startAdornment={<>R$</>}
                    />
                    <FormBrlInput
                      key={`${activeTab}-maxValue`}
                      name={`${activeTab}.maxValue`}
                      label="Valor máximo para venda"
                      placeholder="0,00"
                      startAdornment={<>R$</>}
                    />
                  </div>

                  <div className="space-y-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between py-2 border-b h-11 bg-white cursor px-6 border-gray-50 text-gray-500 text-xs rounded-t-lg">
                      <p>Forma de pagamento</p>
                      <p>Parcelamento</p>
                      <p></p>
                    </div>

                    {activeTab === 'person' &&
                      personPaymentMethods.fields?.map(
                        (method, methodIndex) => (
                          <div key={method.id}>
                            <div className="w-full bg-gray-100 h-11 px-6 border-gray-200 flex items-center">
                              <h3 className="type-body-strong">
                                {method.name}
                              </h3>
                            </div>

                            <div>
                              {method.conditions.map(
                                (condition, conditionIndex) => (
                                  <div
                                    key={`${methodIndex}-${conditionIndex}`}
                                    className="flex items-center justify-between py-2 border-b h-[72px] bg-white cursor px-6 border-gray-200 text-gray-900 text-sm"
                                  >
                                    <p>{condition.name}</p>
                                    <p>{condition.name}</p>
                                    <Switch
                                      checked={condition.isActive}
                                      onCheckedChange={(checked) => {
                                        const newMethods = [
                                          ...form.getValues(
                                            'person.paymentMethods',
                                          ),
                                        ]
                                        newMethods[methodIndex].conditions[
                                          conditionIndex
                                        ].isActive = checked
                                        form.setValue(
                                          'person.paymentMethods',
                                          newMethods,
                                        )
                                      }}
                                    />
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        ),
                      )}

                    {activeTab === 'company' &&
                      companyPaymentMethods.fields?.map(
                        (method, methodIndex) => (
                          <div key={method.id}>
                            <div className="w-full bg-gray-100 h-11 px-6 border-gray-200 flex items-center">
                              <h3 className="type-body-strong">
                                {method.name}
                              </h3>
                            </div>

                            <div>
                              {method.conditions.map(
                                (condition, conditionIndex) => (
                                  <div
                                    key={`${methodIndex}-${conditionIndex}`}
                                    className="flex items-center justify-between py-2 border-b h-[72px] bg-white cursor px-6 border-gray-200 text-gray-900 text-sm"
                                  >
                                    <p>{condition.name}</p>
                                    <p>{condition.name}</p>
                                    <Switch
                                      checked={condition.isActive}
                                      onCheckedChange={(checked) => {
                                        const newMethods = [
                                          ...form.getValues(
                                            'company.paymentMethods',
                                          ),
                                        ]
                                        newMethods[methodIndex].conditions[
                                          conditionIndex
                                        ].isActive = checked
                                        form.setValue(
                                          'company.paymentMethods',
                                          newMethods,
                                        )
                                      }}
                                    />
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        ),
                      )}
                  </div>

                  <Card className="space-y-4">
                    <Accordion type="single" collapsible>
                      <AccordionItem
                        value="item-1"
                        className="p-0 m-0 border-0"
                      >
                        <CardHeader>
                          <div className="flex justify-between">
                            <CardTitle>Opções avançadas</CardTitle>
                            <AccordionTrigger
                              className={cn(
                                buttonVariants({
                                  variant: 'neutralLight',
                                  size: 'icon',
                                }),
                                'mr-0 [&>svg]:text-gray [&>svg]:size-5',
                              )}
                            />
                          </div>
                        </CardHeader>
                        <AccordionContent>
                          <Separator />
                          <CardContent className="p-6">
                            <Alert className="bg-warning-50 border border-warning-50 mb-6">
                              <Icon
                                icon={IconAlertTriangle}
                                size="md"
                                className="stroke-warning-600"
                              />
                              <AlertTitle className="text-warning-600">
                                Atenção
                              </AlertTitle>

                              <AlertDescription className="text-sm font-normal text-gray-500">
                                Ao marcar as opções abaixo, o limite dos
                                clientes escolhidos, do tipo desta aba, é
                                trocado pelo novo padrão, inclusive os limites
                                personalizados.
                              </AlertDescription>
                            </Alert>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">
                                  Aplicar a
                                </p>
                                <FormRadio
                                  name={`${activeTab}.applyTo`}
                                  className="w-full"
                                  items={[
                                    {
                                      value: 'PROSPECT',
                                      label: 'Pré-cadastros',
                                    },
                                    {
                                      value: 'ACTIVE',
                                      label: 'Cadastros aprovados',
                                    },
                                    {
                                      value: 'ALL',
                                      label: 'Todos (inclusive inativos)',
                                    },
                                  ]}
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="minValue"
                                  checked={form.watch(
                                    `${activeTab}.applyMinValueToAll`,
                                  )}
                                  onCheckedChange={(checked) =>
                                    form.setValue(
                                      `${activeTab}.applyMinValueToAll`,
                                      checked as boolean,
                                    )
                                  }
                                />
                                <label htmlFor="minValue" className="text-sm">
                                  Aplicar o valor mínimo para venda aos clientes
                                  escolhidos
                                </label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="maxValue"
                                  checked={form.watch(
                                    `${activeTab}.applyMaxValueToAll`,
                                  )}
                                  onCheckedChange={(checked) =>
                                    form.setValue(
                                      `${activeTab}.applyMaxValueToAll`,
                                      checked as boolean,
                                    )
                                  }
                                />
                                <label htmlFor="maxValue" className="text-sm">
                                  Aplicar o valor máximo para venda aos clientes
                                  escolhidos
                                </label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="paymentMethods"
                                  checked={form.watch(
                                    `${activeTab}.applyPaymentMethodsToAll`,
                                  )}
                                  onCheckedChange={(checked) =>
                                    form.setValue(
                                      `${activeTab}.applyPaymentMethodsToAll`,
                                      checked as boolean,
                                    )
                                  }
                                />
                                <label
                                  htmlFor="paymentMethods"
                                  className="text-sm"
                                >
                                  Aplicar as formas de pagamento aos clientes
                                  escolhidos
                                </label>
                              </div>
                            </div>
                          </CardContent>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="neutralOutline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleValidateAllTabs}
                isLoading={form.formState.isSubmitting}
              >
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Form>
    </>
  )
}
