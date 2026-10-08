// Components
import { FinancialFlow } from './components/FinancialFlow'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Fluxo financeiro',
  }
}

export default function FinancialFlowPage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      requireAll
      permissions={['financial:flow:view', 'values:values:view']}
    >
      <FinancialFlow searchParams={searchParams} />
    </PermissionGate>
  )
}
