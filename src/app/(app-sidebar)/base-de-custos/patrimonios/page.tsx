import { Depreciation } from './components/Depreciation'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import { pageTitle } from '@/lib/metadata'

export function metadata() {
  return { title: pageTitle('Patrimônios', 'Base de custos') }
}

export default function DepreciationPage({ searchParams }: SearchParamsType) {
  return <Depreciation searchParams={searchParams} />
}
