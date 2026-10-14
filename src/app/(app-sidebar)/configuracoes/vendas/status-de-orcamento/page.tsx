// Components
import { Main } from './components/Main'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Constants
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Status de orçamento' }
}

export default function QuotationStatusPage() {
  return (
    <PermissionGate
      permissions={['sales_settings:quotation_status:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar os status de orçamento.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.SALES.QUOTATION_STATUS_CONFIGURATION]}
        wall={{
          title: 'Status de orçamento',
          description: 'Personalize os status dos seus orçamentos.',
          pageTitle: true,
        }}
      >
        <Main />
      </FeatureGate>
    </PermissionGate>
  )
}
