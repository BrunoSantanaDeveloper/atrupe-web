// Components
import { Main } from './components/Main'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Contas trial',
  }
}

export default function Page({ searchParams }: SearchParamsType) {
  const defaultTab = 'ativas'
  const status = searchParams.status || defaultTab

  return <Main searchParams={{ ...searchParams, status }} />
}
