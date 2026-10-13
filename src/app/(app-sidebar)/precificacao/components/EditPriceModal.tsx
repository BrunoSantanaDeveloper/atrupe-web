'use client'

// O modal de precificação do recurso (PR-2, PR-4), no desenho do Figma
// "Editar precificação": preço variável (informa o lucro, calcula o preço)
// ou preço fixo (informa o preço, calcula o lucro); o resumo decompõe o preço
// em custo, tributação, custo financeiro, comissão e lucro, em % e em R$; a
// estimativa do mês multiplica custo e preço pela média de venda. Não mostra
// "markup" (DC-13). Alinhado ao design.md em 03/10/2026.
//
// A conta daqui é só simulação: quem calcula e grava é a API. Mão de obra e
// máquinas gravam em /pricing/item; material e produto gravam no próprio
// cadastro, por `onSave`.

// React / Next
import { useEffect, useRef, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FeaturedIcon } from '@/components/ui/featured-icon'
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

// Types
import type { PriceRule, PricingGroup, PricingItem } from '../types'

// Actions
import { updateItemPrice, getPricingParameters } from '@/actions/pricing'

// Hooks / Store / Consts
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import { ProductPriceTiers } from '@/app/(app-sidebar)/configuracoes/produtos/components/ProductPriceTiers'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconCircle,
  IconPercentage,
  IconCircleCheck,
  IconCurrencyReal,
  IconCircleCheckFilled,
} from '@tabler/icons-react'

interface Props {
  group: PricingGroup
  item?: PricingItem
  open: boolean
  onOpenChange: () => void
  // Quem grava o preço, quando não é a rota da Precificação (mão de obra e
  // máquinas): o material e o produto gravam no cadastro. Devolve
  // { success, message }. No preço variável vai também o lucro informado, em
  // décimos de ponto (300 = 30,0 %): o servidor refaz a conta com ele
  onSave?: (values: {
    rule: PriceRule
    price: number
    desiredMargin?: number
  }) => Promise<{ success: boolean; message: string }>
  // No produto, a tabela por faixa de quantidade (FQ-1) fica aqui, junto do
  // preço (orientação do time, 03/10/2026)
  priceTiers?: { productId: string; unitKind: string }
}

const toNumber = (text: string) => Number(text.replace(',', '.')) || 0
const percentText = (value: number | null) =>
  value === null ? '-' : `${value.toFixed(1).replace('.', ',')}%`

