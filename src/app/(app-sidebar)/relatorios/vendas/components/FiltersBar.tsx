'use client'

// React
import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Lib
import {
  getDateRangeFromParams,
  updateFilterParam,
  updatePeriodParams,
  updateDateRangeParams,
  type PeriodType,
} from '@/lib/filter-utils'

// Components
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="neutralGhost"
                size="iconMd"
                RightIcon={IconFilter}
                className="bg-transparent"
              />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filtros</DialogTitle>
                <DialogDescription hidden></DialogDescription>
              </DialogHeader>
              <DialogBody className="flex flex-col gap-4">
                <FiltersContent searchParams={searchParams} />
              </DialogBody>
            </DialogContent>
          </Dialog>,
          portalContainer,
        )}

      <Card className="hidden lg:block">
        <CardHeader className="flex-row flex-wrap space-y-0 gap-4">
          <FiltersContent searchParams={searchParams} />
        </CardHeader>
      </Card>
    </>
  )
}

function FiltersContent({ searchParams }: SearchParamsType) {
  const router = useRouter()
  const params = new URLSearchParams(
    new URLSearchParams(searchParams).toString(),
  )

  const defaultDateRange = getDateRangeFromParams(
    searchParams?.startDate,
    searchParams?.endDate,
  )

  const updateOptions = { router, params }

  const originSelectOptions = originOptions.map((o) => ({
    value: o.id,
    label: o.name,
  }))

  const periodSelectOptions = periodOptions.map((p) => ({
    value: p.id,
    label: p.name,
  }))

  return (
    <>
      <SelectBasic
        name="origin"
        label="Origem"
        placeholder="Selecione uma origem"
        className="lg:w-[260px] w-full"
        options={originSelectOptions}
        value={searchParams?.origin || 'all'}
        onChange={(value) => updateFilterParam('origin', value, updateOptions)}
      />
      <SelectBasic
        name="period"
        label="Período"
        placeholder="Selecione o período"
        className="lg:w-[260px] w-full"
        options={periodSelectOptions}
        value={searchParams?.period || 'current_month'}
        onChange={(value) =>
          updatePeriodParams(value as PeriodType, updateOptions)
        }
      />
      <DateRangePickerBasic
        label="Período personalizado"
        placeholder="Selecione o período"
        className="lg:w-[260px] w-full"
        value={defaultDateRange}
        onChange={(range) => updateDateRangeParams(range, updateOptions)}
      />
    </>
  )
}
