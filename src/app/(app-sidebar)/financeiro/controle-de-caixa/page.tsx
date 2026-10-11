// Components
import { CashControl } from '@/app/(app-sidebar)/financeiro/controle-de-caixa/components/CashControl'
import { CashControl as DemoCashControl } from '@/app/(app-sidebar)/financeiro/controle-de-caixa/components/demo/CashControl'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FeatureGate } from '@/components/common/FeatureGate'

// Libs
import { DEMO_DATA } from '@/lib/demo'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Constants
import { FEATURES } from '@/consts/features'

export function metadata() {
  return {
    title: 'Controle de Caixa',
  }
}

export default function CashControlPage({ searchParams }: SearchParamsType) {
  return (
    <FeatureGate
      features={[FEATURES.FINANCIAL.CASH_CONTROL]}
      wall={{
        title: 'Controle de caixa',
        description: 'Controle as entradas e as saídas de caixa da empresa.',
        pageTitle: true,
      }}
    >
      {/* O caixa do dia (CX-0 a CX-5) ainda roda sobre dados de exemplo: só
          com a flag de demonstração, e com a permissão de valores, como a
          tela nova pede (o saldo é informação financeira). Sem a flag, a
          tela real */}
      <PermissionGate
        requireAll
        permissions={
          DEMO_DATA
            ? ['financial:cash_control:view', 'values:values:view']
            : ['financial:cash_control:view']
        }
        fallback={<div>Você não tem permissão para acessar esta página.</div>}
      >
        {DEMO_DATA ? (
          <DemoCashControl searchParams={searchParams} />
        ) : (
          <CashControl searchParams={searchParams} />
        )}
      </PermissionGate>
    </FeatureGate>
  )
}
