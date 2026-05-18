'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Icons
import {
  IconDotsVertical,
  IconFileCheck,
  IconDownload,
  IconEdit,
  IconArrowBackUp,
  IconPlus,
  IconBan,
  IconRefresh,
  IconLoader2,
} from '@tabler/icons-react'

// Dialogs
import { CorrectionLetterDialog } from './CorrectionLetterDialog'
import { CancelNfeDialog } from '@/app/(app-sidebar)/configuracoes/nota-fiscal/gestao/components/CancelNfeDialog'

// Actions
import { getItem } from '@/actions/_cruds'

interface NfeActionsDropdownProps {
  nfe: {
    id: string
    numero: number
    serie: number
    status: string
    chaveAcesso?: string | null
    danfeUrl?: string | null
    xmlAutorizado?: string | null
    dataEmissao?: string | null
  }
  onRefetch: () => void
}

export function NfeActionsDropdown({
  nfe,
  onRefetch,
}: NfeActionsDropdownProps) {
  const router = useRouter()
  const [isCcEDialogOpen, setIsCcEDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isConsulting, setIsConsulting] = useState(false)

  const horasDesdeEmissao = nfe.dataEmissao
    ? (Date.now() - new Date(nfe.dataEmissao).getTime()) / (1000 * 60 * 60)
    : 0
  const cancelDisabled = horasDesdeEmissao > 24

  const handleDownloadXml = async () => {
    if (!nfe.xmlAutorizado) {
      toast.error('XML não disponível para download')
      return
    }

    try {
      const blob = new Blob([nfe.xmlAutorizado], { type: 'application/xml' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `NFe_${nfe.chaveAcesso || nfe.numero}.xml`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast.error('Erro ao baixar o XML')
    }
  }

  const handleConsultarStatus = async () => {
    setIsConsulting(true)
    try {
      const result = await getItem({ route: `/fiscal/nfe/${nfe.id}/status` })

      if (result.data?.sefazError) {
        toast.error(`Erro na consulta SEFAZ: ${result.data.sefazError}`)
        return
      }

      if (result.data?.statusChanged) {
        toast.info(`Status atualizado: ${result.data.sefazDescription}`)
        onRefetch()
      } else {
        toast.success('Nota conferida na SEFAZ — sem alterações')
      }
    } catch {
      toast.error('Não foi possível consultar o status')
    } finally {
      setIsConsulting(false)
    }
  }

  const handleVerDanfe = () => {
    if (nfe.danfeUrl) {
      window.open(nfe.danfeUrl, '_blank')
    }
  }

  const showCce =
    nfe.status === 'AUTHORIZED' || nfe.status === 'CORRECTION_SENT'
  const isAuthorized = nfe.status === 'AUTHORIZED'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="iconSm" aria-label="Ações da NF-e">
            <IconDotsVertical size={18} className="text-gray-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            NF-e nº {nfe.numero}/{nfe.serie}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {nfe.danfeUrl && (
            <DropdownMenuItem onClick={handleVerDanfe}>
              <IconFileCheck className="mr-2 h-4 w-4" />
              <span>Ver DANFE</span>
            </DropdownMenuItem>
          )}

          {nfe.xmlAutorizado && (
            <DropdownMenuItem onClick={handleDownloadXml}>
              <IconDownload className="mr-2 h-4 w-4" />
              <span>Baixar XML</span>
            </DropdownMenuItem>
          )}

          {(showCce || isAuthorized) && <DropdownMenuSeparator />}

          {showCce && (
            <DropdownMenuItem onClick={() => setIsCcEDialogOpen(true)}>
              <IconEdit className="mr-2 h-4 w-4" />
              <span>Carta de Correção</span>
            </DropdownMenuItem>
          )}

          {isAuthorized && (
            <>
              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/nota-fiscal/emitir/avulsa/nfe?devolutionOf=${nfe.id}`,
                  )
                }
              >
                <IconArrowBackUp className="mr-2 h-4 w-4" />
                <span>Devolver NF-e</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/nota-fiscal/emitir/avulsa/nfe?complementaryOf=${nfe.id}`,
                  )
                }
              >
                <IconPlus className="mr-2 h-4 w-4" />
                <span>Emitir Complementar</span>
              </DropdownMenuItem>
            </>
          )}

          {nfe.status === 'REJECTED' && (
            <DropdownMenuItem
              onClick={() =>
                router.push(
                  `/nota-fiscal/emitir/avulsa/nfe?reissueOf=${nfe.id}`,
                )
              }
            >
              <IconEdit className="mr-2 h-4 w-4 text-warning-600" />
              <span className="text-warning-600">Corrigir e Reemitir</span>
            </DropdownMenuItem>
          )}

          {(nfe.status === 'AUTHORIZED' ||
            nfe.status === 'PENDING' ||
            nfe.status === 'REJECTED') && (
            <DropdownMenuItem
              disabled={isConsulting}
              onClick={(e) => {
                e.preventDefault() // Keep dropdown open while consulting
                handleConsultarStatus()
              }}
            >
              {isConsulting ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconRefresh className="mr-2 h-4 w-4" />
              )}
              <span>Consultar SEFAZ</span>
            </DropdownMenuItem>
          )}

          {isAuthorized && (
            <>
              <DropdownMenuSeparator />
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div className="w-full">
                      <DropdownMenuItem
                        disabled={cancelDisabled}
                        onClick={() =>
                          !cancelDisabled && setIsCancelDialogOpen(true)
                        }
                        className={
                          cancelDisabled
                            ? 'opacity-50 cursor-not-allowed text-error-600 focus:bg-error-50 focus:text-error-600'
                            : 'text-error-600 focus:bg-error-50 focus:text-error-600'
                        }
                      >
                        <IconBan className="mr-2 h-4 w-4" />
                        <span>Cancelar NF-e</span>
                      </DropdownMenuItem>
                    </div>
                  </TooltipTrigger>
                  {cancelDisabled && (
                    <TooltipContent>
                      <p>O prazo para cancelamento (24h) expirou.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CorrectionLetterDialog
        open={isCcEDialogOpen}
        onOpenChange={setIsCcEDialogOpen}
        nfeId={isCcEDialogOpen ? nfe.id : null}
        onSuccess={onRefetch}
      />

      <CancelNfeDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        nfe={
          isCancelDialogOpen
            ? { id: nfe.id, number: nfe.numero, series: String(nfe.serie) }
            : null
        }
        onSuccess={onRefetch}
      />
    </>
  )
}
