import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface IInstallment {
  id: string
  installment: number
  operatorFeeRate: number
  operatorFeeTransfer: number
  paymentConditionId: string
  quotationPaymentId: string | null
}

interface IPaymentCondition {
  id: string
  name: string
  isActive: boolean
  acceptInstallments: boolean
  costType: string
  minInstallments: number | null
  maxInstallments: number | null
  receivingType: string | null
  dayInterval: number | null
  installments: IInstallment[]
}

interface IPaymentMethod {
  id: string
  name: string
  conditions: IPaymentCondition[]
}

interface IPaymentConditionsResponse {
  total: number
  lastPage: number
  data: {
    paymentMethod: {
      id: string
      name: string
    }
    conditions: IPaymentCondition[]
  }[]
}

async function fetchData(): Promise<IPaymentMethod[]> {
  const response: IPaymentConditionsResponse = await getDataOld({
    route: 'paymentConditionRoute',
    perPage: '999999',
  })

  return response.data.map((item) => ({
    id: item.paymentMethod.id,
    name: item.paymentMethod.name,
    conditions: item.conditions,
  }))
}

export function usePaymentConditionsFullList() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['payment-conditions-full-list'],
    queryFn: () => fetchData(),
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
