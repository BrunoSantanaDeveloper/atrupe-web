// Component Imports
import { Checkout } from './components/Checkout'

// Type Imports
import type { ParamsType, SearchParamsType } from '@/types/coreTypes'

interface Props extends SearchParamsType, ParamsType {}

export default function CheckoutPage({ searchParams, params }: Props) {
  return <Checkout searchParams={searchParams} id={params.checkoutId} />
}
