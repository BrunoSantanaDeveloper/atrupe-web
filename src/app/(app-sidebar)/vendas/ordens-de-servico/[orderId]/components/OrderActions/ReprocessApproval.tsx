'use client'

// Completa uma aprovação que ficou pela metade: a rota só cria o que falta
// (agenda, financeiro, etapas, retrato da composição e a conta do
// terceirizado) e devolve o que completou (PO, 14/10/2026, questão 18)

// React
import { useState } from 'react'

// Components
import { toast } from 'sonner'
import { CustomButton } from '@/components/common/CustomButton'

// Icons
import { IconRefresh } from '@tabler/icons-react'

// Hooks
import { useQueryClient } from '@tanstack/react-query'
import { usePlanErrorToast } from '@/hooks/usePlanErrorToast'

// Actions
import { createItemNew } from '@/actions/_cruds'

const STEPS: Record<string, string> = {
  order: 'ordem de serviço',
  deliverySchedule: 'agenda de entrega',
  receivables: 'contas a receber',
  payables: 'contas a pagar',
  productionStages: 'etapas de produção',
  snapshots: 'retrato da composição',
  outsourcedPayables: 'conta do terceirizado',
}

interface ReprocessResult {
  orderId: string
  created: string[]
  failed: { step: string; message: string }[]
}

export function ReprocessApproval({ quotationId }: { quotationId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()
  const { notifyActionError } = usePlanErrorToast()

  const reprocess = async () => {
    setIsLoading(true)
    const result = await createItemNew({
      route: `/sale/quotation/${quotationId}/approve/reprocess`,
    })
    setIsLoading(false)

    if (!result.success) {
      notifyActionError(result)
      return
    }

    const { created = [], failed = [] } = (result.data ?? {}) as ReprocessResult
    queryClient.invalidateQueries()

    if (failed.length) {
      toast.error(
        `Não foi possível completar: ${failed
          .map((failure) => failure.message)
          .join('; ')}`,
      )
    } else if (created.length) {
      toast.success(
        `Completado: ${created.map((step) => STEPS[step] ?? step).join(', ')}.`,
      )
    } else {
      toast.success('A aprovação já estava completa: nada faltava.')
    }
  }

  return (
    <CustomButton
      icon={IconRefresh}
      title="Reprocessar aprovação"
      onClick={reprocess}
      isLoading={isLoading}
    />
  )
}
