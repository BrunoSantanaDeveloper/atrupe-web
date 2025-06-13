// Component Imports
import { PaymentConditions } from './components/PaymentConditions'
import { PermissionGate } from '@/components/common/PermissionGate'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Condições de Pagamento',
  }
}

export default function PaymentConditionsPage({
  searchParams,
}: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['financial_settings:payment_methods:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar as condições de pagamento.
        </div>
      }
    >
      <PaymentConditions searchParams={searchParams} />
    </PermissionGate>
  )
}
