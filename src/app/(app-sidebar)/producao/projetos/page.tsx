import { Projects } from './components/Projects'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Projetos em produção' }
}

export default function Page() {
  return (
    <PermissionGate
      permissions={['production:production:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar a produção.
        </div>
      }
    >
      <FeatureGate
        features={[
          FEATURES.PRODUCTION.PRODUCTION_MANAGER,
          FEATURES.PRODUCTION.SECTOR_BOARD,
        ]}
        wall={{ title: 'Projetos em produção', pageTitle: true }}
      >
        <Projects />
      </FeatureGate>
    </PermissionGate>
  )
}
