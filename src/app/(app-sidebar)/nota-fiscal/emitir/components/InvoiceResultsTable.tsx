'use client'

import { Fragment, useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

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
  IconBan,
  IconTrash,
} from '@tabler/icons-react'

// Components (modal)
import { InvoiceTypeSelectModal } from './InvoiceTypeSelectModal'
import { NfeActionsDropdown } from '@/components/common/fiscal/NfeActionsDropdown'

// Actions
import { getData, deleteItemNew } from '@/actions/_cruds'

import type { SearchParamsType } from '@/types/coreTypes'

// Unified Interfaces
interface NfeItem {
  id: string
  numero: number
  serie: number
  status: string
  chaveAcesso?: string | null
  danfeUrl?: string | null
  xmlAutorizado?: string | null
  dataEmissao?: string | null
  motivoRejeicao?: string
}

interface UnifiedInvoiceItem {
  type: 'ORDER' | 'NFE_AVULSA' | 'NFSE_AVULSA'
  id: string
  createdAt: string
  status: string
  clientName: string
  reference: string
  totalValue: number
  nfes: NfeItem[]
  nfse?: unknown
  originalData: {
    quotation?: {
      client?: {
        id?: string
      }
    }
  }
}

interface OrderGroupFromBackend {
  date: string
  items: UnifiedInvoiceItem[]
}

interface Props extends SearchParamsType {}

// Helper para traduzir o status real do item unificado
const getInvoiceStatusProps = (item: UnifiedInvoiceItem) => {
  if (item.type === 'NFE_AVULSA') {
    if (item.status === 'AUTHORIZED')
      return { label: 'Emitida', variant: 'successLight' as const }
    if (item.status === 'DRAFT')
      return { label: 'Em digitação', variant: 'blueLight' as const }
    if (item.status === 'REJECTED')
      return { label: 'Rejeitada', variant: 'errorLight' as const }
    if (item.status === 'CANCELLED')
      return { label: 'Cancelada', variant: 'errorLight' as const }
    return { label: item.status, variant: 'neutralLight' as const }
  }

  if (item.type === 'NFSE_AVULSA') {
    if (item.status === 'AUTHORIZED')
      return { label: 'Emitida', variant: 'successLight' as const }
    if (item.status === 'DRAFT')
      return { label: 'Em digitação', variant: 'blueLight' as const }
    if (item.status === 'REJECTED')
      return { label: 'Rejeitada', variant: 'errorLight' as const }
    if (item.status === 'CANCELLED')
      return { label: 'Cancelada', variant: 'errorLight' as const }
    return { label: item.status, variant: 'neutralLight' as const }
  }

  // Type ORDER
  const authorizedNfe = item.nfes?.find((n) => n.status === 'AUTHORIZED')
  if (authorizedNfe)
    return { label: 'Emitida', variant: 'successLight' as const }

  const draftNfe = item.nfes?.find((n) => n.status === 'DRAFT')
  if (draftNfe) return { label: 'Em digitação', variant: 'blueLight' as const }

  const rejectedNfe = item.nfes?.find((n) => n.status === 'REJECTED')
  if (rejectedNfe) {
    return {
      label: 'Rejeitada',
      variant: 'errorLight' as const,
      tooltip: rejectedNfe.motivoRejeicao || 'Rejeitada pela SEFAZ',
    }
  }

  const s = item.status?.toUpperCase() || ''

  if (s === 'CANCELED')
    return { label: 'Cancelada', variant: 'errorLight' as const }
  if (s === 'IN_PRODUCTION' || s === 'DELIVERY' || s === 'COMPLETED') {
    return { label: 'Em produção', variant: 'warningLight' as const }
  }
  if (s === 'FINISHED' || s === 'PENDING') {
    return { label: 'Não emitida', variant: 'neutralLight' as const }
  }

  return {
    label: item.status || 'Não definida',
    variant: 'neutralLight' as const,
  }
}

const canSelectForConsolidation = (item: UnifiedInvoiceItem) => {
  if (item.type !== 'ORDER') return false
  const hasBlockingNfe = item.nfes?.some((n) =>
    ['AUTHORIZED', 'DRAFT'].includes(n.status),
  )
  if (hasBlockingNfe) return false
  return item.status?.toUpperCase() !== 'CANCELED'
}

