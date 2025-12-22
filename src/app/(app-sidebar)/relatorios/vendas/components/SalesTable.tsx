'use client'

import { Fragment } from 'react'

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

// Components
import { TablePagination } from '@/components/common/TablePagination'
import { SelectBasic } from '@/components/common/form/FormSelect'

// Mock Data
import { mockTableDataGrouped, mockTableDataFlat } from '../mock-data'
import type { SalePhase, SalesTableData } from '../types'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

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
    variant: 'successLight',
  },
  aguardando: {
    label: 'Aguardando',
    variant: 'warningLight',
  },
}

interface SalesTableProps extends SearchParamsType {}

export function SalesTable({ searchParams }: SalesTableProps) {
  const groupBy = (searchParams?.groupBy as 'none' | 'client') || 'client'
  const orderBy =
    (searchParams?.orderBy as 'approvedDate' | 'valueDesc' | 'valueAsc') ||
    'approvedDate'

  // TODO: Replace with actual API call that uses groupBy and orderBy params
  // const { data: tableData } = useQuery({
  //   queryKey: ['sales-table', groupBy, orderBy, searchParams?.page],
  //   queryFn: () => fetchSalesTable({ groupBy, orderBy, page: searchParams?.page }),
  // })

  // Simulate API response based on groupBy selection
  const tableData: SalesTableData =
    groupBy === 'client' ? mockTableDataGrouped : mockTableDataFlat

  const isGrouped = tableData.grouped
  const totalPages = 10 // TODO: get from API response

  return (
    <Card>
      {/* Filters Row */}
      <CardHeader className="flex-row flex-wrap space-y-0 gap-4">
        <SelectBasic
          name="groupBy"
          label="Agrupar por"
          className="w-[260px]"
          value={groupBy}
          onChange={() => {}} // TODO: update URL params
          options={[
            { value: 'none', label: 'Sem agrupamento' },
            { value: 'client', label: 'Cliente' },
          ]}
        />
        <SelectBasic
          name="orderBy"
          label="Ordenar por"
          className="w-[260px]"
          value={orderBy}
          onChange={() => {}} // TODO: update URL params
          options={[
            { value: 'approvedDate', label: 'Data de aprovação' },
            { value: 'valueDesc', label: 'Maior valor' },
            { value: 'valueAsc', label: 'Menor valor' },
          ]}
        />
      </CardHeader>
      <CardContent className="p-0">
        {/* Table */}
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
            {isGrouped
              ? // Grouped by client - data comes pre-grouped from backend
                tableData.groups.map((group) => (
                  <Fragment key={group.clientId}>
                    {/* Group Header Row */}
                    <TableRow className="bg-gray-100">
                      <TableCell
                        colSpan={2}
                        className="text-gray font-medium text-xs py-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-primary-700">
                            {group.clientName}
                          </span>
                          <Badge variant="neutralLight" className="text-xs">
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
                    {group.records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <p className="font-medium">
                            {record.clientName || 'Cliente não informado'}
                          </p>
                          <p className="text-gray truncate">
                            {record.serviceDescription}
                          </p>
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
                            variant={phaseConfig[record.phase].variant}
                          >
                            {phaseConfig[record.phase].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-gray-600">
                          {record.phasePercentage}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                ))
              : // Ungrouped - flat list from backend
                tableData.records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <p className="font-medium">
                        {record.clientName || 'Cliente não informado'}
                      </p>
                      <p className="text-gray truncate">
                        {record.serviceDescription}
                      </p>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {record.approvedDate || '-'}
                    </TableCell>
                    <TableCell className="text-success-700 text-nowrap">
                      {formatCurrencyToBrl(record.value)}
                    </TableCell>
                    <TableCell>
                      <Badge status variant={phaseConfig[record.phase].variant}>
                        {phaseConfig[record.phase].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-gray-600">
                      {record.phasePercentage}%
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Pagination */}
      <CardFooter>
        <TablePagination searchParams={searchParams} lastPage={totalPages} />
      </CardFooter>
    </Card>
  )
}
