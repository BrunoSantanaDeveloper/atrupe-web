'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { useFiscalOnboardingStatus } from '@/hooks/useFiscalOnboardingStatus'
import { getItem } from '@/actions/_cruds'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  IconCheck,
  IconBuilding,
  IconCertificate,
  IconWorld,
  IconHash,
  IconArrowsSplit,
  IconFileInvoice,
  IconChevronRight,
  IconRocket,
  IconLock,
} from '@tabler/icons-react'

const DISMISSAL_KEY = 'fiscal-setup-modal-dismissed'

interface InvoicyConfig {
  environment?: string
  nfeSeries?: string
  nfeNextNumber?: number
  defaultCfop?: string
  defaultOperationNature?: string
  [key: string]: unknown
}

interface SetupStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  complete: boolean
  optional?: boolean
}

export function FiscalSetupModal() {
  const router = useRouter()
  const { hasFeature } = usePlanFeatures()
  const { data: onboardingData, isLoading: isLoadingOnboarding } =
    useFiscalOnboardingStatus()
  const [config, setConfig] = useState<InvoicyConfig | null>(null)
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(true) // Start true to prevent flash

  const hasOnboarding = !!onboardingData
  const isOnboardingActive = onboardingData?.status === 'ACTIVE'
  const isOnboardingPending = [
    'PENDING',
    'PROVISIONING',
    'PENDING_REVIEW',
  ].includes(onboardingData?.status || '')
  const isOnboardingNotStarted =
    !onboardingData || onboardingData?.status === 'NOT_STARTED'
  const shouldShowModal =
    hasFeature('nota_fiscal') && (isOnboardingNotStarted || isOnboardingActive)

  // Check localStorage on mount
  useEffect(() => {
    try {
      const wasDismissed = localStorage.getItem(DISMISSAL_KEY) === 'true'
      setDismissed(wasDismissed)
    } catch {
      // localStorage not available
    }
  }, [])

  // Fetch Invoicy config when onboarding is active
  useEffect(() => {
    if (!hasFeature('nota_fiscal') || !isOnboardingActive) {
      setIsLoadingConfig(false)
      return
    }
    // Only fetch config when onboarding is active

    let cancelled = false

    async function fetchConfig() {
      try {
        const result = await getItem({ route: '/fiscal/invoicy/config' })
        if (!cancelled && result.success) {
          setConfig(result.data as InvoicyConfig)
        }
      } catch {
        // Config might not exist yet
      } finally {
        if (!cancelled) setIsLoadingConfig(false)
      }
    }

    fetchConfig()
    return () => {
      cancelled = true
    }
  }, [hasFeature, isOnboardingActive])

  // Build steps with completion status
  const steps: SetupStep[] = [
    {
      id: 'emissor',
      title: 'Dados do Emissor',
      description: 'Configure os dados do emitente para suas notas fiscais',
      icon: IconBuilding,
      href: '/configuracoes/nota-fiscal/emissores',
      complete: isOnboardingActive,
    },
    {
      id: 'certificado',
      title: 'Certificado Digital',
      description: 'Envie seu certificado digital para emissão de notas',
      icon: IconCertificate,
      href: '/configuracoes/nota-fiscal/invoicy',
      complete: false, // Cannot verify from frontend
      optional: true,
    },
    {
      id: 'ambiente',
      title: 'Ambiente de Emissão',
      description: 'Escolha entre Homologação (testes) ou Produção',
      icon: IconWorld,
      href: '/configuracoes/nota-fiscal/invoicy',
      complete: !!config?.environment,
    },
    {
      id: 'series',
      title: 'Séries e Numeração',
      description: 'Configure as séries e próximo número de NF-e',
      icon: IconHash,
      href: '/configuracoes/nota-fiscal/invoicy',
      complete: !!config?.nfeSeries && !!config?.nfeNextNumber,
    },
    {
      id: 'cfop',
      title: 'CFOP e Natureza de Operação',
      description: 'Configure o CFOP padrão e a natureza da operação',
      icon: IconArrowsSplit,
      href: '/configuracoes/nota-fiscal/cfop',
      complete: !!config?.defaultCfop && !!config?.defaultOperationNature,
    },
  ]

  const requiredSteps = steps.filter((s) => !s.optional)
  const allRequiredComplete = requiredSteps.every((s) => s.complete)
  const completedCount = steps.filter((s) => s.complete).length

  // Auto-open when conditions are met
  useEffect(() => {
    if (isLoadingOnboarding || isLoadingConfig) return
    if (!hasFeature('nota_fiscal')) return
    if (isOnboardingPending) return // Don't show during provisioning — it's processing
    if (!isOnboardingNotStarted && !isOnboardingActive) return // Don't show if rejected etc.
    if (dismissed) return
    if (isOnboardingActive && allRequiredComplete) return // Active + fully configured → no need

    const timer = setTimeout(() => setOpen(true), 500)
    return () => clearTimeout(timer)
  }, [
    isLoadingOnboarding,
    isLoadingConfig,
    hasFeature,
    isOnboardingActive,
    isOnboardingPending,
    isOnboardingNotStarted,
    dismissed,
    allRequiredComplete,
  ])

  // Clear dismissal when all required steps are complete (allows re-show if config changes)
  useEffect(() => {
    if (allRequiredComplete && dismissed) {
      try {
        localStorage.removeItem(DISMISSAL_KEY)
        setDismissed(false)
      } catch {
        // localStorage not available
      }
    }
  }, [allRequiredComplete, dismissed])

  const handleDismiss = () => {
    setOpen(false)
    try {
      localStorage.setItem(DISMISSAL_KEY, 'true')
    } catch {
      // localStorage not available
    }
    setDismissed(true)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleDismiss()
    } else {
      setOpen(true)
    }
  }

  const handleStepClick = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  const handleEmitClick = () => {
    setOpen(false)
    router.push('/nota-fiscal/emitir')
  }

  const handleReopenModal = () => {
    try {
      localStorage.removeItem(DISMISSAL_KEY)
    } catch {
      // localStorage not available
    }
    setDismissed(false)
    setOpen(true)
  }

  // Don't render anything if fiscal module is not contracted, or if onboarding is pending/rejected
  if (!hasFeature('nota_fiscal')) return null
  if (isOnboardingPending) return null
  if (!isOnboardingNotStarted && !isOnboardingActive) return null

  // Don't render if still loading
  if (isLoadingOnboarding || isLoadingConfig) return null

  // If active + all required steps are complete, no need for banner or modal
  if (isOnboardingActive && allRequiredComplete && !open) return null

  const showReminderBanner =
    dismissed &&
    (isOnboardingNotStarted || (isOnboardingActive && !allRequiredComplete))

  return (
    <>
      {/* Reminder banner — shows when modal was dismissed but config is still incomplete */}
      {showReminderBanner && (
        <button
          type="button"
          onClick={handleReopenModal}
          className="w-full rounded-lg border border-brand-200 bg-brand-50 p-4 flex items-center gap-3 hover:bg-brand-100 transition-colors group text-left"
        >
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
            <IconFileInvoice className="h-5 w-5 text-brand-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-brand-800">
              Configuração fiscal pendente
            </p>
            <p className="text-sm text-brand-600">
              Complete a configuração do módulo fiscal para começar a emitir
              notas.
            </p>
          </div>
          <IconChevronRight className="h-5 w-5 text-brand-400 group-hover:text-brand-600 transition-colors" />
        </button>
      )}

      {/* Modal dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[520px] p-0 gap-0">
          {isOnboardingNotStarted ? (
            /* ── NOT_STARTED variant: onboarding CTA ── */
            <>
              <DialogHeader className="px-6 pt-6 pb-2">
                <DialogTitle>Configure o Módulo Fiscal</DialogTitle>
                <DialogDescription>
                  Para começar a emitir notas fiscais, primeiro configure seu
                  emissor fiscal.
                </DialogDescription>
              </DialogHeader>

              <DialogBody className="px-6 py-4 space-y-4">
                {/* Main CTA card */}
                <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 flex items-start gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                    <IconRocket className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-900">
                      Iniciar Configuração Fiscal
                    </p>
                    <p className="text-xs text-brand-700 mt-0.5">
                      Preencha os dados do seu emissor (CNPJ, razão social,
                      endereço) para habilitar a emissão de notas fiscais.
                    </p>
                  </div>
                </div>

                {/* Greyed-out preview of upcoming steps */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-400 px-1 mb-2">
                    Próximas etapas (disponíveis após a configuração do emissor)
                  </p>
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className="flex items-center gap-3 p-3 rounded-lg opacity-40"
                    >
                      <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
                        <IconLock className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-500">
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogBody>

              <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <Button variant="ghost" onClick={handleDismiss}>
                  Configurar depois
                </Button>
                <Button
                  onClick={() => {
                    setOpen(false)
                    router.push('/assinatura/configurar-fiscal')
                  }}
                >
                  <IconRocket className="h-4 w-4" />
                  Configurar Módulo Fiscal
                </Button>
              </DialogFooter>
            </>
          ) : (
            /* ── ACTIVE variant: config checklist (existing behavior) ── */
            <>
              <DialogHeader className="px-6 pt-6 pb-2">
                <DialogTitle>Configuração do Módulo Fiscal</DialogTitle>
                <DialogDescription>
                  Complete as etapas abaixo para começar a emitir notas fiscais.
                </DialogDescription>
              </DialogHeader>

              <DialogBody className="px-6 py-4 space-y-1">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {/* Status icon */}
                    <div
                      className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${
                        step.complete
                          ? 'bg-success-100 text-success-600'
                          : step.optional
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-warning-100 text-warning-600'
                      }`}
                    >
                      {step.complete ? (
                        <IconCheck className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-4 w-4" />
                      )}
                    </div>

                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {step.title}
                        </p>
                        {step.optional && !step.complete && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            Opcional
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {step.description}
                      </p>
                    </div>

                    {/* Action link */}
                    {!step.complete && (
                      <button
                        type="button"
                        onClick={() => handleStepClick(step.href)}
                        className="flex-shrink-0 text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 whitespace-nowrap"
                      >
                        Configurar
                        <IconChevronRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Progress bar */}
                <div className="pt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                    <span>Progresso</span>
                    <span>
                      {completedCount} de {steps.length} concluídas
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all duration-300"
                      style={{
                        width: `${(completedCount / steps.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </DialogBody>

              <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <Button variant="ghost" onClick={handleDismiss}>
                  Configurar depois
                </Button>
                <Button
                  disabled={!allRequiredComplete}
                  onClick={handleEmitClick}
                >
                  <IconFileInvoice className="h-4 w-4" />
                  Começar a emitir notas
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
