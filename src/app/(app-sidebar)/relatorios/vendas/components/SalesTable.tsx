'use client'

import { Fragment } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

// UI
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge, BadgeProps } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

// Components
import { TablePagination } from '@/components/common/TablePagination'
import { SelectBasic } from '@/components/common/form/FormSelect'

// Actions
import { getSalesTableData } from '@/actions/sales-report'

// Types
import type {
  SalePhase,
  SalesClientGroup,
  SalesSellerGroup,
  SaleRecord,
} from '../types'
import type { SearchParamsType } from '@/types/coreTypes'

// Hooks
import { usePermissions } from '@/hooks/usePermissions'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

const phaseConfig: Record<
  SalePhase,
  { label: string; variant: BadgeProps['variant'] }
> = {
  'em-producao': {
    label: 'Em produção',
    variant: 'blueLight',
  },
  entregue: {
    label: 'Entrega',
    variant: 'purpleLight',
  },
  aguardando: {
    label: 'Aguardando',
    variant: 'warningLight',
  },
}

interface SalesTableProps extends SearchParamsType {}

export function SalesTable({ searchParams }: SalesTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const urlSearchParams = useSearchParams()

  const { hasPermission } = usePermissions()
  const canSeeOtherSellers = hasPermission('sale:other_quotation:view')

  const groupBy =
    (searchParams?.groupBy as 'none' | 'client' | 'seller') || 'client'
  const orderBy =
    (searchParams?.orderBy as 'approvedDate' | 'valueDesc' | 'valueAsc') ||
    'approvedDate'
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
    queryKey: ['sales-table', groupBy, orderBy, page, searchParams],
    queryFn: () =>
      getSalesTableData({
        groupBy,
        orderBy,
        page,
        limit: 10,
        sellerId: searchParams?.sellerId as string,
        originId: searchParams?.originId as string,
        startDate: searchParams?.startDate as string,
        endDate: searchParams?.endDate as string,
      }),
  })

  const defaultData = {
    grouped: false as const,
    records: [] as SaleRecord[],
    totalCount: 0,
    pagination: { page: 1, totalPages: 1, totalRecords: 0 },
  }
  const tableData = data ?? defaultData
  const isGrouped = tableData.grouped
  const totalPages = tableData.pagination?.totalPages || 1

  const renderRecord = (record: SaleRecord) => (
    <TableRow key={record.id}>
      <TableCell>
        <p className="font-medium">
          {record.clientName || 'Cliente não informado'}
        </p>
        <p className="text-gray truncate">{record.serviceDescription}</p>
      </TableCell>
      <TableCell className="text-gray-600">
        {record.approvedDate || '-'}
      </TableCell>
      <TableCell className="text-success-700 text-nowrap">
        {formatCurrencyToBrl(record.value)}
      </TableCell>
      <TableCell>
        <Badge
          status
          variant={phaseConfig[record.phase]?.variant || 'neutralLight'}
        >
          {phaseConfig[record.phase]?.label || 'Desconhecido'}
        </Badge>
      </TableCell>
      <TableCell className="text-right text-gray-600">
        {record.phasePercentage}%
      </TableCell>
    </TableRow>
  )

  return (
    <Card>
      {/* Filters Row */}
      <CardHeader className="flex-row flex-wrap space-y-0 gap-4">
        <SelectBasic
          name="groupBy"
          label="Agrupar por"
          className="w-[260px]"
          value={groupBy}
          onChange={(value) => updateUrlParam('groupBy', value)}
          options={[
            { value: 'none', label: 'Sem agrupamento' },
            { value: 'client', label: 'Cliente' },
            ...(canSeeOtherSellers
              ? [{ value: 'seller', label: 'Vendedor' }]
              : []),
          ]}
        />
        <SelectBasic
          name="orderBy"
          label="Ordenar por"
          className="w-[260px]"
          value={orderBy}
          onChange={(value) => updateUrlParam('orderBy', value)}
          options={[
            { value: 'approvedDate', label: 'Data de aprovação' },
            { value: 'valueDesc', label: 'Maior valor' },
            { value: 'valueAsc', label: 'Menor valor' },
          ]}
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
                    <span>Serviços</span>
                    <Badge variant="neutralLight" className="font-medium">
                      {tableData.totalCount}
                    </Badge>
                  </div>
                </TableHead>
                <TableHead>Aprovado</TableHead>
                <TableHead>Vendas</TableHead>
                <TableHead>Fase atual</TableHead>
                <TableHead className="text-right">100%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isGrouped && 'groups' in tableData
                ? // Grouped - data comes pre-grouped from backend
                  tableData.groups.map(
                    (group: SalesClientGroup | SalesSellerGroup) => {
                      const groupId =
                        'clientId' in group ? group.clientId : group.sellerId
                      const groupName =
                        'clientName' in group
                          ? group.clientName
                          : group.sellerName

                      return (
                        <Fragment key={groupId}>
                          {/* Group Header Row */}
                          <TableRow className="bg-gray-100">
                            <TableCell
                              colSpan={2}
                              className="text-gray font-medium text-xs py-3"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-primary-700">
                                  {groupName}
                                </span>
                                <Badge
                                  variant="neutralLight"
                                  className="text-xs"
                                >
                                  {group.count}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-success-700 font-medium text-xs py-3">
                              {formatCurrencyToBrl(group.total)}
                            </TableCell>
                            <TableCell colSpan={2}></TableCell>
                          </TableRow>

                          {/* Group Records */}
                          {group.records.map((record: SaleRecord) =>
                            renderRecord(record),
                          )}
                        </Fragment>
                      )
                    },
                  )
                : // Ungrouped - flat list from backend
                  'records' in tableData &&
                  tableData.records.map((record: SaleRecord) =>
                    renderRecord(record),
                  )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Pagination */}
      <CardFooter>
        <TablePagination searchParams={searchParams} lastPage={totalPages} />
      </CardFooter>
    </Card>
  )
}
