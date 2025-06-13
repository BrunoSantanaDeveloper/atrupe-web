// Components
import { FinancialFlow } from './components/FinancialFlow'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Fluxo Financeiro',
  }
}

export default function FinancialFlowPage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate permissions={['financial:flow:view']}>
      <FinancialFlow searchParams={searchParams} />
    </PermissionGate>
  )
}
