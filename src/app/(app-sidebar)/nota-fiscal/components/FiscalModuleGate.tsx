'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { useFiscalOnboardingStatus } from '@/hooks/useFiscalOnboardingStatus'
import { FiscalOnboardingModal } from '@/components/fiscal/FiscalOnboardingModal'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import {
  IconLock,
  IconFileInvoice,
  IconSettings,
  IconLoader2,
} from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

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
        <IconLoader2
          aria-hidden
          className="h-8 w-8 animate-spin text-gray mb-4"
        />
        <p className="text-sm text-gray">Verificando acesso ao módulo...</p>
      </div>
    )
  }

  // User doesn't have the nota_fiscal feature at all
  if (!hasFeature('nota_fiscal')) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <FeaturedIcon variant="neutralOutline" Icon={IconLock} />
        <h2 className="type-section-title mt-6 mb-2 text-center">
          Módulo Nota Fiscal não contratado
        </h2>
        <p className="text-sm text-gray text-center max-w-md mb-6">
          Para emitir e gerenciar notas fiscais, é necessário contratar o módulo
          Nota Fiscal na sua assinatura.
        </p>
        <Button
          onClick={() =>
            router.push('/configuracoes/empresa-e-sistema/assinatura')
          }
        >
          Ver planos e módulos
        </Button>
      </div>
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
            <IconFileInvoice aria-hidden size={ICON_SIZE.md} className="mr-2" />
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
          Voltar ao Dashboard
        </Button>
      </div>
    )
  }

  // Module is active - render children
  return <>{children}</>
}
