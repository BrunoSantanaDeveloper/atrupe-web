'use client'

import { Fragment } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'

// UI
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { TablePagination } from '@/components/common/TablePagination'

// Config
import { movementOptions, groupByOptions, orderByOptions } from '../config'

// Actions
import { getCashFlowTable } from '@/actions/cash-flow-report'

// Utils
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import { updateFilterParam } from '@/lib/filter-utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { CashFlowRecord } from '../types'

export function CashFlowTable({ searchParams }: SearchParamsType) {
  const router = useRouter()
  const params = useSearchParams()
  const updateOptions = { router, params }

  const { data, isLoading } = useQuery({
    queryKey: ['cash-flow-table', searchParams],
    queryFn: () =>
      getCashFlowTable({
        startDate: searchParams?.startDate as string,
        endDate: searchParams?.endDate as string,
        movement:
          (searchParams?.movement as 'all' | 'revenue' | 'expense') || 'all',
        groupBy:
          (searchParams?.groupBy as 'none' | 'date' | 'client') || 'date',
        orderBy:
          (searchParams?.orderBy as
            | 'dueDate'
            | 'valueDesc'
            | 'valueAsc'
            | 'clientName') || 'dueDate',
        page: Number(searchParams?.page) || 1,
        limit: 10,
      }),
  })

  const renderRecord = (record: CashFlowRecord) => (
    <TableRow key={record.id}>
      <TableCell>
        <p className="font-medium">{record.clientName}</p>
        <p className="text-gray truncate">{record.description}</p>
      </TableCell>
      <TableCell
        className={cn(
          'text-nowrap font-medium',
          record.value >= 0 ? 'text-success-700' : 'text-error-700',
        )}
      >
        {record.value >= 0 ? '' : '-'}
        {formatCurrencyToBrl(Math.abs(record.value))}
      </TableCell>
      <TableCell className="text-right text-gray-600">
        {record.percentage}%
      </TableCell>
    </TableRow>
  )

  return (
    <Card>
      {/* Table Filters */}
      <CardHeader className="flex-row flex-wrap space-y-0 gap-4">
        <SelectBasic
          name="movement"
          label="Movimentação"
          className="lg:w-[200px] w-full"
          options={movementOptions}
          value={(searchParams?.movement as string) || 'all'}
          onChange={(value) =>
            updateFilterParam('movement', value, updateOptions)
          }
        />
        <SelectBasic
          name="groupBy"
          label="Agrupar por"
          className="lg:w-[200px] w-full"
          options={groupByOptions}
          value={(searchParams?.groupBy as string) || 'date'}
          onChange={(value) =>
            updateFilterParam('groupBy', value, updateOptions)
          }
        />
        <SelectBasic
          name="orderBy"
          label="Ordenar por"
          className="lg:w-[200px] w-full"
          options={orderByOptions}
          value={(searchParams?.orderBy as string) || 'dueDate'}
          onChange={(value) =>
            updateFilterParam('orderBy', value, updateOptions)
          }
        />
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>
                  <div className="flex items-center gap-2">
                    <span>Movimentações</span>
                    <Badge variant="neutralLight" className="font-medium">
                      {data?.totalCount || 0}
                    </Badge>
                  </div>
                </TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="text-right">100%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.grouped && data?.groups
                ? data.groups.map((group) => (
                    <Fragment key={group.date}>
                      {/* Group Header */}
                      <TableRow className="bg-gray-100">
                        <TableCell
                          colSpan={2}
                          className="text-gray font-medium text-xs py-3"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-primary-700">
                              {group.date}
                            </span>
                            <Badge variant="neutralLight" className="text-xs">
                              {group.count}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell
                          className={cn(
                            'font-medium text-xs py-3 text-right',
                            group.total >= 0
                              ? 'text-success-700'
                              : 'text-error-700',
                          )}
                        >
                          {formatCurrencyToBrl(group.total)}
                        </TableCell>
                      </TableRow>

                      {/* Group Records */}
                      {group.records.map(renderRecord)}
                    </Fragment>
                  ))
                : data?.records.map(renderRecord)}

              {(!data?.records || data.records.length === 0) &&
                (!data?.groups || data.groups.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-gray-500 py-8"
                    >
                      Nenhum registro encontrado
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <CardFooter>
          <TablePagination
            searchParams={searchParams}
            lastPage={data.pagination.totalPages}
          />
        </CardFooter>
      )}
    </Card>
  )
}
