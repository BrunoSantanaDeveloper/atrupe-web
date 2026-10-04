// Components
import { Main } from './components/Main'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Constants
import { FEATURES } from '@/consts/features'

export function metadata() {
  return {
    title: 'Motivos de rejeição e cancelamento',
  }
}

export default function Page({ searchParams }: SearchParamsType) {
  return (
    <FeatureGate
      features={[
        FEATURES.SALES.QUOTATION_REJECTION_REASONS,
        FEATURES.SALES.SERVICE_ORDER_CANCELLATION_REASON,
      ]}
      requireAll={false}
      fallback={
        <UpgradeFallback
          title="Motivos de rejeição e cancelamento"
          description="A configuração de motivos de rejeição e cancelamento não está incluída no seu plano atual. Faça upgrade para personalizar os motivos dos seus orçamentos e ordens de serviço."
        />
      }
    >
      <PermissionGate
        permissions={['sales_settings:rejection_reasons:view']}
        fallback={
          <div className="p-4">
            Você não tem permissão para visualizar os motivos de rejeição e
            cancelamento.
          </div>
        }
      >
        <Main searchParams={searchParams} />
      </PermissionGate>
    </FeatureGate>
  )
}
