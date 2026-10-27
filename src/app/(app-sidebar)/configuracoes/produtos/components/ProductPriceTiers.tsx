'use client'

// Preço por faixa de quantidade (FQ-1 a FQ-3), no cadastro do produto a
// partir do LITE (decidido em 03/10/2026): é tabela de preço, não desconto,
// e a faixa vale para o total da venda. Grava a cada ação, como o resto do
// cadastro. No PRO, a composição mostra o custo e a margem de cada faixa.

import { useEffect, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { PriceTier, UnitKind } from '../[id]/composicao/assembly'
import { unitSymbol } from '../[id]/composicao/assembly'

// Actions
import { getPriceTiers, setPriceTiers } from '@/actions/product-variations'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconTrash, IconPlus } from '@tabler/icons-react'

const EDIT = ['product_settings:products:edit']

interface Props {
  // Nulo no cadastro novo: as faixas ficam na tela e são gravadas depois que
  // o produto existe (27/10/2026)
  productId: string | null
  unitKind: string
  onLocalChange?: (tiers: PriceTier[]) => void
  // Preço de venda por unidade do produto, em centavos, para a primeira faixa
  // nascer com ele
  basePriceCents: number
}

export function ProductPriceTiers({
  productId,
  unitKind,
  basePriceCents,
  onLocalChange,
}: Props) {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    enabled: !!productId,
    queryKey: ['price-tiers', productId],
    queryFn: () => getPriceTiers({ productId: productId as string }),
  })
  const saved = data?.data || []
  const [tiers, setTiers] = useState<PriceTier[]>([])

  useEffect(() => {
    setTiers(saved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(saved)])

  const unit = unitSymbol[(unitKind as UnitKind) || 'UNITY'] || 'un'

  const persist = async (next: PriceTier[]) => {
    setTiers(next)
    if (!productId) {
      onLocalChange?.(next)
      return
    }
    const res = await setPriceTiers({ productId, tiers: next })
    if (!res.success) {
      toast.error(res.message)
      return
    }
    queryClient.invalidateQueries({ queryKey: ['price-tiers', productId] })
    queryClient.invalidateQueries({ queryKey: ['assembly', productId] })
  }

  const update = (index: number, patch: Partial<PriceTier>) =>
    setTiers((current) =>
      current.map((tier, i) => (i === index ? { ...tier, ...patch } : tier)),
    )

  return (
    <TooltipProvider>
      <div className="w-full space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 className="type-card-title">Preço por quantidade</h4>
            <p className="text-sm text-gray">
              Até 100 um valor, de 101 a 500 outro. A faixa vale para o total:
              150 unidades saem todas pelo valor da segunda faixa. Sem faixas,
              vale o valor de venda do produto.
            </p>
          </div>
          <PermissionGate permissions={EDIT}>
            <Button
              type="button"
              size="sm"
              variant="neutralOutline"
              LeftIcon={IconPlus}
              onClick={() =>
                persist([
                  ...tiers,
                  {
                    from: tiers.length
                      ? Math.max(...tiers.map((tier) => tier.from)) * 5 || 1
                      : 1,
                    unitPrice: tiers.at(-1)?.unitPrice ?? basePriceCents,
                  },
                ])
              }
            >
              Nova faixa
            </Button>
          </PermissionGate>
        </div>

        {tiers.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[40%]">
                  A partir de (quantidade)
                </TableHead>
                <TableHead className="w-[45%]">
                  Preço de venda por {unit}
                </TableHead>
                <TableHead className="w-[15%]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiers.map((tier, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      step="1"
                      aria-label="A partir de"
                      value={tier.from}
                      onChange={(event) =>
                        update(index, { from: Number(event.target.value) || 0 })
                      }
                      onBlur={() => persist(tiers)}
                    />
                  </TableCell>
                  <TableCell>
                    <PermissionGate
                      permissions={['values:values:view']}
                      fallback={<span>••••••</span>}
                    >
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        aria-label="Preço de venda da faixa"
                        startAdornment={<span className="text-sm">R$</span>}
                        value={tier.unitPrice / 100}
                        onChange={(event) =>
                          update(index, {
                            unitPrice: Math.round(
                              Number(event.target.value || 0) * 100,
                            ),
                          })
                        }
                        onBlur={() => persist(tiers)}
                      />
                    </PermissionGate>
                  </TableCell>
                  <TableCell>
                    <PermissionGate permissions={EDIT}>
                      <div className="flex justify-end">
                        <ActionButton
                          Icon={IconTrash}
                          variant="errorGhost"
                          tooltip="Remover faixa"
                          onClick={() =>
                            persist(tiers.filter((_, i) => i !== index))
                          }
                        />
                      </div>
                    </PermissionGate>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </TooltipProvider>
  )
}
