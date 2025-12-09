// Components
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { FormSelect } from '@/components/common/form/FormSelect'
import { billingOptions } from '@/app/(app-sidebar)/configuracoes/vendas/series-de-venda/components/EditItem'

import { QuotationPaymentConditionsType } from './schema'
import type { QuotationType } from '@/types/sales/quotation'

const typeOptions = [
  { value: 'NFE', label: 'NF-e' },
  { value: 'NFSE', label: 'NFS-e' },
  { value: 'OTHER', label: 'A definir' },
]

interface Props {
  quotationData: QuotationType
}

export function TypeAndBilling({ quotationData }: Props) {
  const { canBillOnDeliveryAndCheckout } = usePlanFeatures()

  // Filtrar billingOptions para mostrar apenas a opção atual
  const currentBillingValue =
    quotationData.paymentConditions?.billing || 'ON_ORDER'
  const filteredBillingOptions = billingOptions.filter(
    (option) => option.value === currentBillingValue,
  )

  return (
    <>
      <FormSelect<QuotationPaymentConditionsType>
        name="type"
        label="Nota"
        options={typeOptions}
        width="flex-[1_0_100px]"
      />

      <FormSelect<QuotationPaymentConditionsType>
        name="billing"
        label="Faturamento"
        options={filteredBillingOptions}
        width="flex-[1_0_200px]"
        disabled={!canBillOnDeliveryAndCheckout()}
      />
    </>
  )
}