export function InvoiceResultsTable({ searchParams }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [orderGroups, setOrderGroups] = useState<OrderGroupFromBackend[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [modalOrderId, setModalOrderId] = useState<string | null>(null)
  const [cancelingDraftId, setCancelingDraftId] = useState<string | null>(null)
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(
    () => new Set(),
  )

  const currentPage = parseInt((searchParams?.page as string) || '1', 10)
  const currentSearch = searchParams?.search as string | undefined
  const currentNfeStatus =
    (searchParams?.nfeStatus as string | undefined) || 'TODOS'
  const recordType = searchParams?.recordType as string | undefined
  const startDate = searchParams?.startDate as string | undefined
  const endDate = searchParams?.endDate as string | undefined

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)

    try {
      const filters: Record<string, string | undefined> = {
        page: currentPage.toString(),
        status: currentNfeStatus,
      }

      if (recordType) filters.recordType = recordType
      if (currentSearch) filters.search = currentSearch
      if (startDate) filters.startDate = startDate
      if (endDate) filters.endDate = endDate

      const result = await getData({
        route: '/fiscal/nfe/unified',
        filters,
        perPage: '20',
      })

      if (result.success && result.data) {
        // Defensive check to ensure data is an array before setting it to state
        // This prevents "TypeError: n.map is not a function" crashes on render
        const rawData = result.data as unknown as Record<string, unknown>
        const dataArray = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.data)
            ? rawData.data
            : []
        setOrderGroups(dataArray as OrderGroupFromBackend[])
        setTotalPages(result.lastPage || 1)
      } else {
        setOrderGroups([])
      }
    } catch (error) {
      console.error('Erro ao buscar notas/pedidos:', error)
      setOrderGroups([])
    } finally {
      setIsLoading(false)
    }
  }, [
    currentPage,
    currentSearch,
    currentNfeStatus,
    recordType,
    startDate,
    endDate,
  ])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    setSelectedOrderIds(new Set())
  }, [currentPage, currentSearch, currentNfeStatus, startDate, endDate])

  const visibleOrders = useMemo(
    () => orderGroups.flatMap((group) => group.items),
    [orderGroups],
  )

  const selectableOrders = useMemo(
    () => visibleOrders.filter(canSelectForConsolidation),
    [visibleOrders],
  )

  const selectedOrders = useMemo(
    () => visibleOrders.filter((order) => selectedOrderIds.has(order.id)),
    [selectedOrderIds, visibleOrders],
  )

  const selectedTotal = selectedOrders.reduce(
    (sum, order) => sum + (order.totalValue || 0),
    0,
  )

  const allSelectableSelected =
    selectableOrders.length > 0 &&
    selectableOrders.every((order) => selectedOrderIds.has(order.id))
  const someSelectableSelected = selectableOrders.some((order) =>
    selectedOrderIds.has(order.id),
  )

  const toggleOrderSelection = (
    order: UnifiedInvoiceItem,
    checked: boolean,
  ) => {
    setSelectedOrderIds((current) => {
      const next = new Set(current)
      if (checked) {
        if (next.size > 0) {
          const firstSelectedId = Array.from(next)[0]
          const firstSelectedOrder = visibleOrders.find(
            (o) => o.id === firstSelectedId,
          )
          if (
            firstSelectedOrder &&
            firstSelectedOrder.originalData?.quotation?.client?.id !==
              order.originalData?.quotation?.client?.id
          ) {
            toast.error(
              'Você só pode selecionar OSs do mesmo cliente para consolidar',
            )
            return current
          }
        }
        next.add(order.id)
      } else {
        next.delete(order.id)
      }
      return next
    })
  }

  const toggleAllVisible = (checked: boolean) => {
    if (checked) {
      const clientIds = new Set(
        selectableOrders
          .map((o) => o.originalData?.quotation?.client?.id)
          .filter(Boolean),
      )
      if (clientIds.size > 1) {
        toast.error(
          'Os itens visíveis pertencem a clientes diferentes. Filtre por um único cliente na busca antes de selecionar todos.',
        )
        return
      }
    }

    setSelectedOrderIds((current) => {
      const next = new Set(current)
      selectableOrders.forEach((order) => {
        if (checked) {
          next.add(order.id)
        } else {
          next.delete(order.id)
        }
      })
      return next
    })
  }

  const handleConsolidate = () => {
    if (selectedOrders.length < 2) {
      toast.error('Selecione ao menos duas OSs para consolidar')
      return
    }

    router.push(
      `/nota-fiscal/emitir/consolidado?orders=${selectedOrders
        .map((order) => order.id)
        .join(',')}`,
    )
  }

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
                Nenhum registro encontrado
              </p>
              <p className="text-sm text-gray-500">
                Tente ajustar os filtros ou selecionar outro cliente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <TableFiltersHeader searchParams={searchParams}>
          <InvoiceFilter searchParams={searchParams} />
        </TableFiltersHeader>

        <CardContent className="flex-1 overflow-auto p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-y border-gray-100">
                <TableHead className="w-[40px] px-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex">
                          <Checkbox
                            id="select-all"
                            disabled={selectableOrders.length === 0}
                            checked={
                              allSelectableSelected
                                ? true
                                : someSelectableSelected
                                  ? 'indeterminate'
                                  : false
                            }
                            onCheckedChange={(checked) =>
                              toggleAllVisible(checked === true)
                            }
                          />
                        </span>
                      </TooltipTrigger>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead>Tipo / Referência</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderGroups.map((group) => (
                <Fragment key={group.date}>
                  <TableRow className="bg-gray-100">
                    <TableCell
                      colSpan={6}
                      className="text-gray font-medium text-xs py-3"
                    >
                      {formatDate(group.date)}
                    </TableCell>
                  </TableRow>
                  {group.items.map((item) => {
                    const statusProps = getInvoiceStatusProps(item)

                    return (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell className="px-4">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex">
                                  <Checkbox
                                    id={`check-${item.id}`}
                                    disabled={!canSelectForConsolidation(item)}
                                    checked={selectedOrderIds.has(item.id)}
                                    onCheckedChange={(checked) =>
                                      toggleOrderSelection(
                                        item,
                                        checked === true,
                                      )
                                    }
                                  />
                                </span>
                              </TooltipTrigger>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {item.type === 'ORDER' ? (
                              <Badge variant="blueLight" className="w-fit">
                                Pedido de Venda
                              </Badge>
                            ) : item.type === 'NFE_AVULSA' ? (
                              <Badge variant="purpleLight" className="w-fit">
                                NF-e Avulsa
                              </Badge>
                            ) : (
                              <Badge variant="orangeLight" className="w-fit">
                                NFS-e Avulsa
                              </Badge>
                            )}
                            <p className="font-medium text-gray-800">
                              {item.reference}
                            </p>
                            {(() => {
                              if (item.type === 'ORDER') {
                                const authorizedNfe = item.nfes?.find(
                                  (n) => n.status === 'AUTHORIZED',
                                )
                                const draftNfe = item.nfes?.find(
                                  (n) => n.status === 'DRAFT',
                                )
                                if (authorizedNfe) {
                                  return (
                                    <span className="text-xs text-success-700 font-medium">
                                      NF-e nº {authorizedNfe.numero} (Série{' '}
                                      {authorizedNfe.serie})
                                    </span>
                                  )
                                }
                                if (draftNfe) {
                                  return (
                                    <span className="text-xs text-blue-700 font-medium">
                                      Rascunho NF-e nº {draftNfe.numero} (Série{' '}
                                      {draftNfe.serie})
                                    </span>
                                  )
                                }
                              }
                              return null
                            })()}
                            <span className="text-xs text-gray-500 font-mono hidden md:inline">
                              ID: {item.id.slice(0, 8)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium text-gray-700">
                            {item.clientName}
                          </p>
                        </TableCell>
                        <TableCell className="font-semibold text-success-600">
                          {formatCurrency(item.totalValue)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {statusProps.tooltip ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge variant={statusProps.variant} status>
                                      {statusProps.label}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="max-w-xs text-center"
                                  >
                                    <p>{statusProps.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <Badge variant={statusProps.variant} status>
                                {statusProps.label}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <TooltipProvider>
                              {(() => {
                                if (item.type === 'NFSE_AVULSA') {
                                  return (
                                    <ActionButton
                                      Icon={IconReceipt}
                                      tooltip="Ver nota de serviço"
                                      onClick={() =>
                                        router.push(
                                          `/nota-fiscal/emitir-nfse/avulsa/${item.id}`,
                                        )
                                      }
                                    />
                                  )
                                }

                                if (item.type === 'NFE_AVULSA') {
                                  const n = item.nfes?.[0]
                                  if (n?.status === 'AUTHORIZED') {
                                    return (
                                      <NfeActionsDropdown
                                        nfe={n}
                                        onRefetch={fetchOrders}
                                      />
                                    )
                                  }
                                  return (
                                    <ActionButton
                                      Icon={IconReceipt}
                                      tooltip="Continuar emissão"
                                      onClick={() =>
                                        router.push(
                                          `/nota-fiscal/emitir/avulsa/nfe/${item.id}`,
                                        )
                                      }
                                    />
                                  )
                                }

                                // Type ORDER
                                const authorizedNfe = item.nfes?.find(
                                  (n) => n.status === 'AUTHORIZED',
                                )
                                const draftNfe = item.nfes?.find(
                                  (n) => n.status === 'DRAFT',
                                )
                                const isCancelingThis =
                                  cancelingDraftId === draftNfe?.id

                                if (authorizedNfe) {
                                  return (
                                    <NfeActionsDropdown
                                      nfe={authorizedNfe}
                                      onRefetch={fetchOrders}
                                    />
                                  )
                                }

                                if (draftNfe) {
                                  return (
                                    <>
                                      <ActionButton
                                        Icon={IconReceipt}
                                        tooltip="Continuar emissão"
                                        onClick={() => setModalOrderId(item.id)}
                                      />
                                      <ActionButton
                                        Icon={IconTrash}
                                        tooltip="Excluir rascunho"
                                        variant="errorGhost"
                                        disabled={isCancelingThis}
                                        onClick={() =>
                                          handleCancelDraft(draftNfe.id)
                                        }
                                      />
                                    </>
                                  )
                                }

                                if (item.status?.toUpperCase() === 'CANCELED') {
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
                                    onClick={() => setModalOrderId(item.id)}
                                  />
                                )
                              })()}
                            </TooltipProvider>
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

        {selectedOrders.length >= 2 && (
          <div className="sticky bottom-0 z-10 border-t border-success-200 bg-white/95 backdrop-blur px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-gray-700">
                {selectedOrders.length} OS(s) selecionadas - Total:{' '}
                {formatCurrency(selectedTotal)}
              </p>
              <Button
                variant="success"
                LeftIcon={IconFileInvoice}
                onClick={handleConsolidate}
              >
                Consolidar em uma NF
              </Button>
            </div>
          </div>
        )}

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
