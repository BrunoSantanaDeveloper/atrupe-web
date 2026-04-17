'use client'

import { Fragment, useEffect, useState, useCallback } from 'react'

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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'

// Components
import { TablePagination } from '@/components/common/TablePagination'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import { InvoiceFilter } from './InvoiceFilter'
import { ActionButton } from '@/components/common/ActionButton'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Icons
import { IconFileInvoice, IconSearch } from '@tabler/icons-react'

// Actions
import { getData } from '@/actions/_cruds'

import type { SearchParamsType } from '@/types/coreTypes'

// Matches backend response structure from order.service.findAll
interface OrderItem {
  id: string
  status: string
  quotation: {
    id: string
    description?: string
    totalValue?: number
    client?: {
      id: string
      name?: string
      email?: string
    }
    serie?: {
      id: string
      name?: string
      code?: string
      quotation?: number
    }
    seller?: {
      id: string
      name?: string
    }
  }
}

// Backend returns data already grouped by date
interface OrderGroupFromBackend {
  date: string
  orders: OrderItem[]
}

interface Props extends SearchParamsType {}

// Helper para traduzir o status do pedido para o status visual na tela de Notas Fiscais da UI
const getInvoiceStatusProps = (statusStr: string) => {
  const s = statusStr?.toUpperCase() || ''
  if (s === 'FINISHED' || s === 'PENDING') {
    return { label: 'Não emitida', variant: 'neutralLight' as const }
  }
  if (s === 'DRAFT' || s === 'DIGITACAO') {
    return { label: 'Em digitação', variant: 'infoLight' as const }
  }
  return {
    label: statusStr || 'Não definida',
    variant: 'neutralLight' as const,
  }
}

export function InvoiceResultsTable({ searchParams }: Props) {
  const [isLoading, setIsLoading] = useState(true)
  const [orderGroups, setOrderGroups] = useState<OrderGroupFromBackend[]>([])
  const [totalPages, setTotalPages] = useState(1)

  const selectedClientId = searchParams?.clientId as string
  const currentPage = parseInt((searchParams?.page as string) || '1', 10)

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)

    try {
      const filters: Record<string, string | undefined> = {
        page: currentPage.toString(),
      }

      if (selectedClientId) {
        filters.clientId = selectedClientId
      }

      const result = await getData({
        route: '/sale/order',
        filters,
        perPage: '20',
      })

      if (result.success && result.data) {
        // Backend returns data already grouped: [{ date, orders }]
        setOrderGroups(result.data as OrderGroupFromBackend[])
        setTotalPages(result.lastPage || 1)
      } else {
        setOrderGroups([])
      }
    } catch (error) {
      console.error('Erro ao buscar ordens:', error)
      setOrderGroups([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedClientId, currentPage])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Format date string for display
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  // Format currency
  const formatCurrency = (value?: number) => {
    if (!value) return 'R$ 0,00'
    return (value / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="h-full flex flex-col">
        <TableFiltersHeader searchParams={searchParams}>
          <InvoiceFilter searchParams={searchParams} />
        </TableFiltersHeader>
        <CardContent className="flex-1 p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (orderGroups.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <TableFiltersHeader searchParams={searchParams}>
          <InvoiceFilter searchParams={searchParams} />
        </TableFiltersHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <FeaturedIcon
              Icon={IconFileInvoice}
              size="xl"
              variant="borderedLight"
              rounded
              color="neutral"
            />
            <div className="space-y-1">
              <p className="font-semibold text-lg text-gray-900">
                Nenhuma ordem encontrada
              </p>
              <p className="text-sm text-gray-500">
                {selectedClientId
                  ? 'Este cliente não possui ordens'
                  : 'Selecione um cliente para ver suas ordens'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <TableFiltersHeader searchParams={searchParams}>
        <InvoiceFilter searchParams={searchParams} />
      </TableFiltersHeader>

      <CardContent className="flex-1 overflow-auto p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-y border-gray-100">
              <TableHead className="w-[40px] px-4">
                <Checkbox id="select-all" />
              </TableHead>
              <TableHead>Referência</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Fase atual</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderGroups.map((group) => (
              <Fragment key={group.date}>
                <TableRow className="bg-gray-100">
                  <TableCell
                    colSpan={5}
                    className="text-gray font-medium text-xs py-3"
                  >
                    {formatDate(group.date)}
                  </TableCell>
                </TableRow>
                {group.orders.map((order) => {
                  const clientName =
                    order.quotation?.client?.name || 'Cliente não informado'
                  const orderRef = order.quotation?.serie
                    ? `${order.quotation.serie.code}-${order.quotation.serie.quotation}`
                    : order.id?.slice(0, 8) || 'N/D'

                  return (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell className="px-4">
                        <Checkbox id={`check-${order.id}`} />
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-gray-800">
                          {clientName}
                        </p>
                        <p className="text-gray truncate">{orderRef}</p>
                      </TableCell>
                      <TableCell className="font-semibold text-success-600">
                        {formatCurrency(order.quotation?.totalValue)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getInvoiceStatusProps(order.status).variant}
                          status
                        >
                          {getInvoiceStatusProps(order.status).label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <ActionButton
                            Icon={IconSearch}
                            tooltip="Detalhes da Ordem"
                            link={`/nota-fiscal/emitir/${order.id}`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="border-t border-gray-100 p-4 mt-auto">
        <TablePagination
          searchParams={searchParams}
          lastPage={totalPages}
          activeVariant="success"
        />
      </CardFooter>
    </Card>
  )
}
