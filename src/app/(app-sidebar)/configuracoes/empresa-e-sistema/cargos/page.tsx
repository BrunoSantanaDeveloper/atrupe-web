// Components
import { Main } from './components/Main'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Cargos',
  }
}

export default function Page({ searchParams }: SearchParamsType) {
  return <Main searchParams={searchParams} />
}
