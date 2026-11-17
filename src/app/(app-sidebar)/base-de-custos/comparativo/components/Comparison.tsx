'use client'

// React / Next
import Link from 'next/link'
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
import { TooltipProvider } from '@/components/ui/tooltip'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

// Components
import { LoadError } from '../../components/LoadError'
import { ComparisonSettingsDialog } from './ComparisonSettingsDialog'
import { Button } from '@/components/ui/button'
import { PermissionGate } from '@/components/common/PermissionGate'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'
import { FetchingRegion } from '@/components/common/FetchingRegion'
import { TablePagination } from '@/components/common/TablePagination'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getCostComparison } from '@/actions/cost-base'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'
import { formatReferenceMonth } from '../../reference-month'
import { comparisonPeriods, comparisonStatuses } from '@/consts/cost-base'

// Third-party
import { useQuery, keepPreviousData } from '@tanstack/react-query'

// Icons
import {
  IconScale,
  IconSettings,
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react'

// Sem estimativa ou sem lançamento mostra `-` (design.md §7)
const formatValue = (value: number | null) =>
  value === null ? '-' : formatCurrencyToBrl(value)

export function Comparison({ searchParams }: SearchParamsType) {
  const [expanded, setExpanded] = useState<string[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const period = (searchParams?.period as string) || '12'
  const status = (searchParams?.status as string) || 'todas'

  // Trocar de período ou de situação volta à primeira página
  const link = (next: { period?: string; status?: string }) =>
    `/base-de-custos/comparativo?period=${next.period || period}&status=${
      next.status || status
    }`

  const { data, isLoading, isPlaceholderData } = useQuery({
    staleTime: Infinity,
    // Situação e período mantêm a lista anterior até a nova chegar
    placeholderData: keepPreviousData,
    queryKey: ['cost-comparison', searchParams],
    queryFn: () => getCostComparison({ filters: searchParams }),
  })

  const accounts = data?.data?.accounts || []
  const coverage = data?.data?.coverage
  const lastPage = data?.data?.lastPage ?? 1

  // Os meses completos do período, do mais antigo ao de referência
  const months = data?.data?.months || []
  const firstMonth = formatReferenceMonth(months[0])
  const lastMonth = formatReferenceMonth(months[months.length - 1])
  const periodLabel =
    firstMonth && lastMonth
      ? firstMonth === lastMonth
        ? `Período: ${lastMonth}. `
        : `Período: de ${firstMonth} a ${lastMonth}. `
      : ''

  const toggle = (id: string) =>
    setExpanded((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>Previsto e realizado</CardTitle>
          <CardDescription>
            As contas do plano de contas que não são despesa administrativa —
            essas já entram na aba própria, com custo mensal de referência. Aqui
            a empresa vê o que está previsto no sistema, o que ainda não está, e
            se o previsto está acontecendo.
          </CardDescription>
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Tabs value={status} className="overflow-x-auto">
              <TabsList>
                {comparisonStatuses.map((item) => (
                  <TabsTrigger key={item.value} value={item.value} asChild>
                    <Link href={link({ status: item.value })}>
                      {item.label}
                      {item.value === 'sem-previsao' &&
                      coverage?.withoutEstimate
                        ? ` (${coverage.withoutEstimate})`
                        : ''}
                    </Link>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Tabs value={period} className="overflow-x-auto">
              <TabsList>
                {comparisonPeriods.map((item) => (
                  <TabsTrigger key={item.value} value={item.value} asChild>
                    <Link href={link({ period: item.value })}>
                      {item.label}
                    </Link>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            {/* Em que conta entram o material das vendas e o custo financeiro */}
            <PermissionGate permissions={['cost:base:edit']}>
              <Button
                type="button"
                variant="neutralOutline"
                LeftIcon={IconSettings}
                className="ml-auto"
                onClick={() => setSettingsOpen(true)}
              >
                Contas das fontes
              </Button>
            </PermissionGate>
          </div>
        </CardHeader>
        <FetchingRegion isFetching={isPlaceholderData}>
          {data && !data.success ? (
            <LoadError message={data.message} />
          ) : !isLoading && !accounts.length ? (
            <ListDataTotalEmpty
              icon={IconScale}
              title={
                status === 'sem-previsao'
                  ? 'Todas as contas têm previsão'
                  : 'Nada para comparar ainda'
              }
              description={
                status === 'sem-previsao'
                  ? 'Todo o resto do plano de contas já tem estimativa vinda dos cadastros.'
                  : 'As contas vêm do plano de contas, fora as despesas administrativas, que ficam na aba própria.'
              }
            />
          ) : (
            <>
              <CardContent>
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[6%]" />
                      <TableHead className="w-[34%] min-w-[220px]">
                        Conta
                      </TableHead>
                      <TableHead numeric className="w-[18%]">
                        Previsto no período
                      </TableHead>
                      <TableHead numeric className="w-[18%]">
                        Realizado no período
                      </TableHead>
                      <TableHead numeric className="w-[24%]">
                        Diferença
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableSkeletonRows cols={5} rows={6} />
                    ) : (
                      accounts.map((account) => {
                        const isExpanded = expanded.includes(account.id)

                        return (
                          <Fragment key={account.id}>
                            <TableRow>
                              <TableCell>
                                <ActionButton
                                  Icon={
                                    isExpanded
                                      ? IconChevronDown
                                      : IconChevronRight
                                  }
                                  tooltip={
                                    isExpanded
                                      ? `Recolher ${account.name}`
                                      : `Detalhar ${account.name}`
                                  }
                                  onClick={() => toggle(account.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-medium">{account.name}</p>
                                  {account.estimated === null && (
                                    <Badge variant="warningLight">
                                      sem previsão
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray">
                                  {account.chartAccount}
                                </p>
                              </TableCell>
                              <TableCell numeric>
                                {formatValue(account.estimated)}
                              </TableCell>
                              <TableCell numeric>
                                {formatValue(account.actual)}
                              </TableCell>
                              <TableCell className="text-right">
                                {account.difference === null ? (
                                  <span className="text-sm text-gray">
                                    sem comparação
                                  </span>
                                ) : (
                                  <div className="flex items-center justify-end gap-2">
                                    <span>
                                      {formatCurrencyToBrl(
                                        Math.abs(account.difference),
                                      )}
                                    </span>
                                    <Badge variant="neutralLight">
                                      {/* Diferença zero não é desvio: está no previsto */}
                                      {account.difference === 0
                                        ? 'no previsto'
                                        : account.difference > 0
                                          ? 'abaixo do previsto'
                                          : 'acima do previsto'}
                                      {account.differencePercent !== null &&
                                        ` · ${Math.abs(
                                          account.differencePercent,
                                        )
                                          .toString()
                                          .replace('.', ',')}%`}
                                    </Badge>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                            {isExpanded &&
                              (account.sources.length ? (
                                account.sources.map((source) => (
                                  <TableRow
                                    key={source.id}
                                    className="bg-gray-50"
                                  >
                                    <TableCell />
                                    <TableCell colSpan={2}>
                                      <p className="text-sm font-medium">
                                        {source.name}
                                      </p>
                                      <p className="text-sm text-gray">
                                        {source.detail}
                                      </p>
                                    </TableCell>
                                    <TableCell numeric colSpan={2}>
                                      {formatCurrencyToBrl(source.value)}
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow className="bg-gray-50">
                                  <TableCell />
                                  <TableCell
                                    colSpan={4}
                                    className="text-sm text-gray"
                                  >
                                    Nenhuma estimativa nos cadastros aponta para
                                    esta conta. Ela é candidata a virar custo de
                                    cadastro.
                                  </TableCell>
                                </TableRow>
                              ))}
                          </Fragment>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-4">
                {/* De onde vem o previsto: o rodapé explica as fontes */}
                <p className="text-sm text-gray">
                  {periodLabel}
                  {coverage
                    ? `${coverage.withEstimate} de ${coverage.total} contas já têm previsão no sistema. `
                    : ''}
                  O previsto soma os custos dos patrimônios pelo volume do
                  período (as leituras do contador, o que foi vendido pelas
                  composições ou o volume mensal previsto do cadastro), o custo
                  financeiro sobre o recebido e o material das composições
                  vendidas. Períodos maiores são mais precisos: a compra não
                  acontece no mesmo mês do consumo. A depreciação não aparece
                  aqui, porque não tem lançamento financeiro correspondente.
                </p>
                {lastPage > 1 ? (
                  <TablePagination
                    searchParams={searchParams}
                    lastPage={lastPage}
                  />
                ) : null}
              </CardFooter>
            </>
          )}
        </FetchingRegion>
      </Card>
      <ComparisonSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </TooltipProvider>
  )
}
