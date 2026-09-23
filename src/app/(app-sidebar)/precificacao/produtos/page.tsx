import { PricingList } from '../components/PricingList'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return { title: 'Precificação' }
}

export default function ProductPricingPage({ searchParams }: SearchParamsType) {
  return (
    <PricingList
      group="products"
      itemLabel="produto"
      originLabel="da composição do produto"
      description="Produto sem composição aparece como custo não calculado, nunca como margem zero."
      searchParams={searchParams}
    />
  )
}
