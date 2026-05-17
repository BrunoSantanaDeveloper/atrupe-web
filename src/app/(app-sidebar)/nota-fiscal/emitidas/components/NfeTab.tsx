'use client'

import { useState } from 'react'
import { toast } from 'sonner'

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'

// Icons
import {
  IconDotsVertical,
  IconFileText,
  IconPrinter,
  IconBan,
  IconHash,
  IconPencil,
  IconAlertCircle,
} from '@tabler/icons-react'

// Components
import { InvoiceTable } from './InvoiceTable'
import { CorrectionLetterDialog } from '@/components/common/fiscal/CorrectionLetterDialog'
import { CancelNfeDialog } from './CancelNfeDialog'
import { InutilizarDialog } from './InutilizarDialog'

// Types
import type { Nfe, Nfce } from '@/types/fiscal/nfe'

interface NfeTabProps {
  items: (Nfe | Nfce)[]
  isLoading: boolean
  onRefetch: () => void
}

export function NfeTab({ items, isLoading, onRefetch }: NfeTabProps) {
  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false)
  const [correctionNfeId, setCorrectionNfeId] = useState<string | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelNfeId, setCancelNfeId] = useState<string | null>(null)
  const [inutDialogOpen, setInutDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState<string | null>(null)
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)

  const handleShowRejection = (motivo: string | undefined | null) => {
    setRejectionReason(
      motivo || 'Motivo não disponível. Consulte o XML de retorno.',
    )
    setRejectionDialogOpen(true)
  }

  const handleDownloadXml = (xml: string | undefined, filename: string) => {
    if (!xml) {
      toast.error('XML não disponível')
      return
    }
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.xml`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleOpenDanfe = (url: string | undefined) => {
    if (!url) {
      toast.error('DANFE não disponível')
      return
    }
    window.open(url, '_blank')
  }

  const renderActions = (item: Nfe | Nfce) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0"
          aria-label="Abrir menu de ações"
        >
          <span className="sr-only">Abrir menu</span>
          <IconDotsVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        {item.danfeUrl && (
          <DropdownMenuItem onClick={() => handleOpenDanfe(item.danfeUrl)}>
            <IconPrinter className="mr-2 h-4 w-4" />
            Ver DANFE (PDF)
          </DropdownMenuItem>
        )}
        {item.xmlAutorizado && (
          <DropdownMenuItem
            onClick={() =>
              handleDownloadXml(item.xmlAutorizado, `NFe-${item.numero}`)
            }
          >
            <IconFileText className="mr-2 h-4 w-4" />
            Baixar XML
          </DropdownMenuItem>
        )}
        {item.status === 'REJECTED' && (
          <DropdownMenuItem
            className="text-warning-700 focus:text-warning-700 focus:bg-warning-50"
            onClick={() => handleShowRejection(item.motivoRejeicao)}
          >
            <IconAlertCircle className="mr-2 h-4 w-4" />
            Ver motivo da rejeição
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {item.status === 'AUTHORIZED' && (
          <DropdownMenuItem
            onClick={() => {
              setCorrectionNfeId(item.id)
              setCorrectionDialogOpen(true)
            }}
          >
            <IconPencil className="mr-2 h-4 w-4" />
            Carta de Correção
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="text-error-600 focus:text-error-600 focus:bg-error-50"
          disabled={item.status !== 'AUTHORIZED'}
          onClick={() => {
            setCancelNfeId(item.id)
            setCancelDialogOpen(true)
          }}
        >
          <IconBan className="mr-2 h-4 w-4" />
          Cancelar Nota
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>NF-e Emitidas</CardTitle>
          <CardDescription>Lista de notas fiscais modelo 55.</CardDescription>
        </CardHeader>
        <div className="flex gap-2 px-6 pb-4">
          <Button
            variant="neutralOutline"
            size="sm"
            onClick={() => setInutDialogOpen(true)}
          >
            <IconHash className="h-4 w-4 mr-1" />
            Inutilizar Numeração
          </Button>
        </div>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <InvoiceTable
              items={items}
              actionRenderer={renderActions}
              onStatusClick={(item) => {
                if (item.status === 'REJECTED') {
                  handleShowRejection(item.motivoRejeicao)
                }
              }}
              emptyCtaLabel="Emitir NF-e"
              emptyCtaHref="/nota-fiscal/emitir"
            />
          )}
        </CardContent>
      </Card>

      <CorrectionLetterDialog
        open={correctionDialogOpen}
        onOpenChange={setCorrectionDialogOpen}
        nfeId={correctionNfeId}
        onSuccess={onRefetch}
      />
      <CancelNfeDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        nfeId={cancelNfeId}
        onSuccess={onRefetch}
      />
      <InutilizarDialog
        open={inutDialogOpen}
        onOpenChange={setInutDialogOpen}
      />

      {/* Modal de Motivo de Rejeição */}
      <AlertDialog
        open={rejectionDialogOpen}
        onOpenChange={setRejectionDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-error-700">
              <IconAlertCircle className="h-5 w-5" />
              Motivo da Rejeição
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-700 whitespace-pre-wrap">
              {rejectionReason}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
