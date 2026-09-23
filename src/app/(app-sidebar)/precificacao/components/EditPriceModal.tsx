'use client'

// React / Next
import { useEffect, useState } from 'react'

// UI
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
import { Input } from '@/components/ui/input'

// Types
import type { PriceRule, PricingGroup, PricingItem } from '../types'

// Actions
import { updateItemPrice, getPricingSummary } from '@/actions/pricing'

// Hooks / Store / Consts
import { cn, formatCurrencyToBrl } from '@/lib/utils'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconCurrencyReal } from '@tabler/icons-react'

interface Props {
  group: PricingGroup
  item?: PricingItem
  open: boolean
  onOpenChange: () => void
}

// O resumo decompõe o preço nos quatro parâmetros oficiais: tributação,
// comissão, custo financeiro e margem (PR-4).
export function EditPriceModal({ group, item, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()
  const [rule, setRule] = useState<PriceRule>('FIXED')
  const [price, setPrice] = useState(0)

  const { data: summary } = useQuery({
    staleTime: Infinity,
    queryKey: ['pricing-summary'],
    queryFn: () => getPricingSummary(),
  })

  const parameters = summary?.data?.parameters

  useEffect(() => {
    if (!item) return

    setRule(item.rule)
    setPrice(item.price || 0)
  }, [item])

  const cost = item?.cost ?? null

  // Preço variável: o preço acompanha o custo pelo markup de referência.
  const suggestedPrice =
    cost !== null && parameters?.markup
      ? Math.round(cost * parameters.markup)
      : null

  const effectivePrice = rule === 'VARIABLE' ? suggestedPrice || 0 : price

  const share = (percent?: number) =>
    percent ? Math.round((effectivePrice * percent) / 1000) : 0

  const margin =
    cost !== null && effectivePrice
      ? Math.round(((effectivePrice - cost) / effectivePrice) * 1000) / 10
      : null

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      updateItemPrice({
        group,
        id: item?.id || '',
        rule,
        price: effectivePrice,
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

  const lines = [
    {
      label: 'Preço de venda',
      percent: 1000,
      value: effectivePrice,
      strong: true,
    },
    { label: 'Custo', percent: null, value: cost || 0 },
    { label: 'Tributação', percent: parameters?.taxation, value: null },
    { label: 'Comissão', percent: parameters?.commission, value: null },
    {
      label: 'Custo financeiro',
      percent: parameters?.financialCost,
      value: null,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconCurrencyReal} />
            <DialogTitle>Editar precificação</DialogTitle>
            <DialogDescription className="sr-only">
              Defina a regra de preço e o preço praticado do item.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ['VARIABLE', 'Preço variável', 'Acompanha o custo'],
                    ['FIXED', 'Preço fixo', 'O preço não muda'],
                  ] as const
                ).map(([value, label, description]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={rule === value}
                    onClick={() => setRule(value)}
                    className={cn(
                      'rounded-lg border p-3 text-left transition-colors',
                      rule === value
                        ? 'border-brand bg-success-25'
                        : 'border-gray-200 hover:border-gray-300',
                    )}
                  >
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block text-xs text-gray">
                      {description}
                    </span>
                  </button>
                ))}
              </div>

              <div>
                <p className="text-sm text-gray">Item</p>
                <p className="text-sm font-medium">{item?.name}</p>
                <p className="text-sm text-gray">
                  {item?.sector} · {item?.unit}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray">Custo atual</p>
                <p className="text-sm font-medium">
                  {cost === null
                    ? 'Custo não calculado'
                    : formatCurrencyToBrl(cost)}
                </p>
              </div>

              {rule === 'FIXED' ? (
                <div className="space-y-1.5">
                  <label
                    htmlFor="price"
                    className="text-sm font-medium text-gray-900"
                  >
                    Preço de venda
                  </label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    step="0.01"
                    startAdornment={<span className="text-sm">R$</span>}
                    value={(price / 100).toFixed(2)}
                    onChange={(event) =>
                      setPrice(
                        Math.round(Number(event.target.value || 0) * 100),
                      )
                    }
                  />
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray">
                    Preço sugerido pelo markup de referência
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {suggestedPrice === null
                      ? '-'
                      : formatCurrencyToBrl(suggestedPrice)}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 p-4 space-y-3">
              <p className="text-sm font-medium text-center">
                Resumo de precificação
              </p>
              {lines.map((line) => (
                <div
                  key={line.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className={line.strong ? 'font-medium' : 'text-gray'}>
                    {line.label}
                  </span>
                  <span className="flex items-center gap-3">
                    {line.percent !== null && (
                      <span className="text-gray">
                        {((line.percent || 0) / 10)
                          .toFixed(1)
                          .replace('.', ',')}
                        %
                      </span>
                    )}
                    <span className="text-gray-900">
                      {line.value !== null
                        ? formatCurrencyToBrl(line.value)
                        : formatCurrencyToBrl(share(line.percent || 0))}
                    </span>
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm border-t border-gray-200 pt-3">
                <span className="font-medium">Margem</span>
                <span
                  className={
                    margin !== null && margin < 0
                      ? 'text-error-700 font-medium'
                      : 'text-gray-900 font-medium'
                  }
                >
                  {margin === null
                    ? '-'
                    : `${margin.toString().replace('.', ',')}%`}
                </span>
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            isLoading={isPending}
            disabled={cost === null}
            onClick={() => mutate()}
          >
            {isPending ? 'Salvando...' : 'Salvar preço'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
