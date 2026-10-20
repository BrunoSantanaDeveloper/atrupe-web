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
  /** Estado atual da contingência do emissor */
  ativa: boolean
  motivoAtual?: string | null
  dataHoraAtual?: string | null
  onSuccess?: () => void
}

/**
 * Liga/desliga o modo de contingência da NFC-e.
 *
 * Contingência faz a NFC-e ser emitida offline e transmitida depois. Ligar por
 * engano gera documentos que ficam pendentes de sincronização com a SEFAZ, por
 * isso a ação exige justificativa e confirmação explícita.
 *
 * Até aqui só existia o endpoint (POST /fiscal/nfce/contingencia), sem
 * nenhuma tela — só dava para acionar por chamada direta à API.
 */
export function ContingenciaNfceDialog({
  open,
  onOpenChange,
  ativa,
  motivoAtual,
  dataHoraAtual,
  onSuccess,
}: Props) {
  const [motivo, setMotivo] = useState('')
  const [confirmado, setConfirmado] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const desativando = ativa

  useEffect(() => {
    if (open) {
      setMotivo(desativando ? '' : (motivoAtual ?? ''))
      setConfirmado(false)
    }
  }, [open, desativando, motivoAtual])

  const motivoValido = desativando || motivo.trim().length >= 15
  const podeEnviar = motivoValido && confirmado && !isSubmitting

  const handleSubmit = async () => {
    if (!podeEnviar) return
    setIsSubmitting(true)
    try {
      const result = await createItemNew({
        route: '/fiscal/nfce/contingencia',
        data: {
          ativar: !ativa,
          motivo: desativando ? 'Retorno à emissão normal' : motivo.trim(),
        },
      })

      if (!result.success) {
        toast.error(result.message || 'Erro ao alterar contingência')
        return
      }

      toast.success(
        desativando
          ? 'Contingência desativada. Emissão volta ao modo normal.'
          : 'Contingência ativada. As próximas NFC-e serão emitidas offline.',
      )
      onSuccess?.()
      onOpenChange(false)
    } catch {
      toast.error('Erro ao alterar contingência')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {desativando ? 'Desativar contingência' : 'Ativar contingência'}
          </DialogTitle>
          <DialogDescription>
            {desativando
              ? 'A emissão de NFC-e volta ao modo normal, com transmissão imediata à SEFAZ.'
              : 'As NFC-e passam a ser emitidas offline e transmitidas quando a SEFAZ voltar.'}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {desativando && dataHoraAtual && (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
              <p>
                Contingência ativa desde{' '}
                <span className="font-medium">
                  {new Date(dataHoraAtual).toLocaleString('pt-BR')}
                </span>
              </p>
              {motivoAtual && <p className="mt-1">Motivo: {motivoAtual}</p>}
            </div>
          )}

          {!desativando && (
            <>
              <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
                <Icon
                  icon={IconAlertTriangle}
                  size="sm"
                  className="text-amber-600 shrink-0 mt-0.5"
                />
                <div className="text-xs text-amber-900 space-y-1">
                  <p className="font-medium">
                    Use apenas quando a SEFAZ estiver indisponível.
                  </p>
                  <p>
                    Documentos emitidos em contingência ficam pendentes de
                    sincronização e precisam ser transmitidos assim que o
                    serviço voltar.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="motivo-contingencia">
                  Motivo da contingência *
                </Label>
                <Input
                  id="motivo-contingencia"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ex: SEFAZ-SP fora do ar desde 14h30"
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo de 15 caracteres. Fica registrado na auditoria do
                  emissor.
                </p>
              </div>
            </>
          )}

          <label className="flex items-start gap-2 cursor-pointer">
            <Checkbox
              checked={confirmado}
              onCheckedChange={(v) => setConfirmado(v === true)}
              className="mt-0.5"
            />
            <span className="text-xs text-gray-700">
              {desativando
                ? 'Confirmo que a SEFAZ voltou a responder e a emissão pode retornar ao modo normal.'
                : 'Confirmo que a SEFAZ está indisponível e que entendo o impacto na emissão.'}
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
            variant={desativando ? 'default' : 'destructive'}
          >
            {desativando ? 'Desativar' : 'Ativar contingência'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
