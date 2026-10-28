'use client'

// Clientes sem compra há N dias (CRM-4, 27/10/2026): quem já comprou e não
// compra há mais de N dias, com "novo orçamento a partir do último pedido"
// e o WhatsApp na linha. Na gráfica a recompra vale mais que o lead novo.
// N vem da configuração do acompanhamento e pode ser trocado na hora.

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TooltipProvider } from '@/components/ui/tooltip'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { DuplicateQuotationButton } from '@/components/common/DuplicateQuotationButton'
import { WhatsAppButton } from '@/app/(app-sidebar)/vendas/orcamentos/components/FollowUp/WhatsAppButton'

import { getInactiveClients } from '@/actions/sales-report'
import { useFollowUpSettings } from '@/hooks/queries/useFollowUp'
import { formatCurrencyToBrl } from '@/lib/utils'
import { formatToLocaleDate } from '@/lib/formatDate'

const choices = [30, 60, 90, 180, 365]

export function InactiveClientsTable() {
  const { data: settings } = useFollowUpSettings()
  const [chosen, setChosen] = useState<number | null>(null)
  const days = chosen ?? settings?.inactiveDays ?? 90

  const { data, isLoading } = useQuery({
    queryKey: ['sales-inactive-clients', days],
    queryFn: () => getInactiveClients(days),
  })
  const rows = data?.clients || []

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle>Clientes sem compra há {days} dias</CardTitle>
        <div className="flex flex-wrap gap-1.5">
          {choices.map((option) => (
            <Button
              key={option}
              type="button"
              size="sm"
              variant={option === days ? 'default' : 'neutralOutline'}
              onClick={() => setChosen(option)}
            >
              {option} dias
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Última compra</TableHead>
              <TableHead className="text-right">Compras</TableHead>
              <TableHead className="text-right">Total comprado</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows cols={5} />
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Link
                      href={`/cadastros/clientes/${row.id}/contatos`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {row.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatToLocaleDate(row.lastPurchaseAt ?? undefined)}
                    {typeof row.daysSince === 'number'
                      ? ` · há ${row.daysSince} dias`
                      : ''}
                    {row.lastQuotation ? (
                      <p className="text-xs text-gray-500">
                        {row.lastQuotation.reference}
                        {row.lastQuotation.description
                          ? ` · ${row.lastQuotation.description}`
                          : ''}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">{row.purchases}</TableCell>
                  <TableCell className="text-right text-success-700">
                    {formatCurrencyToBrl(row.total)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <TooltipProvider>
                        <PermissionGate permissions={['sale:quotation:edit']}>
                          <WhatsAppButton
                            phone={row.phone}
                            template="resume"
                            vars={{
                              cliente: row.name,
                              numero: row.lastQuotation?.reference ?? '',
                              valor: row.lastQuotation
                                ? formatCurrencyToBrl(row.lastQuotation.value)
                                : '',
                            }}
                          />
                        </PermissionGate>
                        {row.lastQuotation ? (
                          <PermissionGate
                            permissions={['sale:quotation:create']}
                          >
                            <DuplicateQuotationButton
                              quotationId={row.lastQuotation.id}
                              clientId={row.id}
                              clientName={row.name}
                              description={
                                row.lastQuotation.description || undefined
                              }
                              tooltip="Novo orçamento a partir do último pedido"
                            />
                          </PermissionGate>
                        ) : null}
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray">
                  Nenhum cliente sem compra há {days} dias.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