export function EditPriceModal({
  group,
  item,
  open,
  onOpenChange,
  onSave,
  priceTiers,
}: Props) {
  const queryClient = useQueryClient()
  const [rule, setRule] = useState<PriceRule>('VARIABLE')
  // Em texto, para a pessoa digitar com vírgula
  const [price, setPrice] = useState('')
  const [profit, setProfit] = useState('')
  const [volume, setVolume] = useState('')

  // Só os parâmetros (a rota aceita também quem edita produto), e só com o
  // modal aberto: fechado, ele continua montado nas listas
  const { data: parametersData, isLoading: isLoadingParameters } = useQuery({
    staleTime: Infinity,
    enabled: open,
    queryKey: ['pricing-parameters'],
    queryFn: () => getPricingParameters(),
  })
  const parameters = parametersData?.data || undefined
  const parametersError =
    parametersData && !parametersData.success ? parametersData.message : ''

  // A leitura que falhou não fica guardada: quando este modal fecha, ela sai
  // do cache, e a próxima abertura tenta de novo. Só no fechamento do
  // próprio modal: a tela de materiais monta dois, e o que está fechado não
  // pode apagar a leitura do que está aberto
  const wasOpen = useRef(false)
  useEffect(() => {
    if (wasOpen.current && !open && parametersError) {
      queryClient.resetQueries({ queryKey: ['pricing-parameters'] })
    }
    wasOpen.current = open
  }, [open, parametersError, queryClient])

  const cost = item?.cost ?? null
  // Encargos em décimos de ponto: tributação + custo financeiro + comissão
  // (PR-4)
  const chargesTenths = parameters
    ? parameters.taxation + parameters.financialCost + parameters.commission
    : 0

  // Ao abrir: a regra e o preço do item; o lucro é o gravado no preço
  // variável, senão o que o preço praticado deixa, ou a margem desejada da
  // empresa quando ainda não há preço
  useEffect(() => {
    // Espera os parâmetros: sem eles o lucro sairia errado e seria trocado
    // depois, por cima do que a pessoa já tivesse digitado
    if (!item || !open || isLoadingParameters) return
    // Sem preço ainda, abre no variável: já mostra o preço sugerido pela
    // margem da empresa, em vez de um formulário vazio
    setRule(item.price ? item.rule : 'VARIABLE')
    setPrice(item.price ? (item.price / 100).toFixed(2) : '')
    const currentProfit =
      item.rule === 'VARIABLE' && typeof item.profit === 'number'
        ? item.profit / 10
        : item.price && item.cost !== null
          ? (1 - item.cost / item.price - chargesTenths / 1000) * 100
          : parameters
            ? parameters.desiredMargin / 10
            : 0
    setProfit(currentProfit.toFixed(1))
    setVolume('')
  }, [item, open, chargesTenths, parameters, isLoadingParameters])

  // Preço variável: preço = custo ÷ (1 − encargos − lucro), o método divisor,
  // na mesma ordem de contas da API (ela confere o preço com 1 centavo de
  // folga). O lucro vale com uma casa (décimos de ponto), como é guardado
  const profitTenths = Math.round(toNumber(profit) * 10)
  const divisor = 1 - (chargesTenths + profitTenths) / 1000
  const variablePrice =
    cost !== null && divisor > 0 ? Math.round(cost / divisor) : null
  const fixedPrice = Math.round(toNumber(price) * 100) || null
  const effectivePrice = rule === 'VARIABLE' ? variablePrice : fixedPrice

  const share = (tenths: number) =>
    effectivePrice ? Math.round((effectivePrice * tenths) / 1000) : null
  const taxValue = share(parameters?.taxation || 0)
  const financialValue = share(parameters?.financialCost || 0)
  const commissionValue = share(parameters?.commission || 0)
  const profitValue =
    effectivePrice && cost !== null
      ? effectivePrice -
        cost -
        (taxValue || 0) -
        (financialValue || 0) -
        (commissionValue || 0)
      : null
  const pct = (value: number | null) =>
    value === null || !effectivePrice ? null : (value / effectivePrice) * 100

  const rows = [
    {
      label: 'Preço de venda',
      percent: effectivePrice ? 100 : null,
      value: effectivePrice,
      tone: 'text-blue-600',
    },
    {
      label: 'Custo',
      percent: pct(cost),
      value: cost,
      tone: 'text-warning-600',
    },
    {
      label: 'Tributação',
      percent: parameters ? parameters.taxation / 10 : null,
      value: taxValue,
      tone: 'text-error-700',
    },
    {
      label: 'Custo financeiro',
      percent: parameters ? parameters.financialCost / 10 : null,
      value: financialValue,
      tone: 'text-error-700',
    },
    {
      label: 'Comissão',
      percent: parameters ? parameters.commission / 10 : null,
      value: commissionValue,
      tone: 'text-error-700',
    },
    {
      label: 'Lucro',
      percent: pct(profitValue),
      value: profitValue,
      tone:
        profitValue !== null && profitValue < 0
          ? 'text-error-700'
          : 'text-success-700',
    },
  ]

  const monthly = toNumber(volume)
  const monthlyCost = cost !== null && monthly ? cost * monthly : null
  const monthlySale =
    effectivePrice && monthly ? effectivePrice * monthly : null

  // A rota da Precificação só grava com custo ("Este item ainda não tem
  // custo calculado."); no cadastro quem decide é o `onSave`
  const needsCost = !onSave && cost === null
  // O que impede o preço variável, na frase da API quando ela tem uma
  const variableProblem =
    rule !== 'VARIABLE' || cost === null
      ? ''
      : profitTenths < 0
        ? 'Informe um lucro maior ou igual a zero.'
        : variablePrice === null
          ? 'O lucro e os encargos passam de 100% do preço.'
          : ''

  const invalidate = (...keys: string[]) =>
    keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }))

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      onSave
        ? onSave({
            rule,
            price: effectivePrice || 0,
            ...(rule === 'VARIABLE' ? { desiredMargin: profitTenths } : {}),
          })
        : updateItemPrice({
            group,
            id: item?.id || '',
            rule,
            price: effectivePrice || 0,
            // No variável quem manda é o lucro; o preço vai para conferência
            ...(rule === 'VARIABLE' ? { profit: profitTenths } : {}),
          }),
    onSuccess: (response) => {
      if (!response.success) {
        // "O preço mudou; abra o item de novo": o custo ou os parâmetros
        // desta tela ficaram velhos. Relê os dois para a próxima abertura
        invalidate('pricing-parameters', 'pricing-items', 'pricing-summary')
        return toast.error(response.message || 'Erro ao salvar o preço')
      }
      toast.success('Preço salvo')
      invalidate('pricing-items', 'pricing-summary')
      // O preço é gravado no cadastro (DC-6): a hora do setor aparece na mão
      // de obra da base de custos, e o da configuração, no detalhe do bem
      if (group === 'labor') invalidate('labor-sectors')
      if (group === 'machines') invalidate('asset', 'asset-groups')
      onOpenChange()
    },
    onError: () => toast.error('Erro ao salvar o preço'),
  })

  const options: {
    value: PriceRule
    label: string
    Icon: typeof IconPercentage
  }[] = [
    { value: 'VARIABLE', label: 'Preço variável', Icon: IconPercentage },
    { value: 'FIXED', label: 'Preço fixo', Icon: IconCurrencyReal },
  ]

  const unit = item?.unit || ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[960px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconCurrencyReal} />
            <div>
              <DialogTitle>Editar precificação</DialogTitle>
              <DialogDescription>
                {item?.name}
                {item?.code ? ` · ${item.code}` : ''}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody>
          {/* Sem os parâmetros a simulação segue sem encargos, como era antes
              de eles existirem: quem confere o preço é o servidor, ao salvar */}
          {parametersError && (
            <p className="mb-5 rounded-lg border border-warning-200 bg-warning-50 p-3 text-sm text-warning-800">
              Não foi possível ler os parâmetros da precificação (
              {parametersError}). A simulação abaixo está sem os encargos; o
              preço é conferido ao salvar.
            </p>
          )}
          {isLoadingParameters && (
            <Skeleton className="h-[320px] w-full rounded-lg" />
          )}
          <div
            className={cn(
              'grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]',
              isLoadingParameters && 'hidden',
            )}
          >
            <div className="space-y-5">
              {/* A regra: variável calcula o preço pelo lucro, fixo calcula o
                  lucro pelo preço (PR-2) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {options.map(({ value, label, Icon }) => {
                  const selected = rule === value
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setRule(value)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border bg-white p-3 text-left transition-colors',
                        selected
                          ? 'border-brand bg-success-25'
                          : 'border-gray-200 hover:border-gray-300',
                      )}
                    >
                      <FeaturedIcon
                        variant={selected ? 'light' : 'neutralOutline'}
                        size="sm"
                        rounded
                        Icon={Icon}
                      />
                      <span className="flex-1 text-sm font-medium text-gray-900">
                        {label}
                      </span>
                      {selected ? (
                        <IconCircleCheckFilled
                          size={20}
                          className="text-brand-600"
                          aria-hidden="true"
                        />
                      ) : (
                        <IconCircle
                          size={20}
                          className="text-gray-300"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="flex flex-col">
                <Label htmlFor="pricing-sector" className="mb-2">
                  Setor
                </Label>
                <Input
                  id="pricing-sector"
                  value={item?.sector || '-'}
                  disabled
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col">
                  <Label htmlFor="pricing-unit" className="mb-2">
                    Unidade comercial
                  </Label>
                  <Input id="pricing-unit" value={unit} disabled />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="pricing-volume" className="mb-2">
                    Média de venda
                  </Label>
                  <Input
                    id="pricing-volume"
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    placeholder="no mês"
                    endAdornment={
                      <span className="text-sm text-gray">{unit}</span>
                    }
                    value={volume}
                    onChange={(event) => setVolume(event.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col">
                  <Label htmlFor="pricing-profit" className="mb-2">
                    Lucro
                  </Label>
                  <Input
                    id="pricing-profit"
                    type="number"
                    min={0}
                    step="0.1"
                    inputMode="decimal"
                    endAdornment={<span className="text-sm text-gray">%</span>}
                    disabled={rule === 'FIXED'}
                    value={
                      rule === 'FIXED'
                        ? profitValue !== null && effectivePrice
                          ? ((profitValue / effectivePrice) * 100).toFixed(1)
                          : ''
                        : profit
                    }
                    onChange={(event) => setProfit(event.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="pricing-price" className="mb-2">
                    Preço de venda
                  </Label>
                  <Input
                    id="pricing-price"
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    startAdornment={<span className="text-sm">R$</span>}
                    disabled={rule === 'VARIABLE'}
                    placeholder="0,00"
                    value={
                      rule === 'VARIABLE'
                        ? variablePrice === null
                          ? ''
                          : (variablePrice / 100).toFixed(2)
                        : price
                    }
                    onChange={(event) => setPrice(event.target.value)}
                  />
                </div>
              </div>

              {cost === null && (
                <p className="text-sm text-gray">
                  {needsCost
                    ? 'Este item ainda não tem custo calculado. O preço pode ser definido quando o custo aparecer.'
                    : rule === 'VARIABLE'
                      ? 'Sem custo não há como calcular o preço pelo lucro. Use o preço fixo, ou monte a composição para o custo aparecer.'
                      : 'Sem custo, o resumo não mostra a margem. O preço fixo pode ser gravado mesmo assim.'}
                </p>
              )}
              {variableProblem && (
                <p className="text-sm text-error-700">{variableProblem}</p>
              )}
            </div>

            <div className="space-y-4">
              {/* O resumo decompõe o preço nos quatro parâmetros oficiais
                  (PR-4), em % do preço e em R$ */}
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <p className="border-b border-gray-200 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700">
                  Resumo de precificação
                </p>
                {rows.map((row, index) => (
                  <div
                    key={row.label}
                    className={cn(
                      'flex items-center justify-between gap-3 px-4 py-2.5 text-sm',
                      index < rows.length - 1 && 'border-b border-gray-100',
                    )}
                  >
                    <span className="text-gray-900">{row.label}</span>
                    <span className="flex items-center gap-4">
                      <span className="w-14 text-right text-gray">
                        {percentText(row.percent)}
                      </span>
                      <span
                        className={cn('w-24 text-right font-medium', row.tone)}
                      >
                        {row.value === null
                          ? '-'
                          : formatCurrencyToBrl(row.value)}
                      </span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Custo e venda do mês pela média de venda (PT-12) */}
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <p className="border-b border-gray-200 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700">
                  Estimativa do mês
                </p>
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 text-sm">
                  <span className="text-gray-900">Custo</span>
                  <span className="font-medium text-warning-600">
                    {monthlyCost === null
                      ? '-'
                      : formatCurrencyToBrl(monthlyCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="text-gray-900">Venda</span>
                  <span className="font-medium text-blue-600">
                    {monthlySale === null
                      ? '-'
                      : formatCurrencyToBrl(monthlySale)}
                  </span>
                </div>
                {!monthly && (
                  <p className="border-t border-gray-100 px-4 py-2 text-xs text-gray">
                    Informe a média de venda do mês para ver a estimativa.
                  </p>
                )}
              </div>
            </div>
          </div>
          {priceTiers && (
            <div className="mt-6 border-t border-gray-100 pt-5">
              <ProductPriceTiers
                productId={priceTiers.productId}
                unitKind={priceTiers.unitKind}
                basePriceCents={effectivePrice || 0}
              />
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="neutralOutline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            RightIcon={IconCircleCheck}
            isLoading={isPending}
            disabled={
              isLoadingParameters ||
              !effectivePrice ||
              needsCost ||
              !!variableProblem ||
              (rule === 'VARIABLE' && cost === null)
            }
            onClick={() => mutate()}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
