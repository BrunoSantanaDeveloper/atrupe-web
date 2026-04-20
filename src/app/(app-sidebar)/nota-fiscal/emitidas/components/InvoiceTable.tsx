import { format } from 'date-fns'

// UI
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

// Types
import type { Nfe, Nfce } from '@/types/fiscal/nfe'

// Icons
import { IconFileInvoice } from '@tabler/icons-react'

type BadgeVariant =
  | 'default'
  | 'outline'
  | 'success'
  | 'warning'
  | 'purple'
  | 'blue'
  | 'error'
  | 'neutral'

export const statusMap: Record<
  string,
  { label: string; variant: BadgeVariant }
> = {
  AUTHORIZED: { label: 'Autorizada', variant: 'success' },
  PROCESSING: { label: 'Processando', variant: 'warning' },
  REJECTED: { label: 'Rejeitada', variant: 'error' },
  CANCELLED: { label: 'Cancelada', variant: 'neutral' },
  ERROR: { label: 'Erro', variant: 'error' },
  DRAFT: { label: 'Rascunho', variant: 'outline' },
  PENDING: { label: 'Pendente', variant: 'warning' },
}

export function InvoiceEmptyState({
  message = 'Nenhuma nota fiscal encontrada',
  description = 'As notas fiscais emitidas aparecerão aqui.',
  ctaLabel,
  ctaHref,
}: {
  message?: string
  description?: string
  ctaLabel?: string
  ctaHref?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <IconFileInvoice size={48} className="mb-4 text-gray-300" />
      <p className="text-lg font-medium">{message}</p>
      <p className="text-sm">{description}</p>
      {ctaLabel && ctaHref && (
        <a
          href={ctaHref}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          {ctaLabel}
        </a>
      )}
    </div>
  )
}

interface InvoiceTableProps {
  items: (Nfe | Nfce)[]
  onAction?: (action: string, item: Nfe | Nfce) => void
  actionRenderer?: (item: Nfe | Nfce) => React.ReactNode
  emptyCtaLabel?: string
  emptyCtaHref?: string
}

export function InvoiceTable({
  items,
  actionRenderer,
  emptyCtaLabel,
  emptyCtaHref,
}: InvoiceTableProps) {
  if (!items || items.length === 0) {
    return <InvoiceEmptyState ctaLabel={emptyCtaLabel} ctaHref={emptyCtaHref} />
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número / Série</TableHead>
            <TableHead>Destinatário</TableHead>
            <TableHead>Emissão</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const statusInfo = statusMap[item.status] || {
              label: item.status,
              variant: 'default' as BadgeVariant,
            }
            const clientName =
              item.quotation?.client?.corporateName ||
              item.quotation?.client?.name ||
              'Cliente não identificado'

            return (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{item.numero}</span>
                    <span className="text-xs text-gray-500">
                      Série {item.serie}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{clientName}</TableCell>
                <TableCell>
                  {item.dataEmissao
                    ? format(new Date(item.dataEmissao), 'dd/MM/yyyy HH:mm')
                    : '-'}
                </TableCell>
                <TableCell>
                  {item.valorTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </TableCell>
                <TableCell>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {actionRenderer?.(item)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
