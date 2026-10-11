// Components
import { Main } from './components/Main'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

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
      wall={{
        title: 'Motivos de rejeição e cancelamento',
        description:
          'Personalize os motivos de rejeição dos orçamentos e de cancelamento das ordens de serviço.',
        pageTitle: true,
      }}
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
