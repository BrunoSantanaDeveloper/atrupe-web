'use client'

import { useState } from 'react'

// UI
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Components
import {
  ListDataTotalEmpty,
  ListDataStatusEmpty,
} from '@/components/common/TableEmptyState'
import { NewClientModal } from './NewClient'
import { NewQuotationModal, NewQuotationTriggerButton } from './NewQuotation'
import { TabNavType, Topbar } from '@/components/common/Topbar'
import { QuotationsData } from './QuotationsTable/QuotationsData'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import { QuotationsFilter } from './QuotationsTable/QuotationsFilter'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconReportOff } from '@tabler/icons-react'

export function Quotations({ searchParams }: SearchParamsType) {
  const [openDialog, setOpenDialog] = useState(false)

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['quotation-totals'],
    queryFn: () => getDataOld({ route: 'quotationTotalsRoute' }),
  })

  const totals: { [key: string]: number } = {
    digitacao: data?.OPEN,
    concluido: data?.DONE,
    vencidos: data?.OVERDUE,
    rejeitados: data?.REJECTED,
    todos: data?.TOTAL,
  }

  const status = searchParams.status
  const statusEmpty = totals?.[status] === 0

  const tabs: TabNavType[] = [
    {
      value: 'OPEN',
      tab: 'digitacao',
      label: 'Digitação',
      count: totals?.digitacao,
    },
    {
      value: 'DONE',
      tab: 'concluido',
      label: 'Aguardando',
      count: totals?.concluido,
    },
    {
      value: 'OVERDUE',
      tab: 'vencidos',
      label: 'Vencidos',
      count: totals?.vencidos,
    },
    {
      value: 'REJECTED',
      tab: 'rejeitados',
      label: 'Rejeitados',
      count: totals?.rejeitados,
    },
    {
      value: '',
      tab: 'todos',
      label: 'Todos',
      count: totals?.todos,
    },
  ]

  const statusLabel = tabs?.find((tab) => tab.tab === status)?.label

  return (
    <div className="space-y-5">
      <NewClientModal />

      <Topbar
        title="Orçamentos"
        tabs={tabs}
        activeTab={status}
        paramName="status"
        primaryCta={<NewQuotationTriggerButton onOpenChange={setOpenDialog} />}
      />
      <div>
        <Card>
          {isLoading ? (
            <Skeleton className="h-[calc(100vh-150px)]" />
          ) : totals?.todos && totals?.todos > 0 ? (
            statusEmpty ? (
              <ListDataStatusEmpty
                title={`Nenhum orçamento para o status ${statusLabel ? `: ${statusLabel}` : 'selecionado'}`}
                icon={IconReportOff}
              />
            ) : (
              <>
                {/* Filters */}
                <TableFiltersHeader searchParams={searchParams}>
                  <QuotationsFilter searchParams={searchParams} />
                </TableFiltersHeader>
                {/* Table */}
                <QuotationsData searchParams={searchParams} tabs={tabs} />
              </>
            )
          ) : (
            <ListDataTotalEmpty
              icon={IconReportOff}
              title="Sem orçamentos cadastrados"
              description="Cadastre seu primeiro orçamento"
              cta={<NewQuotationTriggerButton onOpenChange={setOpenDialog} />}
            />
          )}
          <NewQuotationModal
            open={openDialog}
            onOpenChange={(open) => {
              setOpenDialog(open)
            }}
          />
        </Card>
      </div>
    </div>
  )
}
