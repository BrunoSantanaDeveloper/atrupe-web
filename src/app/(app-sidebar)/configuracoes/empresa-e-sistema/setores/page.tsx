// Components
import { Main } from './components/Main'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FeatureGate } from '@/components/common/FeatureGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Constants
import { FEATURES } from '@/consts/features'

export default function Page({ searchParams }: SearchParamsType) {
  return (
    <FeatureGate
      features={[FEATURES.SYSTEM.SECTORS_CONFIGURATION]}
      wall={{
        title: 'Configuração de setores',
        description:
          'Organize a empresa em setores e indique quais são etapas de produção.',
        pageTitle: true,
      }}
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
