'use client'

import { Fragment, useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

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
import {
  IconFileInvoice,
  IconReceipt,
  IconFilePlus,
  IconFileCheck,
  IconBan,
  IconX,
} from '@tabler/icons-react'

// Next
import Link from 'next/link'

// Components (modal)
import { InvoiceTypeSelectModal } from './InvoiceTypeSelectModal'

// Actions
import { getData, deleteItemNew } from '@/actions/_cruds'

import type { SearchParamsType } from '@/types/coreTypes'

// Matches backend response structure from order.service.findAll
interface NfeItem {
  id: string
  numero: number
  serie: number
  status: string
  danfeUrl?: string | null
}

interface OrderItem {
  id: string
  status: string
  nfes: NfeItem[]
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

// Helper para traduzir o status real da ordem + NFs para badge visual
const getInvoiceStatusProps = (order: OrderItem) => {
  // Prioridade 1: se já tem NF autorizada emitida
  const authorizedNfe = order.nfes?.find((n) => n.status === 'AUTHORIZED')
  if (authorizedNfe) {
    return { label: 'Emitida', variant: 'successLight' as const }
  }

  // Prioridade 2: se tem rascunho em digitação
  const draftNfe = order.nfes?.find((n) => n.status === 'DRAFT')
  if (draftNfe) {
    return { label: 'Em digitação', variant: 'blueLight' as const }
  }

  const s = order.status?.toUpperCase() || ''

  // Prioridade 3: ordem cancelada
  if (s === 'CANCELED') {
    return { label: 'Cancelada', variant: 'errorLight' as const }
  }

  // Prioridade 4: em produção / entrega
  if (s === 'IN_PRODUCTION' || s === 'DELIVERY' || s === 'COMPLETED') {
    return { label: 'Em produção', variant: 'warningLight' as const }
  }

  // Prioridade 5: pendente / finalizado sem NF
  if (s === 'FINISHED' || s === 'PENDING') {
    return { label: 'Não emitida', variant: 'neutralLight' as const }
  }

  return {
    label: order.status || 'Não definida',
    variant: 'neutralLight' as const,
  }
}

export function InvoiceResultsTable({ searchParams }: Props) {
  const [isLoading, setIsLoading] = useState(true)
  const [orderGroups, setOrderGroups] = useState<OrderGroupFromBackend[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [modalOrderId, setModalOrderId] = useState<string | null>(null)
  const [cancelingDraftId, setCancelingDraftId] = useState<string | null>(null)

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

  // Cancela/exclui um rascunho de NF-e diretamente da listagem
  const handleCancelDraft = useCallback(
    async (draftId: string) => {
      setCancelingDraftId(draftId)
      try {
        const result = await deleteItemNew({
          route: `/fiscal/nfe/draft/${draftId}`,
        })
        if (!result.success) {
          toast.error('Não foi possível cancelar o rascunho')
          return
        }
        toast.success('Rascunho cancelado com sucesso')
        fetchOrders()
      } catch {
        toast.error('Erro ao cancelar o rascunho')
      } finally {
        setCancelingDraftId(null)
      }
    },
    [fetchOrders],
  )

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
    <>
      {/* Nota Avulsa CTA */}
      <div className="flex items-center justify-between gap-4 rounded-lg border border-primary-200 bg-primary-50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <IconFilePlus size={20} />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-800">
              Nota Fiscal Avulsa
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Emita notas sem depender de uma ordem de serviço
            </p>
          </div>
        </div>
        <Link
          href="/nota-fiscal/emitir/avulsa"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700 transition-colors shrink-0"
        >
          <IconFilePlus size={16} />
          Emitir Nota Avulsa
        </Link>
      </div>

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
                            variant={getInvoiceStatusProps(order).variant}
                            status
                          >
                            {getInvoiceStatusProps(order).label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            {(() => {
                              const authorizedNfe = order.nfes?.find(
                                (n) => n.status === 'AUTHORIZED',
                              )
                              const draftNfe = order.nfes?.find(
                                (n) => n.status === 'DRAFT',
                              )
                              const isCancelingThis =
                                cancelingDraftId === draftNfe?.id

                              if (authorizedNfe) {
                                return authorizedNfe.danfeUrl ? (
                                  <ActionButton
                                    Icon={IconFileCheck}
                                    tooltip="Ver DANFE"
                                    link={authorizedNfe.danfeUrl}
                                  />
                                ) : (
                                  <ActionButton
                                    Icon={IconFileCheck}
                                    tooltip={`NF-e nº ${authorizedNfe.numero} emitida`}
                                    onClick={() => setModalOrderId(order.id)}
                                  />
                                )
                              }

                              if (draftNfe) {
                                return (
                                  <ActionButton
                                    Icon={IconX}
                                    tooltip="Cancelar rascunho"
                                    variant="errorGhost"
                                    disabled={isCancelingThis}
                                    onClick={() =>
                                      handleCancelDraft(draftNfe.id)
                                    }
                                  />
                                )
                              }

                              if (order.status?.toUpperCase() === 'CANCELED') {
                                return (
                                  <ActionButton
                                    Icon={IconBan}
                                    tooltip="Ordem cancelada"
                                    disabled
                                  />
                                )
                              }

                              return (
                                <ActionButton
                                  Icon={IconReceipt}
                                  tooltip="Emitir Nota Fiscal"
                                  onClick={() => setModalOrderId(order.id)}
                                />
                              )
                            })()}
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

        <InvoiceTypeSelectModal
          open={!!modalOrderId}
          onOpenChange={(open) => {
            if (!open) setModalOrderId(null)
          }}
          orderId={modalOrderId ?? ''}
        />
      </Card>
    </>
  )
}
