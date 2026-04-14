'use client'

import { format } from 'date-fns'

// UI
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
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

// Icons
import { IconPrinter } from '@tabler/icons-react'

// Components
import { statusMap, InvoiceEmptyState } from './InvoiceTable'

type BadgeVariant =
  | 'default'
  | 'outline'
  | 'success'
  | 'warning'
  | 'purple'
  | 'blue'
  | 'error'
  | 'neutral'

interface NfseItem {
  id: string
  numero: string
  serie: string
  status: string
  dataEmissao?: string
  valorServicos?: number
  pdfUrl?: string
  quotation?: {
    client?: {
      corporateName?: string
      name?: string
    }
  }
  order?: {
    quotation?: {
      client?: {
        name?: string
      }
    }
  }
}

interface NfseTabProps {
  items: NfseItem[]
  isLoading: boolean
}

export function NfseTab({ items, isLoading }: NfseTabProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>NFS-e Emitidas</CardTitle>
          <CardDescription>
            Lista de notas fiscais de serviço eletrônicas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>NFS-e Emitidas</CardTitle>
          <CardDescription>
            Lista de notas fiscais de serviço eletrônicas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvoiceEmptyState
            message="Nenhuma NFS-e encontrada"
            description="As notas fiscais de serviço emitidas aparecerão aqui."
            ctaLabel="Emitir NFS-e"
            ctaHref="/nota-fiscal/emitir"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>NFS-e Emitidas</CardTitle>
        <CardDescription>
          Lista de notas fiscais de serviço eletrônicas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número / Série</TableHead>
                <TableHead>Tomador</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((nfse) => {
                const nfseStatus = statusMap[nfse.status] || {
                  label: nfse.status,
                  variant: 'default' as BadgeVariant,
                }

                const tomador =
                  nfse.quotation?.client?.corporateName ||
                  nfse.quotation?.client?.name ||
                  nfse.order?.quotation?.client?.name ||
                  'Tomador não identificado'

                return (
                  <TableRow key={nfse.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{nfse.numero}</span>
                        <span className="text-xs text-gray-500">
                          Série {nfse.serie}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{tomador}</TableCell>
                    <TableCell>
                      {nfse.dataEmissao
                        ? format(new Date(nfse.dataEmissao), 'dd/MM/yyyy HH:mm')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {(nfse.valorServicos || 0).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={nfseStatus.variant}>
                        {nfseStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {nfse.pdfUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(nfse.pdfUrl, '_blank')}
                          aria-label="Ver PDF"
                        >
                          <IconPrinter className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
