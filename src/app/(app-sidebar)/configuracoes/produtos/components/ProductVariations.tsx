'use client'

// Variações do produto do LITE em diante (PV-6, decidido em 05/10/2026;
// plano revisto em 27/10/2026): o mesmo produto em tamanhos ou cores (P, M,
// G; 4x0, 4x1, 4x4), cada um com o seu preço. Sem isso, o mesmo produto acaba cadastrado várias vezes. Na venda, o
// vendedor escolhe a variação. No PRO, a composição aprofunda as mesmas
// variações. Cada variação tem os seus valores por quantidade (correção do
// LITE, 11/11/2026): a camiseta P com uma tabela, a M com outra. Com
// Papéis no plano, cada variação aponta o seu papel (GR-0): o cartão em
// couché 300 e em reciclado é o mesmo produto, e o orçamento conta as folhas
// do papel escolhido (12/11/2026).

import { useEffect, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePapers } from '@/hooks/queries/usePapers'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { UnitKind } from '../[id]/composicao/assembly'
import { unitSymbol } from '../[id]/composicao/assembly'

// Components
import { ProductPriceTiers } from './ProductPriceTiers'

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

type Row = {
  id?: string
  name: string
  unitPrice: number | null
  hasOwnTiers?: boolean
  paper?: { id: string; name: string } | null
}

const NO_PAPER = 'none'

interface Props {
  // Nulo no cadastro novo: as linhas ficam na tela e são gravadas depois que
  // o produto existe (27/10/2026)
  productId: string | null
  unitKind: string
  onLocalChange?: (rows: Row[]) => void
  // Preço de venda do produto, em centavos: a primeira faixa da variação sem
  // preço próprio nasce com ele
  basePriceCents: number
  // Quantas variações há: com elas, a tabela de faixas do produto sai
  onCountChange?: (count: number) => void
}

export function ProductVariations({
  productId,
  unitKind,
  onLocalChange,
  basePriceCents,
  onCountChange,
}: Props) {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    enabled: !!productId,
    queryKey: ['product-variations', productId],
    queryFn: () => getProductVariations({ productId: productId as string }),
  })
  const saved = data?.data || []
  const [rows, setRows] = useState<Row[]>([])
  // A variação com a tabela de faixas aberta
  const [openTiers, setOpenTiers] = useState<string | null>(null)
  const { active: withPapers, papers } = usePapers()

  useEffect(() => {
    onCountChange?.(rows.length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length])

  useEffect(() => {
    setRows(saved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(saved)])

  const unit = unitSymbol[(unitKind as UnitKind) || 'UNITY'] || 'un'

  const persist = async (next: Row[]) => {
    setRows(next)
    if (!productId) {
      onLocalChange?.(next)
      return
    }
    const res = await saveProductVariations({
      productId,
      variations: next.map(({ id, name, unitPrice, paper }) => ({
        id,
        name,
        unitPrice,
        // O papel só vai com Papéis no plano: sem o recurso, a API recusa
        ...(withPapers ? { paperId: paper?.id ?? null } : {}),
      })),
    })
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
              4x4, cada um com o seu preço e os seus valores por quantidade. Na
              venda, o vendedor escolhe a variação. Sem preço, vale o valor do
              produto.
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
              <div key={row.id || index} className="space-y-2">
                <div className="flex flex-wrap items-end gap-3">
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
                        value={
                          row.unitPrice === null ? '' : row.unitPrice / 100
                        }
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
                  {withPapers ? (
                    <div className="flex flex-[1_0_200px] flex-col gap-1.5">
                      <label
                        htmlFor={`variation-paper-${index}`}
                        className="text-sm font-medium text-gray-700"
                      >
                        Papel
                      </label>
                      <Select
                        value={row.paper?.id ?? NO_PAPER}
                        onValueChange={(value) => {
                          const paper = papers.find((item) => item.id === value)
                          persist(
                            rows.map((item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    paper: paper
                                      ? { id: paper.id, name: paper.name }
                                      : null,
                                  }
                                : item,
                            ),
                          )
                        }}
                      >
                        <SelectTrigger id={`variation-paper-${index}`}>
                          <SelectValue placeholder="Sem papel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NO_PAPER}>Sem papel</SelectItem>
                          {papers.map((paper) => (
                            <SelectItem key={paper.id} value={paper.id}>
                              {paper.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                  <PermissionGate permissions={EDIT}>
                    <ActionButton
                      Icon={IconTrash}
                      variant="errorGhost"
                      tooltip={`Remover ${row.name}`}
                      onClick={() =>
                        persist(rows.filter((_, i) => i !== index))
                      }
                    />
                  </PermissionGate>
                </div>
                {/* Os valores por quantidade da variação: só depois de gravada,
                  porque a tabela é ligada a ela */}
                {row.id ? (
                  <>
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0"
                      onClick={() =>
                        setOpenTiers((current) =>
                          current === row.id ? null : (row.id ?? null),
                        )
                      }
                    >
                      {openTiers === row.id
                        ? 'Ocultar valores por quantidade'
                        : row.hasOwnTiers
                          ? 'Valores por quantidade (cadastrados)'
                          : 'Valores por quantidade'}
                    </Button>
                    {openTiers === row.id && productId ? (
                      <div className="rounded-lg border border-gray-200 p-3">
                        <ProductPriceTiers
                          productId={productId}
                          variationId={row.id}
                          unitKind={unitKind}
                          basePriceCents={row.unitPrice ?? basePriceCents}
                        />
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className="text-xs text-gray">
                    Salve o produto para cadastrar os valores por quantidade
                    desta variação.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
