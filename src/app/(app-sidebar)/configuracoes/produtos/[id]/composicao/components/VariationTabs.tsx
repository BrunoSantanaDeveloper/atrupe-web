'use client'

// React
import { useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Components
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { ProductComposition } from '../types'

// Actions
import {
  addProductVariation,
  setVariationOverride,
  setVariationPrice,
  clearVariationOverride,
  removeProductVariation,
} from '@/actions/compositions'

// Hooks / Store / Consts
import { cn } from '@/lib/utils'
import { useMoney } from '@/hooks/useMoney'
import { assemblyOverrideObj } from '@/consts/productAssembly'
import { FEATURES } from '@/consts/features'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus, IconTrash, IconArrowBackUp } from '@tabler/icons-react'

interface Props {
  product: ProductComposition
}

// Variações do produto composto (PV-1 e PV-2). A variação nasce herdando a
// base; só o que for alterado aqui passa a ser dela, e o resto continua
// acompanhando — é o que evita a cópia que envelhece sozinha.
export function VariationTabs({ product }: Props) {
  // Preço só para quem tem a permissão de valores (§9)
  const money = useMoney()
  const queryClient = useQueryClient()
  const { hasFeature } = usePlanFeatures()

  // No LITE a variação é só nome e preço — campos digitáveis, sem composição.
  // No PRO ela também altera as etapas (ORC-6: o completo primeiro, o
  // reduzido depois)
  const hasComposition = hasFeature(FEATURES.COSTS.COST_BASE)
  const [current, setCurrent] = useState('base')
  const [name, setName] = useState('')

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['composition', product.id] })

  const onError = () => toast.error('Não foi possível concluir')

  const { mutate: add, isPending } = useMutation({
    mutationFn: () => addProductVariation({ productId: product.id, name }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Variação criada')
      setName('')
      invalidate()
    },
    onError,
  })

  const { mutate: remove } = useMutation({
    mutationFn: (variationId: string) =>
      removeProductVariation({ productId: product.id, variationId }),
    onSuccess: () => {
      setCurrent('base')
      toast.success('Variação removida')
      invalidate()
    },
    onError,
  })

  const { mutate: override } = useMutation({
    mutationFn: (values: {
      variationId: string
      stepId: string
      cost: number
      estimatedMinutes: number
    }) => setVariationOverride({ productId: product.id, ...values }),
    onSuccess: invalidate,
    onError,
  })

  const { mutate: clear } = useMutation({
    mutationFn: (values: { variationId: string; stepId: string }) =>
      clearVariationOverride({ productId: product.id, ...values }),
    onSuccess: () => {
      toast.success('A etapa voltou a acompanhar a base')
      invalidate()
    },
    onError,
  })

  const { mutate: setPrice } = useMutation({
    mutationFn: (values: { variationId: string; price: number | null }) =>
      setVariationPrice({ productId: product.id, ...values }),
    onSuccess: invalidate,
    onError,
  })

  const variation = product.variations.find((item) => item.id === current)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {hasComposition && (
          <button
            type="button"
            onClick={() => setCurrent('base')}
            className={cn(
              'rounded-lg border px-4 py-2 text-sm',
              current === 'base'
                ? 'border-brand-500 bg-white font-medium text-brand-700'
                : 'border-gray-200 bg-white text-gray-600',
            )}
          >
            Composição base
          </button>
        )}
        {product.variations.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCurrent(item.id)}
            className={cn(
              'rounded-lg border px-4 py-2 text-sm',
              current === item.id
                ? 'border-brand-500 bg-white font-medium text-brand-700'
                : 'border-gray-200 bg-white text-gray-600',
            )}
          >
            {item.name}
            {item.overrides.length ? (
              <span className="ml-2 text-xs text-gray">
                {item.overrides.length}
              </span>
            ) : null}
          </button>
        ))}
        <PermissionGate permissions={['product_settings:products:edit']}>
          <div className="flex items-center gap-2">
            <Input
              value={name}
              className="w-[120px]"
              placeholder="P, M, G…"
              aria-label="Nova variação"
              onChange={(event) => setName(event.target.value)}
            />
            <Button
              size="sm"
              type="button"
              variant="outline"
              LeftIcon={IconPlus}
              disabled={!name}
              isLoading={isPending}
              onClick={() => add()}
            >
              Variação
            </Button>
          </div>
        </PermissionGate>
      </div>

      {variation ? (
        <div className="space-y-3 rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">Variação {variation.name}</p>
              <p className="text-sm text-gray">
                Os valores em branco acompanham a composição base. O que você
                alterar aqui passa a valer só para esta variação.
              </p>
            </div>
            <div className="flex items-end gap-2">
              <div className="space-y-1.5">
                <label
                  htmlFor={`price-${variation.id}`}
                  className="text-sm font-medium"
                >
                  Preço próprio
                </label>
                <Input
                  id={`price-${variation.id}`}
                  type="number"
                  min={0}
                  step="0.01"
                  className="w-[140px]"
                  placeholder="vale o do produto"
                  startAdornment={<span className="text-sm">R$</span>}
                  defaultValue={variation.price ? variation.price / 100 : ''}
                  onBlur={(event) =>
                    setPrice({
                      variationId: variation.id,
                      price: event.target.value
                        ? Math.round(Number(event.target.value) * 100)
                        : null,
                    })
                  }
                />
              </div>
              <PermissionGate permissions={['product_settings:products:edit']}>
                <ActionButton
                  Icon={IconTrash}
                  tooltip={`Remover a variação ${variation.name}`}
                  onClick={() => remove(variation.id)}
                />
              </PermissionGate>
            </div>
          </div>

          {hasComposition &&
            product.steps.map((step) => {
              const changed = variation.overrides.find(
                (item) => item.stepId === step.id,
              )

              return (
                <div
                  key={step.id}
                  className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 p-3"
                >
                  <div className="min-w-[180px] flex-1">
                    <p className="font-medium">{step.name}</p>
                    <p className="text-sm text-gray">{step.sector}</p>
                  </div>
                  {changed ? (
                    <Badge
                      variant={assemblyOverrideObj.VARIATION_CHANGED.variant}
                    >
                      {assemblyOverrideObj.VARIATION_CHANGED.text}
                    </Badge>
                  ) : (
                    <Badge
                      variant={assemblyOverrideObj.VARIATION_INHERITS.variant}
                    >
                      {assemblyOverrideObj.VARIATION_INHERITS.text}
                    </Badge>
                  )}
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`minutes-${variation.id}-${step.id}`}
                      className="text-sm font-medium"
                    >
                      Tempo (min)
                    </label>
                    <Input
                      id={`minutes-${variation.id}-${step.id}`}
                      type="number"
                      min={0}
                      className="w-[110px]"
                      defaultValue={
                        changed?.estimatedMinutes ?? step.estimatedMinutes
                      }
                      onBlur={(event) =>
                        override({
                          variationId: variation.id,
                          stepId: step.id,
                          estimatedMinutes: Number(event.target.value) || 0,
                          cost: changed?.cost ?? step.cost,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`cost-${variation.id}-${step.id}`}
                      className="text-sm font-medium"
                    >
                      Custo
                    </label>
                    <Input
                      id={`cost-${variation.id}-${step.id}`}
                      type="number"
                      min={0}
                      step="0.01"
                      className="w-[140px]"
                      startAdornment={<span className="text-sm">R$</span>}
                      defaultValue={(changed?.cost ?? step.cost) / 100}
                      onBlur={(event) =>
                        override({
                          variationId: variation.id,
                          stepId: step.id,
                          cost: Math.round(
                            Number(event.target.value || 0) * 100,
                          ),
                          estimatedMinutes:
                            changed?.estimatedMinutes ?? step.estimatedMinutes,
                        })
                      }
                    />
                  </div>
                  {changed && (
                    <ActionButton
                      Icon={IconArrowBackUp}
                      tooltip="Voltar a acompanhar a base"
                      onClick={() =>
                        clear({ variationId: variation.id, stepId: step.id })
                      }
                    />
                  )}
                </div>
              )
            })}

          {!hasComposition && (
            <p className="text-sm text-gray">
              Neste plano a variação define o nome e o preço. A composição —
              materiais, tempos e setores por tamanho — faz parte do PRO.
            </p>
          )}

          {hasComposition && !product.steps.length && (
            <p className="text-sm text-gray">
              A composição base ainda não tem etapas. Monte a base primeiro: a
              variação só altera o que já existe nela.
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray">
          {product.variations.length
            ? 'Esta é a composição base. Ela vale para todas as variações, menos onde a variação tiver alteração própria.'
            : `Produto sem variações. Crie uma quando o mesmo produto existir em tamanhos ou modelos diferentes — o preço de referência é ${money(
                product.price || 0,
              )}.`}
        </p>
      )}
    </div>
  )
}
