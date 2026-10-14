'use client'

import { useState } from 'react'
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
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { toast } from 'sonner'
import { IconAlertTriangle } from '@tabler/icons-react'
import { deleteItemNew } from '@/actions/_cruds'
import { refreshPlanFeatures } from '@/actions/subscription'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { formatCurrencyToBrl } from '@/lib/utils'

interface RemoveModuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscriptionId: string
  moduleKey: string
  moduleName: string
  modulePrice: number
}

export function RemoveModuleDialog({
  open,
  onOpenChange,
  subscriptionId,
  moduleKey,
  moduleName,
  modulePrice,
}: RemoveModuleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  const { update: updateSession } = useSession()

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const res = await deleteItemNew({
        route: `/subscriptions/${subscriptionId}/modules/${moduleKey}`,
      })

      if (!res.success) {
        toast.error(res.message || 'Erro ao remover módulo.')
        return
      }

      // Refresh session to update features
      const refreshResult = await refreshPlanFeatures()
      if (refreshResult.success) {
        await updateSession({
          company: {
            plan: {
              name: refreshResult.planName,
              active: refreshResult.active,
              features: refreshResult.features,
              limits: refreshResult.limits,
            },
          },
        })
      }

      toast.success(`Módulo ${moduleName} removido.`)
      queryClient.invalidateQueries({ queryKey: ['subscription-active'] })
      handleClose()
    } catch {
      toast.error('Erro ao remover módulo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // NOTE: When a module is removed, the subscription value in Asaas is updated
  // immediately, and the reduced total takes effect on the next billing cycle.
  // No refund is generated for the current cycle.

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon
                variant="orangeBorderedLight"
                Icon={IconAlertTriangle}
                rounded
              />
              <span>Remover módulo</span>
            </div>
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja remover o módulo{' '}
            <strong>{moduleName}</strong> ({formatCurrencyToBrl(modulePrice)}
            /mês) da sua assinatura?
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="rounded-lg bg-warning-50 border border-warning-200 p-3">
            <p className="text-sm text-warning-700">
              O valor da sua assinatura será reduzido a partir da próxima
              fatura. As funcionalidades do módulo serão desativadas
              imediatamente.
            </p>
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
              Cancelar
            </Button>
            <Button
              variant="error"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              Remover módulo
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
