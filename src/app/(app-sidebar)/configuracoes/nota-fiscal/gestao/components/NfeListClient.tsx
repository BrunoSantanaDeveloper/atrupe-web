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
import { RejectionReasonAction } from '@/components/common/fiscal/RejectionReasonAction'

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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

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
  rejectionReason?: string | null
  createdAt: string
  environment: 'HOMOLOGACAO' | 'PRODUCAO'
  order?: {
    id: string
    quotation?: {
      id: string
      quotationNumber?: number
    }
  }
}

// Tipo para os dados retornados do backend
interface NfeBackendItem {
  id: string
  numero: number
  serie: number
  status: string
  valorTotal: number
  danfeUrl?: string
  chaveAcesso?: string
  motivoRejeicao?: string | null
  createdAt: string
  ambiente: number
  order?: {
    id: string
    quotation?: {
      id: string
      quotationNumber?: number
      client?: {
        name?: string
        cnpj?: string
        cpf?: string
      }
    }
  }
  quotation?: {
    client?: {
      name?: string
      cnpj?: string
      cpf?: string
    }
  }
}

const statusConfig: Record<
  string,
  { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }
> = {
  AUTHORIZED: { variant: 'success', label: 'Autorizada' },
  AUTORIZADA: { variant: 'success', label: 'Autorizada' },
  PROCESSING: { variant: 'warning', label: 'Processando' },
  PROCESSANDO: { variant: 'warning', label: 'Processando' },
  PENDING: { variant: 'warning', label: 'Pendente' },
  REJECTED: { variant: 'error', label: 'Rejeitada' },
  REJEITADA: { variant: 'error', label: 'Rejeitada' },
  CANCELLED: { variant: 'neutral', label: 'Cancelada' },
  CANCELADA: { variant: 'neutral', label: 'Cancelada' },
  CORRECTION_SENT: { variant: 'warning', label: 'Carta de Correção' },
  DENEGADA: { variant: 'error', label: 'Denegada' },
  ERRO: { variant: 'error', label: 'Erro' },
}

async function fetchNfeList(status?: string) {
  const filters: Record<string, string> = {}
  if (status && status !== 'ALL') {
    filters.status = status
  }

  const response = await getDataOld({
    route: '/fiscal/nfe',
    filters,
  })

  // getDataOld já retorna res.data, então não precisa de .data adicional
  const items = response?.items || response || []

  // Mapear campos do banco para os esperados pelo frontend
  return items.map((nfe: NfeBackendItem) => ({
    id: nfe.id,
    number: nfe.numero,
    series: String(nfe.serie),
    status: nfe.status,
    recipientName:
      nfe.order?.quotation?.client?.name ||
      nfe.quotation?.client?.name ||
      'N/A',
    recipientDocument:
      nfe.order?.quotation?.client?.cnpj ||
      nfe.order?.quotation?.client?.cpf ||
      nfe.quotation?.client?.cnpj ||
      nfe.quotation?.client?.cpf ||
      '',
    totalNfe: nfe.valorTotal,
    danfeUrl: nfe.danfeUrl,
    xmlKey: nfe.chaveAcesso,
    rejectionReason: nfe.motivoRejeicao,
    createdAt: nfe.createdAt,
    environment: nfe.ambiente === 1 ? 'PRODUCAO' : 'HOMOLOGACAO',
    order: nfe.order,
  }))
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
              <SelectItem value="AUTHORIZED">Autorizada</SelectItem>
              <SelectItem value="PROCESSING">Processando</SelectItem>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="CANCELLED">Cancelada</SelectItem>
              <SelectItem value="REJECTED">Rejeitada</SelectItem>
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
              <TableHead>Ambiente</TableHead>
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
              const canCancel =
                nfe.status === 'AUTHORIZED' || nfe.status === 'AUTORIZADA'
              const canCorrect =
                nfe.status === 'AUTHORIZED' || nfe.status === 'AUTORIZADA'
              const isRejected =
                nfe.status === 'REJECTED' || nfe.status === 'REJEITADA'

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
                    <div className="flex items-center gap-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      {isRejected && (
                        <RejectionReasonAction
                          reason={nfe.rejectionReason}
                          reissueHref={`/nota-fiscal/emitir/avulsa/nfe?reissueOf=${nfe.id}`}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        nfe.environment === 'PRODUCAO'
                          ? 'successLight'
                          : 'warningLight'
                      }
                    >
                      {nfe.environment === 'PRODUCAO'
                        ? 'Produção'
                        : 'Homologação'}
                    </Badge>
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
