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
import { RejectionReasonAction } from '@/components/common/fiscal/RejectionReasonAction'
import {
  resolveFiscalEnvironment,
  useFiscalEnvironmentConfig,
} from '@/components/common/fiscal/FiscalEnvironmentBadge'

// Icons
import {
  IconFileInvoice,
  IconReceipt,
  IconBan,
  IconTrash,
  IconDotsVertical,
  IconFileCheck,
  IconDownload,
  IconRefresh,
  IconQrcode,
  IconPrinter,
} from '@tabler/icons-react'

// Components (modal)
import { InvoiceTypeSelectModal } from './InvoiceTypeSelectModal'
import { NfeActionsDropdown } from '@/components/common/fiscal/NfeActionsDropdown'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CancelNfeDialog } from '@/app/(app-sidebar)/configuracoes/nota-fiscal/gestao/components/CancelNfeDialog'

// Actions
import { getData, deleteItemNew, createItemNew } from '@/actions/_cruds'

import type { SearchParamsType } from '@/types/coreTypes'

// Unified Interfaces
interface NfeItem {
  id: string
  numero: number
  serie: number
  status: string
  ambiente?: number
  chaveAcesso?: string | null
  danfeUrl?: string | null
  xmlAutorizado?: string | null
  dataEmissao?: string | null
  motivoRejeicao?: string | null
}

interface FiscalRecordWithRejection {
  id?: string
  numero?: number
  serie?: string | number
  status?: string
  ambiente?: number
  pdfUrl?: string | null
  motivoRejeicao?: string | null
}

