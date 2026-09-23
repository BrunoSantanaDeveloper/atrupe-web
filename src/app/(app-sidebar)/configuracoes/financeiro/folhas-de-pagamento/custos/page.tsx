import { PayrollCosts } from './components/PayrollCosts'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Custos da folha' }
}

export default function PayrollCostsPage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      requireAll
      permissions={['financial_settings:payroll:view', 'values:values:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar os custos da folha.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.COSTS.COST_BASE]}
        fallback={
          <UpgradeFallback
            title="Custos da folha"
            description="O custo completo por colaborador faz parte do plano PRO. Informado o salário base, os encargos são calculados e alimentam o custo do setor."
          />
        }
      >
        <PayrollCosts searchParams={searchParams} />
      </FeatureGate>
    </PermissionGate>
  )
}
