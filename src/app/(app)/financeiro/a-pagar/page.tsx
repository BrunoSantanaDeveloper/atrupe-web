// Components
import { Transactions } from '@/app/(app)/financeiro/_components/transactions/Transactions'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Movimentações a Pagar',
  }
}

export default function PayablePage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['financial:payable:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar contas a pagar.
        </div>
      }
    >
      <Transactions searchParams={searchParams} type="payable" />
    </PermissionGate>
  )
}
