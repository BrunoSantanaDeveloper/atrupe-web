// Components
import { Main } from './components/Main'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Contas trial',
  }
}

export default function Page({ searchParams }: SearchParamsType) {
  const defaultTab = 'ativas'
  const status = searchParams.status || defaultTab

  return (
    <PermissionGate permissions={['admin:trial_accounts:view']}>
      <Main searchParams={{ ...searchParams, status }} />
    </PermissionGate>
  )
}
