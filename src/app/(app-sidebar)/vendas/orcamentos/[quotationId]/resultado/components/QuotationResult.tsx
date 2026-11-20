'use client'

// React
import { InfoHint } from '@/components/common/InfoHint'
import { Fragment, useState } from 'react'

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
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { PermissionGate } from '@/components/common/PermissionGate'
import { durationText } from '@/components/common/DurationInput'

// Actions
import {
  exportQuotationResult,
  getQuotationResult,
  type QuotationResultData,
  type ResultResource,
} from '@/actions/quotation-result'

// Hooks / Store / Consts
import { cn, formatMoney } from '@/lib/utils'
import { quotationsStatusObj } from '@/consts/quotations'
import { resourceKindObj } from '@/consts/processes'

// Third-party
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconDownload } from '@tabler/icons-react'

const num = (value: number) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: 3 })

const percent = (value: number) =>
  `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`

const date = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('pt-BR') : '—'

// O tempo em hh:mm:ss, como em toda a composição; o resto com a unidade
const quantityText = (value: number, unit: string) =>
  unit === 'min'
    ? durationText(value)
    : unit === 'h'
      ? durationText(value * 60)
      : `${num(value)} ${unit}`

const kindText = (kind: string) =>
  resourceKindObj[kind as keyof typeof resourceKindObj] || ''

// Margem de quem vende por `sale` e gasta `cost`; sem venda, não há margem
const marginOf = (sale: number, cost: number) =>
  sale > 0 ? ((sale - cost) / sale) * 100 : null

type Item = QuotationResultData['items'][number]

// A venda de cada recurso: o preço do item repartido pela venda sugerida
// do retrato, como a Estimativa de Custos do legado. Assim a coluna soma o
// preço do item, mesmo com desconto
const salesOf = (item: Item) => {
  const resources = item.lines.flatMap((line) => line.resolved)
  const suggested = resources.reduce((sum, r) => sum + (r.sale ?? 0), 0)
  return (resource: ResultResource) =>
    suggested > 0 && resource.sale !== null && resource.sale !== undefined
      ? (resource.sale / suggested) * item.total
      : null
}

