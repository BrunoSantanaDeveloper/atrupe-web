'use client'

// Cadastro do produto de locação, com as regras que o sistema já tem
// (revisão de 16/11/2026). É um produto comum marcado como locação. START:
// um período (dias) e um valor. LITE: cada período é uma variação do produto
// (PV-6), como P, M e G, e a quantidade disponível entra com a reserva. PRO:
// a composição com os custos do patrimônio.

import { IconPhoto, IconPlus, IconTrash } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ActionButton } from '@/components/common/ActionButton'
import { BrlInput } from '@/components/common/BrlInput'

import {
  planHas,
  unitOf,
  type Plan,
  type RentalPeriod,
  type RentalProduct,
} from '../data'
import { PlanLock } from './PlanLock'

export function RentalProductForm({
  plan,
  product,
  onChange,
}: {
  plan: Plan
  product: RentalProduct
  onChange: (product: RentalProduct) => void
}) {
  const patch = (changes: Partial<RentalProduct>) =>
    onChange({ ...product, ...changes })

  const patchPeriod = (id: string, changes: Partial<RentalPeriod>) =>
    patch({
      periods: product.periods.map((period) =>
        period.id === id ? { ...period, ...changes } : period,
      ),
    })

  const spot = product.spot
  const patchSpot = (changes: Partial<NonNullable<typeof spot>>) =>
    spot && patch({ spot: { ...spot, ...changes } })

  const withVariations = planHas(plan, 'LITE')
  const first = product.periods[0]
  const unit = unitOf(product)
  const priceLabel = unit ? `Valor do período por ${unit}` : 'Valor do período'

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Produto de locação</CardTitle>
            <CardDescription>
              Configurações › Produtos › Novo produto. É o cadastro comum de
              produto, com a marca &quot;Produto de locação&quot;, no setor
              Locação.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 px-6 pb-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
              <div className="space-y-1.5">
                <Label htmlFor="rental-name">Nome</Label>
                <Input
                  id="rental-name"
                  value={product.name}
                  onChange={(event) => patch({ name: event.target.value })}
                />
              </div>
              <div className="flex items-center gap-3 md:pt-6">
                <Switch id="rental-flag" checked disabled />
                <Label htmlFor="rental-flag">Produto de locação</Label>
              </div>
            </div>

            {!withVariations && first && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="period-name">Período da locação</Label>
                    <Input
                      id="period-name"
                      placeholder="Diária, bissemana, mês"
                      value={first.name}
                      onChange={(event) =>
                        patchPeriod(first.id, { name: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="period-days">Dias do período</Label>
                    <Input
                      id="period-days"
                      type="number"
                      min={1}
                      value={first.days}
                      onChange={(event) =>
                        patchPeriod(first.id, {
                          days: Number(event.target.value) || 1,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="period-price">{priceLabel}</Label>
                    <BrlInput
                      id="period-price"
                      value={first.priceCents}
                      onChange={(priceCents) =>
                        patchPeriod(first.id, { priceCents })
                      }
                    />
                  </div>
                </div>
                <p className="text-sm text-gray">
                  É o preço de venda do produto, como em qualquer outro. No
                  orçamento, a locação começa na data de início e termina depois
                  dos dias do período.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <PlanLock
          plan={plan}
          from="LITE"
          title="Vários períodos no mesmo produto"
          locked="No Start cada produto tem um período e um valor: para vender o mesmo outdoor por bissemana e por mês, cadastre dois produtos. No Lite os períodos são variações do produto, como P, M e G: um cadastro só, e o vendedor escolhe o período na venda."
        >
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <CardTitle>Variações: os períodos da locação</CardTitle>
                  <CardDescription>
                    É a mesma tabela de variações dos outros produtos, com os
                    dias de cada período. Cada variação pode ter o seu preço por
                    quantidade.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="neutralOutline"
                  LeftIcon={IconPlus}
                  onClick={() =>
                    patch({
                      periods: [
                        ...product.periods,
                        {
                          id: `p${Date.now()}`,
                          name: '',
                          days: 1,
                          priceCents: 0,
                        },
                      ],
                    })
                  }
                >
                  Nova variação
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[40%]">Variação</TableHead>
                    <TableHead className="w-[20%]">Dias do período</TableHead>
                    <TableHead className="w-[30%]">{priceLabel}</TableHead>
                    <TableHead className="w-[10%]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.periods.map((period) => (
                    <TableRow key={period.id}>
                      <TableCell>
                        <Input
                          aria-label="Nome da variação"
                          placeholder="Diária, bissemana, mês"
                          value={period.name}
                          onChange={(event) =>
                            patchPeriod(period.id, {
                              name: event.target.value,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          aria-label="Dias do período"
                          value={period.days}
                          onChange={(event) =>
                            patchPeriod(period.id, {
                              days: Number(event.target.value) || 1,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <BrlInput
                          aria-label={priceLabel}
                          value={period.priceCents}
                          onChange={(priceCents) =>
                            patchPeriod(period.id, { priceCents })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <ActionButton
                            Icon={IconTrash}
                            variant="errorGhost"
                            tooltip="Remover variação"
                            disabled={product.periods.length === 1}
                            onClick={() =>
                              patch({
                                periods: product.periods.filter(
                                  (item) => item.id !== period.id,
                                ),
                              })
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </PlanLock>

        <PlanLock
          plan={plan}
          from="LITE"
          title="Quantidade disponível para locar"
          locked="No Start o sistema não confere o que já está alugado. No Lite você informa quantas unidades existem (1 outdoor, 20 peças, 6 cotas do painel) e a reserva não deixa alugar além do que está livre no período."
        >
          <Card>
            <CardHeader>
              <CardTitle>Quantidade disponível para locar</CardTitle>
              <CardDescription>
                Quantas unidades deste produto existem. A reserva desconta deste
                saldo em cada período: o outdoor tem 1, o lote de box truss tem
                20 peças, o painel de LED tem 6 cotas.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="max-w-[200px]">
                <Input
                  type="number"
                  min={1}
                  aria-label="Quantidade disponível para locar"
                  value={product.capacity}
                  onChange={(event) =>
                    patch({ capacity: Number(event.target.value) || 1 })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </PlanLock>

        {spot && (
          <Card>
            <CardHeader>
              <CardTitle>Dados do ponto</CardTitle>
              <CardDescription>
                Opcional. Entram na proposta e no contrato: o cliente escolhe o
                ponto pela foto e pelo endereço.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 px-6 pb-6 lg:grid-cols-[1fr_220px]">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="spot-address">Endereço do ponto</Label>
                  <Input
                    id="spot-address"
                    value={spot.address}
                    onChange={(event) =>
                      patchSpot({ address: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="spot-face">Face e sentido</Label>
                  <Input
                    id="spot-face"
                    value={spot.face}
                    onChange={(event) =>
                      patchSpot({ face: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="spot-art">Medida da arte</Label>
                  <Input
                    id="spot-art"
                    value={spot.artSize}
                    onChange={(event) =>
                      patchSpot({ artSize: event.target.value })
                    }
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    id="spot-lit"
                    checked={spot.lit}
                    onCheckedChange={(lit) => patchSpot({ lit })}
                  />
                  <Label htmlFor="spot-lit">Iluminado</Label>
                </div>
              </div>
              <div className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray">
                <IconPhoto className="size-8" aria-hidden />
                <p className="text-sm">Fotos do ponto</p>
              </div>
            </CardContent>
          </Card>
        )}

        <PlanLock
          plan={plan}
          from="PRO"
          title="Custo do bem e preço sugerido"
          locked="Quer saber quanto este bem custa por dia e se o valor do período dá lucro? No Pro o produto ganha a composição com os custos do patrimônio: depreciação, aluguel do ponto, energia."
        >
          <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm text-gray-700">
            Este produto tem a composição com os custos do patrimônio. O custo
            por dia e a margem de cada período estão na aba{' '}
            <span className="font-semibold">Composição</span>.
          </div>
        </PlanLock>
      </div>
    </TooltipProvider>
  )
}
