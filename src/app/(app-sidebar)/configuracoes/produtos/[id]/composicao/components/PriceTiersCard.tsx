'use client'

// Preço por faixa de quantidade (FQ-1 a FQ-3). É tabela de preço, não
// desconto: o desconto do vendedor continua por cima. A faixa vale para o
// total da venda, e cada faixa mostra o custo naquela quantidade — é onde se
// vê se a tabela está apertando a margem sem ninguém notar.

// React
import { useEffect, useState } from 'react'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardTitle,
  CardHeader,
  CardFooter,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

// Components
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { ComputedAssembly, PriceTier } from '../assembly'
import { unitSymbol } from '../assembly'

// Actions
import { setPriceTiers } from '@/actions/product-variations'

// Hooks / Store / Consts
import { useMoney } from '@/hooks/useMoney'

// Third-party
import { toast } from 'sonner'

// Icons
import { IconTrash, IconPlus } from '@tabler/icons-react'

// Utils
import { cn } from '@/lib/utils'

const EDIT = ['product_settings:products:edit']

interface Props {
  assembly: ComputedAssembly
  onSaved: () => void
}

export function PriceTiersCard({ assembly, onSaved }: Props) {
  const money = useMoney()
  const [tiers, setTiers] = useState<PriceTier[]>([])
  const [saving, setSaving] = useState(false)

  // Na variação vista, a tabela dela; sem tabela própria, a do produto (FQ-4)
  const variation = assembly.activeVariation
  const source = assembly.effectiveTiers

  useEffect(() => {
    setTiers(source)
  }, [source])

  const unit = unitSymbol[assembly.unitKind]
  const changed = JSON.stringify(tiers) !== JSON.stringify(source)
  // A aba da variação com composição própria: "<produto>::v:<variação>"
  const [hostId, hostVariation] = assembly.productId.split('::v:')
  const host = { id: hostId, variationId: hostVariation }
  // Na variação sem tabela própria, editar é criar a dela
  const inherited = !!variation && !assembly.tiersFromVariation

  const setTier = (index: number, patch: Partial<PriceTier>) =>
    setTiers((current) =>
      current.map((tier, i) => (i === index ? { ...tier, ...patch } : tier)),
    )

  const save = async () => {
    setSaving(true)
    const res = await setPriceTiers({
      productId: host.id,
      tiers,
      variationId: variation?.id ?? host.variationId,
    })
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success('Tabela de faixas salva')
    onSaved()
  }

  const summaryOf = (from: number) =>
    assembly.tierSummary.find((item) => item.from === from)

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Preço por faixa de quantidade
          {variation ? ` · ${variation.name}` : ''}
        </CardTitle>
        <CardDescription>
          {variation
            ? inherited
              ? 'Esta variação usa a tabela do produto. Mude um valor e salve para ela ter a própria.'
              : 'Tabela própria desta variação. As outras continuam com a delas.'
            : 'Até 100 um valor, de 101 a 500 outro. A faixa vale para o total da venda: 150 unidades saem todas pelo valor da segunda faixa. Sem tabela, vale o valor de venda do produto.'}
        </CardDescription>
      </CardHeader>
      {tiers.length > 0 && (
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[22%]">A partir de</TableHead>
                <TableHead className="w-[24%]">
                  Preço de venda por {unit}
                </TableHead>
                <TableHead numeric className="w-[20%]">
                  Custo por {unit} nessa quantidade
                </TableHead>
                <TableHead numeric className="w-[14%]">
                  Margem
                </TableHead>
                <TableHead className="w-[20%]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiers.map((tier, index) => {
                const summary = summaryOf(tier.from)
                const active = assembly.activeTier?.from === tier.from

                return (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        step="1"
                        aria-label="A partir de"
                        endAdornment={<span className="text-sm">{unit}</span>}
                        value={tier.from}
                        onChange={(event) =>
                          setTier(index, {
                            from: Number(event.target.value) || 0,
                          })
                        }
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
                          aria-label="Preço de venda"
                          startAdornment={<span className="text-sm">R$</span>}
                          value={tier.unitPrice / 100}
                          onChange={(event) =>
                            setTier(index, {
                              unitPrice: Math.round(
                                Number(event.target.value || 0) * 100,
                              ),
                            })
                          }
                        />
                      </PermissionGate>
                    </TableCell>
                    <TableCell numeric className="text-sm">
                      {summary && !changed ? money(summary.unitCost) : '-'}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right text-sm font-medium',
                        summary &&
                          !changed &&
                          summary.margin !== null &&
                          summary.margin < 10 &&
                          'text-error-700',
                      )}
                    >
                      {summary && !changed && summary.margin !== null
                        ? summary.margin < 0
                          ? 'Abaixo do custo'
                          : `${summary.margin.toLocaleString('pt-BR')}%`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {active && !changed && (
                          <Badge variant="successLight">
                            vale para {assembly.measure.quantity} {unit}
                          </Badge>
                        )}
                        <PermissionGate permissions={EDIT}>
                          <ActionButton
                            Icon={IconTrash}
                            variant="errorGhost"
                            tooltip="Remover faixa"
                            onClick={() =>
                              setTiers((current) =>
                                current.filter((_, i) => i !== index),
                              )
                            }
                          />
                        </PermissionGate>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {changed && (
            <p className="mt-3 text-sm text-gray">
              Salve para ver o custo e a margem de cada faixa.
            </p>
          )}
        </CardContent>
      )}
      <PermissionGate permissions={EDIT}>
        <CardFooter className="flex-wrap justify-between gap-3">
          <Button
            type="button"
            variant="neutralOutline"
            LeftIcon={IconPlus}
            onClick={() =>
              setTiers((current) => [
                ...current,
                {
                  from: current.length
                    ? Math.max(...current.map((tier) => tier.from)) * 5 || 1
                    : 1,
                  unitPrice:
                    current.at(-1)?.unitPrice ?? assembly.unitPrice ?? 0,
                },
              ])
            }
          >
            Nova faixa
          </Button>
          <div className="flex flex-wrap gap-2">
            {variation && assembly.tiersFromVariation && (
              <Button
                type="button"
                variant="neutralOutline"
                onClick={async () => {
                  const res = await setPriceTiers({
                    productId: host.id,
                    tiers: [],
                    variationId: variation.id,
                    inherit: true,
                  })
                  if (!res.success) return toast.error(res.message)
                  toast.success('Variação voltou à tabela do produto')
                  onSaved()
                }}
              >
                Usar a tabela do produto
              </Button>
            )}
            <Button
              type="button"
              isLoading={saving}
              disabled={!changed}
              onClick={save}
            >
              {inherited ? 'Criar tabela desta variação' : 'Salvar faixas'}
            </Button>
          </div>
        </CardFooter>
      </PermissionGate>
    </Card>
  )
}
