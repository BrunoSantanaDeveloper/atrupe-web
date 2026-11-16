'use client'

// A composição do produto de locação no PRO (decisão de 16/11/2026): o
// produto ganha os custos do patrimônio (LC-2, LC-3) e o custo por dia sai da
// ocupação de referência, como o custo por m² sai da produtividade da
// impressora (LC-7). Daí vêm o preço sugerido de cada período e o resultado
// por bem.
//
// Cada período é uma variação do produto, e a composição por variação dá o
// custo de cada período (revisão de 16/11). A composição segue as regras de
// hoje, iguais para todos. No resultado por bem, a receita é a do financeiro
// (o recebido no mês); o vendido fica no relatório de vendas.

import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import {
  ASSETS,
  average,
  dailyCostOf,
  depreciationOf,
  formatBrl,
  monthlyCostOf,
  unitOf,
  type RentalAsset,
  type RentalProduct,
} from '../data'

const MONTHS = ['D', 'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N']

const percent = (value: number) =>
  `${(value * 100).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%`

export function RentalComposition({
  products,
  productId,
  onProductId,
}: {
  products: RentalProduct[]
  productId: string
  onProductId: (id: string) => void
}) {
  const product = products.find((item) => item.id === productId) || products[0]
  const [assets, setAssets] = useState<RentalAsset[]>(ASSETS)
  const [markup, setMarkup] = useState(2)

  const asset = assets.find((item) => item.id === product.assetId) || assets[0]
  const setReference = (referenceDays: number) =>
    setAssets((current) =>
      current.map((item) =>
        item.id === asset.id ? { ...item, referenceDays } : item,
      ),
    )

  const monthly = monthlyCostOf(asset)
  const daily = dailyCostOf(asset, product.capacity)
  const realized = Math.round(average(asset.occupancy))
  const unit = unitOf(product)
  const perUnit = unit ? ` por ${unit}` : ''

  return (
    <div className="space-y-4">
      <div className="max-w-md space-y-1.5">
        <Label>Produto de locação</Label>
        <Select value={product.id} onValueChange={onProductId}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {products.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Custo do patrimônio</CardTitle>
            <CardDescription>
              {asset.name}. Vem do cadastro de patrimônios: o valor do bem e os
              custos próprios do ponto.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Custo</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead className="text-right">Por mês</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    Depreciação
                    <span className="block text-xs text-gray">
                      {formatBrl(asset.valueCents)}, {asset.lifeYears} anos,{' '}
                      {asset.residualPercent}% de residual
                    </span>
                  </TableCell>
                  <TableCell className="text-gray">-</TableCell>
                  <TableCell className="text-right">
                    {formatBrl(depreciationOf(asset))}
                  </TableCell>
                </TableRow>
                {asset.fixedCosts.map((cost) => (
                  <TableRow key={cost.name}>
                    <TableCell>{cost.name}</TableCell>
                    <TableCell className="text-gray">{cost.account}</TableCell>
                    <TableCell className="text-right">
                      {formatBrl(cost.monthlyCents)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50 font-semibold">
                  <TableCell colSpan={2}>Custo mensal do bem</TableCell>
                  <TableCell className="text-right">
                    {formatBrl(monthly)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ocupação de referência e custo por dia</CardTitle>
            <CardDescription>
              Quantos dias por mês o bem costuma estar alugado. O custo do mês é
              dividido por esses dias, para o preço cobrir os dias parados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-40 space-y-1.5">
                <Label htmlFor="reference-days">
                  Dias alugados por mês
                  {unit ? `, por ${unit}` : ''}
                </Label>
                <Input
                  id="reference-days"
                  type="number"
                  min={1}
                  max={30}
                  value={asset.referenceDays}
                  onChange={(event) =>
                    setReference(
                      Math.min(
                        Math.max(Number(event.target.value) || 1, 1),
                        30,
                      ),
                    )
                  }
                />
              </div>
              {realized !== asset.referenceDays && (
                <Button
                  type="button"
                  variant="neutralOutline"
                  onClick={() => setReference(Math.max(realized, 1))}
                >
                  Usar a média realizada ({realized} dias)
                </Button>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm text-gray">
                Realizado nos últimos 12 meses: média de {realized} dias por mês
              </p>
              <div className="flex h-24 items-end gap-1.5">
                {asset.occupancy.map((value, index) => (
                  <div
                    key={index}
                    className="flex flex-1 flex-col items-center gap-1"
                  >
                    <div
                      title={`${value} dias`}
                      className={cn(
                        'w-full rounded-t',
                        value >= asset.referenceDays
                          ? 'bg-brand-400'
                          : 'bg-gray-300',
                      )}
                      style={{ height: `${Math.max((value / 30) * 72, 2)}px` }}
                    />
                    <span className="text-[10px] text-gray">
                      {MONTHS[index]}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray">
                Em verde, os meses que alcançaram a referência.
              </p>
            </div>

            <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
              <p className="text-sm text-gray-700">
                {formatBrl(monthly)} ÷ {asset.referenceDays} dias
                {product.capacity > 1
                  ? ` ÷ ${product.capacity} ${unitOf(product, product.capacity)}`
                  : ''}
              </p>
              <p className="text-xl font-semibold text-gray-900">
                {formatBrl(daily)} por dia{perUnit}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1.5">
              <CardTitle>
                Custo, preço sugerido e margem de cada período
              </CardTitle>
              <CardDescription>
                O custo do período é o custo por dia vezes os dias. O preço
                sugerido aplica o markup; a margem compara com o valor que você
                pratica.
              </CardDescription>
            </div>
            <div className="w-32 space-y-1.5">
              <Label htmlFor="rental-markup">Markup</Label>
              <Input
                id="rental-markup"
                type="number"
                min={1}
                step="0.1"
                value={markup}
                onChange={(event) =>
                  setMarkup(Math.max(Number(event.target.value) || 1, 1))
                }
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Período</TableHead>
                <TableHead>Dias</TableHead>
                <TableHead className="text-right">Custo{perUnit}</TableHead>
                <TableHead className="text-right">Preço sugerido</TableHead>
                <TableHead className="text-right">Valor praticado</TableHead>
                <TableHead className="text-right">Margem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.periods.map((period) => {
                const cost = daily * period.days
                const margin = period.priceCents
                  ? (period.priceCents - cost) / period.priceCents
                  : 0
                return (
                  <TableRow key={period.id}>
                    <TableCell className="font-medium text-gray-900">
                      {period.name}
                    </TableCell>
                    <TableCell>{period.days}</TableCell>
                    <TableCell className="text-right">
                      {formatBrl(cost)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatBrl(cost * markup)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatBrl(period.priceCents)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          margin >= 0.3
                            ? 'successLight'
                            : margin >= 0
                              ? 'warningLight'
                              : 'errorLight'
                        }
                      >
                        {percent(margin)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado por bem, neste mês</CardTitle>
          <CardDescription>
            Qual ponto dá mais e qual dá menos. A receita é a do financeiro: o
            que o bem recebeu no mês, nas datas das parcelas. O total vendido no
            mês fica no relatório de vendas, por produto. O custo é o realizado:
            depreciação mais as despesas do ponto lançadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Bem</TableHead>
                <TableHead>Ocupação do mês</TableHead>
                <TableHead className="text-right">Recebido</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Resultado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...assets]
                .sort(
                  (a, b) =>
                    b.revenueCents -
                    b.realCostCents -
                    (a.revenueCents - a.realCostCents),
                )
                .map((item) => {
                  const result = item.revenueCents - item.realCostCents
                  const month = item.occupancy.at(-1) || 0
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-gray-900">
                        {item.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                month >= item.referenceDays
                                  ? 'bg-brand-400'
                                  : 'bg-warning-400',
                              )}
                              style={{ width: `${(month / 30) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-700">
                            {month} dias · referência {item.referenceDays}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatBrl(item.revenueCents)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatBrl(item.realCostCents)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right font-semibold',
                          result >= 0 ? 'text-success-700' : 'text-error-700',
                        )}
                      >
                        {formatBrl(result)}
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
