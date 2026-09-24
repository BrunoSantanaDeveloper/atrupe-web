// UI
import { Card } from '@/components/ui/card'
import { PermissionGate } from '@/components/common/PermissionGate'

// Components
import { Topbar } from '@/components/common/Topbar'
import { NewPaymentCondition } from './NewPaymentCondition'
import { PaymentConditionsData } from './PaymentConditionsTable/PaymentConditionsData'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function PaymentConditions({ searchParams }: SearchParamsType) {
  return (
    <div className="space-y-5">
      <Topbar
        title="Condições de Pagamento"
        previousPage="/configuracoes/financeiro"
        primaryCta={
          <PermissionGate
            permissions={['financial_settings:payment_methods:create']}
          >
            <NewPaymentCondition />
          </PermissionGate>
        }
      />
      <Card>
        <PaymentConditionsData searchParams={searchParams} />
      </Card>
    </div>
  )
}
