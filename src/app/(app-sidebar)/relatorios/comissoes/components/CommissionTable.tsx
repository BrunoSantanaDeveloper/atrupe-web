'use client'

import { Fragment, useState } from 'react'
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
import { groupByOptions, orderByOptions } from '../config'

// Actions
import { getCommissionTable } from '@/actions/commission-report'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type {
  CommissionType,
  CommissionGroupBy,
  CommissionOrderBy,
  CommissionRecord,
} from '../types'

interface CommissionTableProps extends SearchParamsType {}

export function CommissionTable({ searchParams }: CommissionTableProps) {
  const [groupBy, setGroupBy] = useState<CommissionGroupBy>('none')
  const [orderBy, setOrderBy] = useState<CommissionOrderBy>('saleDate')

  const page = parseInt((searchParams?.page as string) || '1')

  const { data, isLoading } = useQuery({
    queryKey: ['commission-table', searchParams, groupBy, orderBy, page],
    queryFn: () =>
      getCommissionTable({
        commissionType: searchParams?.commissionType as CommissionType,
        startDate: searchParams?.startDate as string,
        endDate: searchParams?.endDate as string,
        groupBy,
        orderBy,
        page,
        limit: 10,
      }),
  })

  const renderRecord = (record: CommissionRecord) => (
    <TableRow key={record.id}>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{record.clientName}</span>
          <span className="text-sm text-gray">{record.description}</span>
        </div>
      </TableCell>
      <TableCell className="text-gray-600">{record.saleDate}</TableCell>
      <TableCell className="text-gray-600">{record.receivedDate}</TableCell>
      <TableCell className="text-right text-gray-900">
        {formatCurrencyToBrl(record.saleValue)}
      </TableCell>
      <TableCell className="text-right text-success-700 font-medium">
        {formatCurrencyToBrl(record.receivedValue)}
      </TableCell>
      <TableCell className="text-right text-gray-600">
        {record.percentage}%
      </TableCell>
    </TableRow>
  )

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap space-y-0 gap-4">
        <SelectBasic
          name="groupBy"
          label="Agrupar por"
          options={groupByOptions}
          value={groupBy}
          onChange={(v) => setGroupBy(v as CommissionGroupBy)}
          className="w-[180px]"
        />
        <SelectBasic
          name="orderBy"
          label="Ordenar por"
          options={orderByOptions}
          value={orderBy}
          onChange={(v) => setOrderBy(v as CommissionOrderBy)}
          className="w-[200px]"
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
                <TableRow className="bg-gray-50">
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <span>Serviços</span>
                      <Badge variant="neutralLight" className="font-medium">
                        {data.totalCount}
                      </Badge>
                    </div>
                  </TableHead>
                  <TableHead>Data da venda</TableHead>
                  <TableHead>Data do recebimento</TableHead>
                  <TableHead className="text-right">Venda</TableHead>
                  <TableHead className="text-right">Recebimento</TableHead>
                  <TableHead className="text-right w-16">100%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.grouped && data.groups.length > 0
                  ? data.groups.map((group) => (
                      <Fragment key={group.vendedorId}>
                        {/* Group Header */}
                        <TableRow className="bg-gray-100">
                          <TableCell
                            colSpan={3}
                            className="text-gray font-medium text-xs py-3"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-primary-700">
                                {group.vendedorName}
                              </span>
                              <Badge variant="neutralLight" className="text-xs">
                                {group.count}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-gray-900 font-medium text-xs py-3">
                            {formatCurrencyToBrl(group.saleTotal)}
                          </TableCell>
                          <TableCell className="text-right text-success-700 font-medium text-xs py-3">
                            {formatCurrencyToBrl(group.receivedTotal)}
                          </TableCell>
                          <TableCell />
                        </TableRow>

                        {/* Group Records */}
                        {group.records.map((record) => renderRecord(record))}
                      </Fragment>
                    ))
                  : data.records.map((record) => renderRecord(record))}
              </TableBody>
            </Table>

            {data.pagination.totalPages > 1 && (
              <div className="p-4">
                <TablePagination
                  searchParams={searchParams as Record<string, string>}
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
