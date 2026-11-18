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
import { PermissionGate } from '@/components/common/PermissionGate'

// Actions
import {
  exportQuotationResult,
  getQuotationResult,
} from '@/actions/quotation-result'

// Hooks / Store / Consts
import { cn, formatMoney } from '@/lib/utils'

// Third-party
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconDownload } from '@tabler/icons-react'

const num = (value: number) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: 3 })

const percent = (value: number) => value.toString().replace('.', ',')

// Resultado previsto da venda (ORC-8 e ORC-9). Substitui o PDF "Estimativa de
// Custos" do legado: aqui é tela, com permissão própria, e as colunas de
// realizado entram quando houver apontamento (ELITE) e consumo (FULL). O
// custo sai do retrato gravado na venda (ORC-10): não muda com o custo de
// hoje.
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

  const summary = [
    { label: 'Preço de venda', value: result.revenue },
    { label: 'Custo de produção', value: -result.productionCost },
    {
      label: `Comissão do vendedor (${percent(result.commission.percent)}%)`,
      value: -result.commission.value,
    },
    {
      label: `Tributação (${percent(result.taxes.percent)}%)`,
      value: -result.taxes.value,
    },
  ]

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          title={`Resultado previsto · ${result.reference}`}
          previousPage={`/vendas/orcamentos/${quotationId}`}
          supportText={result.client || undefined}
        />

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <CardTitle>Resultado da venda</CardTitle>
                  <InfoHint title="Resultado da venda">
                    <p>
                      O que sobra depois do custo de produção e do que a venda
                      leva embora. Enquanto não houver produção apontada, tudo
                      aqui é previsto.
                    </p>
                  </InfoHint>
                </div>
              </div>
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
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
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
                    result.result < 0 ? 'text-error-700' : 'text-success-700',
                  )}
                >
                  {formatMoney(result.result)}
                </p>
                <p className="text-sm text-gray">
                  {percent(result.margin)}% de margem
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {result.items.map((item) => (
          <Card key={item.itemId}>
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>Venda {formatMoney(item.total)}</CardDescription>
            </CardHeader>
            {item.costKnown ? (
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
                        <TableHead numeric className="w-[14%]">
                          Realizado
                        </TableHead>
                        <TableHead numeric className="w-[14%]">
                          Custo estimado
                        </TableHead>
                        <TableHead numeric className="w-[14%]">
                          Custo realizado
                        </TableHead>
                        <TableHead numeric className="w-[14%]">
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
                              {line.kind !== 'STAGE' && (
                                <Badge variant="neutralLight" className="ml-2">
                                  acrescentado
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                          {line.resolved.map((resource, index) => (
                            <TableRow key={`${line.id}-${index}`}>
                              <TableCell className="pl-8">
                                {resource.name}
                              </TableCell>
                              <TableCell numeric className="text-gray-600">
                                {num(resource.quantity)} {resource.unit}
                              </TableCell>
                              <TableCell numeric className="text-gray">
                                {resource.actualQuantity === null
                                  ? '—'
                                  : `${num(resource.actualQuantity)} ${resource.unit}`}
                              </TableCell>
                              <TableCell numeric>
                                {formatMoney(resource.cost)}
                              </TableCell>
                              <TableCell numeric className="text-gray">
                                {resource.actualCost === null
                                  ? '—'
                                  : formatMoney(resource.actualCost)}
                              </TableCell>
                              <TableCell numeric className="text-gray">
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
                <CardFooter className="flex-wrap justify-between gap-3">
                  <p className="text-sm text-gray">
                    {item.lines[0]?.resolvedAt
                      ? `Cálculo resolvido em ${new Date(item.lines[0].resolvedAt).toLocaleDateString('pt-BR')}. `
                      : ''}
                    O realizado aparece com o apontamento da produção (tempo) e
                    o consumo do estoque (material).
                  </p>
                  <p className="text-sm">
                    Custo {formatMoney(item.cost)} · venda{' '}
                    {formatMoney(item.total)} ·{' '}
                    <span
                      className={cn(
                        'font-semibold',
                        item.margin < 0 ? 'text-error-700' : 'text-gray-900',
                      )}
                    >
                      {percent(item.margin)}% de margem
                    </span>
                  </p>
                </CardFooter>
              </>
            ) : (
              <CardContent className="px-6 pb-6">
                <Badge variant="warningLight">sem composição</Badge>
                <p className="mt-2 text-sm text-gray">
                  Este item é vendido pelo preço do cadastro. Sem composição, o
                  custo não é calculado e a margem não aparece.
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </TooltipProvider>
  )
}
