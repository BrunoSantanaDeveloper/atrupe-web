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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Actions
import { createItemNew } from '@/actions/_cruds'

interface InutilizarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InutilizarDialog({
  open,
  onOpenChange,
}: InutilizarDialogProps) {
  const [numInicial, setNumInicial] = useState('')
  const [numFinal, setNumFinal] = useState('')
  const [justificativa, setJustificativa] = useState('')
  const [isInutilizando, setIsInutilizando] = useState(false)

  const handleInutilizar = async () => {
    const ini = parseInt(numInicial)
    const fin = parseInt(numFinal)

    if (!ini || !fin) {
      toast.error('Informe os números inicial e final.')
      return
    }
    if (ini > fin) {
      toast.error('Número inicial deve ser menor ou igual ao final.')
      return
    }
    if (justificativa.length < 15) {
      toast.error('A justificativa deve ter no mínimo 15 caracteres.')
      return
    }

    setIsInutilizando(true)
    try {
      const result = await createItemNew({
        route: '/fiscal/nfe/inutilizar',
        data: {
          numeroInicial: ini,
          numeroFinal: fin,
          justificativa,
        },
      })
      if (!result.success) {
        throw new Error(result.message || 'Erro ao inutilizar')
      }
      toast.success(`Numeração ${ini} a ${fin} inutilizada com sucesso!`)
      onOpenChange(false)
      resetForm()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao inutilizar'
      toast.error(message)
    } finally {
      setIsInutilizando(false)
    }
  }

  const resetForm = () => {
    setNumInicial('')
    setNumFinal('')
    setJustificativa('')
  }

  const handleClose = (value: boolean) => {
    if (!value) resetForm()
    onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Inutilizar Numeração NF-e</DialogTitle>
          <DialogDescription>
            Inutilize uma faixa de numeração que não será utilizada. A numeração
            inutilizada não poderá ser usada para emissão.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inutNumInicial">Número Inicial *</Label>
              <Input
                id="inutNumInicial"
                type="number"
                min={1}
                value={numInicial}
                onChange={(e) => setNumInicial(e.target.value)}
                placeholder="Ex: 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inutNumFinal">Número Final *</Label>
              <Input
                id="inutNumFinal"
                type="number"
                min={1}
                value={numFinal}
                onChange={(e) => setNumFinal(e.target.value)}
                placeholder="Ex: 5"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="inutJustificativa">Justificativa *</Label>
            <Textarea
              id="inutJustificativa"
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Informe o motivo da inutilização..."
              rows={4}
              maxLength={255}
            />
            <p className="text-xs text-gray-500 text-right">
              {justificativa.length}/255 caracteres
              {justificativa.length > 0 && justificativa.length < 15 && (
                <span className="text-warning-500 ml-2">
                  Mínimo 15 caracteres
                </span>
              )}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isInutilizando}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleInutilizar}
            disabled={
              isInutilizando ||
              !numInicial ||
              !numFinal ||
              justificativa.length < 15
            }
          >
            {isInutilizando ? 'Inutilizando...' : 'Confirmar Inutilização'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
