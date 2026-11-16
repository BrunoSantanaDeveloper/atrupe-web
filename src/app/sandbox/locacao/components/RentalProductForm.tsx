'use client'

// Cadastro do produto de locação. No START é só isto: o bem, o modo e o
// valor por período (LC-14, 16/11/2026). O saldo de peças e de cotas entra
// com a reserva, no LITE; o custo do bem, com a composição, no PRO.

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
import { RadioGroup } from '@/components/ui/radio-group'
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
import { RadioCard } from '@/components/common/radio-card'

import {
  MODE_HINT,
  MODE_LABEL,
  formatBrl,
  unitOfMode,
  type Plan,
  type RentalMode,
  type RentalPeriod,
  type RentalProduct,
} from '../data'
import { PlanLock } from './PlanLock'

const MODES: RentalMode[] = ['INDIVIDUAL', 'QUANTITY', 'AD']

const priceLabel = (mode: RentalMode) =>
  mode === 'QUANTITY'
    ? 'Valor do período por peça'
    : mode === 'AD'
      ? 'Valor do período por cota'
      : 'Valor do período'

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

  const spot = product.spot || {
    address: '',
    face: '',
    lit: false,
    artSize: '',
  }
  const patchSpot = (changes: Partial<typeof spot>) =>
    patch({ spot: { ...spot, ...changes } })

  const hasSpot = product.mode !== 'QUANTITY'

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Produto de locação</CardTitle>
            <CardDescription>
              Configurações › Produtos › Novo produto, com o tipo
              &quot;Locação&quot;. O produto nasce no setor Locação.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 px-6 pb-6">
            <div className="space-y-1.5">
              <Label htmlFor="rental-name">Nome</Label>
              <Input
                id="rental-name"
                value={product.name}
                onChange={(event) => patch({ name: event.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Como este produto é alugado</Label>
              <RadioGroup
                value={product.mode}
                onValueChange={(mode) => patch({ mode: mode as RentalMode })}
                className="grid grid-cols-1 gap-3 md:grid-cols-3"
              >
                {MODES.map((mode) => (
                  <RadioCard key={mode} value={mode}>
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-gray-900">
                        {MODE_LABEL[mode]}
                      </p>
                      <p className="text-sm font-normal text-gray">
                        {MODE_HINT[mode]}
                      </p>
                    </div>
                  </RadioCard>
                ))}
              </RadioGroup>
            </div>

            {product.mode !== 'INDIVIDUAL' && (
              <PlanLock
                plan={plan}
                from="LITE"
                title={
                  product.mode === 'QUANTITY'
                    ? 'Saldo de peças'
                    : 'Saldo de cotas do painel'
                }
                locked={
                  product.mode === 'QUANTITY'
                    ? 'No Start você aluga a quantidade que digitar. No Lite o sistema sabe quantas peças existem e não deixa alugar além do que está livre no período.'
                    : 'No Start você vende a cota sem controle de saldo. No Lite o sistema sabe quantas cotas o painel tem e não deixa vender além do que está livre no período.'
                }
              >
                <div className="max-w-xs space-y-1.5">
                  <Label htmlFor="rental-capacity">
                    {product.mode === 'QUANTITY'
                      ? 'Peças disponíveis para locar'
                      : 'Cotas de exibição do painel'}
                  </Label>
                  <Input
                    id="rental-capacity"
                    type="number"
                    min={1}
                    value={product.capacity}
                    onChange={(event) =>
                      patch({ capacity: Number(event.target.value) || 1 })
                    }
                  />
                  <p className="text-sm text-gray">
                    A reserva desconta deste saldo em cada período.
                  </p>
                </div>
              </PlanLock>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1.5">
                <CardTitle>Valor por período</CardTitle>
                <CardDescription>
                  Cadastre os períodos que você vende. No orçamento, o total sai
                  do número de dias: vale o valor por dia do maior período que
                  cabe.
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
                Novo período
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[30%]">Período</TableHead>
                  <TableHead className="w-[15%]">Dias</TableHead>
                  <TableHead className="w-[25%]">
                    {priceLabel(product.mode)}
                  </TableHead>
                  <TableHead className="w-[20%]">Sai por dia</TableHead>
                  <TableHead className="w-[10%]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.periods.map((period) => (
                  <TableRow key={period.id}>
                    <TableCell>
                      <Input
                        aria-label="Nome do período"
                        placeholder="Diária, bissemana, mês"
                        value={period.name}
                        onChange={(event) =>
                          patchPeriod(period.id, { name: event.target.value })
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
                        aria-label={priceLabel(product.mode)}
                        value={period.priceCents}
                        onChange={(priceCents) =>
                          patchPeriod(period.id, { priceCents })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {formatBrl(period.priceCents / Math.max(period.days, 1))}
                      {product.mode !== 'INDIVIDUAL'
                        ? ` por ${unitOfMode(product.mode)}`
                        : ''}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <ActionButton
                          Icon={IconTrash}
                          variant="errorGhost"
                          tooltip="Remover período"
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

        {hasSpot && (
          <Card>
            <CardHeader>
              <CardTitle>Dados do ponto</CardTitle>
              <CardDescription>
                Entram na proposta e no contrato: o cliente escolhe o ponto pela
                foto e pelo endereço.
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
