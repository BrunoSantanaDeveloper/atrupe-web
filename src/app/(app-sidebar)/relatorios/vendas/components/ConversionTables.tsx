'use client'

// Conversão por origem de contato e por vendedor (CRM-6, 27/10/2026): no
// período, quantos orçamentos nasceram, quantos aprovaram, a taxa, o valor
// e o tempo médio até fechar. As origens já existiam e nunca viraram número.

import { useQuery } from '@tanstack/react-query'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'

import { getConversion } from '@/actions/sales-report'
import { formatCurrencyToBrl } from '@/lib/utils'
import type { SearchParamsType } from '@/types/coreTypes'
import type { ConversionRow } from '../types'

function ConversionTable({
  title,
  nameLabel,
  rows,
  isLoading,
}: {
  title: string
  nameLabel: string
  rows: ConversionRow[]
  isLoading: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{nameLabel}</TableHead>
              <TableHead className="text-right">Orçamentos</TableHead>
              <TableHead className="text-right">Aprovados</TableHead>
              <TableHead className="text-right">Taxa</TableHead>
              <TableHead className="text-right">Valor aprovado</TableHead>
              <TableHead className="text-right">Dias até fechar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows cols={6} />
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id ?? 'none'}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right">{row.quotations}</TableCell>
                  <TableCell className="text-right">{row.approved}</TableCell>
                  <TableCell className="text-right">
                    {row.rate.toLocaleString('pt-BR')}%
                  </TableCell>
                  <TableCell className="text-right text-success-700">
                    {formatCurrencyToBrl(row.value)}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.averageDays === null
                      ? '-'
                      : row.averageDays.toLocaleString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray">
                  Nenhum orçamento no período.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function ConversionTables({ searchParams }: SearchParamsType) {
  const { data, isLoading } = useQuery({
    queryKey: [
      'sales-conversion',
      searchParams?.startDate,
      searchParams?.endDate,
      searchParams?.sellerId,
      searchParams?.originId,
      searchParams?.clientId,
      searchParams?.serieId,
    ],
    queryFn: () =>
      getConversion({
        sellerId: searchParams?.sellerId as string,
        originId: searchParams?.originId as string,
        clientId: searchParams?.clientId as string,
        serieId: searchParams?.serieId as string,
        startDate: searchParams?.startDate as string,
        endDate: searchParams?.endDate as string,
      }),
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ConversionTable
        title="Conversão por origem de contato"
        nameLabel="Origem"
        rows={data?.byOrigin || []}
        isLoading={isLoading}
      />
      <ConversionTable
        title="Conversão por vendedor"
        nameLabel="Vendedor"
        rows={data?.bySeller || []}
        isLoading={isLoading}
      />
    </div>
  )
}
