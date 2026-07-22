'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// Icons
import { Repeat, Check, Loader2 } from 'lucide-react'

// Components
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
} from '@/components/ui/dialog'

// Utils
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import { changeSubscriptionPlan } from '@/actions/subscription'

export interface PlanOption {
  id: string
  name: string
  basePrice?: number
  isActive: boolean
}

interface Props {
  plans: PlanOption[]
  currentPlanName?: string | null
}

export function ChangePlanButton({ plans, currentPlanName }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [changedTo, setChangedTo] = useState<string | null>(null)

  const isCurrent = (plan: PlanOption) =>
    !!currentPlanName &&
    plan.name.toUpperCase() === currentPlanName.toUpperCase()

  // Só planos liberados para contratação e diferentes do atual
  const options = plans.filter((plan) => plan.isActive && !isCurrent(plan))

  // Sem alternativa de plano, não faz sentido oferecer a troca
  if (options.length === 0) return null

  const handleClose = (nextOpen: boolean) => {
    if (isSaving) return
    setOpen(nextOpen)

    if (!nextOpen) {
      setSelectedId(null)
      // Ao fechar após a troca, atualiza a tela para refletir o novo plano
      if (changedTo) {
        setChangedTo(null)
        router.refresh()
      }
    }
  }

  const handleConfirm = async () => {
    if (!selectedId) return

    const selected = options.find((plan) => plan.id === selectedId)
    setIsSaving(true)

    try {
      const res = await changeSubscriptionPlan(selectedId)

      if (res.success) {
        setChangedTo(selected?.name || null)
      } else {
        toast.error(res.message || 'Não foi possível alterar o plano.')
      }
    } catch {
      toast.error('Erro ao conectar ao servidor. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Button
        variant="neutralOutline"
        className="w-full"
        LeftIcon={Repeat}
        onClick={() => setOpen(true)}
      >
        Mudar de plano
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[460px] bg-white p-6 rounded-xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg font-semibold text-gray-800">
              {changedTo ? 'Plano alterado' : 'Mudar de plano'}
            </DialogTitle>
          </DialogHeader>

          {changedTo ? (
            <DialogBody className="space-y-3 text-sm text-gray-600">
              <p>
                Seu plano foi alterado para{' '}
                <strong className="text-gray-900">{changedTo}</strong>.
              </p>
              <p>
                Geramos uma nova cobrança no valor do plano escolhido, vencendo
                hoje. Conclua o pagamento em{' '}
                <strong>Regularizar Pagamento</strong> para reativar o acesso —
                o período em que a conta ficou bloqueada não foi cobrado.
              </p>
            </DialogBody>
          ) : (
            <DialogBody className="space-y-3">
              <p className="text-sm text-gray-600">
                Escolha o plano que deseja utilizar. Ao confirmar, sua cobrança
                em aberto é substituída por uma única cobrança no valor do plano
                escolhido, vencendo hoje — você não paga pelo período em que
                ficou sem acesso.
              </p>

              <div className="space-y-2">
                {options.map((plan) => {
                  const selected = selectedId === plan.id

                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedId(plan.id)}
                      className={cn(
                        'w-full flex items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors',
                        selected
                          ? 'border-brand-400 bg-brand-50/50'
                          : 'border-gray-200 hover:bg-gray-50',
                      )}
                    >
                      <span className="font-medium text-gray-800">
                        {plan.name}
                      </span>
                      <span className="flex items-center gap-2">
                        {typeof plan.basePrice === 'number' && (
                          <span className="text-sm text-gray-600">
                            {formatCurrencyToBrl(plan.basePrice)}
                            <span className="text-gray-400"> /mês</span>
                          </span>
                        )}
                        {selected && (
                          <Check className="h-4 w-4 text-brand-500" />
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            </DialogBody>
          )}

          <DialogFooter className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
            {changedTo ? (
              <Button type="button" onClick={() => handleClose(false)}>
                Entendi
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="neutralOutline"
                  onClick={() => handleClose(false)}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!selectedId || isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Alterando...
                    </span>
                  ) : (
                    'Confirmar troca'
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
