'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

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
import { Skeleton } from '@/components/ui/skeleton'

// Icons
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'

// Actions
import { getDfcTable } from '@/actions/dfc-report'

// Utils
import { formatCurrencyToBrl, cn } from '@/lib/utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { DfcTableRow } from '../types'

export function DfcTable({ searchParams }: SearchParamsType) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(
    new Set(['receitas', 'despesas', '02-oper', '01.02.01-vendas']),
  )

  const { data, isLoading } = useQuery({
    queryKey: [
      'dfc-table',
      searchParams?.startDate,
      searchParams?.endDate,
      searchParams?.regime,
    ],
    queryFn: () =>
      getDfcTable({
        startDate: searchParams?.startDate as string,
        endDate: searchParams?.endDate as string,
        regime:
          (searchParams?.regime as 'realizado' | 'competencia') || undefined,
      }),
  })

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const isRowVisible = (row: DfcTableRow): boolean => {
    if (!row.parentId) return true
    if (!expandedRows.has(row.parentId)) return false

    // Check all ancestors
    const parent = data?.rows.find((r) => r.id === row.parentId)
    if (parent) return isRowVisible(parent)
    return true
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="min-w-[250px]">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                {[1, 2, 3].map((i) => (
                  <TableHead key={i} className="text-right min-w-[120px]">
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }, (_, i) => (
                <TableRow key={i} className={i < 1 ? 'bg-gray-50' : ''}>
                  <TableCell
                    style={{
                      paddingLeft: 16 + (i === 0 ? 0 : i < 3 ? 24 : 48),
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-4 h-4 rounded" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </TableCell>
                  {[1, 2, 3].map((j) => (
                    <TableCell key={j} className="text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const visibleRows = data.rows.filter(isRowVisible)

  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="sticky left-0 bg-gray-50 min-w-[250px]">
                Categoria
              </TableHead>
              {data.headers.map((header) => (
                <TableHead key={header} className="text-right min-w-[120px]">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.map((row) => {
              const isExpanded = expandedRows.has(row.id)
              const isNegative =
                row.name === 'Despesas' || row.parentId?.startsWith('desp')
              const paddingLeft = 16 + row.level * 24

              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    row.level === 0 && 'bg-gray-50 font-semibold',
                    isNegative && row.level === 0 && 'bg-red-50',
                    !isNegative && row.level === 0 && 'bg-success-50',
                  )}
                >
                  <TableCell
                    className={cn(
                      'sticky left-0 bg-inherit',
                      row.level === 0 && 'bg-gray-50',
                      isNegative && row.level === 0 && 'bg-red-50',
                      !isNegative && row.level === 0 && 'bg-success-50',
                    )}
                    style={{ paddingLeft }}
                  >
                    <div className="flex items-center gap-2">
                      {row.isExpandable && (
                        <button
                          onClick={() => toggleRow(row.id)}
                          className="p-0.5 hover:bg-gray-200 rounded"
                        >
                          {isExpanded ? (
                            <IconChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <IconChevronRight className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      )}
                      {!row.isExpandable && <span className="w-5" />}
                      {row.code && (
                        <span className="text-gray text-sm">{row.code}</span>
                      )}
                      <span>{row.name}</span>
                    </div>
                  </TableCell>
                  {data.headers.map((header) => {
                    const value = row.values[header] || 0
                    const isValueNegative = value < 0

                    return (
                      <TableCell
                        key={header}
                        className={cn(
                          'text-right',
                          isValueNegative && 'text-red-600',
                        )}
                      >
                        {isValueNegative ? '-' : ''}
                        {formatCurrencyToBrl(Math.abs(value))}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
