// Component Imports
import { Conciliation } from './components/Conciliation'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FeatureGate } from '@/components/common/FeatureGate'

// Constants
import { FEATURES } from '@/consts/features'

export function metadata() {
  return {
    title: 'Conciliação bancária',
  }
}

// A conciliação com o extrato (CX-6, LITE), do controle de caixa: a mesma
// permissão e o mesmo recurso do plano
export default function ConciliationPage() {
  return (
    <PermissionGate
      requireAll
      permissions={['financial:cash_control:view', 'values:values:view']}
      fallback={<div>Você não tem permissão para acessar esta página.</div>}
    >
      <FeatureGate
        features={[FEATURES.FINANCIAL.CASH_CONTROL]}
        wall={{
          title: 'Conciliação bancária',
          description:
            'Importe o extrato do banco e confira o que caiu na conta.',
          pageTitle: true,
        }}
      >
        <Conciliation />
      </FeatureGate>
    </PermissionGate>
  )
}
