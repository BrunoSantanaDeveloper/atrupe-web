import { ProjectDetail } from './components/ProjectDetail'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Projeto' }
}

export default function Page({ params }: { params: { id: string } }) {
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
        features={[FEATURES.PRODUCTION.PRODUCTION_MANAGER]}
        wall={{ title: 'Projeto', pageTitle: true }}
      >
        <ProjectDetail id={params.id} />
      </FeatureGate>
    </PermissionGate>
  )
}
