import { PricingList } from '../components/PricingList'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return { title: 'Precificação' }
}

export default function LaborPricingPage({ searchParams }: SearchParamsType) {
  return (
    <PricingList
      group="labor"
      itemLabel="setor"
      originLabel="do custo do setor dividido pela carga horária"
      description="A hora de cada setor produtivo, com o custo vindo da Base de custos."
      searchParams={searchParams}
    />
  )
}
