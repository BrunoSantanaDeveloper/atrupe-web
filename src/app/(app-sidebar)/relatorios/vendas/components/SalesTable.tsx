'use client'

import { useState } from 'react'

// UI
import { Card, CardContent, CardFooter } from '@/components/ui/card'
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
import { TablePaginationControlled } from '@/components/common/TablePaginationControlled'
import { SelectBasic } from '@/components/common/form/FormSelect'

// Mock Data
import { mockSalesReportData } from '../mock-data'
import type { SalePhase } from '../types'

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
    label: 'Entregue',
    variant: 'successLight',
  },
  aguardando: {
    label: 'Aguardando',
    variant: 'warningLight',
  },
}

export function SalesTable() {
  const { tableSections, pagination } = mockSalesReportData
  const [currentPage, setCurrentPage] = useState(pagination.page)
  const [groupBy, setGroupBy] = useState('value')
  const [orderBy, setOrderBy] = useState('seller')

  return (
    <Card>
      <CardContent className="p-6">
        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <SelectBasic
            name="groupBy"
            label="Agrupar por"
            className="w-[140px]"
            value={groupBy}
            onChange={setGroupBy}
            options={[
              { value: 'value', label: 'Maior valor' },
              { value: 'date', label: 'Data' },
              { value: 'client', label: 'Cliente' },
            ]}
          />
          <SelectBasic
            name="orderBy"
            label="Ordenar por"
            className="w-[180px]"
            value={orderBy}
            onChange={setOrderBy}
            options={[
              { value: 'seller', label: 'Nome do vendedor' },
              { value: 'client', label: 'Nome do cliente' },
              { value: 'value', label: 'Valor' },
            ]}
          />
        </div>

        {/* Table Sections */}
        {tableSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {/* Section Header */}
            <div className="flex items-center gap-4 mb-3">
              <span className="text-sm font-medium text-gray-700">
                Serviços: <span className="font-semibold">{section.count}</span>
              </span>
              <span className="text-xs text-gray-500">Aprovado</span>
              <span className="text-xs text-gray-500">Venceu</span>
              <span className="text-xs text-gray-500">Fase atual</span>
              <span className="text-xs text-gray-500">%OS</span>
            </div>

            {/* Section Title */}
            <div className="bg-gray-50 rounded-t-lg p-3 flex items-center justify-between">
              <span className="font-medium text-gray-900">
                {section.title}: {section.count}
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {formatCurrencyToBrl(section.total)}
              </span>
            </div>

            {/* Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">
                    Cliente não informado
                  </TableHead>
                  <TableHead>Aprovado</TableHead>
                  <TableHead>Venceu</TableHead>
                  <TableHead>Fase atual</TableHead>
                  <TableHead className="text-right">%OS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {record.clientName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {record.serviceDescription}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {record.approvedDate || '-'}
                    </TableCell>
                    <TableCell className="text-gray-600">
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
          </div>
        ))}
      </CardContent>

      {/* Pagination */}
      <CardFooter>
        <TablePaginationControlled
          page={currentPage}
          lastPage={pagination.totalPages}
          setPage={setCurrentPage}
        />
      </CardFooter>
    </Card>
  )
}
