'use client'

// React
import { useState } from 'react'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Components
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'
import { CancelNfeDialog } from './CancelNfeDialog'
import { CorrectionNfeDialog } from './CorrectionNfeDialog'

// Icons
import {
  IconExternalLink,
  IconX,
  IconPencil,
  IconRefresh,
} from '@tabler/icons-react'

// Hooks
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Utils
import { formatDate } from '@/lib/utils'

interface NfeItem {
  id: string
  number: number
  series: string
  status: string
  recipientName: string
  recipientDocument: string
  totalNfe: number
  danfeUrl?: string
  xmlKey?: string
  createdAt: string
  order?: {
    id: string
    quotation?: {
      id: string
      quotationNumber?: number
    }
  }
}

const statusConfig: Record<
  string,
  { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }
> = {
  AUTORIZADA: { variant: 'success', label: 'Autorizada' },
  PROCESSANDO: { variant: 'warning', label: 'Processando' },
  REJEITADA: { variant: 'error', label: 'Rejeitada' },
  CANCELADA: { variant: 'neutral', label: 'Cancelada' },
  DENEGADA: { variant: 'error', label: 'Denegada' },
  ERRO: { variant: 'error', label: 'Erro' },
}

async function fetchNfeList(status?: string) {
  const params: Record<string, string> = {}
  if (status && status !== 'ALL') {
    params.status = status
  }

  const response = await getDataOld({
    route: '/fiscal/nfe',
    params,
  })

  return response?.data || []
}

export function NfeListClient() {
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false)
  const [selectedNfe, setSelectedNfe] = useState<NfeItem | null>(null)

  const queryClient = useQueryClient()

  const { data: nfeList = [], isLoading } = useQuery({
    queryKey: ['nfe-list', statusFilter],
    queryFn: () => fetchNfeList(statusFilter),
  })

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['nfe-list'] })
  }

  const handleOpenDanfe = (url: string) => {
    window.open(url, '_blank')
  }

  const handleOpenCancel = (nfe: NfeItem) => {
    setSelectedNfe(nfe)
    setCancelDialogOpen(true)
  }

  const handleOpenCorrection = (nfe: NfeItem) => {
    setSelectedNfe(nfe)
    setCorrectionDialogOpen(true)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const hasData = nfeList.length > 0

  if (isLoading) {
    return <TableSkeleton />
  }

  return (
    <>
      {/* Filters */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              <SelectItem value="AUTORIZADA">Autorizada</SelectItem>
              <SelectItem value="PROCESSANDO">Processando</SelectItem>
              <SelectItem value="CANCELADA">Cancelada</SelectItem>
              <SelectItem value="REJEITADA">Rejeitada</SelectItem>
              <SelectItem value="ERRO">Erro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="neutralOutline"
          size="sm"
          onClick={handleRefresh}
          LeftIcon={IconRefresh}
        >
          Atualizar
        </Button>
      </div>

      {/* Table */}
      {hasData ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número/Série</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Destinatário</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nfeList.map((nfe: NfeItem) => {
              const status = statusConfig[nfe.status] || {
                variant: 'neutral' as const,
                label: nfe.status,
              }
              const canCancel = nfe.status === 'AUTORIZADA'
              const canCorrect = nfe.status === 'AUTORIZADA'

              return (
                <TableRow key={nfe.id}>
                  <TableCell>
                    <div className="font-medium">
                      {nfe.number}/{nfe.series}
                    </div>
                    {nfe.order?.quotation?.quotationNumber && (
                      <div className="text-xs text-gray-500">
                        Pedido #{nfe.order.quotation.quotationNumber}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{nfe.recipientName}</div>
                    <div className="text-xs text-gray-500">
                      {nfe.recipientDocument}
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(nfe.totalNfe)}</TableCell>
                  <TableCell>{formatDate(nfe.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <TooltipProvider>
                        {nfe.danfeUrl && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="neutralGhost"
                                size="icon"
                                onClick={() => handleOpenDanfe(nfe.danfeUrl!)}
                              >
                                <IconExternalLink className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver DANFE</TooltipContent>
                          </Tooltip>
                        )}

                        {canCorrect && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="neutralGhost"
                                size="icon"
                                onClick={() => handleOpenCorrection(nfe)}
                              >
                                <IconPencil className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Carta de Correção</TooltipContent>
                          </Tooltip>
                        )}

                        {canCancel && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="neutralGhost"
                                size="icon"
                                onClick={() => handleOpenCancel(nfe)}
                              >
                                <IconX className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Cancelar NF-e</TooltipContent>
                          </Tooltip>
                        )}
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      ) : (
        <FilteredDataEmpty
          title="Nenhuma nota fiscal encontrada"
          description="Não há notas fiscais emitidas com os filtros selecionados"
        />
      )}

      {/* Dialogs */}
      <CancelNfeDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        nfe={selectedNfe}
        onSuccess={handleRefresh}
      />

      <CorrectionNfeDialog
        open={correctionDialogOpen}
        onOpenChange={setCorrectionDialogOpen}
        nfe={selectedNfe}
        onSuccess={handleRefresh}
      />
    </>
  )
}
