// Component Imports
import { PaymentConditions } from './components/PaymentConditions'

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
  return <PaymentConditions searchParams={searchParams} />
}
