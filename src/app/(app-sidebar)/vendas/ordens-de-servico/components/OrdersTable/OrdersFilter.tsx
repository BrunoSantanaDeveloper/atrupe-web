'use client'

// React Imports
// import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// UI component Imports
import { SelectSerieField } from '@/components/common/form/global-inputs/SeriesSelectField'
import { SelectSellerField } from '@/components/common/form/global-inputs/SellersSelectField'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

// Third-party Imports
// import { format } from 'date-fns'
// import { ptBR } from 'date-fns/locale'
// import { FormDatePickerSingle } from '@/components/common/form/FormDatePicker'

export function OrdersFilter({ searchParams }: SearchParamsType) {
  // const [date, setDate] = useState<Date>()

  const router = useRouter()

  const searchParamsObject = new URLSearchParams(searchParams)
  const params = new URLSearchParams(searchParamsObject.toString())

  const handleFilter = (key: string, value: string) => {
    if (!value || value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    params.delete('page')

    router.push(`?${params.toString()}`)
  }

  return (
    <>
      {/* <FormDatePickerSingle
        name="date"
        label="Aprovada até"
        placeholder="Selecione uma data"
        width="w-[220px]"
        value={date}
        onSelect={(value) => {
          if (value) {
            setDate(value)
            handleFilter('date', format(value, 'P', { locale: ptBR }))
          } else {
            setDate(undefined)
            handleFilter('date', '')
          }
        }}
      /> */}
      <SelectSerieField
        noForm
        name="serie"
        label="Série"
        width="w-full sm:w-[220px]"
        value={searchParams?.serieId || 'all'}
        onChange={(value) => handleFilter('serieId', value)}
      />
      <SelectSellerField
        noForm
        name="seller"
        label="Vendedor"
        width="w-full sm:w-[220px]"
        value={searchParams?.sellerId || 'all'}
        onChange={(value) => handleFilter('sellerId', value)}
      />
    </>
  )
}
