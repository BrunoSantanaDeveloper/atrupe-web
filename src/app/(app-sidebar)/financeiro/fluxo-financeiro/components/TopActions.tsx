'use client'

// React
import { useRouter } from '@/hooks/useRouter'
import { Dispatch, SetStateAction } from 'react'

// UI
import { TooltipProvider } from '@/components/ui/tooltip'

// Components
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Icons
import {
  IconEye,
  IconEyeOff,
  IconCalendarDot,
  IconCalendarCheck,
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react'

// Types
import { SearchParamsType } from '@/types/coreTypes'

interface Props extends SearchParamsType {
  showTotals: boolean
  setShowTotals: Dispatch<SetStateAction<boolean>>
}

export function TopActions({ showTotals, setShowTotals, searchParams }: Props) {
  const router = useRouter()

  const searchParamsObject = new URLSearchParams(searchParams)
  const params = new URLSearchParams(searchParamsObject.toString())

  const handleFilter = (key: string, value: string) => {
    params.set(key, value)

    params.delete('page')

    router.push(`?${params.toString()}`)
  }

  const handleShowTotals = () => {
    setShowTotals(!showTotals)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <TooltipProvider>
        {/* EC-23: estes três só mudam a forma de ver a lista — não alteram
            dado nenhum, então bastam a permissão de visualizar */}
        <PermissionGate permissions={['financial:flow:view']}>
          <ActionButton
            tooltip={
              searchParams.sort === 'asc'
                ? 'Ordenação decrescente'
                : 'Ordenação crescente'
            }
            size="iconMd"
            variant="neutralOutline"
            Icon={
              searchParams.sort === 'asc'
                ? IconSortDescending
                : IconSortAscending
            }
            onClick={() => {
              const newSort = searchParams.sort === 'asc' ? 'desc' : 'asc'
              handleFilter('sort', newSort)
            }}
          />
          <ActionButton
            tooltip={
              searchParams.dateType === 'paidDate'
                ? 'Mostrar por data de vencimento'
                : 'Mostrar por data de pagamento'
            }
            size="iconMd"
            variant="neutralOutline"
            Icon={
              searchParams.dateType === 'paidDate'
                ? IconCalendarDot
                : IconCalendarCheck
            }
            onClick={() => {
              const newDateType =
                searchParams.dateType === 'paidDate' ? 'dueDate' : 'paidDate'
              handleFilter('dateType', newDateType)
            }}
          />
          <ActionButton
            tooltip={showTotals ? 'Ocultar totais' : 'Mostrar totais'}
            size="iconMd"
            variant="neutralOutline"
            Icon={showTotals ? IconEyeOff : IconEye}
            onClick={handleShowTotals}
          />
        </PermissionGate>
      </TooltipProvider>
    </div>
  )
}
