// Components
import { FormSelect } from '@/components/common/form/FormSelect'
import { billingOptions } from '@/app/(app)/configuracoes/vendas/series-de-venda/components/EditItem'

import { QuotationPaymentConditionsType } from './schema'

const typeOptions = [
  { value: 'NFE', label: 'NF-e' },
  { value: 'NFSE', label: 'NFS-e' },
  { value: 'OTHER', label: 'A definir' },
]

export function TypeAndBilling() {
  return (
    <>
      <FormSelect<QuotationPaymentConditionsType>
        name="type"
        label="Nota"
        options={typeOptions}
        width="flex-[1_0_200px]"
      />

      <FormSelect<QuotationPaymentConditionsType>
        name="billing"
        label="Faturamento"
        options={billingOptions}
        width="flex-[1_0_200px]"
      />
    </>
  )
}
