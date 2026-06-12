'use client'

import { useState } from 'react'
import { useFiscalOnboardingStatus } from '@/hooks/useFiscalOnboardingStatus'
import { FiscalOnboardingModal } from '@/components/fiscal/FiscalOnboardingModal'
import {
  IconAlertTriangle,
  IconSettings,
  IconArrowRight,
} from '@tabler/icons-react'

export function FiscalModulePendingBanner() {
  const { isPending, needsSetup, isLoading, pendingMessage } =
    useFiscalOnboardingStatus()
  const [modalOpen, setModalOpen] = useState(false)

  if (isLoading) return null

  if (needsSetup) {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="w-full rounded-lg border border-brand-200 bg-brand-50 p-4 flex items-center gap-3 hover:bg-brand-100 transition-colors group text-left"
        >
          <IconSettings className="h-5 w-5 text-brand-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-brand-800">
              Configure seus dados fiscais
            </p>
            <p className="text-xs text-brand-600">
              Preencha os dados da empresa para começar a emitir notas fiscais.
            </p>
          </div>
          <IconArrowRight className="h-4 w-4 text-brand-400 group-hover:text-brand-600 transition-colors" />
        </button>

        <FiscalOnboardingModal open={modalOpen} onOpenChange={setModalOpen} />
      </>
    )
  }

  if (isPending) {
    return (
      <div className="rounded-lg border border-warning-200 bg-warning-50 p-4 flex items-center gap-3">
        <IconAlertTriangle className="h-5 w-5 text-warning-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-warning-800">
            Módulo fiscal em configuração
          </p>
          <p className="text-xs text-warning-600">{pendingMessage}</p>
        </div>
      </div>
    )
  }

  return null
}
