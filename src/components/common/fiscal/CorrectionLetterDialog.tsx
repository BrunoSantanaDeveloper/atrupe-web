'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

// UI
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Icons
import { IconDownload } from '@tabler/icons-react'

// Actions
import { createItemNew, getData } from '@/actions/_cruds'

interface CorrectionEvent {
  id: string
  sequenciaEvento: number
  createdAt: string
  correcao: string
  protocolo?: string
  xmlEvento?: string
}

interface CorrectionLetterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nfeId: string | null
  onSuccess: () => void
}

export function CorrectionLetterDialog({
  open,
  onOpenChange,
  nfeId,
  onSuccess,
}: CorrectionLetterDialogProps) {
  const [correctionText, setCorrectionText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [history, setHistory] = useState<CorrectionEvent[]>([])
  const [nextSequence, setNextSequence] = useState<number>(1)

  const fetchHistory = useCallback(async () => {
    if (!nfeId) return
    try {
      const result = await getData({
        route: `/fiscal/nfe/${nfeId}/corrections`,
      })
      if (result.success && Array.isArray(result.data)) {
        setHistory(result.data)
        const maxSeq = result.data.reduce(
          (max: number, event: CorrectionEvent) =>
            Math.max(max, event.sequenciaEvento || 0),
          0,
        )
        setNextSequence(maxSeq + 1)
      } else {
        setHistory([])
        setNextSequence(1)
      }
    } catch {
      setHistory([])
      setNextSequence(1)
    }
  }, [nfeId])

  useEffect(() => {
    if (open && nfeId) {
      fetchHistory()
    } else {
      setHistory([])
      setNextSequence(1)
    }
  }, [open, nfeId, fetchHistory])

  const handleSend = async () => {
    if (!nfeId) return
    if (correctionText.length < 15) {
      toast.error('A correção deve ter no mínimo 15 caracteres.')
      return
    }
    if (correctionText.length > 1000) {
      toast.error('A correção deve ter no máximo 1000 caracteres.')
      return
    }

    setIsSending(true)
    setErrorMsg('')
    try {
      const result = await createItemNew({
        route: `/fiscal/nfe/${nfeId}/correction-letter`,
        data: {
          correcao: correctionText,
          sequenciaEvento: nextSequence,
        },
      })
      if (!result.success) {
        throw new Error(result.message || 'Erro ao enviar carta de correção')
      }
      toast.success('Carta de correção enviada com sucesso!')
      onOpenChange(false)
      setCorrectionText('')
      setErrorMsg('')
      onSuccess()
    } catch (err) {
      let message =
        err instanceof Error ? err.message : 'Erro ao enviar carta de correção.'

      // Tentativa de limpar problemas de encoding do backend
      message = message
        .replace(/correÃ§Ã£o/g, 'correção')
        .replace(/NÃ£o/g, 'Não')
        .replace(/possÃvel/g, 'possível')
        .replace(/operaÃ§Ã£o/g, 'operação')

      setErrorMsg(message)
      toast.error(message)
    } finally {
      setIsSending(false)
    }
  }

  const handleDownloadXml = async (eventId: string, sequence: number) => {
    try {
      const result = await getData({
        route: `/fiscal/nfe/${nfeId}/corrections/${eventId}/xml`,
      })
      if (result.success && result.data?.xml) {
        const xmlContent = result.data.xml
        const blob = new Blob([xmlContent], { type: 'application/xml' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `CCe_NFe_${nfeId}_seq_${sequence}.xml`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success('XML baixado com sucesso!')
      } else {
        toast.error(result.message || 'Erro ao obter XML da carta de correção.')
      }
    } catch {
      toast.error('Erro ao baixar o XML da carta de correção.')
    }
  }

  const handleClose = (value: boolean) => {
    if (!value) {
      setCorrectionText('')
      setErrorMsg('')
    }
    onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Carta de Correção (CC-e)</DialogTitle>
          <DialogDescription>
            Informe o texto da correção. A carta de correção não corrige valor,
            dados cadastrais ou alíquota. Mínimo 15 caracteres.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="sequence">Sequência do Evento</Label>
            <Input
              id="sequence"
              type="number"
              value={nextSequence}
              disabled
              className="bg-gray-50 text-gray-500"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="correctionText">Texto da Correção *</Label>
            <Textarea
              id="correctionText"
              value={correctionText}
              onChange={(e) => setCorrectionText(e.target.value)}
              placeholder="Descreva a correção a ser feita na nota fiscal..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 text-right">
              {correctionText.length}/1000 caracteres
              {correctionText.length > 0 && correctionText.length < 15 && (
                <span className="text-warning-500 ml-2">
                  Mínimo 15 caracteres
                </span>
              )}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
              {errorMsg}
            </div>
          )}

          {history.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <Label>Histórico de Cartas de Correção</Label>
              <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1">
                {history.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 bg-gray-50 rounded-md border border-gray-100 flex flex-col gap-1.5"
                  >
                    <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                      <span>Sequência #{event.sequenciaEvento}</span>
                      <span>
                        {new Date(event.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-mono whitespace-pre-wrap leading-relaxed">
                      {event.correcao}
                    </p>
                    <div className="flex justify-between items-center mt-1 pt-1.5 border-t border-gray-200">
                      {event.protocolo ? (
                        <span className="text-xs text-success-700 bg-success-50 px-2 py-0.5 rounded font-mono">
                          Prot: {event.protocolo}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 font-mono">
                          Sem protocolo
                        </span>
                      )}
                      {event.xmlEvento ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs font-semibold text-blue-600 hover:text-blue-700 gap-1 flex items-center"
                          onClick={() =>
                            handleDownloadXml(event.id, event.sequenciaEvento)
                          }
                        >
                          <IconDownload size={14} />
                          XML do Evento
                        </Button>
                      ) : (
                        <span
                          className="text-xs text-gray-400 cursor-not-allowed flex items-center gap-1"
                          title="XML não disponível para este evento antigo"
                        >
                          <IconDownload size={14} className="opacity-50" />
                          XML Indisponível
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isSending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || correctionText.length < 15}
          >
            {isSending ? 'Enviando...' : 'Enviar Carta de Correção'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
