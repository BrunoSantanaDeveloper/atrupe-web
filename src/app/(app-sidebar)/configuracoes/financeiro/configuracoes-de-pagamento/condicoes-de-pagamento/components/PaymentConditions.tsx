// UI
import { Card } from '@/components/ui/card'

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
        primaryCta={<NewPaymentCondition />}
      />
      <Card>
        <PaymentConditionsData searchParams={searchParams} />
      </Card>
    </div>
  )
}
