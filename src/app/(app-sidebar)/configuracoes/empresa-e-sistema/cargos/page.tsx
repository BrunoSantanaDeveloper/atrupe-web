// Components
import { Main } from './components/Main'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export default function Page({ searchParams }: SearchParamsType) {
  return <Main searchParams={searchParams} />
}
