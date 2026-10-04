'use client'

import Link from 'next/link'

// Components
import { FormInput } from '@/components/common/form/FormInput'

// Icons
import {
  IconArrowRight,
  IconReceipt,
  IconSettings,
  IconClock,
} from '@tabler/icons-react'

// UI
import { Button } from '@/components/ui/button'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { useFiscalOnboardingStatus } from '@/hooks/useFiscalOnboardingStatus'

export function Step5() {
  const { hasFeature } = usePlanFeatures()
  const hasFiscalModule = hasFeature('nota_fiscal')
  const { isLoading, isActive, isPending } = useFiscalOnboardingStatus()

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-gray-400">
        Carregando...
      </div>
    )
  }

  // Sem módulo contratado → CTA de contratação
  if (!hasFiscalModule) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-5 text-center">
        <div className="h-14 w-14 rounded-full bg-brand-50 flex items-center justify-center">
          <IconReceipt className="h-7 w-7 text-brand-600" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-gray-900">
            Módulo Fiscal não contratado
          </h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Para emitir NF-e, NFS-e e NFC-e, ative o módulo fiscal no seu plano.
          </p>
        </div>
        <Button type="button" RightIcon={IconArrowRight} asChild>
          <Link href="/configuracoes/empresa-e-sistema/assinatura">
            Ver planos e módulos
          </Link>
        </Button>
      </div>
    )
  }

  // Módulo contratado mas pendente/não configurado
  if (!isActive) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-5 text-center">
        <div className="h-14 w-14 rounded-full bg-amber-50 flex items-center justify-center">
          <IconClock className="h-7 w-7 text-amber-500" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-gray-900">
            {isPending
              ? 'Configuração em andamento'
              : 'Módulo Fiscal não configurado'}
          </h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            {isPending
              ? 'Seus dados foram enviados e estão sendo processados. Em breve o módulo será ativado.'
              : 'Inicie a configuração do módulo fiscal.'}
          </p>
        </div>
        {!isPending && (
          <Button
            type="button"
            variant="neutralOutline"
            RightIcon={IconArrowRight}
            asChild
          >
            <Link
              href="/dashboard"
              onClick={() => {
                try {
                  localStorage.removeItem('fiscal-setup-modal-dismissed')
                  localStorage.setItem('force_open_fiscal_form', 'true')
                } catch {}
              }}
            >
              Configurar módulo fiscal
            </Link>
          </Button>
        )}
      </div>
    )
  }

  // Módulo ativo → CNAE + IE + IM + link para emissores
  return (
    <div className="space-y-6">
      {/* Dados fiscais cadastrais */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Dados fiscais</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormInput
            name="fiscal.cnae"
            label="CNAE"
            placeholder="Ex: 4642701"
            width="sm:col-span-1"
          />
          <FormInput
            name="general.stateRegistration"
            label="Inscrição Estadual (IE)"
            placeholder="Opcional"
            width="sm:col-span-1"
          />
          <FormInput
            name="general.municipalRegistration"
            label="Inscrição Municipal (IM)"
            placeholder="Opcional"
            width="sm:col-span-1"
          />
        </div>
      </div>

      {/* Link para configurações do emissor */}
      <div className="rounded-lg border border-brand-100 bg-brand-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
            <IconSettings className="h-4 w-4 text-brand-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-900">
              Configurações do Emissor
            </p>
            <p className="text-xs text-brand-700 mt-0.5">
              Séries, ambiente, certificado digital, CFOP e outras configurações
              fiscais
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="neutralOutline"
          size="sm"
          RightIcon={IconArrowRight}
          className="shrink-0"
          asChild
        >
          <Link href="/configuracoes/nota-fiscal/emissores">
            Gerenciar Emissor
          </Link>
        </Button>
      </div>
    </div>
  )
}
