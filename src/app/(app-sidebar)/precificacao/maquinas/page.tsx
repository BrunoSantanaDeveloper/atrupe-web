import { PricingList } from '../components/PricingList'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return { title: 'Precificação' }
}

export default function MachinePricingPage({ searchParams }: SearchParamsType) {
  return (
    <PricingList
      group="machines"
      itemLabel="equipamento"
      originLabel="do cadastro do patrimônio"
      description="Uma linha por configuração produtiva. Grupos de bens equivalentes aparecem como uma linha só."
      searchParams={searchParams}
    />
  )
}
