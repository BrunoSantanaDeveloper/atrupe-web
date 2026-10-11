'use client'

// React
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

// UI
import { Button } from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import { useAlertDialog } from '@/store/useAlertDialog'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { PermissionGate } from '@/components/common/PermissionGate'

// Icons
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
} from '@tabler/icons-react'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export function PayrollFilter({
  searchParams,
  selectedIds,
  setSelectedIds,
  generateTransaction,
}: SearchParamsType & {
  selectedIds: string[]
  setSelectedIds: (ids: string[]) => void
  generateTransaction: (employeeIds: string[]) => Promise<boolean>
}) {
  const router = useRouter()
  const alertDialog = useAlertDialog()
  const queryClient = useQueryClient()

  // Estado para controle do mês e ano - inicializa com mês atual
  const currentDate = new Date()
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth())
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear())

  const searchParamsObject = new URLSearchParams(searchParams)
  const params = new URLSearchParams(searchParamsObject.toString())

  // Inicializar com valores dos searchParams se existirem, caso contrário usa o mês atual
  useEffect(() => {
    const month = searchParams?.month
    const year = searchParams?.year

    if (month && !isNaN(Number(month)) && year && !isNaN(Number(year))) {
      // Se ambos os parâmetros existem e são válidos, usa eles
      setCurrentMonth(Number(month))
      setCurrentYear(Number(year))
    } else {
      // Se não há parâmetros válidos, usa o mês atual
      const now = new Date()
      setCurrentMonth(now.getMonth())
      setCurrentYear(now.getFullYear())
    }
  }, [searchParams])

  const handleFilter = (key: string, value: string) => {
    if (!value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    params.delete('page')

    router.push(`?${params.toString()}`)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedIds([])
    let newMonth = currentMonth
    let newYear = currentYear

    if (direction === 'prev') {
      newMonth = currentMonth === 0 ? 11 : currentMonth - 1
      newYear = currentMonth === 0 ? currentYear - 1 : currentYear
    } else {
      newMonth = currentMonth === 11 ? 0 : currentMonth + 1
      newYear = currentMonth === 11 ? currentYear + 1 : currentYear
    }

    setCurrentMonth(newMonth)
    setCurrentYear(newYear)

    // Atualizar URL
    handleFilter('month', newMonth.toString())
    handleFilter('year', newYear.toString())
  }

  const handleMonthYearSelect = (value: string) => {
    setSelectedIds([])
    const [month, year] = value.split('-')
    setCurrentMonth(Number(month))
    setCurrentYear(Number(year))

    // Atualizar URL
    handleFilter('month', month)
    handleFilter('year', year)
  }

  // Gerar opções para o último ano e próximo ano
  const generateMonthYearOptions = () => {
    const options = []
    const startYear = currentYear - 1
    const endYear = currentYear + 1

    for (let year = startYear; year <= endYear; year++) {
      for (let month = 0; month < 12; month++) {
        options.push({
          value: `${month}-${year}`,
          label: `${MONTHS[month]} / ${year}`,
        })
      }
    }

    return options
  }

  const currentValue = `${currentMonth}-${currentYear}`

  const handlePostSelectedPayroll = async () => {
    if (selectedIds.length === 0) return

    await alertDialog.open({
      title: 'Lançar folhas de pagamento',
      description:
        selectedIds.length > 1
          ? `Deseja lançar as ${selectedIds.length} folhas de pagamento selecionadas?`
          : 'Deseja lançar a folha de pagamento selecionada?',
      cancelLabel: 'Cancelar',
      confirmLabel: 'Lançar',
      toastMsg: undefined,
      onConfirm: async () => {
        await generateTransaction(selectedIds)
        setSelectedIds([])
        queryClient.invalidateQueries()
      },
    })
  }

  return (
    <>
      <div className="flex items-end gap-2 w-full sm:w-auto">
        <Button
          type="button"
          variant="neutralOutline"
          size="iconMd"
          onClick={() => navigateMonth('prev')}
          aria-label="Mês anterior"
          RightIcon={IconChevronLeft}
        />

        <SelectBasic
          name="month-year-select"
          label="Mês de referência"
          placeholder="Selecione o mês"
          options={generateMonthYearOptions()}
          value={currentValue}
          onChange={handleMonthYearSelect}
          className="w-full sm:w-[220px]"
        />

        <Button
          type="button"
          variant="neutralOutline"
          size="iconMd"
          onClick={() => navigateMonth('next')}
          aria-label="Próximo mês"
          RightIcon={IconChevronRight}
        />
      </div>
      <div className="flex items-end w-full sm:w-auto">
        <PermissionGate permissions={['financial:payroll:edit']}>
          <Button
            variant="neutralOutline"
            LeftIcon={IconPlus}
            onClick={handlePostSelectedPayroll}
            disabled={selectedIds.length === 0}
            className="w-full sm:w-auto"
          >
            Lançar selecionadas
          </Button>
        </PermissionGate>
      </div>
    </>
  )
}
