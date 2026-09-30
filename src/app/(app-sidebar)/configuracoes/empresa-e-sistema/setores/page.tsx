// Components
import { Main } from './components/Main'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FeatureGate } from '@/components/common/FeatureGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Constants
import { FEATURES } from '@/consts/features'

export default function Page({ searchParams }: SearchParamsType) {
  return (
    <FeatureGate
      features={[FEATURES.SYSTEM.SECTORS_CONFIGURATION]}
      fallback={
        <UpgradeFallback
          title="Setores"
          description="A configuração de setores não está incluída no seu plano atual."
        />
      }
    >
      <PermissionGate
        permissions={['company_settings:sectors:view']}
        fallback={
          <div className="p-4">
            Você não tem permissão para visualizar os setores.
          </div>
        }
      >
        <Main searchParams={searchParams} />
      </PermissionGate>
    </FeatureGate>
  )
}
