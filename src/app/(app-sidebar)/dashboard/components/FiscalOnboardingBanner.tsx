'use client'

import { useState } from 'react'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { useFiscalOnboardingStatus } from '@/hooks/useFiscalOnboardingStatus'
import { FiscalOnboardingModal } from '@/components/fiscal/FiscalOnboardingModal'
import {
  IconFileSymlink,
  IconLoader2,
  IconArrowRight,
} from '@tabler/icons-react'

export function FiscalOnboardingBanner() {
  const { hasFeature } = usePlanFeatures()
  const { isPending, isActive, needsSetup, isLoading, pendingMessage } =
    useFiscalOnboardingStatus()
  const [modalOpen, setModalOpen] = useState(false)

  // Don't show if fiscal module is not contracted or still loading
  // Ao aparecer depois da carga, entra suave em vez de saltar
  if (isLoading || !hasFeature('nota_fiscal')) return null

  // Don't show if module is fully active
  if (isActive) return null

  if (isPending) {
    return (
      <div className="rounded-lg border border-warning-200 bg-warning-50 p-4 flex items-center gap-3 animate-in fade-in-0 duration-base">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-warning-100 flex items-center justify-center">
          <IconLoader2 className="h-5 w-5 text-warning-600 animate-spin" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-warning-800">
            Módulo Nota Fiscal em configuração
          </p>
          <p className="text-sm text-warning-600">{pendingMessage}</p>
        </div>
      </div>
    )
  }

  if (needsSetup) {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="w-full rounded-lg border border-brand-200 bg-brand-50 p-4 flex items-center gap-3 hover:bg-brand-100 transition-colors group text-left animate-in fade-in-0 duration-base"
        >
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
            <IconFileSymlink className="h-5 w-5 text-brand-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-brand-800">
              Configure seu módulo Nota Fiscal
            </p>
            <p className="text-sm text-brand-600">
              Preencha os dados fiscais da sua empresa para ativar a emissão de
              notas.
            </p>
          </div>
          <IconArrowRight className="h-5 w-5 text-brand-400 group-hover:text-brand-600 transition-colors" />
        </button>

        <FiscalOnboardingModal open={modalOpen} onOpenChange={setModalOpen} />
      </>
    )
  }

  return null
}
