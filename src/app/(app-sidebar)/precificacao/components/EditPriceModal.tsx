'use client'

// O modal de precificação do recurso (PR-2, PR-4), no desenho do Figma
// "Editar precificação": preço variável (informa o lucro, calcula o preço)
// ou preço fixo (informa o preço, calcula o lucro); o resumo decompõe o preço
// em custo, tributação, custo financeiro, comissão e lucro, em % e em R$; a
// estimativa do mês multiplica custo e preço pela média de venda. Não mostra
// "markup" (DC-13). Alinhado ao design.md em 03/10/2026.

// React / Next
import { useEffect, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
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
import { updateItemPrice, getPricingSummary } from '@/actions/pricing'

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
  // Quem grava o preço, quando não é o mock da Precificação: o produto da
  // lista grava no cadastro (API). Devolve { success, message }
  onSave?: (values: {
    rule: PriceRule
    price: number
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

  const { data: summary } = useQuery({
    staleTime: Infinity,
    queryKey: ['pricing-summary'],
    queryFn: () => getPricingSummary(),
  })
  const parameters = summary?.data?.parameters

  const cost = item?.cost ?? null
  // Encargos em fração: tributação + custo financeiro + comissão (PR-4)
  const charges = parameters
    ? (parameters.taxation + parameters.financialCost + parameters.commission) /
      1000
    : 0

  // Ao abrir: a regra e o preço do item; o lucro vem do preço praticado,
  // ou da margem desejada da empresa quando ainda não há preço
  useEffect(() => {
    if (!item || !open) return
    // Sem preço ainda, abre no variável: já mostra o preço sugerido pela
    // margem da empresa, em vez de um formulário vazio
    setRule(item.price ? item.rule : 'VARIABLE')
    setPrice(item.price ? (item.price / 100).toFixed(2) : '')
    const currentProfit =
      item.price && item.cost !== null
        ? (1 - item.cost / item.price - charges) * 100
        : parameters
          ? parameters.desiredMargin / 10
          : 0
    setProfit(currentProfit.toFixed(1))
    setVolume('')
  }, [item, open, charges, parameters])

  // Preço variável: preço = custo ÷ (1 − encargos − lucro), o método divisor
  const profitFraction = toNumber(profit) / 100
  const variablePrice =
    cost !== null && 1 - charges - profitFraction > 0
      ? Math.round(cost / (1 - charges - profitFraction))
      : null
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

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      onSave
        ? onSave({ rule, price: effectivePrice || 0 })
        : updateItemPrice({
            group,
            id: item?.id || '',
            rule,
            price: effectivePrice || 0,
          }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)
      toast.success('Preço salvo')
      queryClient.invalidateQueries({ queryKey: ['pricing-items'] })
      queryClient.invalidateQueries({ queryKey: ['pricing-summary'] })
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
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
                  value={item?.sector || ''}
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
                  {rule === 'VARIABLE'
                    ? 'Sem custo não há como calcular o preço pelo lucro. Use o preço fixo, ou monte a composição para o custo aparecer.'
                    : 'Sem custo, o resumo não mostra a margem. O preço fixo pode ser gravado mesmo assim.'}
                </p>
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
            disabled={!effectivePrice || (rule === 'VARIABLE' && cost === null)}
            onClick={() => mutate()}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
