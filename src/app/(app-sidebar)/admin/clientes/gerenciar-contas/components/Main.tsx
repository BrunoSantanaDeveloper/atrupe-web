'use client'

// UI
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Components
import { Data } from './Table/Data'
import { Filter } from './Table/Filter'
import {
  ListDataTotalEmpty,
  ListDataStatusEmpty,
} from '@/components/common/TableEmptyState'
import { TabNavType, Topbar } from '@/components/common/Topbar'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import { ExportDataButton } from '@/components/common/ExportDataButton'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { AccountItem } from './types'

// Actions
import { getData } from '@/actions/_cruds'

// Libs
import { ACCOUNT_EXPORT_COLUMNS } from './billing'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconReportOff } from '@tabler/icons-react'

export function Main({ searchParams }: SearchParamsType) {
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['active-clients-totals'],
    queryFn: () => getData({ route: '/subscriptions/active-clients/totals' }),
  })

  const statusTotal = data?.data

  const totals: { [key: string]: number } = {
    ativas: statusTotal?.ACTIVE,
    bloqueadas: statusTotal?.BLOCKED,
    inativas: statusTotal?.INACTIVE,
    canceladas: statusTotal?.CANCELED,
    todos: statusTotal?.TOTAL,
  }

  const status = searchParams.status
  const statusEmpty = totals?.[status] === 0

  const tabs: TabNavType[] = [
    {
      value: 'ACTIVE',
      tab: 'ativas',
      label: 'Ativas',
      count: totals?.ativas,
    },
    {
      value: 'BLOCKED',
      tab: 'bloqueadas',
      label: 'Bloqueadas',
      count: totals?.bloqueadas,
    },
    {
      value: 'INACTIVE',
      tab: 'inativas',
      label: 'Inativas',
      count: totals?.inativas,
    },
    {
      value: 'CANCELLED',
      tab: 'canceladas',
      label: 'Canceladas',
      count: totals?.canceladas,
    },
  ]

  const statusLabel = tabs?.find((tab) => tab.tab === status)?.label

  // A planilha da cobrança sai com a aba e os filtros que estão na tela.
  const getExportAccounts = async () => {
    const result = await getData({
      route: '/subscriptions/active-clients/export',
      filters: searchParams,
    })

    if (!result.success) {
      throw new Error(result.message)
    }

    return (result.data || []) as AccountItem[]
  }

  return (
    <div className="space-y-5">
      <Topbar
        title="Gerenciar contas"
        tabs={tabs}
        activeTab={status}
        paramName="status"
        label="Super Admin"
        classNames={{ title: 'text-white', label: 'bg-[#FF4201]' }}
        primaryCta={
          <ExportDataButton
            columns={ACCOUNT_EXPORT_COLUMNS}
            fileName="contas-cobranca"
            sheetName="Contas"
            getData={getExportAccounts}
            emptyMessage="Nenhuma conta para exportar com estes filtros"
          />
        }
      />
      <div>
        <Card>
          {isLoading ? (
            <Skeleton className="h-[calc(100vh-150px)]" />
          ) : totals?.todos && totals?.todos > 0 ? (
            statusEmpty ? (
              <ListDataStatusEmpty
                title={`Nenhuma conta para o status ${statusLabel ? `: ${statusLabel}` : 'selecionado'}`}
                icon={IconReportOff}
              />
            ) : (
              <>
                {/* Filters */}
                <TableFiltersHeader searchParams={searchParams}>
                  <Filter searchParams={searchParams} />
                </TableFiltersHeader>
                {/* Table */}
                <Data searchParams={searchParams} tabs={tabs} />
              </>
            )
          ) : (
            <ListDataTotalEmpty
              icon={IconReportOff}
              title="Nada encontrado"
              description="Nenhuma conta cadastrada"
            />
          )}
        </Card>
      </div>
    </div>
  )
}
