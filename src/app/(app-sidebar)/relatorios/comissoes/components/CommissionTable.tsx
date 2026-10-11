'use client'

import { useSession } from 'next-auth/react'
import { usePermissions } from '@/hooks/usePermissions'

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

// Mode
import {
  commissionOf,
  commissionBase,
  commissionFilters,
  commissionModeOf,
  commissionModeCopy,
} from '../mode'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type {
  CommissionGroupBy,
  CommissionOrderBy,
  CommissionRecord,
} from '../types'

interface CommissionTableProps extends SearchParamsType {}

export function CommissionTable({ searchParams }: CommissionTableProps) {
  // EC-25: sem a permissão de ver vendas de outros vendedores, o relatório
  // vai preso ao vendedor da sessão — o de Vendas já faz isso
  const { data: session } = useSession()
  const { hasAnyPermission } = usePermissions()
  const canSeeOtherSellers = hasAnyPermission([
    'sale:other_quotation:view',
    'sale:other_sellers:view',
  ])
  const restrictedSellerId = canSeeOtherSellers
    ? undefined
    : session?.user?.employeeId

  const mode = commissionModeOf(searchParams?.commissionType as string)
  const copy = commissionModeCopy[mode]

  // A comissão é paga por vendedor: agrupar por ele é o ponto de partida
  const [groupBy, setGroupBy] = useState<CommissionGroupBy>('vendedor')
  // Sem escolha do usuário, ordena pela data que o modo filtra
  const [chosenOrderBy, setOrderBy] = useState<CommissionOrderBy>()
  const orderBy =
    chosenOrderBy ?? (mode === 'received_value' ? 'receivedDate' : 'saleDate')

  const page = parseInt((searchParams?.page as string) || '1')

  const { data, isLoading } = useQuery({
    queryKey: [
      'commission-table',
      searchParams?.commissionType,
      searchParams?.startDate,
      searchParams?.endDate,
      searchParams?.receivedStartDate,
      searchParams?.receivedEndDate,
      searchParams?.period,
      searchParams?.sellerId,
      restrictedSellerId,
      groupBy,
      orderBy,
      page,
    ],
    queryFn: () =>
      getCommissionTable({
        ...commissionFilters(
          {
            commissionType: searchParams?.commissionType as string,
            period: searchParams?.period as string,
            startDate: searchParams?.startDate as string,
            endDate: searchParams?.endDate as string,
            receivedStartDate: searchParams?.receivedStartDate as string,
            receivedEndDate: searchParams?.receivedEndDate as string,
            sellerId: searchParams?.sellerId as string,
          },
          restrictedSellerId,
        ),
        groupBy,
        orderBy,
        page,
        limit: 10,
      }),
  })

  // Colunas na ordem da leitura: a venda, a base do modo, o percentual do
  // vendedor e a comissão. O outro valor fica em segundo plano, como
  // referência — no modo recebido, é o que mostra que a venda é de outro mês
  const renderRecord = (record: CommissionRecord) => (
    <TableRow key={record.id}>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{record.clientName}</span>
          <span className="text-sm text-gray">{record.description}</span>
        </div>
      </TableCell>
      <TableCell className="text-gray-600">
        {mode === 'received_value' ? record.receivedDate : record.saleDate}
        <span className="block text-xs text-gray">
          {mode === 'received_value'
            ? `vendida em ${record.saleDate}`
            : record.receivedDate
              ? `recebida em ${record.receivedDate}`
              : 'ainda não recebida'}
        </span>
      </TableCell>
      <TableCell numeric className="text-gray">
        {formatCurrencyToBrl(
          mode === 'received_value' ? record.saleValue : record.receivedValue,
        )}
      </TableCell>
      <TableCell numeric className="font-medium text-gray-900">
        {formatCurrencyToBrl(commissionBase(record, mode))}
      </TableCell>
      <TableCell numeric className="text-gray-600">
        {record.percentage}%
      </TableCell>
      <TableCell numeric className="font-semibold text-success-700">
        {formatCurrencyToBrl(commissionOf(record, mode))}
      </TableCell>
    </TableRow>
  )

  const headers = (
    <>
      <TableHead>
        {mode === 'received_value' ? 'Recebido em' : 'Vendido em'}
      </TableHead>
      <TableHead numeric>
        {mode === 'received_value' ? 'Valor da venda' : 'Já recebido'}
      </TableHead>
      <TableHead className="text-right">{copy.baseLabel}</TableHead>
      <TableHead numeric className="w-16">
        %
      </TableHead>
      <TableHead className="text-right">Comissão</TableHead>
    </>
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
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Venda</TableHead>
                {headers}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-24 ml-auto" />
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
                <TableRow className="bg-gray-50">
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <span>Venda</span>
                      <Badge variant="neutralLight" className="font-medium">
                        {data.totalCount}
                      </Badge>
                    </div>
                  </TableHead>
                  {headers}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.grouped && data.groups.length > 0
                  ? data.groups.map((group) => (
                      <Fragment key={group.vendedorId}>
                        {/* Group Header */}
                        <TableRow className="bg-gray-100">
                          <TableCell
                            colSpan={2}
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
                          <TableCell
                            numeric
                            className="text-gray font-medium text-xs py-3"
                          >
                            {formatCurrencyToBrl(
                              mode === 'received_value'
                                ? group.saleTotal
                                : group.receivedTotal,
                            )}
                          </TableCell>
                          <TableCell
                            numeric
                            className="text-gray-900 font-medium text-xs py-3"
                          >
                            {formatCurrencyToBrl(
                              mode === 'received_value'
                                ? group.receivedTotal
                                : group.saleTotal,
                            )}
                          </TableCell>
                          <TableCell />
                          <TableCell
                            numeric
                            className="text-success-700 font-semibold text-xs py-3"
                          >
                            {formatCurrencyToBrl(
                              group.records.reduce(
                                (sum, r) => sum + commissionOf(r, mode),
                                0,
                              ),
                            )}
                          </TableCell>
                        </TableRow>

                        {/* Group Records */}
                        {group.records.map((record) => renderRecord(record))}
                      </Fragment>
                    ))
                  : data.records.map((record) => renderRecord(record))}
              </TableBody>
            </Table>

            {/* Agrupado, a API devolve tudo de uma vez: o paginador só vale
                sem agrupamento, como em produção (CR-10) */}
            {!data.grouped && data.pagination.totalPages > 1 && (
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
