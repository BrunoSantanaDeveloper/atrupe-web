'use client'

import { useState } from 'react'
import { toast } from 'sonner'

// UI
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

// Icons
import {
  IconDotsVertical,
  IconFileCheck,
  IconDownload,
  IconBan,
  IconRefresh,
  IconLoader2,
  IconMail,
} from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

// Dialogs
import { CancelNfeDialog } from '@/app/(app-sidebar)/configuracoes/nota-fiscal/gestao/components/CancelNfeDialog'

// Actions
import { createItemNew, getItem } from '@/actions/_cruds'

interface NfseActionsDropdownProps {
  nfse: {
    id: string
    numero: number
    serie: string
    status: string
    pdfUrl?: string | null
    codigoVerificacao?: string | null
  }
  onRefetch: () => void
}

export function NfseActionsDropdown({
  nfse,
  onRefetch,
}: NfseActionsDropdownProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isConsulting, setIsConsulting] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isOpeningPdf, setIsOpeningPdf] = useState(false)
  const [isDownloadingXml, setIsDownloadingXml] = useState(false)

  const isAuthorized = nfse.status === 'AUTHORIZED'

  const handleVerPdf = async () => {
    const previewWindow = window.open('', '_blank')
    if (!previewWindow) {
      toast.error('Permita a abertura de pop-ups para visualizar o PDF')
      return
    }

    setIsOpeningPdf(true)
    try {
      // O pdfUrl salvo na emissão evita um round-trip; o endpoint é o fallback
      // para notas antigas que não o têm gravado.
      if (nfse.pdfUrl) {
        previewWindow.location.href = nfse.pdfUrl
        return
      }

      const result = await getItem({ route: `/fiscal/nfse/${nfse.id}/pdf` })
      if (!result.success) {
        throw new Error(result.message || 'PDF não disponível')
      }

      const url = result.data?.url || result.data?.pdfUrl
      if (!url) throw new Error('PDF não disponível')
      previewWindow.location.href = url
    } catch (error) {
      previewWindow.close()
      toast.error(
        error instanceof Error ? error.message : 'Não foi possível abrir o PDF',
      )
    } finally {
      setIsOpeningPdf(false)
    }
  }

  const handleDownloadXml = async () => {
    setIsDownloadingXml(true)
    try {
      const result = await getItem({ route: `/fiscal/nfse/${nfse.id}/xml` })

      if (!result.success || !result.data?.xml) {
        throw new Error(result.message || 'XML não disponível para download')
      }

      const blob = new Blob([result.data.xml], { type: 'application/xml' })
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `NFSe_${nfse.numero}_${nfse.serie}.xml`
      document.body.appendChild(anchor)
      anchor.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(anchor)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao baixar o XML',
      )
    } finally {
      setIsDownloadingXml(false)
    }
  }

  const handleSendEmail = async () => {
    setIsSendingEmail(true)
    try {
      const result = await createItemNew({
        route: `/fiscal/nfse/${nfse.id}/send-email`,
      })

      if (!result.success) {
        const endpointUnavailable =
          result.status === 404 || result.message?.includes('Cannot POST')

        toast.error(
          endpointUnavailable
            ? 'Envio por e-mail indisponível neste backend. Atualize/reinicie a API e tente novamente.'
            : result.message || 'Erro ao enviar PDF/XML por e-mail',
        )
        return
      }

      toast.success('PDF/XML enviados por e-mail')
      onRefetch()
    } catch {
      toast.error('Erro ao enviar PDF/XML por e-mail')
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleConsultarStatus = async () => {
    setIsConsulting(true)
    try {
      const result = await getItem({ route: `/fiscal/nfse/${nfse.id}/status` })

      if (!result.success) {
        throw new Error(result.message || 'Erro ao consultar status')
      }

      toast.success('Consulta realizada')
      onRefetch()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível consultar o status',
      )
    } finally {
      setIsConsulting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="iconSm" aria-label="Ações da NFS-e">
            <Icon icon={IconDotsVertical} size="sm" className="text-gray-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            NFS-e nº {nfse.numero}/{nfse.serie}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {isAuthorized && (
            <DropdownMenuItem
              disabled={isOpeningPdf}
              onClick={(event) => {
                event.preventDefault()
                handleVerPdf()
              }}
            >
              {isOpeningPdf ? (
                <Icon
                  icon={IconLoader2}
                  size="md"
                  className="mr-2 animate-spin"
                />
              ) : (
                <Icon icon={IconFileCheck} size="md" className="mr-2" />
              )}
              <span>Ver PDF</span>
            </DropdownMenuItem>
          )}

          {isAuthorized && (
            <DropdownMenuItem
              disabled={isDownloadingXml}
              onClick={(event) => {
                event.preventDefault()
                handleDownloadXml()
              }}
            >
              {isDownloadingXml ? (
                <Icon
                  icon={IconLoader2}
                  size="md"
                  className="mr-2 animate-spin"
                />
              ) : (
                <Icon icon={IconDownload} size="md" className="mr-2" />
              )}
              <span>Baixar XML</span>
            </DropdownMenuItem>
          )}

          {isAuthorized && <DropdownMenuSeparator />}

          {isAuthorized && (
            <DropdownMenuItem
              disabled={isSendingEmail}
              onClick={(event) => {
                event.preventDefault()
                handleSendEmail()
              }}
            >
              {isSendingEmail ? (
                <Icon
                  icon={IconLoader2}
                  size="md"
                  className="mr-2 animate-spin"
                />
              ) : (
                <Icon icon={IconMail} size="md" className="mr-2" />
              )}
              <span>Enviar PDF/XML por e-mail</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            disabled={isConsulting}
            onClick={(event) => {
              event.preventDefault()
              handleConsultarStatus()
            }}
          >
            {isConsulting ? (
              <Icon
                icon={IconLoader2}
                size="md"
                className="mr-2 animate-spin"
              />
            ) : (
              <Icon icon={IconRefresh} size="md" className="mr-2" />
            )}
            <span>Consultar status</span>
          </DropdownMenuItem>

          {isAuthorized && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsCancelDialogOpen(true)}
                className="text-error-600 focus:text-error-600"
              >
                <Icon icon={IconBan} size="md" className="mr-2" />
                <span>Cancelar NFS-e</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CancelNfeDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        nfe={{
          id: nfse.id,
          number: nfse.numero,
          series: nfse.serie,
        }}
        docType="NFSE"
        onSuccess={() => {
          setIsCancelDialogOpen(false)
          onRefetch()
        }}
      />
    </>
  )
}
