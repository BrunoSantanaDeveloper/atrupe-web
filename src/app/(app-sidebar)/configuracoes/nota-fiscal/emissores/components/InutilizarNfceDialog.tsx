'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { IconAlertTriangle } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

import { createItemNew } from '@/actions/_cruds'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Série de NFC-e do ambiente em uso, apenas informativa */
  serie?: number
  onSuccess?: () => void
}

/**
 * Inutilização de faixa de numeração de NFC-e.
 *
 * Usada quando números foram "queimados" — por falha de transmissão, por
 * exemplo — e a SEFAZ precisa ser informada de que aquela faixa não será
 * usada. É IRREVERSÍVEL: os números inutilizados não voltam a ficar
 * disponíveis.
 *
 * Até aqui só existia o endpoint (POST /fiscal/nfce/inutilizar), sem tela.
 */
export function InutilizarNfceDialog({
  open,
  onOpenChange,
  serie,
  onSuccess,
}: Props) {
  const [numeroInicial, setNumeroInicial] = useState('')
  const [numeroFinal, setNumeroFinal] = useState('')
  const [justificativa, setJustificativa] = useState('')
  const [confirmado, setConfirmado] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setNumeroInicial('')
      setNumeroFinal('')
      setJustificativa('')
      setConfirmado(false)
    }
  }, [open])

  const inicial = Number(numeroInicial)
  const final = Number(numeroFinal)

  const faixaValida =
    Number.isInteger(inicial) &&
    Number.isInteger(final) &&
    inicial >= 1 &&
    final >= inicial
  const justificativaValida = justificativa.trim().length >= 15
  const podeEnviar =
    faixaValida && justificativaValida && confirmado && !isSubmitting

  const quantidade = faixaValida ? final - inicial + 1 : 0

  const handleSubmit = async () => {
    if (!podeEnviar) return
    setIsSubmitting(true)
    try {
      const result = await createItemNew({
        route: '/fiscal/nfce/inutilizar',
        data: {
          numeroInicial: inicial,
          numeroFinal: final,
          justificativa: justificativa.trim(),
        },
      })

      if (!result.success) {
        toast.error(result.message || 'Erro ao inutilizar numeração')
        return
      }

      toast.success(
        `Numeração ${inicial} a ${final} inutilizada junto à SEFAZ.`,
      )
      onSuccess?.()
      onOpenChange(false)
    } catch {
      toast.error('Erro ao inutilizar numeração')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Inutilizar faixa de numeração</DialogTitle>
          <DialogDescription>
            Informa à SEFAZ que uma faixa de números de NFC-e não será
            utilizada.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
            <Icon
              icon={IconAlertTriangle}
              size="sm"
              className="text-amber-600 shrink-0 mt-0.5"
            />
            <div className="text-xs text-amber-900 space-y-1">
              <p className="font-medium">Esta ação é irreversível.</p>
              <p>
                Os números inutilizados não voltam a ficar disponíveis. A
                inutilização é registrada na SEFAZ e vale para a série
                {serie ? ` ${serie}` : ''} do ambiente em uso.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="numero-inicial">Número inicial *</Label>
              <Input
                id="numero-inicial"
                type="number"
                min={1}
                value={numeroInicial}
                onChange={(e) => setNumeroInicial(e.target.value)}
                placeholder="Ex: 120"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="numero-final">Número final *</Label>
              <Input
                id="numero-final"
                type="number"
                min={1}
                value={numeroFinal}
                onChange={(e) => setNumeroFinal(e.target.value)}
                placeholder="Ex: 125"
              />
            </div>
          </div>

          {numeroInicial && numeroFinal && !faixaValida && (
            <p className="text-xs text-error-600">
              O número final deve ser maior ou igual ao inicial.
            </p>
          )}

          {faixaValida && (
            <p className="text-xs text-muted-foreground">
              {quantidade} número{quantidade > 1 ? 's' : ''} será
              {quantidade > 1 ? 'ão' : ''} inutilizado
              {quantidade > 1 ? 's' : ''}.
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="justificativa-inutilizacao">Justificativa *</Label>
            <Input
              id="justificativa-inutilizacao"
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Ex: Falha de transmissão na emissão dos numeros"
            />
            <p className="text-xs text-muted-foreground">
              Mínimo de 15 caracteres, exigido pela SEFAZ.
            </p>
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <Checkbox
              checked={confirmado}
              onCheckedChange={(v) => setConfirmado(v === true)}
              className="mt-0.5"
            />
            <span className="text-xs text-gray-700">
              Confirmo que a faixa informada está correta e entendo que a
              inutilização não pode ser desfeita.
            </span>
          </label>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!podeEnviar}
            isLoading={isSubmitting}
            variant="destructive"
          >
            Inutilizar faixa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
