'use client'

import { Fragment } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

// UI
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { SelectBasic } from '@/components/common/form/FormSelect'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { TablePagination } from '@/components/common/TablePagination'

// Config
import {
  statusOptionsReceitas,
  statusOptionsDespesas,
  groupByOptionsReceitas,
  groupByOptionsDespesas,
  orderByOptionsReceitas,
  orderByOptionsDespesas,
} from '../config'

// Actions
import { getFinancialTable } from '@/actions/financial-report'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { FinancialTab } from '../types'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

interface FinancialTableProps extends SearchParamsType {
  tab: FinancialTab
}

export function FinancialTable({ searchParams, tab }: FinancialTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const urlSearchParams = useSearchParams()
  const { canProvision } = usePlanFeatures()

  const status = (searchParams?.status as string) || 'received'
  const groupBy = (searchParams?.groupBy as 'none' | 'client') || 'client'
  const orderBy =
    (searchParams?.orderBy as string) ||
    (tab === 'despesas' ? 'dueDate' : 'receivedDate')
  const page = Number(searchParams?.page) || 1

  // Helper to update URL params
  const updateUrlParam = (key: string, value: string) => {
    const params = new URLSearchParams(urlSearchParams.toString())
    params.set(key, value)
    // Reset to page 1 when changing filters
    if (key !== 'page') {
      params.set('page', '1')
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const { data, isLoading } = useQuery({
    queryKey: [
      'financial-table',
      searchParams?.startDate,
      searchParams?.endDate,
      tab,
      status,
      groupBy,
      orderBy,
      page,
      searchParams?.clientId,
    ],
    queryFn: () =>
      getFinancialTable({
        tab,
        startDate: searchParams?.startDate as string,
        endDate: searchParams?.endDate as string,
        clientId: searchParams?.clientId as string,
        status: status as 'received' | 'confirmed' | 'to_receive' | 'overdue',
        groupBy,
        orderBy: orderBy as
          | 'saleDate'
          | 'dueDate'
          | 'receivedDate'
          | 'valueDesc'
          | 'valueAsc',
        page,
        limit: 10,
      }),
  })

  const getValueColor = (recordStatus: string) => {
    switch (recordStatus) {
      case 'received':
        return 'text-green-600'
      case 'to_receive':
        return 'text-green-600'
      case 'overdue':
        return 'text-red-600'
      default:
        return 'text-gray-900'
    }
  }

  const getPct = (value: number) => {
    const total = data?.totalValue || 0
    if (total <= 0) return '0.0'
    return ((value / total) * 100).toFixed(1)
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-4 flex-wrap space-y-0">
        <SelectBasic
          name="status"
          label={tab === 'receitas' ? 'Receitas' : 'Despesas'}
          options={(tab === 'receitas'
            ? statusOptionsReceitas
            : statusOptionsDespesas
          ).filter((opt) => canProvision() || opt.value !== 'confirmed')}
          value={status}
          onChange={(v) => updateUrlParam('status', v)}
          className="lg:w-[200px] w-full"
        />

        <SelectBasic
          name="groupBy"
          label="Agrupar por"
          options={
            tab === 'receitas' ? groupByOptionsReceitas : groupByOptionsDespesas
          }
          value={groupBy}
          onChange={(v) => updateUrlParam('groupBy', v)}
          className="lg:w-[200px] w-full"
        />

        <SelectBasic
          name="orderBy"
          label="Ordenar por"
          options={
            tab === 'receitas' ? orderByOptionsReceitas : orderByOptionsDespesas
          }
          value={orderBy}
          onChange={(v) => updateUrlParam('orderBy', v)}
          className="lg:w-[200px] w-full"
        />
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-32" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </TableHead>
                <TableHead className="text-right w-16">
                  <Skeleton className="h-4 w-8 ml-auto" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex flex-col">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3.5 w-48" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-10 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : !data ||
          (data.records.length === 0 &&
            (!data.groups || data.groups.length === 0)) ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-gray-500">Nenhum dado disponível</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">
                    <span className="flex items-center gap-2">
                      {tab === 'receitas' ? 'Receitas' : 'Despesas'}
                      <Badge variant="neutralLight">
                        {data?.totalCount || 0}
                      </Badge>
                    </span>
                  </TableHead>
                  <TableHead>
                    {tab === 'receitas'
                      ? 'Data do recebimento'
                      : 'Data do pagamento'}
                  </TableHead>
                  <TableHead className="text-right">
                    {tab === 'receitas' ? 'Vendas' : 'Pagamentos'}
                  </TableHead>
                  <TableHead className="text-right w-16">100%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.grouped && data.groups
                  ? data.groups.map((group) => (
                      <Fragment key={group.clientId}>
                        {/* Group Header */}
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableCell colSpan={2} className="font-medium">
                            <div className="flex items-center gap-2">
                              {group.clientName}
                              <Badge variant="neutralLight">
                                {group.count}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrencyToBrl(group.total)}
                          </TableCell>
                          <TableCell />
                        </TableRow>

                        {/* Group Records */}
                        {group.records.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {record.clientName}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {record.description}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-500">
                              {record.receivedDate || '-'}
                            </TableCell>
                            <TableCell
                              className={`text-right font-medium ${getValueColor(record.status)}`}
                            >
                              {formatCurrencyToBrl(record.value)}
                            </TableCell>
                            <TableCell className="text-right text-gray-500">
                              {getPct(record.value)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </Fragment>
                    ))
                  : data.records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {record.clientName}
                            </span>
                            <span className="text-sm text-gray-500">
                              {record.description}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {record.receivedDate || '-'}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${getValueColor(record.status)}`}
                        >
                          {formatCurrencyToBrl(record.value)}
                        </TableCell>
                        <TableCell className="text-right text-gray-500">
                          {getPct(record.value)}%
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>

            {data.pagination.totalPages > 1 && (
              <div className="mt-4">
                <TablePagination
                  searchParams={searchParams as { [key: string]: string }}
                  lastPage={data.pagination.totalPages}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
