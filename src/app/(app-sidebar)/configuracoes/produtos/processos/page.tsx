import { Processes } from './components/Processes'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Processos' }
}

export default function ProcessesPage({ searchParams }: SearchParamsType) {
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
        fallback={
          <UpgradeFallback
            title="Processos"
            description="Os processos fazem parte do plano PRO. Cada processo é uma etapa produtiva de um setor, com máquina, material, mão de obra e terceirizado."
          />
        }
      >
        <Processes searchParams={searchParams} />
      </FeatureGate>
    </PermissionGate>
  )
}
