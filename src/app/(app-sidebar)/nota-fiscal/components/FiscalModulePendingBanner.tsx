'use client'

import { useState } from 'react'
import { useFiscalOnboardingStatus } from '@/hooks/useFiscalOnboardingStatus'
import { FiscalOnboardingModal } from '@/components/fiscal/FiscalOnboardingModal'
import {
  IconAlertTriangle,
  IconSettings,
  IconArrowRight,
} from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

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
          <Icon
            icon={IconSettings}
            size="md"
            className="text-brand-600 flex-shrink-0"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-brand-800">
              Configure seus dados fiscais
            </p>
            <p className="text-xs text-brand-600">
              Preencha os dados da empresa para começar a emitir notas fiscais.
            </p>
          </div>
          <Icon
            icon={IconArrowRight}
            size="sm"
            className="text-brand-400 group-hover:text-brand-600 transition-colors"
          />
        </button>

        <FiscalOnboardingModal open={modalOpen} onOpenChange={setModalOpen} />
      </>
    )
  }

  if (isPending) {
    return (
      <div className="rounded-lg border border-warning-200 bg-warning-50 p-4 flex items-center gap-3">
        <Icon
          icon={IconAlertTriangle}
          size="md"
          className="text-warning-600 flex-shrink-0"
        />
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
