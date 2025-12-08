// Components
import { Main } from './components/Main'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export default function Page({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['company_settings:sectors:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar os setores.
        </div>
      }
    >
      <Main searchParams={searchParams} />
    </PermissionGate>
  )
}
