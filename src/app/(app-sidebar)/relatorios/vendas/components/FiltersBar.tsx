'use client'

// React
import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { DateRange } from 'react-day-picker'

// Components
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogHeader,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { DateRangePickerBasic } from '@/components/common/form/DateRangePickerBasic'

// Icons
import { IconFilter } from '@tabler/icons-react'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Config
import { originOptions, periodOptions } from '../config'

export function FiltersBar({ searchParams }: SearchParamsType) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setPortalContainer(document.getElementById('mobile-filter-button-portal'))
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {/* Mobile Filter Button - rendered via portal in MobileSidebar header */}
      {portalContainer &&
        createPortal(
          <Button
            type="button"
            variant="neutralGhost"
            size="iconMd"
            RightIcon={IconFilter}
            className="bg-transparent"
            onClick={() => setDialogOpen(true)}
          />,
          portalContainer,
        )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtros</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <FiltersContent searchParams={searchParams} />
          </DialogBody>
        </DialogContent>
      </Dialog>

      <Card className="hidden lg:block">
        <CardHeader className="flex-row flex-wrap space-y-0 gap-4">
          <FiltersContent searchParams={searchParams} />
        </CardHeader>
      </Card>
    </>
  )
}

function FiltersContent({ searchParams }: SearchParamsType) {
  const searchParamsObject = new URLSearchParams(searchParams)
  const params = new URLSearchParams(searchParamsObject.toString())

  const router = useRouter()

  const hasUrlParams = searchParams?.startDate && searchParams?.endDate

  const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const parseDateFromISO = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day, 12, 0, 0, 0)
  }

  const getDefaultDateRange = (): DateRange | undefined => {
    if (hasUrlParams) {
      return {
        from: parseDateFromISO(searchParams.startDate!),
        to: parseDateFromISO(searchParams.endDate!),
      }
    }

    return undefined
  }

  const defaultDateRange = getDefaultDateRange()

  const handleFilter = (key: string, value: string) => {
    if (!value || value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    params.delete('page')

    router.push(`?${params.toString()}`)
  }

  const handlePeriodChange = (value: string) => {
    const today = new Date()
    today.setHours(12, 0, 0, 0)

    let startDate: Date | null = null
    let endDate: Date = today

    switch (value) {
      case 'current_month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        break
      case 'last_6_months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1)
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        break
      case 'last_12_months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1)
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        break
      case 'last_24_months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 23, 1)
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        break
      case 'last_36_months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 35, 1)
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        break
      case 'custom':
        // Para personalizado, apenas limpa as datas para o usuário selecionar
        params.delete('startDate')
        params.delete('endDate')
        params.set('period', value)
        params.delete('page')
        router.push(`?${params.toString()}`)
        return
    }

    if (startDate) {
      params.set('startDate', formatDateToISO(startDate))
      params.set('endDate', formatDateToISO(endDate))
      params.set('period', value)
    }

    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      params.set('startDate', formatDateToISO(range.from))
      params.set('endDate', formatDateToISO(range.to))
      params.set('period', 'custom')
    } else {
      params.delete('startDate')
      params.delete('endDate')
    }

    params.delete('page')

    router.push(`?${params.toString()}`)
  }

  const originSelectOptions = originOptions.map((o) => ({
    value: o.id,
    label: o.name,
  }))

  const periodSelectOptions = periodOptions.map((p) => ({
    value: p.id,
    label: p.name,
  }))

  const isCustomPeriod = searchParams?.period === 'custom'

  return (
    <>
      <SelectBasic
        name="origin"
        label="Origem"
        placeholder="Selecione uma origem"
        className="lg:w-[260px] w-full"
        options={originSelectOptions}
        value={searchParams?.origin || 'all'}
        onChange={(value) => handleFilter('origin', value)}
      />
      <SelectBasic
        name="period"
        label="Período"
        placeholder="Selecione o período"
        className="lg:w-[260px] w-full"
        options={periodSelectOptions}
        value={searchParams?.period || 'current_month'}
        onChange={handlePeriodChange}
      />
      <DateRangePickerBasic
        label="Período personalizado"
        placeholder="Selecione o período"
        className="lg:w-[260px] w-full"
        value={defaultDateRange}
        onChange={handleDateRangeChange}
        disabled={!isCustomPeriod}
      />
    </>
  )
}
