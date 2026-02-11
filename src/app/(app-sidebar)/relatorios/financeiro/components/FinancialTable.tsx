'use client'

import { Fragment, useState } from 'react'
import { useSearchParams } from 'next/navigation'
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
import type { FinancialTab, FinancialStatus } from '../types'

interface FinancialTableProps extends SearchParamsType {
  tab: FinancialTab
}

export function FinancialTable({ searchParams, tab }: FinancialTableProps) {
  const urlParams = useSearchParams()

  const [status, setStatus] = useState<FinancialStatus>('received')
  const [groupBy, setGroupBy] = useState<'none' | 'client'>('client')
  const [orderBy, setOrderBy] = useState<
    'saleDate' | 'dueDate' | 'receivedDate' | 'valueDesc' | 'valueAsc'
  >('receivedDate')

  const page = parseInt(urlParams.get('page') || '1')

  const { data, isLoading } = useQuery({
    queryKey: [
      'financial-table',
      searchParams,
      tab,
      status,
      groupBy,
      orderBy,
      page,
    ],
    queryFn: () =>
      getFinancialTable({
        tab,
        startDate: searchParams?.startDate as string,
        endDate: searchParams?.endDate as string,
        status,
        groupBy: groupBy as 'none' | 'client',
        orderBy,
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

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-4 flex-wrap space-y-0">
        <SelectBasic
          name="status"
          label={tab === 'receitas' ? 'Receitas' : 'Despesas'}
          options={
            tab === 'receitas' ? statusOptionsReceitas : statusOptionsDespesas
          }
          value={status}
          onChange={(v) => setStatus(v as FinancialStatus)}
          className="lg:w-[200px] w-full"
        />

        <SelectBasic
          name="groupBy"
          label="Agrupar por"
          options={
            tab === 'receitas' ? groupByOptionsReceitas : groupByOptionsDespesas
          }
          value={groupBy}
          onChange={(v) => setGroupBy(v as 'none' | 'client')}
          className="lg:w-[200px] w-full"
        />

        <SelectBasic
          name="orderBy"
          label="Ordenar por"
          options={
            tab === 'receitas' ? orderByOptionsReceitas : orderByOptionsDespesas
          }
          value={orderBy}
          onChange={(v) => setOrderBy(v as typeof orderBy)}
          className="lg:w-[200px] w-full"
        />
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="w-full h-12" />
            ))}
          </div>
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
                      Serviços
                      <Badge variant="neutralLight">
                        {data?.totalCount || 0}
                      </Badge>
                    </span>
                  </TableHead>
                  <TableHead>Data do recebimento</TableHead>
                  <TableHead className="text-right">Vendas</TableHead>
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
                              {record.percentage}%
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
                          {record.percentage}%
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
