import { Outsourced } from './components/Outsourced'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Terceirizados' }
}

export default function OutsourcedPage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['product_settings:products:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar os terceirizados.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.COSTS.COST_BASE]}
        fallback={
          <UpgradeFallback
            title="Terceirizados"
            description="O cadastro de terceirizados faz parte do plano PRO. O serviço contratado entra na composição e vira previsão de despesa quando a venda é aprovada."
          />
        }
      >
        <Outsourced searchParams={searchParams} />
      </FeatureGate>
    </PermissionGate>
  )
}
