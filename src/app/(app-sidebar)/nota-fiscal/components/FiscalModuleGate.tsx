'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { useFiscalOnboardingStatus } from '@/hooks/useFiscalOnboardingStatus'
import { FiscalOnboardingModal } from '@/components/fiscal/FiscalOnboardingModal'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { IconFileInvoice, IconSettings, IconLoader2 } from '@tabler/icons-react'

interface FiscalModuleGateProps {
  children: React.ReactNode
}

export function FiscalModuleGate({ children }: FiscalModuleGateProps) {
  const router = useRouter()
  const { hasFeature } = usePlanFeatures()
  const { needsSetup, isPending, isLoading, pendingMessage } =
    useFiscalOnboardingStatus()
  const [modalOpen, setModalOpen] = useState(false)

  // Still loading session/status
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <IconLoader2 className="h-8 w-8 animate-spin text-gray mb-4" />
        <p className="text-sm text-gray">Verificando acesso ao módulo...</p>
      </div>
    )
  }

  // Módulo não contratado: a parede de módulo leva à trilha de contratação
  // (/assinatura), que oferece os módulos — a página de gestão da
  // assinatura não contrata nada. Só o titular contrata.
  if (!hasFeature('nota_fiscal')) {
    return (
      <UpgradeFallback
        kind="module"
        feature="nota_fiscal"
        title="Módulo Nota Fiscal não contratado"
        description="Para emitir e gerenciar notas fiscais, contrate o módulo Nota Fiscal na sua assinatura."
        pageTitle
      />
    )
  }

  // Module contracted but needs setup
  if (needsSetup) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <FeaturedIcon variant="neutralOutline" Icon={IconSettings} />
          <h2 className="type-section-title mt-6 mb-2 text-center">
            Configure seu módulo fiscal
          </h2>
          <p className="text-sm text-gray text-center max-w-md mb-6">
            Preencha os dados fiscais da sua empresa para começar a emitir notas
            fiscais.
          </p>
          <Button onClick={() => setModalOpen(true)}>
            <IconFileInvoice className="h-4 w-4 mr-2" />
            Configurar agora
          </Button>
        </div>

        <FiscalOnboardingModal open={modalOpen} onOpenChange={setModalOpen} />
      </>
    )
  }

  // Module contracted but pending activation
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <FeaturedIcon variant="neutralOutline" Icon={IconLoader2} />
        <h2 className="type-section-title mt-6 mb-2 text-center">
          Módulo em ativação
        </h2>
        <p className="text-sm text-gray text-center max-w-md mb-6">
          {pendingMessage}
        </p>
        <Button variant="ghost" onClick={() => router.push('/dashboard')}>
          Voltar ao painel
        </Button>
      </div>
    )
  }

  // Module is active - render children
  return <>{children}</>
}
