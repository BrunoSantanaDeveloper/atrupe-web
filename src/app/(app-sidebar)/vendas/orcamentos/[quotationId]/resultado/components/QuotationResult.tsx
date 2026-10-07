'use client'

// React
import { Fragment } from 'react'

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
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'

// Actions
import { getQuotation } from '@/actions/quotation-composition'

// Hooks / Store / Consts
import { cn, formatMoney } from '@/lib/utils'
import { itemTotal, quotationTotal } from '@/lib/quotation-calc'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Percentuais de referência da empresa, vindos da Precificação (PR-1)
const SELLER_COMMISSION = 5
const TAXES = 10

// Resultado previsto da venda (ORC-8 e ORC-9). Substitui o PDF "Estimativa de
// Custos" do legado: aqui é tela, com permissão própria, e as colunas de
// realizado entram quando houver apontamento (ELITE) e consumo (FULL).
export function QuotationResult({ quotationId }: { quotationId: string }) {
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['quotation-composition', quotationId],
    queryFn: () => getQuotation({ id: quotationId }),
  })

  const quotation = data?.data

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
          <CardContent className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-6 w-28" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
        </Card>
      </div>
    )

  if (!quotation) return <div className="p-4">Orçamento não encontrado.</div>

  const revenue = quotationTotal(quotation.items)
  const productionCost = quotation.items.reduce(
    (sum, item) =>
      sum +
      item.lines.reduce((lineSum, line) => lineSum + line.cost, 0) *
        item.quantity,
    0,
  )
  const commission = Math.round((revenue * SELLER_COMMISSION) / 100)
  const taxes = Math.round((revenue * TAXES) / 100)
  const result = revenue - productionCost - commission - taxes
  const margin = revenue ? Math.round((result / revenue) * 1000) / 10 : 0

  const summary = [
    { label: 'Preço de venda', value: revenue },
    { label: 'Custo de produção', value: -productionCost },
    {
      label: `Comissão do vendedor (${SELLER_COMMISSION}%)`,
      value: -commission,
    },
    { label: `Tributação (${TAXES}%)`, value: -taxes },
  ]

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          review="new"
          title={`Resultado previsto · ${quotation.reference}`}
          previousPage={`/vendas/orcamentos/${quotationId}/composicao`}
          supportText={quotation.client}
        />

        <Card>
          <CardHeader>
            <CardTitle>Resultado da venda</CardTitle>
            <CardDescription>
              O que sobra depois do custo de produção e do que a venda leva
              embora. Enquanto não houver produção apontada, tudo aqui é
              previsto.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {summary.map((line) => (
                <div key={line.label}>
                  <p className="text-xs text-gray">{line.label}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatMoney(Math.abs(line.value))}
                  </p>
                </div>
              ))}
              <div>
                <p className="text-xs text-gray">Resultado</p>
                <p
                  className={cn(
                    'text-lg font-semibold',
                    result < 0 ? 'text-error-700' : 'text-success-700',
                  )}
                >
                  {formatMoney(result)}
                </p>
                <p className="text-sm text-gray">
                  {margin.toString().replace('.', ',')}% de margem
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {quotation.items.map((item) => {
          const cost =
            item.lines.reduce((sum, line) => sum + line.cost, 0) * item.quantity
          const price = itemTotal(item)
          const itemMargin = price
            ? Math.round(((price - cost) / price) * 1000) / 10
            : null

          return (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>
                  {item.sector} · {item.quantity} un
                  {item.width && item.height
                    ? ` · ${item.width} x ${item.height}`.replace(/\./g, ',')
                    : ''}
                </CardDescription>
              </CardHeader>
              {item.lines.length ? (
                <>
                  <CardContent>
                    <Table className="min-w-[900px]">
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="w-[30%] min-w-[200px]">
                            Composição
                          </TableHead>
                          <TableHead className="w-[14%] text-right">
                            Estimado
                          </TableHead>
                          <TableHead className="w-[14%] text-right">
                            Realizado
                          </TableHead>
                          <TableHead className="w-[14%] text-right">
                            Custo estimado
                          </TableHead>
                          <TableHead className="w-[14%] text-right">
                            Custo realizado
                          </TableHead>
                          <TableHead className="w-[14%] text-right">
                            Diferença
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {item.lines.map((line) => (
                          <Fragment key={line.id}>
                            <TableRow className="bg-gray-50">
                              <TableCell colSpan={6} className="font-medium">
                                {line.name}
                                <span className="ml-2 text-sm text-gray">
                                  {line.sector}
                                </span>
                              </TableCell>
                            </TableRow>
                            {line.resolved.map((resource) => (
                              <TableRow key={resource.id}>
                                <TableCell className="pl-8">
                                  {resource.name}
                                </TableCell>
                                <TableCell className="text-right text-gray-600">
                                  {resource.quantity
                                    .toString()
                                    .replace('.', ',')}{' '}
                                  {resource.unit}
                                </TableCell>
                                <TableCell className="text-right text-gray">
                                  {resource.actualQuantity === null
                                    ? '—'
                                    : `${resource.actualQuantity} ${resource.unit}`}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatMoney(resource.cost)}
                                </TableCell>
                                <TableCell className="text-right text-gray">
                                  {resource.actualCost === null
                                    ? '—'
                                    : formatMoney(resource.actualCost)}
                                </TableCell>
                                <TableCell className="text-right text-gray">
                                  {resource.actualCost === null
                                    ? '—'
                                    : formatMoney(
                                        resource.cost - resource.actualCost,
                                      )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="justify-between flex-wrap gap-3">
                    <p className="text-sm text-gray">
                      Cálculo resolvido em{' '}
                      {new Date(item.lines[0].resolvedAt).toLocaleDateString(
                        'pt-BR',
                      )}
                      . O realizado aparece com o apontamento da produção
                      (tempo) e o consumo do estoque (material).
                    </p>
                    <p className="text-sm">
                      Custo {formatMoney(cost)} · venda {formatMoney(price)} ·{' '}
                      <span
                        className={cn(
                          'font-semibold',
                          itemMargin !== null && itemMargin < 0
                            ? 'text-error-700'
                            : 'text-gray-900',
                        )}
                      >
                        {itemMargin === null
                          ? '-'
                          : `${itemMargin.toString().replace('.', ',')}% de margem`}
                      </span>
                    </p>
                  </CardFooter>
                </>
              ) : (
                <CardContent className="px-6 pb-6">
                  <Badge variant="warningLight">sem composição</Badge>
                  <p className="mt-2 text-sm text-gray">
                    Este item é vendido pelo preço do cadastro. Sem composição,
                    o custo não é calculado e a margem não aparece.
                  </p>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
