// Components
import { Main } from './components/Main'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'

// Constants
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Status de orçamento' }
}

export default function QuotationStatusPage() {
  return (
    <FeatureGate
      features={[FEATURES.SALES.QUOTATION_STATUS_CONFIGURATION]}
      fallback={
        <UpgradeFallback
          title="Status de orçamento"
          description="A configuração de status de orçamento não está incluída no seu plano atual. Faça upgrade para personalizar os status dos seus orçamentos."
        />
      }
    >
      <PermissionGate
        permissions={['sales_settings:quotation_status:view']}
        fallback={
          <div className="p-4">
            Você não tem permissão para visualizar os status de orçamento.
          </div>
        }
      >
        <Main />
      </PermissionGate>
    </FeatureGate>
  )
}
