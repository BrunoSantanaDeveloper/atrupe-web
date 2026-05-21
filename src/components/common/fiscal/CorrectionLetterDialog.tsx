'use client'

import { useState } from 'react'
import { toast } from 'sonner'

// UI
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

// Actions
import { createItemNew } from '@/actions/_cruds'

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
        data: { correcao: correctionText },
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

  const handleClose = (value: boolean) => {
    if (!value) setCorrectionText('')
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
        <DialogContent>
          <div className="space-y-3 py-4">
            <Label htmlFor="correctionText">Texto da Correção *</Label>
            <Textarea
              id="correctionText"
              value={correctionText}
              onChange={(e) => setCorrectionText(e.target.value)}
              placeholder="Descreva a correção a ser feita na nota fiscal..."
              rows={5}
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
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                {errorMsg}
              </div>
            )}
          </div>
        </DialogContent>

        <DialogFooter>
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
