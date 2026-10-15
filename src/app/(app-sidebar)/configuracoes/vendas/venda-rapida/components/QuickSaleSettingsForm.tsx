'use client'

// React
import { useEffect, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { AsyncSelectBasic } from '@/components/common/form/AsyncSelectBasic'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { QuickSalePayment } from '../types'

// Hooks / Store / Consts
import { cn } from '@/lib/utils'

// Actions
import {
  getQuickSaleOptions,
  getQuickSaleSettings,
  updateQuickSaleSettings,
} from '@/actions/quick-sale'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// A venda rápida pula o modal de novo orçamento (VR-1). O que o vendedor
// deixaria de preencher a cada venda é definido aqui, uma vez.
export function QuickSaleSettingsForm() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['quick-sale-settings'],
    queryFn: () => getQuickSaleSettings(),
  })

  const settings = data?.data

  const [enabled, setEnabled] = useState(true)
  // O cliente padrão é um cliente de verdade, não um nome digitado: criar o
  // orçamento exige clientId (ALT-22)
  const [client, setClient] = useState<{ value: string; label: string } | null>(
    null,
  )
  const [description, setDescription] = useState('')
  const [seriesId, setSeriesId] = useState('')
  const [serviceTypeId, setServiceTypeId] = useState('')
  const [responsibleId, setResponsibleId] = useState('none')
  const [payment, setPayment] = useState<QuickSalePayment>('CASH_ONLY')
  const [cashMethods, setCashMethods] = useState<string[]>([])
  const [downPaymentRequired, setDownPaymentRequired] = useState(false)
  const [downPaymentPercent, setDownPaymentPercent] = useState(50)

  // O responsável é um contato do cliente padrão: as opções seguem o cliente
  const { data: optionsData } = useQuery({
    staleTime: Infinity,
    queryKey: ['quick-sale-options', client?.value ?? ''],
    queryFn: () => getQuickSaleOptions(client?.value),
  })
  const options = optionsData?.data

  useEffect(() => {
    if (!settings) return

    setEnabled(settings.enabled)
    setClient(
      settings.clientId
        ? { value: settings.clientId, label: settings.clientName }
        : null,
    )
    setDescription(settings.description)
    setSeriesId(settings.seriesId)
    setServiceTypeId(settings.serviceTypeId)
    setResponsibleId(settings.responsibleId || 'none')
    setPayment(settings.payment)
    setCashMethods(settings.cashMethods)
    setDownPaymentRequired(settings.downPaymentRequired)
    setDownPaymentPercent(settings.downPaymentPercent)
  }, [settings])

  const toggleMethod = (value: string) =>
    setCashMethods((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    )

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      updateQuickSaleSettings({
        enabled,
        clientId: client?.value || '',
        clientName: client?.label || '',
        description,
        seriesId,
        serviceTypeId,
        responsibleId: responsibleId === 'none' ? null : responsibleId,
        payment,
        cashMethods,
        downPaymentRequired,
        downPaymentPercent,
      }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Venda rápida atualizada')
      queryClient.invalidateQueries({ queryKey: ['quick-sale-settings'] })
    },
    onError: () => toast.error('Erro ao salvar'),
  })

  if (isLoading) return <Skeleton className="h-[calc(100vh-150px)]" />

  return (
    <div className="space-y-5">
      <Topbar
        review="new"
        title="Venda rápida"
        previousPage="/configuracoes/vendas"
        supportText="A venda de balcão, sem cadastro e sem perguntas"
      />

      <Card>
        <CardContent className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
          <div className="max-w-2xl">
            <p className="font-medium">Usar venda rápida</p>
            <p className="text-sm text-gray">
              Ligada, ela aparece no menu de Vendas. O vendedor não passa pelo
              cadastro do orçamento: cai direto na escolha do item, que é onde a
              venda acontece — uma cópia, um par de impressões, o atendimento de
              balcão.
            </p>
          </div>
          <PermissionGate permissions={['sales_settings:series:edit']}>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              aria-label="Usar venda rápida"
            />
          </PermissionGate>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>O que o sistema preenche sozinho</CardTitle>
          <CardDescription>
            São os campos do modal de novo orçamento. Definidos aqui uma vez,
            eles deixam de ser perguntados a cada venda.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <AsyncSelectBasic
                route="/client"
                width="w-full"
                value={client}
                onChange={(value) => {
                  setClient(value)
                  // O responsável era contato do cliente anterior
                  setResponsibleId('none')
                }}
                minChars={1}
                label="Cliente padrão"
                placeholder="Busque o cliente da venda de balcão"
              />
              <p className="text-sm text-gray">
                Toda venda rápida nasce neste cliente. Costuma ser a própria
                empresa ou um cliente final genérico, tipo
                &quot;Consumidor&quot; — crie uma vez em Cadastros e escolha
                aqui. Se a venda precisar de nota ou parcelamento, o vendedor
                troca o cliente dentro do orçamento, e o pré-cadastro continua
                disponível ali.
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="quick-description"
                className="text-sm font-medium"
              >
                Descrição do serviço
              </label>
              <Input
                id="quick-description"
                value={description}
                placeholder="Deixe vazio para os itens descreverem a venda"
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <SelectBasic
              name="series"
              label="Série"
              value={seriesId}
              onChange={setSeriesId}
              options={options?.series || []}
            />

            <SelectBasic
              name="serviceType"
              label="Atendimento"
              value={serviceTypeId}
              onChange={setServiceTypeId}
              options={options?.serviceTypes || []}
            />

            <div className="space-y-1.5">
              <p className="text-sm font-medium">Vendedor</p>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                Sempre o usuário que está usando o sistema
              </div>
            </div>

            <SelectBasic
              name="responsible"
              label="Responsável"
              value={responsibleId}
              onChange={setResponsibleId}
              options={options?.users || []}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-between flex-wrap gap-3">
          <p className="text-sm text-gray">
            A venda rápida continua sendo um orçamento comum, marcado como
            rápida: ela segue o mesmo caminho para aprovação, ordem de serviço e
            financeiro.
          </p>
          <PermissionGate permissions={['sales_settings:series:edit']}>
            <Button isLoading={isPending} onClick={() => save()}>
              Salvar
            </Button>
          </PermissionGate>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como a venda é recebida</CardTitle>
          <CardDescription>
            A venda de balcão não fica em aberto: ou ela é cobrada na hora, ou
            vai para a frente de caixa fechar com o restante do movimento.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPayment('CASH_ONLY')}
              className={cn(
                'rounded-lg border p-4 text-left',
                payment === 'CASH_ONLY'
                  ? 'border-brand-500 bg-brand-25'
                  : 'border-gray-200 bg-white',
              )}
            >
              <p className="font-medium">Cobrar na hora, só à vista</p>
              <p className="text-sm text-gray">
                A venda se encerra no atendimento, sem parcelar e sem gerar
                cobrança futura.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setPayment('POS')}
              className={cn(
                'rounded-lg border p-4 text-left',
                payment === 'POS'
                  ? 'border-brand-500 bg-brand-25'
                  : 'border-gray-200 bg-white',
              )}
            >
              <p className="font-medium">Enviar para a frente de caixa</p>
              <p className="text-sm text-gray">
                A venda vai para o PDV, onde o recebimento é feito junto com o
                caixa do dia.
              </p>
            </button>
          </div>

          {payment === 'CASH_ONLY' && (
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Meios aceitos</p>
              <div className="flex flex-wrap gap-2">
                {(options?.cashMethods || []).map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => toggleMethod(method.value)}
                    className={cn(
                      'rounded-lg border px-4 py-2 text-sm',
                      cashMethods.includes(method.value)
                        ? 'border-brand-500 bg-white font-medium text-brand-700'
                        : 'border-gray-200 bg-white text-gray-600',
                    )}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray">
                Sem meio selecionado, a venda rápida não consegue ser fechada.
              </p>
            </div>
          )}

          {payment === 'POS' && (
            <div className="space-y-4 rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="font-medium">Entrada obrigatória (sinal)</p>
                  <p className="text-sm text-gray">
                    Quando o cliente deixa o trabalho para buscar depois, o
                    caixa só libera com a entrada mínima paga. O restante é
                    cobrado na retirada. Quem tem permissão pode dispensar o
                    sinal caso a caso.
                  </p>
                </div>
                <PermissionGate permissions={['sales_settings:series:edit']}>
                  <Switch
                    checked={downPaymentRequired}
                    onCheckedChange={setDownPaymentRequired}
                    aria-label="Entrada obrigatória"
                  />
                </PermissionGate>
              </div>
              {downPaymentRequired && (
                <div className="w-full max-w-[200px] space-y-1.5">
                  <label
                    htmlFor="quick-down-payment"
                    className="text-sm font-medium"
                  >
                    Percentual do sinal
                  </label>
                  <Input
                    id="quick-down-payment"
                    type="number"
                    min={1}
                    max={100}
                    step="1"
                    endAdornment={<span className="text-sm">%</span>}
                    value={downPaymentPercent}
                    onChange={(event) =>
                      setDownPaymentPercent(Number(event.target.value) || 0)
                    }
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <PermissionGate permissions={['sales_settings:series:edit']}>
            <Button isLoading={isPending} onClick={() => save()}>
              Salvar
            </Button>
          </PermissionGate>
        </CardFooter>
      </Card>
    </div>
  )
}
