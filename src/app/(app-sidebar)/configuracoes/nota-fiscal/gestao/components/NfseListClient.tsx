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
import { RejectionReasonAction } from '@/components/common/fiscal/RejectionReasonAction'

// Icons
import { IconExternalLink, IconX, IconRefresh } from '@tabler/icons-react'

// Hooks
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Actions
import { getDataOld } from '@/actions/_cruds'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

interface NfseItem {
  id: string
  number: number
  series: string
  rpsNumber: number
  status: string
  recipientName: string
  recipientDocument: string
  totalNfse: number
  pdfUrl?: string
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
interface NfseBackendItem {
  id: string
  numero: number
  serie: string
  rpsNumero: number
  status: string
  valorServicos: number
  pdfUrl?: string
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
}

async function fetchNfseList(status?: string) {
  const filters: Record<string, string> = {}
  if (status && status !== 'ALL') {
    filters.status = status
  }

  const response = await getDataOld({
    route: '/fiscal/nfse',
    filters,
  })

  // O backend retorna { items, total, page, limit, totalPages }
  // getDataOld já retorna res.data, então não precisa de .data adicional
  const items = response?.items || response || []

  // Mapear campos do banco para os esperados pelo frontend
  return items.map((nfse: NfseBackendItem) => ({
    id: nfse.id,
    number: nfse.numero,
    series: nfse.serie,
    rpsNumber: nfse.rpsNumero,
    status: nfse.status,
    recipientName:
      nfse.order?.quotation?.client?.name ||
      nfse.quotation?.client?.name ||
      'N/A',
    recipientDocument:
      nfse.order?.quotation?.client?.cnpj ||
      nfse.order?.quotation?.client?.cpf ||
      nfse.quotation?.client?.cnpj ||
      nfse.quotation?.client?.cpf ||
      '',
    totalNfse: nfse.valorServicos,
    pdfUrl: nfse.pdfUrl,
    rejectionReason: nfse.motivoRejeicao,
    createdAt: nfse.createdAt,
    environment: nfse.ambiente === 1 ? 'PRODUCAO' : 'HOMOLOGACAO',
    order: nfse.order,
  }))
}

export function NfseListClient() {
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const queryClient = useQueryClient()

  const { data: nfseList = [], isLoading } = useQuery({
    queryKey: ['nfse-list', statusFilter],
    queryFn: () => fetchNfseList(statusFilter),
  })

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['nfse-list'] })
  }

  const handleOpenPdf = (url: string) => {
    window.open(url, '_blank')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const hasData = nfseList.length > 0

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
              <TableHead>Numero/Serie</TableHead>
              <TableHead>RPS</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ambiente</TableHead>
              <TableHead>Tomador</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nfseList.map((nfse: NfseItem) => {
              const status = statusConfig[nfse.status] || {
                variant: 'neutral' as const,
                label: nfse.status,
              }
              const canCancel =
                nfse.status === 'AUTHORIZED' || nfse.status === 'AUTORIZADA'
              const isRejected =
                nfse.status === 'REJECTED' || nfse.status === 'REJEITADA'

              return (
                <TableRow key={nfse.id}>
                  <TableCell>
                    <div className="font-medium">
                      {nfse.number}/{nfse.series}
                    </div>
                    {nfse.order?.quotation?.quotationNumber && (
                      <div className="text-xs text-gray-500">
                        Pedido #{nfse.order.quotation.quotationNumber}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {nfse.rpsNumber}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      {isRejected && (
                        <RejectionReasonAction reason={nfse.rejectionReason} />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        nfse.environment === 'PRODUCAO'
                          ? 'successLight'
                          : 'warningLight'
                      }
                    >
                      {nfse.environment === 'PRODUCAO'
                        ? 'Produção'
                        : 'Homologação'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{nfse.recipientName}</div>
                    <div className="text-xs text-gray-500">
                      {nfse.recipientDocument}
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(nfse.totalNfse)}</TableCell>
                  <TableCell>{formatDate(nfse.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <TooltipProvider>
                        {nfse.pdfUrl && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="neutralGhost"
                                size="icon"
                                onClick={() => handleOpenPdf(nfse.pdfUrl!)}
                              >
                                <IconExternalLink className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver PDF</TooltipContent>
                          </Tooltip>
                        )}

                        {canCancel && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="neutralGhost"
                                size="icon"
                                disabled
                              >
                                <IconX className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Cancelar NFS-e</TooltipContent>
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
          title="Nenhuma NFS-e encontrada"
          description="Nao ha notas fiscais de servico emitidas com os filtros selecionados"
        />
      )}
    </>
  )
}
