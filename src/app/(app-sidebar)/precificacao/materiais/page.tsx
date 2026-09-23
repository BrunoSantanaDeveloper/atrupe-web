import { PricingList } from '../components/PricingList'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return { title: 'Precificação' }
}

export default function MaterialPricingPage({
  searchParams,
}: SearchParamsType) {
  return (
    <PricingList
      group="materials"
      itemLabel="material"
      originLabel="do cadastro do material ou da entrada de nota"
      description="Quando o material tem variação, a linha é a variação: é nela que vivem custo e preço."
      searchParams={searchParams}
    />
  )
}
