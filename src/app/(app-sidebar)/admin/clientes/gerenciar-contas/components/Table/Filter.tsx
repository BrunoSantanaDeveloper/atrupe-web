'use client'

// React
import { useRouter } from '@/hooks/useRouter'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { AccountFilterOptions } from '../types'
import { SortSelectorField } from '@/components/common/form/global-inputs/SortSelectField'

// UI
import { SelectBasic } from '@/components/common/form/FormSelect'

// Actions
import { getData } from '@/actions/_cruds'

// Third-party
import { useQuery } from '@tanstack/react-query'

const sortOptions = [
  { value: 'default', label: 'Nome da conta' },
  { value: 'updated_at', label: 'Últimas alterações' },
  { value: 'created_at', label: 'Data de criação' },
]

const additionalUsersOptions = [
  { value: 'default', label: 'Todos' },
  { value: 'with', label: 'Com adicionais' },
  { value: 'without', label: 'Sem adicionais' },
]

const planOptions = [
  { value: 'default', label: 'Todos' },
  { value: 'START', label: 'Start' },
  { value: 'LITE', label: 'Lite' },
  { value: 'PRO', label: 'Pro' },
  { value: 'ELITE', label: 'Elite' },
  { value: 'FULL', label: 'Full' },
]

const billingModeOptions = [
  { value: 'default', label: 'Todas' },
  { value: 'ASAAS_SUBSCRIPTION', label: 'Asaas' },
  { value: 'ASAAS_INSTALLMENT', label: 'Anual parcelado' },
  { value: 'MANUAL', label: 'Manual (sem cobrança)' },
]

export function Filter({ searchParams }: SearchParamsType) {
  const router = useRouter()

  // Os módulos e as UFs que existem nas contas, inclusive o módulo que saiu
  // de venda e segue contratado.
  const { data } = useQuery({
    staleTime: Infinity,
    queryKey: ['active-clients-filters'],
    queryFn: () => getData({ route: '/subscriptions/active-clients/filters' }),
  })
  const options = data?.data as AccountFilterOptions | undefined

  const moduleOptions = [
    { value: 'default', label: 'Todos' },
    { value: 'any', label: 'Com algum módulo' },
    { value: 'none', label: 'Sem módulo' },
    ...(options?.modules ?? []).map((module) => ({
      value: module.key,
      label: module.name,
    })),
  ]

  const stateOptions = [
    { value: 'default', label: 'Todos' },
    ...(options?.states ?? []).map((state) => ({ value: state, label: state })),
  ]

  const searchParamsObject = new URLSearchParams(searchParams)
  const params = new URLSearchParams(searchParamsObject.toString())

  const handleFilter = (key: string, value: string) => {
    if (!value || value === 'default') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    params.delete('page')

    router.push(`?${params.toString()}`)
  }

  return (
    <>
      <SortSelectorField
        name="sort"
        width="w-[200px]"
        options={sortOptions}
        value={searchParams?.sort || 'default'}
        onChange={(value) => handleFilter('sort', value)}
      />

      <SelectBasic
        name="module"
        label="Módulo"
        value={searchParams?.module || 'default'}
        onChange={(value) => handleFilter('module', value)}
        options={moduleOptions}
        className="w-[180px]"
      />

      <SelectBasic
        name="additionalUsers"
        label="Usuários adicionais"
        value={searchParams?.additionalUsers || 'default'}
        onChange={(value) => handleFilter('additionalUsers', value)}
        options={additionalUsersOptions}
        className="w-[180px]"
      />

      <SelectBasic
        name="plan"
        label="Plano"
        value={searchParams?.plan || 'default'}
        onChange={(value) => handleFilter('plan', value)}
        options={planOptions}
        className="w-[140px]"
      />

      <SelectBasic
        name="billingMode"
        label="Cobrança"
        value={searchParams?.billingMode || 'default'}
        onChange={(value) => handleFilter('billingMode', value)}
        options={billingModeOptions}
        className="w-[200px]"
      />

      <SelectBasic
        name="state"
        label="Estado"
        value={searchParams?.state || 'default'}
        onChange={(value) => handleFilter('state', value)}
        options={stateOptions}
        className="w-[120px]"
      />
    </>
  )
}