// Resultado previsto da venda (ORC-8 e ORC-9), no layout da Estimativa de
// Custos do legado (20/11/2026): informações gerais, resumo de custos e
// margem prevista lado a lado e, por item, cada recurso com composição,
// custo, margem e venda, fechando com o resultado do item. As colunas de
// realizado entram quando houver apontamento (ELITE) ou consumo (FULL). O
// custo sai do retrato gravado na venda (ORC-10): não muda com o de hoje.
export function QuotationResult({ quotationId }: { quotationId: string }) {
  const [exporting, setExporting] = useState(false)
  const { data, isLoading } = useQuery({
    queryKey: ['quotation-result', quotationId],
    queryFn: () => getQuotationResult({ quotationId }),
  })

  const result = data?.data

  // Topbar já na tela (o título vem com os dados); abaixo, a forma do resumo
  if (isLoading)
    return (
      <div className="space-y-5">
        <Topbar
          title=""
          previousPage={`/vendas/orcamentos/${quotationId}/composicao`}
        />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
        </Card>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {[0, 1].map((key) => (
            <Card key={key}>
              <CardContent className="space-y-3 px-6 py-6">
                {Array.from({ length: 3 }, (_, index) => (
                  <Skeleton key={index} className="h-4 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )

  if (!result) {
    return (
      <div className="p-4">
        {data?.message || 'Não foi possível carregar o resultado.'}
      </div>
    )
  }

  // O PDF sai com empresa, usuário e data em todas as páginas (SEG-3)
  const handleExport = async () => {
    setExporting(true)
    const res = await exportQuotationResult({ quotationId })
    setExporting(false)
    if (!res.success || !res.data) {
      toast.error(res.message)
      return
    }
    const bytes = Uint8Array.from(atob(res.data.base64), (char) =>
      char.charCodeAt(0),
    )
    const url = URL.createObjectURL(
      new Blob([bytes], { type: 'application/pdf' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = res.data.name
    link.click()
    URL.revokeObjectURL(url)
  }

  const status = result.status ? quotationsStatusObj[result.status] : null
  // O que a venda leva embora, na ordem da Estimativa de Custos do legado
  const expenses: [string, number][] = [
    [
      `Comissão do vendedor (${percent(result.commission.percent)})`,
      result.commission.value,
    ],
    ['Comissão da agência', result.agencyCommission ?? 0],
    ['Entrega', result.delivery ?? 0],
    ['Cobrança', result.billing ?? 0],
    [`Tributação (${percent(result.taxes.percent)})`, result.taxes.value],
  ]
  const totalCost = result.revenue - result.result
  const share = (value: number) =>
    result.revenue > 0 ? percent((value / result.revenue) * 100) : '—'
  // O realizado só aparece quando existe: sem apontamento, as colunas
  // vazias só atrapalham a leitura
  const hasActual = result.items.some((item) =>
    item.lines.some((line) =>
      line.resolved.some(
        (resource) =>
          resource.actualQuantity !== null || resource.actualCost !== null,
      ),
    ),
  )
  const columns = hasActual ? 8 : 5

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          title={`Resultado previsto · ${result.reference}`}
          previousPage={`/vendas/orcamentos/${quotationId}`}
          supportText={result.client || undefined}
        />

        {/* Informações gerais */}
        <Card>
          <CardContent className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
            <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-5">
              <div>
                <dt className="text-xs text-gray">Cliente</dt>
                <dd className="font-medium text-gray-900">
                  {result.client || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray">Vendedor</dt>
                <dd className="font-medium text-gray-900">
                  {result.seller || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray">Situação</dt>
                <dd>
                  {status ? (
                    <Badge status variant={status.variant}>
                      {status.text}
                    </Badge>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray">Data do orçamento</dt>
                <dd className="font-medium text-gray-900">
                  {date(result.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray">Data da aprovação</dt>
                <dd className="font-medium text-gray-900">
                  {date(result.approvedAt)}
                </dd>
              </div>
            </dl>
            <PermissionGate permissions={['sale:quotation_result:export']}>
              <Button
                type="button"
                variant="neutralOutline"
                LeftIcon={IconDownload}
                isLoading={exporting}
                onClick={handleExport}
              >
                Exportar PDF
              </Button>
            </PermissionGate>
          </CardContent>
        </Card>

        {/* Resumo de custos e margem prevista, lado a lado */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Resumo de custos</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-5">
              <dl className="divide-y divide-gray-100 text-sm">
                {(
                  [
                    ['Custo de produção', result.productionCost],
                    ...expenses,
                  ] as [string, number][]
                ).map(([label, value]) => (
                  <div
                    key={label as string}
                    className="flex items-center justify-between py-2"
                  >
                    <dt className="text-gray-700">{label}</dt>
                    <dd className="tabular-nums text-gray-900">
                      {formatMoney(value as number)}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle>Margem prevista</CardTitle>
                <InfoHint title="Margem prevista">
                  <p>
                    O que sobra da venda depois do custo de produção, da
                    comissão e dos tributos. Enquanto não houver produção
                    apontada, tudo aqui é previsto.
                  </p>
                </InfoHint>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-5">
              <dl className="text-sm">
                <div className="flex items-center justify-between border-b border-gray-100 py-2">
                  <dt className="text-gray-700">Valor final</dt>
                  <dd className="flex gap-6 tabular-nums">
                    <span className="text-gray-900">
                      {formatMoney(result.revenue)}
                    </span>
                    <span className="w-14 text-right text-gray">100%</span>
                  </dd>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 py-2">
                  <dt className="text-gray-700">Custo total</dt>
                  <dd className="flex gap-6 tabular-nums">
                    <span className="text-gray-900">
                      {formatMoney(totalCost)}
                    </span>
                    <span className="w-14 text-right text-gray">
                      {share(totalCost)}
                    </span>
                  </dd>
                </div>
                <div
                  className={cn(
                    'mt-2 flex items-center justify-between rounded-lg px-3 py-2 font-semibold',
                    result.result < 0
                      ? 'bg-error-50 text-error-700'
                      : 'bg-success-50 text-success-700',
                  )}
                >
                  <dt>Resultado</dt>
                  <dd className="flex gap-6 tabular-nums">
                    <span>{formatMoney(result.result)}</span>
                    <span className="w-14 text-right">
                      {percent(result.margin)}
                    </span>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Custos por item */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Custos por item</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            <Table className={hasActual ? 'min-w-[980px]' : 'min-w-[720px]'}>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="min-w-[260px]">Recurso</TableHead>
                  <TableHead numeric>
                    {hasActual ? 'Composição estimada' : 'Composição'}
                  </TableHead>
                  {hasActual && (
                    <TableHead numeric>Composição realizada</TableHead>
                  )}
                  <TableHead numeric>
                    {hasActual ? 'Custo estimado' : 'Custo'}
                  </TableHead>
                  {hasActual && <TableHead numeric>Custo realizado</TableHead>}
                  <TableHead numeric>
                    {hasActual ? 'Margem estimada' : 'Margem'}
                  </TableHead>
                  {hasActual && <TableHead numeric>Margem realizada</TableHead>}
                  <TableHead numeric>Valor de venda</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((item, index) => {
                  const saleOf = salesOf(item)
                  const itemResult = item.total - item.cost
                  return (
                    <Fragment key={item.itemId}>
                      <TableRow className="border-t-2 border-gray-200 hover:bg-transparent">
                        <TableCell
                          colSpan={columns}
                          className="pt-5 font-semibold text-gray-900"
                        >
                          <span className="mr-2 text-gray">#{index + 1}</span>
                          {item.name}
                        </TableCell>
                      </TableRow>
                      {item.costKnown ? (
                        item.lines.flatMap((line) =>
                          line.resolved.map((resource, position) => {
                            const sale = saleOf(resource)
                            const margin =
                              sale === null
                                ? null
                                : marginOf(sale, resource.cost)
                            const actualMargin =
                              sale === null || resource.actualCost === null
                                ? null
                                : marginOf(sale, resource.actualCost)
                            return (
                              <TableRow key={`${line.id}-${position}`}>
                                <TableCell className="pl-8">
                                  <span className="text-gray-900">
                                    {resource.name}
                                  </span>
                                  <span className="block text-xs text-gray">
                                    {[kindText(resource.kind), line.name]
                                      .filter(Boolean)
                                      .join(' · ')}
                                  </span>
                                </TableCell>
                                <TableCell
                                  numeric
                                  className="whitespace-nowrap"
                                >
                                  {quantityText(
                                    resource.quantity,
                                    resource.unit,
                                  )}
                                </TableCell>
                                {hasActual && (
                                  <TableCell
                                    numeric
                                    className="whitespace-nowrap text-gray"
                                  >
                                    {resource.actualQuantity === null
                                      ? '—'
                                      : quantityText(
                                          resource.actualQuantity,
                                          resource.unit,
                                        )}
                                  </TableCell>
                                )}
                                <TableCell numeric>
                                  {formatMoney(resource.cost)}
                                </TableCell>
                                {hasActual && (
                                  <TableCell numeric className="text-gray">
                                    {resource.actualCost === null
                                      ? '—'
                                      : formatMoney(resource.actualCost)}
                                  </TableCell>
                                )}
                                <TableCell numeric className="text-gray-700">
                                  {margin === null ? '—' : percent(margin)}
                                </TableCell>
                                {hasActual && (
                                  <TableCell numeric className="text-gray">
                                    {actualMargin === null
                                      ? '—'
                                      : percent(actualMargin)}
                                  </TableCell>
                                )}
                                <TableCell numeric>
                                  {sale === null ? '—' : formatMoney(sale)}
                                </TableCell>
                              </TableRow>
                            )
                          }),
                        )
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns}
                            className="pl-8 text-sm text-gray"
                          >
                            <Badge variant="warningLight" className="mr-2">
                              sem composição
                            </Badge>
                            Vendido pelo preço do cadastro: o custo não é
                            calculado.
                          </TableCell>
                        </TableRow>
                      )}
                      {/* O fechamento do item: resultado em verde ou
                          vermelho e os totais */}
                      <TableRow className="bg-gray-50 font-semibold hover:bg-gray-50">
                        <TableCell>
                          {item.costKnown ? (
                            <span
                              className={cn(
                                'rounded-md px-2 py-1 text-sm',
                                itemResult < 0
                                  ? 'bg-error-50 text-error-700'
                                  : 'bg-success-50 text-success-700',
                              )}
                            >
                              Resultado do item: {formatMoney(itemResult)}
                            </span>
                          ) : (
                            <span className="text-sm text-gray">Totais</span>
                          )}
                        </TableCell>
                        <TableCell numeric className="text-sm text-gray">
                          {item.costKnown ? 'Totais' : ''}
                        </TableCell>
                        {hasActual && <TableCell />}
                        <TableCell numeric>
                          {item.costKnown ? formatMoney(item.cost) : '—'}
                        </TableCell>
                        {hasActual && <TableCell />}
                        <TableCell numeric>
                          {item.costKnown ? percent(item.margin) : '—'}
                        </TableCell>
                        {hasActual && <TableCell />}
                        <TableCell numeric>{formatMoney(item.total)}</TableCell>
                      </TableRow>
                    </Fragment>
                  )
                })}

                {/* O que a venda leva embora, como no legado: comissão e
                    tributação, em vermelho */}
                <TableRow className="border-t-2 border-gray-200 hover:bg-transparent">
                  <TableCell
                    colSpan={columns}
                    className="pt-5 font-semibold text-gray-900"
                  >
                    Despesas da venda
                  </TableCell>
                </TableRow>
                {expenses.map(([label, value]) => (
                  <TableRow key={label as string}>
                    <TableCell className="pl-8">{label}</TableCell>
                    <TableCell numeric />
                    {hasActual && <TableCell />}
                    <TableCell numeric className="text-error-700">
                      {formatMoney(value as number)}
                    </TableCell>
                    {hasActual && <TableCell />}
                    <TableCell numeric />
                    {hasActual && <TableCell />}
                    <TableCell numeric />
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
