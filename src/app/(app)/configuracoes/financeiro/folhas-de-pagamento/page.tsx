// Components
import { Main } from './components/Main'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Folha de pagamento - Config.',
  }
}

export default function Page({ searchParams }: SearchParamsType) {
  return <Main searchParams={searchParams} />
}
