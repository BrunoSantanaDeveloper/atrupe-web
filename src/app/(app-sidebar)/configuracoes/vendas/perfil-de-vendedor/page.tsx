// Components
import { Main } from './components/Main'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Perfil de vendedor',
  }
}

export default function Page({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['sales_settings:seller_profile:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar os perfis de vendedor.
        </div>
      }
    >
      <Main searchParams={searchParams} />
    </PermissionGate>
  )
}
