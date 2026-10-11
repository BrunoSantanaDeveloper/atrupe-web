import { PricingList } from '../components/PricingList'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import { pageTitle } from '@/lib/metadata'

export function metadata() {
  return { title: pageTitle('Materiais', 'Precificação') }
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
