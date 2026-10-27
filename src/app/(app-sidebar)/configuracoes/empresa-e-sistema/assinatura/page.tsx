// Components
import { SubscriptionManagementClient } from './components/SubscriptionManagementClient'
import { AdminGate } from '@/components/common/AdminGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Assinatura',
  }
}

export default function Page({ searchParams }: SearchParamsType) {
  return (
    // Só o administrador da empresa: não se concede pela tela de cargos
    <AdminGate
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar a assinatura.
        </div>
      }
    >
      <SubscriptionManagementClient searchParams={searchParams} />
    </AdminGate>
  )
}
