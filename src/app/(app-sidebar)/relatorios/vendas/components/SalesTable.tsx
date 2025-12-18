'use client'

import { useState } from 'react'

// UI
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Icons
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

// Mock Data
import { mockSalesReportData } from '../mock-data'
import type { SalePhase } from '../types'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const phaseConfig: Record<SalePhase, { label: string; className: string }> = {
  'em-producao': {
    label: 'Em produção',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  },
  entregue: {
    label: 'Entregue',
    className: 'bg-green-100 text-green-700 hover:bg-green-100',
  },
  aguardando: {
    label: 'Aguardando',
    className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  },
}

export function SalesTable() {
  const { tableSections, pagination } = mockSalesReportData
  const [currentPage, setCurrentPage] = useState(pagination.page)
  const [groupBy, setGroupBy] = useState('value')
  const [orderBy, setOrderBy] = useState('seller')

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page)
    }
  }

  const renderPaginationButtons = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - 2)
    const end = Math.min(pagination.totalPages, start + maxVisible - 1)

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'default' : 'outline'}
          size="sm"
          className="w-8 h-8"
          onClick={() => goToPage(i)}
        >
          {i}
        </Button>,
      )
    }

    if (start > 1) {
      pages.unshift(
        <span key="start-ellipsis" className="px-2 text-gray-400">
          ...
        </span>,
      )
    }

    if (end < pagination.totalPages) {
      pages.push(
        <span key="end-ellipsis" className="px-2 text-gray-400">
          ...
        </span>,
        <Button
          key={pagination.totalPages}
          variant="outline"
          size="sm"
          className="w-8 h-8"
          onClick={() => goToPage(pagination.totalPages)}
        >
          {pagination.totalPages}
        </Button>,
      )
    }

    return pages
  }

  return (
    <Card>
      <CardContent className="p-6">
        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">
              Agrupar por
            </label>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="Maior valor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="value">Maior valor</SelectItem>
                <SelectItem value="date">Data</SelectItem>
                <SelectItem value="client">Cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">
              Ordenar por
            </label>
            <Select value={orderBy} onValueChange={setOrderBy}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Nome do vendedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seller">Nome do vendedor</SelectItem>
                <SelectItem value="client">Nome do cliente</SelectItem>
                <SelectItem value="value">Valor</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                {formatCurrency(section.total)}
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
                      {formatCurrency(record.value)}
                    </TableCell>
                    <TableCell>
                      <Badge className={phaseConfig[record.phase].className}>
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

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <IconChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-1">
            {renderPaginationButtons()}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
            className="flex items-center gap-1"
          >
            Próximo
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
