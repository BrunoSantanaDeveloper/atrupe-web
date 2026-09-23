import { ProcessDetail } from './components/ProcessDetail'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Processo' }
}

export default function ProcessPage({ params }: { params: { id: string } }) {
  return (
    <PermissionGate
      permissions={['product_settings:products:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar os processos.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.COSTS.COST_BASE]}
        fallback={<UpgradeFallback title="Processos" />}
      >
        <ProcessDetail id={params.id} />
      </FeatureGate>
    </PermissionGate>
  )
}
