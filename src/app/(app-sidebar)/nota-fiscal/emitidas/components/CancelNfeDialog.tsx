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

interface CancelNfeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nfeId: string | null
  onSuccess: () => void
}

export function CancelNfeDialog({
  open,
  onOpenChange,
  nfeId,
  onSuccess,
}: CancelNfeDialogProps) {
  const [justificativa, setJustificativa] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  const handleCancel = async () => {
    if (!nfeId) return
    if (justificativa.length < 15) {
      toast.error('A justificativa deve ter no mínimo 15 caracteres.')
      return
    }

    setIsCancelling(true)
    try {
      const result = await createItemNew({
        route: `/fiscal/nfe/${nfeId}/cancel`,
        data: { justificativa },
      })
      if (!result.success) {
        throw new Error(result.message || 'Erro ao cancelar NF-e')
      }
      toast.success('NF-e cancelada com sucesso!')
      onOpenChange(false)
      setJustificativa('')
      onSuccess()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cancelar'
      toast.error(message)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleClose = (value: boolean) => {
    if (!value) setJustificativa('')
    onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-error-600">Cancelar NF-e</DialogTitle>
          <DialogDescription>
            Esta ação é irreversível. A nota será cancelada junto à SEFAZ.
            Informe a justificativa (mínimo 15 caracteres).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <Label htmlFor="cancelJustificativa">Justificativa *</Label>
          <Textarea
            id="cancelJustificativa"
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            placeholder="Informe o motivo do cancelamento..."
            rows={4}
            maxLength={255}
          />
          <p className="text-xs text-gray-500 text-right">
            {justificativa.length}/255 caracteres
            {justificativa.length > 0 && justificativa.length < 15 && (
              <span className="text-warning-500 ml-2">Mínimo 15 caracteres</span>
            )}
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isCancelling}
          >
            Voltar
          </Button>
          <Button
            variant="error"
            onClick={handleCancel}
            disabled={isCancelling || justificativa.length < 15}
          >
            {isCancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
