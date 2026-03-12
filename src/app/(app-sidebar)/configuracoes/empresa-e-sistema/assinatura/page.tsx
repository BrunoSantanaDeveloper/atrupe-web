// Components
import { SubscriptionManagementClient } from './components/SubscriptionManagementClient'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export default function Page({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['company_settings:subscription:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar a assinatura.
        </div>
      }
    >
      <SubscriptionManagementClient searchParams={searchParams} />
    </PermissionGate>
  )
}
