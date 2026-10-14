import { Processes } from './components/Processes'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

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
      permissions={['product_settings:composition:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar os processos.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.COSTS.COST_BASE]}
        wall={{
          title: 'Processos',
          description:
            'Cada processo é uma etapa produtiva de um setor, com máquina, material, mão de obra e terceirizado.',
          pageTitle: true,
        }}
      >
        <Processes searchParams={searchParams} />
      </FeatureGate>
    </PermissionGate>
  )
}
