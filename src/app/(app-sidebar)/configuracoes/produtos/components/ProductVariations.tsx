'use client'

// Variações do produto já no START (PV-6, decidido em 05/10/2026): o mesmo
// produto em tamanhos ou cores (P, M, G; 4x0, 4x1, 4x4), cada um com o seu
// preço. Sem isso, o mesmo produto acaba cadastrado várias vezes. Na venda, o
// vendedor escolhe a variação. No PRO, a composição aprofunda as mesmas
// variações.

import { useEffect, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { UnitKind } from '../[id]/composicao/assembly'
import { unitSymbol } from '../[id]/composicao/assembly'

// Actions
import {
  getProductVariations,
  saveProductVariations,
} from '@/actions/product-variations'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconTrash, IconPlus } from '@tabler/icons-react'

const EDIT = ['product_settings:products:edit']

type Row = { id?: string; name: string; unitPrice: number | null }

interface Props {
  productId: string
  unitKind: string
}

export function ProductVariations({ productId, unitKind }: Props) {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ['product-variations', productId],
    queryFn: () => getProductVariations({ productId }),
  })
  const saved = data?.data || []
  const [rows, setRows] = useState<Row[]>([])

  useEffect(() => {
    setRows(saved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(saved)])

  const unit = unitSymbol[(unitKind as UnitKind) || 'UNITY'] || 'un'

  const persist = async (next: Row[]) => {
    setRows(next)
    const res = await saveProductVariations({ productId, variations: next })
    if (!res.success) {
      toast.error(res.message)
      return
    }
    queryClient.invalidateQueries({
      queryKey: ['product-variations', productId],
    })
  }

  const update = (index: number, patch: Partial<Row>) =>
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    )

  return (
    <TooltipProvider>
      <div className="w-full space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 className="type-card-title">Variações</h4>
            <p className="text-sm text-gray">
              O mesmo produto em tamanhos ou cores, como P, M e G ou 4x0, 4x1 e
              4x4, cada um com o seu preço. Na venda, o vendedor escolhe a
              variação. Sem preço, vale o valor do produto.
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
                  ...rows,
                  { name: `Variação ${rows.length + 1}`, unitPrice: null },
                ])
              }
            >
              Nova variação
            </Button>
          </PermissionGate>
        </div>

        {rows.length > 0 && (
          <div className="space-y-2">
            {rows.map((row, index) => (
              <div
                key={row.id || index}
                className="flex flex-wrap items-end gap-3"
              >
                <div className="flex flex-[1_0_200px] flex-col gap-1.5">
                  <label
                    htmlFor={`variation-name-${index}`}
                    className="text-sm font-medium text-gray-700"
                  >
                    Nome
                  </label>
                  <Input
                    id={`variation-name-${index}`}
                    value={row.name}
                    placeholder="Ex.: P, 4x0"
                    onChange={(event) =>
                      update(index, { name: event.target.value })
                    }
                    onBlur={() => persist(rows)}
                  />
                </div>
                <div className="flex flex-[1_0_180px] flex-col gap-1.5">
                  <label
                    htmlFor={`variation-price-${index}`}
                    className="text-sm font-medium text-gray-700"
                  >
                    Preço de venda por {unit}
                  </label>
                  <PermissionGate
                    permissions={['values:values:view']}
                    fallback={<span>••••••</span>}
                  >
                    <Input
                      id={`variation-price-${index}`}
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Valor do produto"
                      startAdornment={<span className="text-sm">R$</span>}
                      value={row.unitPrice === null ? '' : row.unitPrice / 100}
                      onChange={(event) =>
                        update(index, {
                          unitPrice:
                            event.target.value === ''
                              ? null
                              : Math.round(Number(event.target.value) * 100),
                        })
                      }
                      onBlur={() => persist(rows)}
                    />
                  </PermissionGate>
                </div>
                <PermissionGate permissions={EDIT}>
                  <ActionButton
                    Icon={IconTrash}
                    variant="errorGhost"
                    tooltip={`Remover ${row.name}`}
                    onClick={() => persist(rows.filter((_, i) => i !== index))}
                  />
                </PermissionGate>
              </div>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
