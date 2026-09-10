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
  IconMail,
} from '@tabler/icons-react'

// Dialogs
import { CorrectionLetterDialog } from './CorrectionLetterDialog'
import { CancelNfeDialog } from '@/app/(app-sidebar)/configuracoes/nota-fiscal/gestao/components/CancelNfeDialog'

// Actions
import { createItemNew, getItem } from '@/actions/_cruds'

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
    dataAutorizacao?: string | null
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
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isOpeningDanfe, setIsOpeningDanfe] = useState(false)

  // Os dois prazos correm da autorização de uso, não da emissão.
  const baseDoPrazo = nfe.dataAutorizacao || nfe.dataEmissao
  const horasDesdeAutorizacao = baseDoPrazo
    ? (Date.now() - new Date(baseDoPrazo).getTime()) / (1000 * 60 * 60)
    : 0

  /**
   * O cancelamento NÃO é bloqueado aqui. As 24 horas são o prazo regular
   * nacional, mas quem valida é a SEFAZ da UF do emitente, e vários estados
   * recebem o evento depois disso, com penalidade: São Paulo até 480 horas.
   * Desabilitar o item impediria o usuário de sequer tentar, que é o problema
   * relatado pelo cliente. O backend barra só o que nenhuma UF aceita e
   * devolve a mensagem da SEFAZ.
   */
  const foraDoPrazoRegular = horasDesdeAutorizacao > 24

  // CC-e tem prazo de 720h (30 dias) contadas da autorizacao.
  const cceDisabled = horasDesdeAutorizacao > 720

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

  const handleVerDanfe = async () => {
    const previewWindow = window.open('', '_blank')
    if (!previewWindow) {
      toast.error('Permita a abertura de pop-ups para visualizar a DANFE')
      return
    }

    setIsOpeningDanfe(true)
    try {
      const result = await getItem({
        route: `/fiscal/nfe/${nfe.id}/danfe`,
      })
      if (!result.success) {
        throw new Error(result.message || 'DANFE nao disponivel')
      }

      if (result.data?.pdfBase64) {
        const binary = window.atob(result.data.pdfBase64)
        const bytes = new Uint8Array(binary.length)
        for (let index = 0; index < binary.length; index += 1) {
          bytes[index] = binary.charCodeAt(index)
        }
        const url = window.URL.createObjectURL(
          new Blob([bytes], { type: 'application/pdf' }),
        )
        previewWindow.location.href = url
        window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000)
        return
      }

      const fallbackUrl = result.data?.url || nfe.danfeUrl
      if (!fallbackUrl) throw new Error('DANFE nao disponivel')
      previewWindow.location.href = fallbackUrl
    } catch (error) {
      previewWindow.close()
      toast.error(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel abrir a DANFE',
      )
    } finally {
      setIsOpeningDanfe(false)
    }
  }

  const handleSendEmail = async () => {
    setIsSendingEmail(true)
    try {
      const result = await createItemNew({
        route: `/fiscal/nfe/${nfe.id}/send-email`,
      })

      if (!result.success) {
        const endpointUnavailable =
          result.status === 404 || result.message?.includes('Cannot POST')

        toast.error(
          endpointUnavailable
            ? 'Envio por e-mail indisponivel neste backend. Atualize/reinicie a API e tente novamente.'
            : result.message || 'Erro ao enviar DANFE/XML por e-mail',
        )
        return
      }

      toast.success('DANFE/XML enviados por e-mail')
      onRefetch()
    } catch {
      toast.error('Erro ao enviar DANFE/XML por e-mail')
    } finally {
      setIsSendingEmail(false)
    }
  }

  const showCce =
    nfe.status === 'AUTHORIZED' || nfe.status === 'CORRECTION_SENT'
  const isAuthorized =
    nfe.status === 'AUTHORIZED' || nfe.status === 'CORRECTION_SENT'
  // A DANFE e o XML de uma nota cancelada continuam existindo e precisam ficar
  // acessiveis: o documento e o evento de cancelamento sao guardados pelo mesmo
  // prazo. Sem isso o menu de uma nota cancelada fica vazio.
  const hasFiscalDocument = isAuthorized || nfe.status === 'CANCELLED'

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

          {hasFiscalDocument && (
            <DropdownMenuItem
              disabled={isOpeningDanfe}
              onClick={(event) => {
                event.preventDefault()
                handleVerDanfe()
              }}
            >
              {isOpeningDanfe ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconFileCheck className="mr-2 h-4 w-4" />
              )}
              <span>Ver DANFE</span>
            </DropdownMenuItem>
          )}

          {nfe.xmlAutorizado && (
            <DropdownMenuItem onClick={handleDownloadXml}>
              <IconDownload className="mr-2 h-4 w-4" />
              <span>Baixar XML</span>
            </DropdownMenuItem>
          )}

          {(showCce || hasFiscalDocument) && <DropdownMenuSeparator />}

          {isAuthorized && (
            <DropdownMenuItem
              disabled={isSendingEmail}
              onClick={(e) => {
                e.preventDefault()
                handleSendEmail()
              }}
            >
              {isSendingEmail ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconMail className="mr-2 h-4 w-4" />
              )}
              <span>Enviar DANFE/XML por e-mail</span>
            </DropdownMenuItem>
          )}

          {showCce && (
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="w-full">
                    <DropdownMenuItem
                      disabled={cceDisabled}
                      onClick={() => !cceDisabled && setIsCcEDialogOpen(true)}
                      className={
                        cceDisabled ? 'opacity-50 cursor-not-allowed' : ''
                      }
                    >
                      <IconEdit className="mr-2 h-4 w-4" />
                      <span>Carta de Correção</span>
                    </DropdownMenuItem>
                  </div>
                </TooltipTrigger>
                {cceDisabled && (
                  <TooltipContent>
                    <p>O prazo para carta de correção (30 dias) expirou.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
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
            nfe.status === 'REJECTED' ||
            nfe.status === 'CANCELLED') && (
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
                        onClick={() => setIsCancelDialogOpen(true)}
                        className="text-error-600 focus:bg-error-50 focus:text-error-600"
                      >
                        <IconBan className="mr-2 h-4 w-4" />
                        <span>Cancelar NF-e</span>
                      </DropdownMenuItem>
                    </div>
                  </TooltipTrigger>
                  {foraDoPrazoRegular && (
                    <TooltipContent>
                      <p className="max-w-64">
                        Fora do prazo regular de 24 horas. Vários estados ainda
                        aceitam o cancelamento, com penalidade. A SEFAZ dá a
                        palavra final.
                      </p>
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
        authorizedAt={baseDoPrazo}
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
