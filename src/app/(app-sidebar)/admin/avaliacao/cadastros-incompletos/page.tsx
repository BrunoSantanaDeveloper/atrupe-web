// Components
import { Main } from './components/Main'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Cadastros incompletos',
  }
}

export default function Page({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate permissions={['admin:incomplete_registrations:view']}>
      <Main searchParams={searchParams} />
    </PermissionGate>
  )
}
