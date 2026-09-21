// Components
import { Main } from './components/Main'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Colaboradores e Usuários',
  }
}

export default function Page({ searchParams }: SearchParamsType) {
  const defaultTab = 'ativos'
  const status = searchParams.status || defaultTab

  return <Main searchParams={{ ...searchParams, status }} />
}
