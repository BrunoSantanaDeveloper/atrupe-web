'use client'

// React
import { useState } from 'react'

// UI
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

// Icons
import { IconCircleCheck } from '@tabler/icons-react'

// Actions
import { deleteWithBody } from '@/actions/_cruds'

// Third-party
import { useQueryClient } from '@tanstack/react-query'

interface CancelSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscriptionId: string
}

type Step = 'reason' | 'confirm'

const cancelReasons = [
  'Preço muito alto',
  'Não utilizo o sistema',
  'Problemas técnicos',
  'Encontrei uma alternativa melhor',
  'Vou pausar temporariamente',
  'Outro motivo',
]

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  subscriptionId,
}: CancelSubscriptionDialogProps) {
  const [step, setStep] = useState<Step>('reason')
  const [selectedReason, setSelectedReason] = useState('')
  const [feedback, setFeedback] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [exportsConfirmed, setExportsConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const queryClient = useQueryClient()

  const handleClose = () => {
    setStep('reason')
    setSelectedReason('')
    setFeedback('')
    setConfirmText('')
    setExportsConfirmed(false)
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    if (confirmText !== 'CANCELAR') {
      toast.error('Digite CANCELAR para confirmar.')
      return
    }
    if (!exportsConfirmed) {
      toast.error('Confirme as exportações antes de cancelar.')
      return
    }

    setIsSubmitting(true)
    try {
      // Com mensalidade vencida o servidor recusa (contrato 1.1, 7.5 e 8.1),
      // e a mensagem dele diz o que fazer.
      const res = await deleteWithBody({
        route: `/subscriptions/${subscriptionId}/cancel`,
        data: {
          reason: selectedReason,
          feedback,
          exportsConfirmed,
        },
      })

      if (!res.success) {
        toast.error(res.message || 'Erro ao cancelar assinatura.')
        return
      }

      toast.success('Assinatura cancelada.')
      queryClient.invalidateQueries({ queryKey: ['subscription-active'] })
      handleClose()
    } catch {
      toast.error('Erro ao cancelar assinatura.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        {step === 'reason' ? (
          <>
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center gap-4">
                  <span>Cancelar assinatura</span>
                </div>
              </DialogTitle>
              <DialogDescription>
                Nos ajude a melhorar! Selecione o motivo do cancelamento.
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              <div className="space-y-2">
                {cancelReasons.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReason(reason)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors cursor-pointer ${
                      selectedReason === reason
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 mt-4">
                <Label htmlFor="cancel-feedback">
                  Feedback adicional (opcional)
                </Label>
                <Textarea
                  id="cancel-feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Conte-nos mais sobre sua experiência..."
                />
              </div>
            </DialogBody>

            <DialogFooter className="sm:justify-between">
              <div />
              <div className="space-x-4">
                <Button
                  type="button"
                  variant="neutralOutline"
                  onClick={handleClose}
                >
                  Voltar
                </Button>
                <Button
                  variant="error"
                  onClick={() => setStep('confirm')}
                  disabled={!selectedReason}
                >
                  Continuar
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center gap-4">
                  <span>Confirmar cancelamento</span>
                </div>
              </DialogTitle>
              <DialogDescription>
                Esta ação é irreversível. O acesso ao sistema é encerrado ao
                confirmar, sem restituição proporcional do ciclo em andamento.
                Depois do cancelamento, o ambiente não fica disponível para
                exportar dados.
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              <div className="rounded-lg bg-error-50 border border-error-200 p-3">
                <p className="text-sm text-error-700 font-medium">
                  Motivo selecionado: {selectedReason}
                </p>
                {feedback && (
                  <p className="text-sm text-error-600 mt-1">
                    &ldquo;{feedback}&rdquo;
                  </p>
                )}
              </div>

              {/* Contrato 1.1, 5.10 e 9.2: confirmar as exportações antes. */}
              <label className="mt-4 flex items-start gap-2.5 text-sm text-gray-700">
                <Checkbox
                  checked={exportsConfirmed}
                  onCheckedChange={(value) =>
                    setExportsConfirmed(value === true)
                  }
                  className="mt-0.5"
                />
                <span>
                  Fiz as exportações que considero necessárias e estou ciente de
                  que os dados deixam de estar disponíveis após o cancelamento.
                </span>
              </label>

              <div className="space-y-1.5 mt-4">
                <Label htmlFor="cancel-confirm">
                  Digite <strong>CANCELAR</strong> para confirmar
                </Label>
                <Input
                  id="cancel-confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="CANCELAR"
                  // eslint-disable-next-line no-restricted-syntax -- confirmação digitada em maiúsculas
                  className="uppercase"
                />
              </div>
            </DialogBody>

            <DialogFooter className="sm:justify-between">
              <div />
              <div className="space-x-4">
                <Button
                  type="button"
                  variant="neutralOutline"
                  onClick={() => setStep('reason')}
                >
                  Voltar
                </Button>
                <Button
                  variant="error"
                  onClick={handleSubmit}
                  disabled={confirmText !== 'CANCELAR' || !exportsConfirmed}
                  isLoading={isSubmitting}
                  RightIcon={IconCircleCheck}
                >
                  Cancelar assinatura
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
