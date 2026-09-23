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
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getCostComparison } from '@/actions/cost-base'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'
import { comparisonPeriods } from '@/consts/cost-base'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import {
  IconScale,
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react'

// Sem estimativa ou sem lançamento mostra `-` (design.md §7)
const formatValue = (value: number | null) =>
  value === null ? '-' : formatCurrencyToBrl(value)

export function Comparison({ searchParams }: SearchParamsType) {
  const [expanded, setExpanded] = useState<string[]>([])
  const period = (searchParams?.period as string) || '12'

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['cost-comparison', searchParams],
    queryFn: () => getCostComparison({ filters: searchParams }),
  })

  const accounts = data?.data?.accounts || []

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
            O previsto é a estimativa dos cadastros multiplicada pelo volume do
            período. A diferença é informação, não erro: a mesma conta pode ter
            quebra, manutenção corretiva ou gasto extraordinário.
          </CardDescription>
          <Tabs value={period} className="overflow-x-auto pt-4">
            <TabsList>
              {comparisonPeriods.map((item) => (
                <TabsTrigger key={item.value} value={item.value} asChild>
                  <Link
                    href={`/base-de-custos/comparativo?period=${item.value}`}
                  >
                    {item.label}
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        {isLoading ? (
          <TableSkeleton cols={5} rows={6} />
        ) : !accounts.length ? (
          <ListDataTotalEmpty
            icon={IconScale}
            title="Nada para comparar ainda"
            description="As contas aparecem aqui quando houver estimativa nos cadastros ou lançamento no financeiro."
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
                    <TableHead className="w-[18%] text-right">
                      Previsto no período
                    </TableHead>
                    <TableHead className="w-[18%] text-right">
                      Realizado no período
                    </TableHead>
                    <TableHead className="w-[24%] text-right">
                      Diferença
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => {
                    const isExpanded = expanded.includes(account.id)

                    return (
                      <Fragment key={account.id}>
                        <TableRow>
                          <TableCell>
                            <ActionButton
                              Icon={
                                isExpanded ? IconChevronDown : IconChevronRight
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
                            <p className="font-medium">{account.name}</p>
                            <p className="text-sm text-gray">
                              {account.chartAccount}
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatValue(account.estimated)}
                          </TableCell>
                          <TableCell className="text-right">
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
                                  {account.difference >= 0
                                    ? 'abaixo do previsto'
                                    : 'acima do previsto'}
                                  {account.differencePercent !== null &&
                                    ` · ${Math.abs(account.differencePercent)
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
                              <TableRow key={source.id} className="bg-gray-50">
                                <TableCell />
                                <TableCell colSpan={2}>
                                  <p className="text-sm font-medium">
                                    {source.name}
                                  </p>
                                  <p className="text-sm text-gray">
                                    {source.detail}
                                  </p>
                                </TableCell>
                                <TableCell className="text-right" colSpan={2}>
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
                  })}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray">
                Períodos maiores são mais precisos: a compra não acontece no
                mesmo mês do consumo. A depreciação não aparece aqui, porque não
                tem lançamento financeiro correspondente.
              </p>
            </CardFooter>
          </>
        )}
      </Card>
    </TooltipProvider>
  )
}