interface UnifiedInvoiceItem {
  type: 'ORDER' | 'NFE_AVULSA' | 'NFSE_AVULSA' | 'NFCE_AVULSA'
  id: string
  createdAt: string
  status: string
  clientName: string
  reference: string
  totalValue: number
  finalidade?: number
  nfes: NfeItem[]
  nfses?: FiscalRecordWithRejection[]
  nfse?: FiscalRecordWithRejection
  nfce?: {
    id: string
    numero: number
    serie: number
    status: string
    ambiente?: number
    chaveAcesso?: string | null
    danfeUrl?: string | null
    xmlAutorizado?: string | null
    qrCodeUrl?: string | null
    urlConsulta?: string | null
    dataEmissao?: string | null
    motivoRejeicao?: string | null
  }
  originalData: {
    motivoRejeicao?: string | null
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
    if (item.status === 'CORRECTION_SENT')
      return { label: 'Corrigida', variant: 'successLight' as const }
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

  if (item.type === 'NFCE_AVULSA') {
    if (item.status === 'AUTHORIZED')
      return { label: 'Emitida', variant: 'successLight' as const }
    if (item.status === 'PROCESSING')
      return { label: 'Em processamento', variant: 'blueLight' as const }
    if (item.status === 'PENDING')
      return { label: 'Pendente', variant: 'warningLight' as const }
    if (item.status === 'REJECTED')
      return { label: 'Rejeitada', variant: 'errorLight' as const }
    if (item.status === 'CANCELLED')
      return { label: 'Cancelada', variant: 'errorLight' as const }
    if (item.status === 'CONTINGENCY')
      return {
        label: 'Contingência Off-line',
        variant: 'warningLight' as const,
      }
    if (item.status === 'UNKNOWN')
      return {
        label: 'Resultado desconhecido',
        variant: 'warningLight' as const,
      }
    return { label: item.status, variant: 'neutralLight' as const }
  }

  // Type ORDER
  const authorizedNfe = item.nfes?.find(
    (n) => n.status === 'AUTHORIZED' || n.status === 'CORRECTION_SENT',
  )
  if (authorizedNfe)
    return { label: 'Emitida', variant: 'successLight' as const }

  const authorizedNfse = item.nfses?.find((n) => n.status === 'AUTHORIZED')
  if (authorizedNfse)
    return { label: 'Emitida', variant: 'successLight' as const }

  const draftNfe = item.nfes?.find((n) => n.status === 'DRAFT')
  if (draftNfe) return { label: 'Em digitação', variant: 'blueLight' as const }

  const draftNfse = item.nfses?.find((n) =>
    ['DRAFT', 'PENDING', 'PROCESSING'].includes(n.status || ''),
  )
  if (draftNfse)
    return { label: 'Em processamento', variant: 'blueLight' as const }

  const rejectedNfe = item.nfes?.find((n) => n.status === 'REJECTED')
  if (rejectedNfe) {
    return {
      label: 'Rejeitada',
      variant: 'errorLight' as const,
    }
  }

  const rejectedNfse = item.nfses?.find((n) => n.status === 'REJECTED')
  if (rejectedNfse) {
    return {
      label: 'Rejeitada',
      variant: 'errorLight' as const,
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

const findRejectedNfe = (item: UnifiedInvoiceItem) =>
  item.nfes?.find((n) => n.status === 'REJECTED')

const findRejectedNfse = (item: UnifiedInvoiceItem) =>
  item.nfses?.find((n) => n.status === 'REJECTED')

const getRejectionReason = (item: UnifiedInvoiceItem) => {
  if (item.type === 'ORDER') {
    return (
      findRejectedNfe(item)?.motivoRejeicao ||
      findRejectedNfse(item)?.motivoRejeicao
    )
  }

  if (item.type === 'NFE_AVULSA') {
    return (
      findRejectedNfe(item)?.motivoRejeicao ||
      item.nfes?.[0]?.motivoRejeicao ||
      item.originalData?.motivoRejeicao
    )
  }

  if (item.type === 'NFSE_AVULSA') {
    return item.nfse?.motivoRejeicao || item.originalData?.motivoRejeicao
  }

  if (item.type === 'NFCE_AVULSA') {
    return item.nfce?.motivoRejeicao || item.originalData?.motivoRejeicao
  }

  return item.originalData?.motivoRejeicao
}

const getReissueHref = (item: UnifiedInvoiceItem) => {
  const rejectedNfe =
    item.type === 'NFE_AVULSA' ? item.nfes?.[0] : findRejectedNfe(item)

  if (!rejectedNfe || rejectedNfe.status !== 'REJECTED') return undefined
  return `/nota-fiscal/emitir/avulsa/nfe?reissueOf=${rejectedNfe.id}`
}

const isRejectedInvoice = (item: UnifiedInvoiceItem) => {
  if (item.type === 'ORDER')
    return Boolean(findRejectedNfe(item) || findRejectedNfse(item))
  return item.status === 'REJECTED'
}

type ActiveFiscalEnvironment = {
  nfe: number
  nfse: number
  nfce: number
}

const getDocumentEnvironmentLabel = (ambiente?: number) =>
  ambiente === 1 ? 'Produção' : 'Homologação'

const getDocumentEnvironmentVariant = (ambiente?: number) =>
  ambiente === 1 ? ('successLight' as const) : ('warningLight' as const)

const isActiveEnvironmentDocument = (
  document: { ambiente?: number } | undefined | null,
  activeEnvironment: number,
) => (document?.ambiente ?? 2) === activeEnvironment

const findActiveNfe = (
  item: UnifiedInvoiceItem,
  activeEnvironment: ActiveFiscalEnvironment,
  statuses: string[],
) =>
  item.nfes?.find(
    (n) =>
      statuses.includes(n.status) &&
      isActiveEnvironmentDocument(n, activeEnvironment.nfe),
  )

const findActiveNfse = (
  item: UnifiedInvoiceItem,
  activeEnvironment: ActiveFiscalEnvironment,
  statuses: string[],
) =>
  item.nfses?.find(
    (n) =>
      statuses.includes(n.status || '') &&
      isActiveEnvironmentDocument(n, activeEnvironment.nfse),
  )

const getEnvironmentAwareStatusProps = (
  item: UnifiedInvoiceItem,
  activeEnvironment: ActiveFiscalEnvironment,
) => {
  if (item.type !== 'ORDER') return getInvoiceStatusProps(item)

  if (
    findActiveNfe(item, activeEnvironment, ['AUTHORIZED', 'CORRECTION_SENT']) ||
    findActiveNfse(item, activeEnvironment, ['AUTHORIZED'])
  ) {
    return { label: 'Emitida', variant: 'successLight' as const }
  }

  if (findActiveNfe(item, activeEnvironment, ['DRAFT'])) {
    return { label: 'Em digitação', variant: 'blueLight' as const }
  }

  if (
    findActiveNfse(item, activeEnvironment, ['DRAFT', 'PENDING', 'PROCESSING'])
  ) {
    return { label: 'Em processamento', variant: 'blueLight' as const }
  }

  if (
    findActiveNfe(item, activeEnvironment, ['REJECTED']) ||
    findActiveNfse(item, activeEnvironment, ['REJECTED'])
  ) {
    return { label: 'Rejeitada', variant: 'errorLight' as const }
  }

  const hasOtherEnvironmentDocument =
    item.nfes?.some(
      (n) =>
        ['AUTHORIZED', 'CORRECTION_SENT', 'DRAFT'].includes(n.status) &&
        !isActiveEnvironmentDocument(n, activeEnvironment.nfe),
    ) ||
    item.nfses?.some(
      (n) =>
        ['AUTHORIZED', 'DRAFT', 'PENDING', 'PROCESSING'].includes(
          n.status || '',
        ) && !isActiveEnvironmentDocument(n, activeEnvironment.nfse),
    )

  if (hasOtherEnvironmentDocument) {
    return { label: 'Não emitida', variant: 'neutralLight' as const }
  }

  return getInvoiceStatusProps(item)
}

const canSelectForConsolidationInActiveEnvironment = (
  item: UnifiedInvoiceItem,
  activeEnvironment: ActiveFiscalEnvironment,
) => {
  if (item.type !== 'ORDER') return false
  const hasBlockingNfe = item.nfes?.some(
    (n) =>
      ['AUTHORIZED', 'DRAFT', 'CORRECTION_SENT'].includes(n.status) &&
      isActiveEnvironmentDocument(n, activeEnvironment.nfe),
  )
  const hasBlockingNfse = item.nfses?.some(
    (n) =>
      ['AUTHORIZED', 'DRAFT', 'PENDING', 'PROCESSING'].includes(
        n.status || '',
      ) && isActiveEnvironmentDocument(n, activeEnvironment.nfse),
  )
  if (hasBlockingNfe || hasBlockingNfse) return false
  return item.status?.toUpperCase() !== 'CANCELED'
}

const getEnvironmentAwareRejectionReason = (
  item: UnifiedInvoiceItem,
  activeEnvironment: ActiveFiscalEnvironment,
) => {
  if (item.type !== 'ORDER') return getRejectionReason(item)
  return (
    findActiveNfe(item, activeEnvironment, ['REJECTED'])?.motivoRejeicao ||
    findActiveNfse(item, activeEnvironment, ['REJECTED'])?.motivoRejeicao
  )
}

const getEnvironmentAwareReissueHref = (
  item: UnifiedInvoiceItem,
  activeEnvironment: ActiveFiscalEnvironment,
) => {
  if (item.type === 'NFE_AVULSA') return getReissueHref(item)
  const rejectedNfe = findActiveNfe(item, activeEnvironment, ['REJECTED'])
  return rejectedNfe
    ? `/nota-fiscal/emitir/avulsa/nfe?reissueOf=${rejectedNfe.id}`
    : undefined
}

const isRejectedInvoiceInActiveEnvironment = (
  item: UnifiedInvoiceItem,
  activeEnvironment: ActiveFiscalEnvironment,
) => {
  if (item.type !== 'ORDER') return isRejectedInvoice(item)
  return Boolean(
    findActiveNfe(item, activeEnvironment, ['REJECTED']) ||
      findActiveNfse(item, activeEnvironment, ['REJECTED']),
  )
}

const getInvoiceEnvironmentBadges = (
  item: UnifiedInvoiceItem,
  activeEnvironment: ActiveFiscalEnvironment,
) => {
  if (item.type === 'NFE_AVULSA') {
    return (item.nfes || []).map((nfe) => ({
      key: `nfe-${nfe.id}`,
      label: `NF-e: ${getDocumentEnvironmentLabel(nfe.ambiente)}`,
      ambiente: nfe.ambiente,
      otherEnvironment: !isActiveEnvironmentDocument(
        nfe,
        activeEnvironment.nfe,
      ),
    }))
  }

  if (item.type === 'NFSE_AVULSA' && item.nfse) {
    return [
      {
        key: `nfse-${item.nfse.id}`,
        label: `NFS-e: ${getDocumentEnvironmentLabel(item.nfse.ambiente)}`,
        ambiente: item.nfse.ambiente,
        otherEnvironment: !isActiveEnvironmentDocument(
          item.nfse,
          activeEnvironment.nfse,
        ),
      },
    ]
  }

  if (item.type === 'NFCE_AVULSA' && item.nfce) {
    return [
      {
        key: `nfce-${item.nfce.id}`,
        label: `NFC-e: ${getDocumentEnvironmentLabel(item.nfce.ambiente)}`,
        ambiente: item.nfce.ambiente,
        otherEnvironment: !isActiveEnvironmentDocument(
          item.nfce,
          activeEnvironment.nfce,
        ),
      },
    ]
  }

  if (item.type !== 'ORDER') return []

  return [
    ...(item.nfes || []).map((nfe) => ({
      key: `nfe-${nfe.id}`,
      label: `NF-e: ${getDocumentEnvironmentLabel(nfe.ambiente)}`,
      ambiente: nfe.ambiente,
      otherEnvironment: !isActiveEnvironmentDocument(
        nfe,
        activeEnvironment.nfe,
      ),
    })),
    ...(item.nfses || []).map((nfse) => ({
      key: `nfse-${nfse.id}`,
      label: `NFS-e: ${getDocumentEnvironmentLabel(nfse.ambiente)}`,
      ambiente: nfse.ambiente,
      otherEnvironment: !isActiveEnvironmentDocument(
        nfse,
        activeEnvironment.nfse,
      ),
    })),
  ]
}

export function InvoiceResultsTable({ searchParams }: Props) {
  const router = useRouter()
  const { data: fiscalConfig } = useFiscalEnvironmentConfig()
  const activeEnvironment = useMemo(
    () => ({
      nfe: resolveFiscalEnvironment(fiscalConfig, 'NFE') === 'PRODUCAO' ? 1 : 2,
      nfse:
        resolveFiscalEnvironment(fiscalConfig, 'NFSE') === 'PRODUCAO' ? 1 : 2,
      nfce:
        resolveFiscalEnvironment(fiscalConfig, 'NFCE') === 'PRODUCAO' ? 1 : 2,
    }),
    [fiscalConfig],
  )
  const [isLoading, setIsLoading] = useState(true)
  const [orderGroups, setOrderGroups] = useState<OrderGroupFromBackend[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [modalOrderId, setModalOrderId] = useState<string | null>(null)
  const [cancelingDraftId, setCancelingDraftId] = useState<string | null>(null)
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [cancelNfce, setCancelNfce] = useState<{
    id: string
    numero: number
    serie: number
  } | null>(null)

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
    () =>
      visibleOrders.filter((order) =>
        canSelectForConsolidationInActiveEnvironment(order, activeEnvironment),
      ),
    [activeEnvironment, visibleOrders],
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

  const handleConsolidateNfse = () => {
    if (selectedOrders.length < 2) {
      toast.error('Selecione ao menos duas OSs para consolidar')
      return
    }

    router.push(
      `/nota-fiscal/emitir-nfse/consolidado?orders=${selectedOrders
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
    return value.toLocaleString('pt-BR', {
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
                    const statusProps = getEnvironmentAwareStatusProps(
                      item,
                      activeEnvironment,
                    )
                    const rejected = isRejectedInvoiceInActiveEnvironment(
                      item,
                      activeEnvironment,
                    )
                    const rejectionReason = getEnvironmentAwareRejectionReason(
                      item,
                      activeEnvironment,
                    )
                    const reissueHref = getEnvironmentAwareReissueHref(
                      item,
                      activeEnvironment,
                    )
                    const environmentBadges = getInvoiceEnvironmentBadges(
                      item,
                      activeEnvironment,
                    )

                    return (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell className="px-4">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex">
                                  <Checkbox
                                    id={`check-${item.id}`}
                                    disabled={
                                      !canSelectForConsolidationInActiveEnvironment(
                                        item,
                                        activeEnvironment,
                                      )
                                    }
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
                                {item.finalidade === 2
                                  ? 'NF-e Complementar'
                                  : item.finalidade === 4
                                    ? 'NF-e de Devolução'
                                    : 'NF-e Avulsa'}
                              </Badge>
                            ) : item.type === 'NFSE_AVULSA' ? (
                              <Badge variant="orangeLight" className="w-fit">
                                NFS-e Avulsa
                              </Badge>
                            ) : (
                              <Badge variant="successLight" className="w-fit">
                                NFC-e Avulsa
                              </Badge>
                            )}
                            <p className="font-medium text-gray-800">
                              {item.reference}
                            </p>
                            {environmentBadges.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {environmentBadges.map((badge) => (
                                  <Badge
                                    key={badge.key}
                                    variant={
                                      badge.otherEnvironment
                                        ? 'neutralLight'
                                        : getDocumentEnvironmentVariant(
                                            badge.ambiente,
                                          )
                                    }
                                    className="w-fit"
                                  >
                                    {badge.label}
                                    {badge.otherEnvironment
                                      ? ' (outro ambiente)'
                                      : ''}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {(() => {
                              if (item.type === 'ORDER') {
                                const authorizedNfe = findActiveNfe(
                                  item,
                                  activeEnvironment,
                                  ['AUTHORIZED', 'CORRECTION_SENT'],
                                )
                                const draftNfe = findActiveNfe(
                                  item,
                                  activeEnvironment,
                                  ['DRAFT'],
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
                            <Badge variant={statusProps.variant} status>
                              {statusProps.label}
                            </Badge>
                            {rejected && (
                              <RejectionReasonAction
                                reason={rejectionReason}
                                reissueHref={reissueHref}
                              />
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

                                if (item.type === 'NFCE_AVULSA') {
                                  const nfce = item.nfce
                                  const isAuthorized =
                                    nfce?.status === 'AUTHORIZED'
                                  const isContingency =
                                    nfce?.status === 'CONTINGENCY'
                                  const canReprocess =
                                    nfce?.status === 'UNKNOWN' ||
                                    nfce?.status === 'PROCESSING'

                                  const handleReprocess = async () => {
                                    if (!nfce?.id) return
                                    toast.loading('Reprocessando NFC-e...', {
                                      id: 'reprocess-nfce',
                                    })
                                    try {
                                      const result = await createItemNew({
                                        route: `/fiscal/nfce/${nfce.id}/reprocess`,
                                        data: {},
                                      })
                                      if (result.success) {
                                        toast.success('NFC-e reprocessada', {
                                          id: 'reprocess-nfce',
                                        })
                                      } else {
                                        toast.error(
                                          result.message ||
                                            'Erro ao reprocessar',
                                          { id: 'reprocess-nfce' },
                                        )
                                      }
                                      fetchOrders()
                                    } catch {
                                      toast.error('Erro ao reprocessar NFC-e', {
                                        id: 'reprocess-nfce',
                                      })
                                    }
                                  }

                                  const handleDownloadXml = () => {
                                    if (!nfce?.xmlAutorizado) {
                                      toast.error(
                                        'XML não disponível para download',
                                      )
                                      return
                                    }
                                    const blob = new Blob(
                                      [nfce.xmlAutorizado],
                                      { type: 'application/xml' },
                                    )
                                    const url = window.URL.createObjectURL(blob)
                                    const a = document.createElement('a')
                                    a.href = url
                                    a.download = `NFCe_${nfce.chaveAcesso || nfce.numero}.xml`
                                    document.body.appendChild(a)
                                    a.click()
                                    window.URL.revokeObjectURL(url)
                                    document.body.removeChild(a)
                                  }

                                  const handleConsultarStatus = async () => {
                                    toast.loading(
                                      'Consultando status SEFAZ...',
                                      { id: 'consult-nfce' },
                                    )
                                    try {
                                      const result = await getData({
                                        route: `/fiscal/nfce/${nfce?.id}/status`,
                                      })
                                      if (result.success) {
                                        toast.success(
                                          'Consulta realizada com sucesso',
                                          { id: 'consult-nfce' },
                                        )
                                        fetchOrders()
                                      } else {
                                        toast.error(
                                          result.message ||
                                            'Erro ao consultar status',
                                          { id: 'consult-nfce' },
                                        )
                                      }
                                    } catch {
                                      toast.error('Erro ao consultar status', {
                                        id: 'consult-nfce',
                                      })
                                    }
                                  }

                                  return (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="iconSm"
                                          aria-label="Ações da NFC-e"
                                        >
                                          <IconDotsVertical
                                            size={18}
                                            className="text-gray-500"
                                          />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align="end"
                                        className="w-56"
                                      >
                                        <DropdownMenuLabel>
                                          NFC-e nº {nfce?.numero}/{nfce?.serie}
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />

                                        {nfce?.danfeUrl && (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              window.open(
                                                nfce.danfeUrl!,
                                                '_blank',
                                              )
                                            }
                                          >
                                            <IconFileCheck className="mr-2 h-4 w-4" />
                                            <span>Ver DANFE</span>
                                          </DropdownMenuItem>
                                        )}

                                        {(isAuthorized || isContingency) &&
                                          nfce?.id && (
                                            <DropdownMenuItem
                                              onClick={() =>
                                                window.open(
                                                  `/api/fiscal/nfce/${nfce.id}/thermal`,
                                                  '_blank',
                                                )
                                              }
                                            >
                                              <IconPrinter className="mr-2 h-4 w-4" />
                                              <span>
                                                Imprimir DANFE térmico
                                              </span>
                                            </DropdownMenuItem>
                                          )}

                                        {nfce?.qrCodeUrl && (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              window.open(
                                                nfce.qrCodeUrl!,
                                                '_blank',
                                              )
                                            }
                                          >
                                            <IconQrcode className="mr-2 h-4 w-4" />
                                            <span>Visualizar QR Code</span>
                                          </DropdownMenuItem>
                                        )}

                                        {nfce?.xmlAutorizado && (
                                          <DropdownMenuItem
                                            onClick={handleDownloadXml}
                                          >
                                            <IconDownload className="mr-2 h-4 w-4" />
                                            <span>Baixar XML</span>
                                          </DropdownMenuItem>
                                        )}

                                        {(isAuthorized ||
                                          isContingency ||
                                          nfce?.status === 'REJECTED' ||
                                          nfce?.status === 'UNKNOWN') && (
                                          <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                              onClick={handleConsultarStatus}
                                            >
                                              <IconRefresh className="mr-2 h-4 w-4" />
                                              <span>Consultar SEFAZ</span>
                                            </DropdownMenuItem>
                                          </>
                                        )}

                                        {canReprocess && (
                                          <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                              onClick={handleReprocess}
                                            >
                                              <IconRefresh className="mr-2 h-4 w-4" />
                                              <span>Reprocessar NFC-e</span>
                                            </DropdownMenuItem>
                                          </>
                                        )}

                                        {isAuthorized && (
                                          <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                              className="text-error-600 focus:bg-error-50 focus:text-error-600"
                                              onClick={() =>
                                                setCancelNfce({
                                                  id: nfce.id,
                                                  numero: nfce.numero,
                                                  serie: nfce.serie,
                                                })
                                              }
                                            >
                                              <IconBan className="mr-2 h-4 w-4" />
                                              <span>Cancelar NFC-e</span>
                                            </DropdownMenuItem>
                                          </>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )
                                }

                                if (item.type === 'NFE_AVULSA') {
                                  const n = item.nfes?.[0]
                                  if (
                                    n?.status === 'AUTHORIZED' ||
                                    n?.status === 'CORRECTION_SENT' ||
                                    n?.status === 'REJECTED'
                                  ) {
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
                                const authorizedNfe = findActiveNfe(
                                  item,
                                  activeEnvironment,
                                  ['AUTHORIZED', 'CORRECTION_SENT'],
                                )
                                const draftNfe = findActiveNfe(
                                  item,
                                  activeEnvironment,
                                  ['DRAFT'],
                                )
                                const authorizedNfse = findActiveNfse(
                                  item,
                                  activeEnvironment,
                                  ['AUTHORIZED'],
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

                                if (authorizedNfse) {
                                  return (
                                    <ActionButton
                                      Icon={IconReceipt}
                                      tooltip={`Ver PDF NFS-e ${authorizedNfse.numero}/${authorizedNfse.serie}`}
                                      onClick={() => {
                                        if (authorizedNfse.pdfUrl) {
                                          window.open(
                                            authorizedNfse.pdfUrl,
                                            '_blank',
                                          )
                                        }
                                      }}
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
              <div className="flex gap-2">
                <Button
                  variant="neutralOutline"
                  LeftIcon={IconFileInvoice}
                  onClick={handleConsolidateNfse}
                >
                  Consolidar em NFS-e
                </Button>
                <Button
                  variant="success"
                  LeftIcon={IconFileInvoice}
                  onClick={handleConsolidate}
                >
                  Consolidar em NF-e
                </Button>
              </div>
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

        <CancelNfeDialog
          open={!!cancelNfce}
          onOpenChange={(open) => {
            if (!open) setCancelNfce(null)
          }}
          nfe={
            cancelNfce
              ? {
                  id: cancelNfce.id,
                  number: cancelNfce.numero,
                  series: String(cancelNfce.serie),
                }
              : null
          }
          isNfce={true}
          onSuccess={fetchOrders}
        />
      </Card>
    </>
  )
}
